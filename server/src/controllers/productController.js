import { prisma } from '../config/db.js';

/**
 * Canonical category normalization helper
 */
export function normalizeCategory(cat) {
  if (!cat) return 'OTHER';
  const c = cat.toString().trim().toUpperCase();
  if (c === 'VEGETABLES' || c === 'VEGETABLE') return 'VEGETABLES';
  if (c === 'FRUITS' || c === 'FRUIT') return 'FRUITS';
  if (c === 'GRAINS' || c === 'GRAIN') return 'GRAINS';
  if (c === 'DAIRY' || c === 'MILK') return 'DAIRY';
  if (c === 'EGGS' || c === 'EGG') return 'EGGS';
  if (c === 'HONEY') return 'HONEY';
  if (c === 'NUTS' || c === 'NUT' || c === 'PEANUT' || c === 'GROUNDNUT') return 'NUTS';
  return 'OTHER';
}

export function getCategoryMatchValues(normCat) {
  switch (normCat) {
    case 'VEGETABLES': return ['VEGETABLES', 'Vegetables', 'vegetables', 'Vegetable', 'vegetable'];
    case 'FRUITS': return ['FRUITS', 'Fruits', 'fruits', 'Fruit', 'fruit'];
    case 'GRAINS': return ['GRAINS', 'Grains', 'grains', 'Grain', 'grain'];
    case 'DAIRY': return ['DAIRY', 'Dairy', 'dairy', 'Milk', 'milk'];
    case 'EGGS': return ['EGGS', 'Eggs', 'eggs', 'Egg', 'egg'];
    case 'HONEY': return ['HONEY', 'Honey', 'honey'];
    case 'NUTS': return ['NUTS', 'Nuts', 'nuts', 'Peanut', 'peanuts', 'Groundnuts', 'groundnuts'];
    case 'OTHER': return ['OTHER', 'Other', 'other', 'Beverages', 'beverages', 'Spices', 'spices'];
    default: return [normCat, normCat.toLowerCase()];
  }
}

/**
 * GET /api/products
 * Public: Queryable active product catalog with rich filters
 */
