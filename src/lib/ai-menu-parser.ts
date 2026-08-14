// =============================================
// Motor de Extracción de Menús con IA Multimodal (Google Gemini 1.5 Flash)
// =============================================

import { ExtractedMenu, ExtractedMenuSchema } from './validations/import';

const ALLERGEN_ALIAS_MAP: Record<string, string> = {
  gluten: 'gluten',
  wheat: 'gluten',
  trigo: 'gluten',
  crustaceans: 'crustaceos',
  crustaceos: 'crustaceos',
  marisco: 'crustaceos',
  eggs: 'huevos',
  huevos: 'huevos',
  huevo: 'huevos',
  fish: 'pescado',
  pescado: 'pescado',
  peanuts: 'cacahuetes',
  cacahuetes: 'cacahuetes',
  mani: 'cacahuetes',
  soybeans: 'soja',
  soja: 'soja',
  milk: 'lacteos',
  lacteos: 'lacteos',
  leche: 'lacteos',
  dairy: 'lacteos',
  nuts: 'frutos_cascara',
  frutos_cascara: 'frutos_cascara',
  frutossecos: 'frutos_cascara',
  celery: 'apio',
  apio: 'apio',
  mustard: 'mostaza',
  mostaza: 'mostaza',
  sesame: 'sesamo',
  sesamo: 'sesamo',
  sulphites: 'sulfitos',
  sulfitos: 'sulfitos',
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
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'Falta la clave GEMINI_API_KEY en las variables de entorno. Puedes obtener una clave gratuita en https://aistudio.google.com e incluirla en tu archivo .env.local.'
    );
  }

  const base64Data = buffer.toString('base64');

  const promptText = `
Eres un sumiller y chef experto en gastronomía y gestión de cartas de restaurantes en España y Europa.
Analiza detenidamente la carta/menú adjunto (imagen o PDF).
Extrae absolutamente TODAS las categorías de comida/bebida y los platos/productos pertenecientes a cada categoría.

Para cada producto extrae:
- name: Nombre exacto del plato o bebida en español.
- description: Descripción de ingredientes, modo de preparación o notas adicionales si aparecen en el documento (si no aparece descripción, pon "").
- price: El precio del plato como número decimal o texto (ejemplo: "9.50", "12.00"). Si no tiene precio visible, pon "0.00".
- allergens: Array de identificadores de alérgenos presentes o señalados con iconos/texto. Usa exclusivamente estos identificadores: ["gluten", "crustaceos", "huevos", "pescado", "cacahuetes", "soja", "lacteos", "frutos_cascara", "apio", "mostaza", "sesamo", "sulfitos", "altramuces", "moluscos"].

REGLA DE SALIDA: Responde ÚNICAMENTE con un JSON válido respetando estrictamente esta estructura:
{
  "categories": [
    {
      "name": "Nombre de la categoría (ej. Entrantes, Carnes, Postres, Vinos)",
      "products": [
        {
          "name": "Nombre del plato",
          "description": "Descripción o ingredientes",
          "price": "9.50",
          "allergens": ["gluten", "lacteos"]
        }
      ]
    }
  ]
}
`.trim();

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
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

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 400 && errorText.includes('PDF')) {
      throw new Error('El archivo PDF está protegido por contraseña o tiene un formato no compatible.');
    }
    throw new Error(`Error en el servicio de IA (HTTP ${response.status}). Comprueba que tu GEMINI_API_KEY esté activa.`);
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
  const normalizedCategories = validated.data.categories.map((cat) => ({
    ...cat,
    products: cat.products.map((prod) => ({
      ...prod,
      allergens: normalizeAllergens(prod.allergens),
    })),
  }));

  return { categories: normalizedCategories };
}
