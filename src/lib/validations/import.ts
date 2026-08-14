// =============================================
// Esquemas de Validación Zod — Importador de Menú IA
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
  name: z.string().min(1, 'El nombre del producto es obligatorio'),
  description: z.string().default(''),
  price: z.union([z.string(), z.number()]).transform((val) => {
    if (typeof val === 'number') return val.toFixed(2);
    const cleaned = String(val).replace(',', '.').replace(/[^0-9.]/g, '');
    return cleaned || '0.00';
  }),
  allergens: z.array(z.string()).default([]),
});

export const ExtractedCategorySchema = z.object({
  name: z.string().min(1, 'El nombre de la categoría es obligatorio'),
  products: z.array(ExtractedProductSchema).default([]),
});

export const ExtractedMenuSchema = z.object({
  categories: z.array(ExtractedCategorySchema).default([]),
});

export type ExtractedProduct = z.infer<typeof ExtractedProductSchema>;
export type ExtractedCategory = z.infer<typeof ExtractedCategorySchema>;
export type ExtractedMenu = z.infer<typeof ExtractedMenuSchema>;
