import { z } from 'zod';

export const registerSchema = z.object({
  role: z.enum(['CONSUMER', 'FARMER', 'consumer', 'farmer']).transform((val) => val.toUpperCase()),
  name: z.string().trim().min(2, 'Name must contain at least 2 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must contain at least 8 characters'),
  phone: z.string().optional().default(''),
  location: z.string().optional().default(''),
  farmName: z.string().optional(),
  farmLocation: z.string().optional(),
  farmDescription: z.string().optional(),
  farmAcreage: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return null;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number({ invalid_type_error: 'Total Farm Acreage must be a valid number' }).min(0, 'Farm Acreage cannot be negative').nullable().optional())
}).refine(
  (data) => {
    if (data.role === 'FARMER' && (!data.farmName || !data.farmName.trim())) {
      return false;
    }
    return true;
  },
  {
    message: 'Farm Name is required for farmer registration',
    path: ['farmName']
  }
);

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  farmName: z.string().trim().min(2).optional(),
  description: z.string().trim().optional(),
  about: z.string().trim().optional(),
  acreage: z.string().trim().optional(),
  established: z.string().trim().optional(),
  farmAcreage: z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return null;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number({ invalid_type_error: 'Total Farm Acreage must be a valid number' }).min(0, 'Farm Acreage cannot be negative').nullable().optional())
});

export const productQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  farmerId: z.string().optional(),
  status: z.enum(['ACTIVE', 'OUT_OF_STOCK', 'DRAFT', 'INACTIVE']).optional(),
  priceRange: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  location: z.string().optional(),
  freshness: z.string().optional(),
  verifiedOnly: z.preprocess((v) => v === 'true' || v === true, z.boolean().optional()),
  inStockOnly: z.preprocess((v) => v === 'true' || v === true, z.boolean().optional()),
  sortBy: z.enum(['recommended', 'freshest', 'nearest', 'price-asc', 'price-desc', 'highest-rated']).optional().default('recommended'),
  limit: z.coerce.number().min(1).max(100).default(50),
  page: z.coerce.number().min(1).default(1)
}).passthrough();

export const productBaseSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required'),
  category: z.string().trim().min(1, 'Category is required'),
  description: z.string().trim().min(5, 'Description is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  unit: z.string().trim().min(1, 'Unit is required (e.g. 1 kg, 500 g, bunch)'),
  quantity: z.coerce.number().int().nonnegative('Quantity cannot be negative').default(10),
  availableQuantity: z.coerce.number().int().nonnegative('Available quantity cannot be negative').optional(),
  imageUrl: z.string().optional().default(''),
  location: z.string().trim().min(2, 'Origin location is required'),
  status: z.enum(['ACTIVE', 'OUT_OF_STOCK', 'DRAFT', 'INACTIVE']).optional().default('ACTIVE'),
  harvestDate: z.string().optional().nullable(),
  packingDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  origin: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  ingredients: z.string().optional().nullable()
});

const validateDates = (data) => {
  if (data.harvestDate && data.expiryDate) {
    const hDate = new Date(data.harvestDate);
    const eDate = new Date(data.expiryDate);
    if (!isNaN(hDate.getTime()) && !isNaN(eDate.getTime()) && hDate > eDate) {
      return false;
    }
  }
  return true;
};

export const createProductSchema = productBaseSchema.refine(
  validateDates,
  {
    message: 'Expiry date cannot be before harvest date',
    path: ['expiryDate']
  }
);

export const updateProductSchema = productBaseSchema.partial().refine(
  validateDates,
  {
    message: 'Expiry date cannot be before harvest date',
    path: ['expiryDate']
  }
);

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1')
});

export const deliveryAddressSchema = z.union([
  z.string().trim().min(5, 'Delivery address is required'),
  z.object({
    fullName: z.string().trim().min(2, 'Full name is required'),
    phone: z.string().trim().min(5, 'Phone number is required'),
    address: z.string().trim().min(5, 'Address is required'),
    city: z.string().trim().min(2, 'City is required'),
    state: z.string().trim().optional().default('Tamil Nadu'),
    pincode: z.string().trim().min(4, 'Pincode is required')
  })
]);

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least 1 item'),
  deliveryAddress: deliveryAddressSchema,
  paymentMethod: z.preprocess((val) => {
    if (!val || typeof val !== 'string') return 'COD';
    const s = val.toUpperCase().trim();
    if (s.includes('UPI')) return 'UPI';
    if (s.includes('CARD')) return 'CARD';
    return 'COD';
  }, z.enum(['COD', 'UPI', 'CARD'])).default('COD')
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid order status' })
  })
});

