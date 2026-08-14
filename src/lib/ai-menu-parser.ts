// =============================================
// Motor de Extracción de Menús con IA Multimodal (Google Generative AI SDK)
// Soporte Multi-Carta, Menús Degustación y Bilingüismo (ES / EN)
// =============================================

import { GoogleGenerativeAI } from '@google/generative-ai';
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
    ''
  ).trim().replace(/^["']|["']$/g, '');

  if (!apiKey) {
    throw new Error(
      'Falta la clave GEMINI_API_KEY en las variables de entorno. Obtén una clave de API válida en https://aistudio.google.com/app/apikey (debe empezar por AIzaSy...).'
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const candidateModels = [
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro',
  ];
  let textContent = '';
  let lastErrorText = '';

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

  const filePart = {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const result = await model.generateContent([promptText, filePart]);
      const response = await result.response;
      textContent = response.text();

      if (textContent) break;
    } catch (err: unknown) {
      lastErrorText = err instanceof Error ? err.message : String(err);
      console.warn(`Error probando modelo ${modelName} con el SDK:`, lastErrorText);
    }
  }

  if (!textContent) {
    throw new Error(
      `No se pudo conectar con el servicio de IA. Asegúrate de estar usando una clave de API válida de Google AI Studio (empieza por AIzaSy...). (Detalle: ${lastErrorText.slice(0, 140)})`
    );
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
