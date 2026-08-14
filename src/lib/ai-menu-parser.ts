// =============================================
// Motor de Extracción de Menús con IA Multimodal (Google Gemini API Cascade)
// Soporte Multi-Carta, Menús Degustación y Bilingüismo (ES / EN)
// =============================================

import { ExtractedMenu, ExtractedMenuSchema } from './validations/import';

const ALLERGEN_ALIAS_MAP: Record<string, string> = {
  gluten: 'gluten',
  wheat: 'gluten',
  trigo: 'gluten',
  crustaceans: 'crustaceos',
  crustaceos: 'crustaceos',
  marisco: 'crustaceos',
  prawns: 'crustaceos',
  shrimp: 'crustaceos',
  eggs: 'huevos',
  huevos: 'huevos',
  huevo: 'huevos',
  egg: 'huevos',
  fish: 'pescado',
  pescado: 'pescado',
  peanuts: 'cacahuetes',
  cacahuetes: 'cacahuetes',
  mani: 'cacahuetes',
  soybeans: 'soja',
  soja: 'soja',
  soy: 'soja',
  milk: 'lacteos',
  lacteos: 'lacteos',
  leche: 'lacteos',
  dairy: 'lacteos',
  cheese: 'lacteos',
  nuts: 'frutos_cascara',
  frutos_cascara: 'frutos_cascara',
  frutossecos: 'frutos_cascara',
  almonds: 'frutos_cascara',
  celery: 'apio',
  apio: 'apio',
  mustard: 'mostaza',
  mostaza: 'mostaza',
  sesame: 'sesamo',
  sesamo: 'sesamo',
  sulphites: 'sulfitos',
  sulfitos: 'sulfitos',
  wine: 'sulfitos',
  vino: 'sulfitos',
  lupin: 'altramuces',
  altramuces: 'altramuces',
  molluscs: 'moluscos',
  moluscos: 'moluscos',
};

function normalizeAllergens(allergens: string[]): string[] {
  const result = new Set<string>();
  for (const item of allergens) {
    const clean = item.toLowerCase().trim().replace(/[^a-z_]/g, '');
    if (ALLERGEN_ALIAS_MAP[clean]) {
      result.add(ALLERGEN_ALIAS_MAP[clean]);
    }
  }
  return Array.from(result);
}

export async function parseMenuWithAI(buffer: Buffer, mimeType: string): Promise<ExtractedMenu> {
  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    'AIzaSyCQ_vYj3NYyCAfnyeiu-lO8WC2U36_2t_8'
  ).trim().replace(/^["']|["']$/g, '');

  const base64Data = buffer.toString('base64');

  const promptText = `
Eres un chef, sumiller y gestor de cartas de restaurantes de alta gastronomía en España y Europa.
Analiza detenidamente el documento adjunto (imagen o PDF de la carta del restaurante).

INSTRUCCIONES CLAVE DE EXTRACCIÓN Y ESTRUCTURA:

1. DETECCIÓN MULTI-CARTA / COLECCIONES DE MENÚ:
   - Si el documento contiene varias cartas o secciones independientes (ej. "Carta Principal", "MENÚ DE TAPAS CLÁSICAS (28,00 €)", "MENÚ DE TAPAS DE MAR (39,00 €)", "VINOS Y BEBIDAS"), créalas como colecciones separadas en el array "collections".
   - Para menús degustación o menús del día con precio fijo global (ej. "28,00 € por persona"), asigna "hasFixedPrice": true y "fixedPrice": "28.00".
   - Si solo hay una carta general, crea una única colección llamada "Carta Principal" ("Main Menu").

2. SEPARACIÓN BILINGÜE ESPAÑOL / INGLÉS (FILTRADO INTELIGENTE):
   - Si los títulos, platos o descripciones están escritos en Español e Inglés separados por "/", "|", salto de línea o paréntesis (ejemplo: "RACIONES FRÍAS / COLD DISHES" o "Ensalada de burrata... / Burrata cheese salad..."):
     - Extrae ÚNICAMENTE la parte en Español en "name_es" y "description_es".
     - Asigna la parte traducida al Inglés en "name_en" y "description_en".
   - Si el documento está solo en español, asigna la traducción automática al inglés si es evidente, o pon "name_en": "" y "description_en": "".

3. PRECIOS Y ALÉRGENOS UE:
   - Formatea los precios como texto limpio (ej. "18.00", "16.00", "20.50"). Si indica "S/M" o "Según Mercado", pon "price": "S/M".
   - Identifica cualquier icono o texto de alérgenos y asígnalos usando EXCLUSIVAMENTE estos identificadores: ["gluten", "crustaceos", "huevos", "pescado", "cacahuetes", "soja", "lacteos", "frutos_cascara", "apio", "mostaza", "sesamo", "sulfitos", "altramuces", "moluscos"].

REGLA DE SALIDA ESTRICTA: Responde ÚNICAMENTE con un JSON válido respetando este esquema exacto:
{
  "collections": [
    {
      "name_es": "Carta Principal",
      "name_en": "Main Menu",
      "hasFixedPrice": false,
      "fixedPrice": "",
      "categories": [
        {
          "name_es": "Raciones Frías",
          "name_en": "Cold Dishes",
          "products": [
            {
              "name_es": "Guacamole con frutas de temporada, gambitas y aceite de cilantro",
              "name_en": "Guacamole with seasonal fruits, prawns and coriander oil",
              "description_es": "Con gambitas y aceite de cilantro",
              "description_en": "With prawns and coriander oil",
              "price": "18.00",
              "allergens": ["crustaceos"]
            }
          ]
        }
      ]
    }
  ]
}
`.trim();

  // Lista en cascada de versiones de API y nombres de modelo para máxima resistencia contra HTTP 404
  const candidateEndpoints = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
  ];

  let response: Response | null = null;
  let lastErrorText = '';

  for (const baseUrl of candidateEndpoints) {
    const endpoint = `${baseUrl}?key=${apiKey}`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      });

      if (res.ok) {
        response = res;
        break;
      }
      lastErrorText = await res.text();
      console.warn(`Gemini API Endpoint ${baseUrl} returned HTTP ${res.status}:`, lastErrorText);
    } catch (e) {
      console.warn(`Error connecting to Gemini API endpoint ${baseUrl}:`, e);
    }
  }

  if (!response || !response.ok) {
    throw new Error(
      `No se pudo conectar con el servicio de IA de Google Gemini. Comprueba que tu GEMINI_API_KEY esté activa en Google AI Studio. (Detalle: ${lastErrorText.slice(0, 120)})`
    );
  }

  const jsonResponse = await response.json();
  const textContent = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error('La IA no pudo procesar la carta. Asegúrate de que el documento o la imagen sea legible.');
  }

  let parsedRaw: unknown;
  try {
    parsedRaw = JSON.parse(textContent);
  } catch {
    throw new Error('No se pudo interpretar el formato devuelto por la IA. Revisa la legibilidad del documento.');
  }

  const validated = ExtractedMenuSchema.safeParse(parsedRaw);
  if (!validated.success) {
    throw new Error('La estructura de la carta extraída no coincide con el formato esperado. Intenta subir una foto o PDF de mayor claridad.');
  }

  // Normalizar los identificadores de alérgenos devueltos por la IA
  const normalizedCollections = validated.data.collections.map((col) => ({
    ...col,
    categories: col.categories.map((cat) => ({
      ...cat,
      products: cat.products.map((prod) => ({
        ...prod,
        allergens: normalizeAllergens(prod.allergens),
      })),
    })),
  }));

  return { collections: normalizedCollections };
}
