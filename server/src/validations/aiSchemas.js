import { z } from 'zod';

export const productDescriptionSchema = z.object({
  name: z.string({ required_error: 'Product name is required' })
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name cannot exceed 100 characters'),
  category: z.string({ required_error: 'Category is required' })
    .trim()
    .min(2, 'Category is required')
    .max(50, 'Category cannot exceed 50 characters'),
  origin: z.string().trim().max(100, 'Origin cannot exceed 100 characters').optional().nullable(),
  location: z.string().trim().max(100, 'Location cannot exceed 100 characters').optional().nullable(),
  ingredients: z.string().trim().max(200, 'Ingredients cannot exceed 200 characters').optional().nullable(),
  unit: z.string().trim().max(30, 'Unit cannot exceed 30 characters').optional().nullable(),
  quantity: z.any().optional(),
  harvestDate: z.string().trim().max(50, 'Harvest date is too long').optional().nullable(),
  packingDate: z.string().trim().max(50, 'Packing date is too long').optional().nullable(),
  expiryDate: z.string().trim().max(50, 'Expiry date is too long').optional().nullable(),
  batchNumber: z.string().trim().max(50, 'Batch number is too long').optional().nullable(),
  farmName: z.string().trim().max(100, 'Farm name cannot exceed 100 characters').optional().nullable()
});

export const productSummarySchema = z.object({
  name: z.string({ required_error: 'Product name is required' })
    .trim()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name cannot exceed 100 characters'),
  category: z.string().trim().max(50, 'Category cannot exceed 50 characters').optional().nullable(),
  ingredients: z.string().trim().max(200, 'Ingredients cannot exceed 200 characters').optional().nullable(),
  origin: z.string().trim().max(100, 'Origin cannot exceed 100 characters').optional().nullable(),
  description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional().nullable()
});

export const translateSchema = z.object({
  text: z.string({ required_error: 'Text to translate is required' })
    .trim()
    .min(1, 'Text cannot be empty')
    .max(1000, 'Text cannot exceed 1000 characters'),
  targetLanguage: z.string({ required_error: 'Target language is required' })
    .trim()
    .toLowerCase()
    .refine((lang) => ['ta', 'tamil', 'en', 'english', 'simple-en', 'simple_english', 'simple english'].includes(lang), {
      message: 'Supported target languages are: Tamil (ta), English (en), Simple English (simple-en)'
    })
});

export const simpleEnglishSchema = z.object({
  text: z.string({ required_error: 'Text to simplify is required' })
    .trim()
    .min(1, 'Text cannot be empty')
    .max(1000, 'Text cannot exceed 1000 characters')
});

export const smartShoppingSchema = z.object({
  query: z.string({ required_error: 'Shopping query is required' })
    .trim()
    .min(2, 'Query must be at least 2 characters')
    .max(200, 'Query cannot exceed 200 characters')
});
