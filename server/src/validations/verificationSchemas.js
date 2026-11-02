import { z } from 'zod';

export const productIdParamSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' })
    .trim()
    .min(1, 'Product ID cannot be empty')
    .max(100, 'Product ID is too long')
});
