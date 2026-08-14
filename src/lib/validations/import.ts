// =============================================
// Esquemas de Validación Zod — Importador de Menú IA V2.0
// =============================================

import { z } from 'zod';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

export const ExtractedProductSchema = z.object({
  name_es: z.string().min(1, 'El nombre del producto en español es obligatorio'),
  name_en: z.string().default(''),
  description_es: z.string().default(''),
  description_en: z.string().default(''),
  price: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'number') return val.toFixed(2);
    const raw = String(val).trim();
    if (raw.toUpperCase() === 'S/M' || raw.toUpperCase() === 'SM') return 'S/M';
    const cleaned = raw.replace(',', '.').replace(/[^0-9.]/g, '');
    return cleaned || '0.00';
  }),
  allergens: z.array(z.string()).default([]),
});

export const ExtractedCategorySchema = z.object({
  name_es: z.string().min(1, 'El nombre de la categoría es obligatorio'),
  name_en: z.string().default(''),
  products: z.array(ExtractedProductSchema).default([]),
});

export const ExtractedCollectionSchema = z.object({
  name_es: z.string().min(1, 'El nombre del menú es obligatorio'),
  name_en: z.string().default(''),
  hasFixedPrice: z.boolean().default(false),
  fixedPrice: z.string().default(''),
  categories: z.array(ExtractedCategorySchema).default([]),
});

export const ExtractedMenuSchema = z.object({
  collections: z.array(ExtractedCollectionSchema).default([]),
});

export type ExtractedProduct = z.infer<typeof ExtractedProductSchema>;
export type ExtractedCategory = z.infer<typeof ExtractedCategorySchema>;
export type ExtractedCollection = z.infer<typeof ExtractedCollectionSchema>;
export type ExtractedMenu = z.infer<typeof ExtractedMenuSchema>;