export async function getProducts(req, res, next) {
  try {
    const {
      category,
      search,
      farmerId,
      status,
      priceRange,
      minPrice,
      maxPrice,
      location,
      freshness,
      verifiedOnly,
      inStockOnly,
      sortBy = 'recommended',
      limit = 50,
      page = 1
    } = req.query;

    const numLimit = Math.max(1, Math.min(100, Number(limit) || 50));
    const numPage = Math.max(1, Number(page) || 1);

    // Public catalog only shows ACTIVE products unless explicit status is filtered
    const where = {
      status: status || 'ACTIVE'
    };

    // If public request and no status filter, definitely don't show DRAFT or INACTIVE
    if (!status) {
      where.status = 'ACTIVE';
    }

    if (category && category.toString().trim().toUpperCase() !== 'ALL') {
      const normCat = normalizeCategory(category);
      where.category = {
        in: getCategoryMatchValues(normCat)
      };
    }

    if (farmerId) {
      where.farmerId = farmerId;
    }

    if (location && location.toLowerCase() !== 'all') {
      where.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    if (verifiedOnly === true || verifiedOnly === 'true') {
      where.farmer = {
        verified: true
      };
    }

    if (inStockOnly === true || inStockOnly === 'true') {
      where.availableQuantity = {
        gt: 0
      };
    }

    // Price Range Filter (supports numeric minPrice/maxPrice or preset ranges)
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined && minPrice !== '') where.price.gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') where.price.lte = Number(maxPrice);
    } else if (priceRange === 'under-100') {
      where.price = { lt: 100 };
    } else if (priceRange === '100-250') {
      where.price = { gte: 100, lte: 250 };
    } else if (priceRange === '250-500') {
      where.price = { gt: 250, lte: 500 };
    } else if (priceRange === 'above-500') {
      where.price = { gt: 500 };
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { location: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
        { farmer: { farmName: { contains: searchTerm, mode: 'insensitive' } } },
        { transparency: { ingredients: { contains: searchTerm, mode: 'insensitive' } } }
      ];
    }

    // Sorting
    let orderBy = [{ createdAt: 'desc' }];
    if (sortBy === 'price-asc') {
      orderBy = [{ price: 'asc' }];
    } else if (sortBy === 'price-desc') {
      orderBy = [{ price: 'desc' }];
    } else if (sortBy === 'nearest') {
      orderBy = [{ location: 'asc' }];
    } else if (sortBy === 'freshest') {
      orderBy = [{ createdAt: 'desc' }];
    }

    const skip = (numPage - 1) * numLimit;

    const [products, total, activeProductsForCounts] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          farmer: {
            select: {
              id: true,
              farmName: true,
              location: true,
              verified: true,
              verificationStatus: true,
              user: {
                select: { name: true }
              }
            }
          },
          transparency: true
        },
        orderBy,
        take: numLimit,
        skip
      }),
      prisma.product.count({ where }),
      prisma.product.findMany({
        where: { status: 'ACTIVE' },
        select: { category: true }
      })
    ]);

    const categoryCounts = {
      ALL: activeProductsForCounts.length,
      VEGETABLES: 0,
      FRUITS: 0,
      GRAINS: 0,
      DAIRY: 0,
      EGGS: 0,
      HONEY: 0,
      NUTS: 0,
      OTHER: 0
    };

    activeProductsForCounts.forEach((p) => {
      const norm = normalizeCategory(p.category);
      if (categoryCounts[norm] !== undefined) {
        categoryCounts[norm]++;
      } else {
        categoryCounts.OTHER++;
      }
    });

    // Format safe response with convenient flattened fields for frontend components
    const formatted = products.map((p) => ({
      ...p,
      image: p.imageUrl || '',
      farmerName: p.farmer?.farmName || p.farmer?.user?.name || 'Verified Farm',
      verified: p.farmer?.verified || false,
      harvestFreshness: p.transparency?.harvestDate
        ? `Harvested on ${new Date(p.transparency.harvestDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : 'Farm Fresh Batch',
      harvestDate: p.transparency?.harvestDate
        ? new Date(p.transparency.harvestDate).toISOString().split('T')[0]
        : null,
      packingDate: p.transparency?.packingDate
        ? new Date(p.transparency.packingDate).toISOString().split('T')[0]
        : null,
      expiryDate: p.transparency?.expiryDate
        ? new Date(p.transparency.expiryDate).toISOString().split('T')[0]
        : null,
      ingredients: p.transparency?.ingredients || `Fresh natural ${p.name}`,
      origin: p.transparency?.origin || p.location,
      batchNumber: p.transparency?.batchNumber || `BATCH-${p.id.slice(-6).toUpperCase()}`
    }));

    return res.status(200).json({
      success: true,
      data: {
        products: formatted,
        categoryCounts,
        pagination: {
          total,
          page: numPage,
          limit: numLimit,
          totalPages: Math.ceil(total / numLimit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:id
 * Public: Product details with farmer & transparency records
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        farmer: {
          select: {
            id: true,
            farmName: true,
            location: true,
            description: true,
            farmAcreage: true,
            verified: true,
            verificationStatus: true,
            user: {
              select: { name: true, phone: true }
            }
          }
        },
        transparency: true
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    const formatted = {
      ...product,
      image: product.imageUrl || '',
      farmer: {
        id: product.farmer?.id,
        name: product.farmer?.user?.name || product.farmer?.farmName || 'Verified Farm',
        farmName: product.farmer?.farmName || 'Verified Farm',
        location: product.farmer?.location,
        verified: product.farmer?.verified || false
      },
      transparency: product.transparency
        ? {
            harvestDate: product.transparency.harvestDate
              ? new Date(product.transparency.harvestDate).toISOString().split('T')[0]
              : null,
            packingDate: product.transparency.packingDate
              ? new Date(product.transparency.packingDate).toISOString().split('T')[0]
              : null,
            expiryDate: product.transparency.expiryDate
              ? new Date(product.transparency.expiryDate).toISOString().split('T')[0]
              : null,
            ingredients: product.transparency.ingredients || null,
            origin: product.transparency.origin || null,
            batchNumber: product.transparency.batchNumber || null
          }
        : null,
      farmerName: product.farmer?.farmName || product.farmer?.user?.name || 'Verified Farm',
      verified: product.farmer?.verified || false,
      harvestFreshness: product.transparency?.harvestDate
        ? `Harvested on ${new Date(product.transparency.harvestDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : 'Farm Fresh Batch',
      harvestDate: product.transparency?.harvestDate
        ? new Date(product.transparency.harvestDate).toISOString().split('T')[0]
        : null,
      packingDate: product.transparency?.packingDate
        ? new Date(product.transparency.packingDate).toISOString().split('T')[0]
        : null,
      expiryDate: product.transparency?.expiryDate
        ? new Date(product.transparency.expiryDate).toISOString().split('T')[0]
        : null,
      ingredients: product.transparency?.ingredients || null,
      origin: product.transparency?.origin || product.location || null,
      batchNumber: product.transparency?.batchNumber || null
    };

    return res.status(200).json({
      success: true,
      data: {
        product: formatted
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products
 * Protected: FARMER role only. Creates product for authenticated farmer.
 */
export async function createProduct(req, res, next) {
  try {
    const farmerProfileId = req.user.farmerProfile?.id;
    if (!farmerProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile record is missing for this account.'
      });
    }

    const {
      name,
      category,
      description,
      price,
      unit,
      quantity = 10,
      availableQuantity,
      imageUrl,
      location,
      status = 'ACTIVE',
      harvestDate,
      packingDate,
      expiryDate,
      origin,
      batchNumber,
      ingredients
    } = req.body;

    const numPrice = Number(price);
    const numQty = Math.max(0, parseInt(quantity, 10) || 0);
    const numAvail = availableQuantity !== undefined ? Math.max(0, parseInt(availableQuantity, 10) || 0) : numQty;

    if (numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
    }

    // Validate dates if provided
    let hDate = null;
    let pDate = null;
    let eDate = null;

    if (harvestDate) {
      hDate = new Date(harvestDate);
      if (isNaN(hDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid harvest date provided.' });
      }
    }

    if (packingDate) {
      pDate = new Date(packingDate);
      if (isNaN(pDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid packing date provided.' });
      }
    }

    if (expiryDate) {
      eDate = new Date(expiryDate);
      if (isNaN(eDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid expiry date provided.' });
      }
    }

    if (hDate && eDate && hDate > eDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date cannot be before harvest date.'
      });
    }

    // Determine initial status: if available quantity is 0, auto set OUT_OF_STOCK
    let initialStatus = status;
    if (numAvail === 0 && initialStatus !== 'DRAFT' && initialStatus !== 'INACTIVE') {
      initialStatus = 'OUT_OF_STOCK';
    }

    const product = await prisma.product.create({
      data: {
        farmerId: farmerProfileId,
        name: name.trim(),
        category: normalizeCategory(category),
        description: description.trim(),
        price: numPrice,
        unit: unit.trim(),
        quantity: numQty,
        availableQuantity: numAvail,
        imageUrl: imageUrl?.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
        location: location.trim(),
        status: initialStatus,
        transparency: {
          create: {
            harvestDate: hDate,
            packingDate: pDate,
            expiryDate: eDate,
            origin: origin?.trim() || location.trim(),
            batchNumber: batchNumber?.trim() || `FD-BATCH-${Date.now().toString().slice(-6)}`,
            ingredients: ingredients?.trim() || `Fresh natural ${name.trim()}`
          }
        }
      },
      include: {
        transparency: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: {
        product: {
          ...product,
          image: product.imageUrl,
          stock: product.availableQuantity
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/products/:id
 * Protected: FARMER role only. Validates product ownership before updating.
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const farmerProfileId = req.user.farmerProfile?.id;

    // 1. Check product exists
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { transparency: true }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // 2. Enforce strict authorization: Farmer can only modify their own products
    if (existing.farmerId !== farmerProfileId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to modify products belonging to another farm.'
      });
    }

    const {
      name,
      category,
      description,
      price,
      unit,
      quantity,
      availableQuantity,
      imageUrl,
      location,
      status,
      harvestDate,
      packingDate,
      expiryDate,
      origin,
      batchNumber,
      ingredients
    } = req.body;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (category !== undefined) dataToUpdate.category = normalizeCategory(category);
    if (description !== undefined) dataToUpdate.description = description.trim();
    if (price !== undefined) {
      const p = Number(price);
      if (p < 0) return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
      dataToUpdate.price = p;
    }
    if (unit !== undefined) dataToUpdate.unit = unit.trim();
    if (quantity !== undefined) {
      const q = parseInt(quantity, 10);
      if (q < 0) return res.status(400).json({ success: false, message: 'Quantity cannot be negative.' });
      dataToUpdate.quantity = q;
    }
    if (availableQuantity !== undefined) {
      const aq = parseInt(availableQuantity, 10);
      if (aq < 0) return res.status(400).json({ success: false, message: 'Available quantity cannot be negative.' });
      dataToUpdate.availableQuantity = aq;
    }
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl.trim();
    if (location !== undefined) dataToUpdate.location = location.trim();

    // Stock state management
    const nextAvailQty = dataToUpdate.availableQuantity !== undefined ? dataToUpdate.availableQuantity : existing.availableQuantity;
    if (status !== undefined) {
      dataToUpdate.status = status;
    } else {
      // Auto toggle OUT_OF_STOCK / ACTIVE
      if (nextAvailQty === 0 && existing.status === 'ACTIVE') {
        dataToUpdate.status = 'OUT_OF_STOCK';
      } else if (nextAvailQty > 0 && existing.status === 'OUT_OF_STOCK') {
        dataToUpdate.status = 'ACTIVE';
      }
    }

    // Date validation
    let hDate = harvestDate !== undefined ? (harvestDate ? new Date(harvestDate) : null) : existing.transparency?.harvestDate;
    let eDate = expiryDate !== undefined ? (expiryDate ? new Date(expiryDate) : null) : existing.transparency?.expiryDate;

    if (hDate && isNaN(new Date(hDate).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid harvest date provided.' });
    }
    if (eDate && isNaN(new Date(eDate).getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid expiry date provided.' });
    }
    if (hDate && eDate && new Date(hDate) > new Date(eDate)) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date cannot be before harvest date.'
      });
    }

    if (harvestDate !== undefined || packingDate !== undefined || expiryDate !== undefined || origin !== undefined || batchNumber !== undefined || ingredients !== undefined) {
      dataToUpdate.transparency = {
        upsert: {
          create: {
            harvestDate: harvestDate ? new Date(harvestDate) : null,
            packingDate: packingDate ? new Date(packingDate) : null,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            origin: origin || location || existing.location,
            batchNumber: batchNumber || `FD-BATCH-${Date.now().toString().slice(-6)}`,
            ingredients: ingredients || `Fresh natural ${existing.name}`
          },
          update: {
            ...(harvestDate !== undefined && { harvestDate: harvestDate ? new Date(harvestDate) : null }),
            ...(packingDate !== undefined && { packingDate: packingDate ? new Date(packingDate) : null }),
            ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
            ...(origin !== undefined && { origin }),
            ...(batchNumber !== undefined && { batchNumber }),
            ...(ingredients !== undefined && { ingredients })
          }
        }
      };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: {
        transparency: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: {
        product: {
          ...updated,
          image: updated.imageUrl,
          stock: updated.availableQuantity
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/products/:id
 * Protected: FARMER role only. Validates ownership before deletion.
 * Soft-inactivates if order references exist to avoid foreign key errors.
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const farmerProfileId = req.user.farmerProfile?.id;

    const existing = await prisma.product.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (existing.farmerId !== farmerProfileId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot delete another farm’s products.'
      });
    }

    // Check if product has historical order items
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id }
    });

    if (orderItemsCount > 0) {
      // Soft-inactivate to preserve historical order references
      await prisma.product.update({
        where: { id },
        data: {
          status: 'INACTIVE',
          availableQuantity: 0
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Product deactivated successfully (preserved for historical orders).'
      });
    }

    // Hard delete if no orders exist
    await prisma.product.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}
