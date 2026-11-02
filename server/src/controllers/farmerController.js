import { prisma } from '../config/db.js';

/**
 * GET /api/farmers/me
 * Protected: FARMER role only
 */
export async function getMyFarmerProfile(req, res, next) {
  try {
    const farmer = await prisma.farmerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        },
        products: {
          orderBy: { createdAt: 'desc' },
          include: { transparency: true }
        }
      }
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        farmer: {
          ...farmer,
          ownerName: farmer.user?.name || req.user.name,
          email: farmer.user?.email || req.user.email,
          phone: farmer.user?.phone || req.user.phone
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/farmers/me/products
 * Protected: FARMER role only.
 * Returns only products belonging to authenticated farmer with search, category, status, and sort filters.
 */
export async function getMyFarmerProducts(req, res, next) {
  try {
    const farmerProfileId = req.user.farmerProfile?.id;
    if (!farmerProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile record is missing.'
      });
    }

    const { search, category, status, sort } = req.query;

    const where = {
      farmerId: farmerProfileId
    };

    if (category && category.toLowerCase() !== 'all') {
      where.category = {
        equals: category,
        mode: 'insensitive'
      };
    }

    if (status && status !== 'All') {
      if (status === 'Active') {
        where.status = 'ACTIVE';
        where.availableQuantity = { gt: 0 };
      } else if (status === 'Out of Stock') {
        where.OR = [
          { status: 'OUT_OF_STOCK' },
          { availableQuantity: 0 }
        ];
      } else if (status === 'DRAFT') {
        where.status = 'DRAFT';
      } else if (status === 'INACTIVE') {
        where.status = 'INACTIVE';
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { transparency: { ingredients: { contains: q, mode: 'insensitive' } } }
      ];
    }

    // Sort options
    let orderBy = { createdAt: 'desc' };
    if (sort === 'Price') orderBy = { price: 'desc' };
    if (sort === 'Stock') orderBy = { availableQuantity: 'desc' };
    if (sort === 'Newest') orderBy = { createdAt: 'desc' };

    const products = await prisma.product.findMany({
      where,
      include: {
        transparency: true
      },
      orderBy
    });

    const formatted = products.map((p) => {
      const isLowStock = p.availableQuantity > 0 && p.availableQuantity < 15;
      const isOutOfStock = p.availableQuantity === 0 || p.status === 'OUT_OF_STOCK';

      let expiryDays = null;
      let isExpiringSoon = false;
      if (p.transparency?.expiryDate) {
        const diffMs = new Date(p.transparency.expiryDate) - new Date();
        expiryDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        isExpiringSoon = expiryDays >= 0 && expiryDays <= 3;
      }

      return {
        ...p,
        image: p.imageUrl || '',
        stock: p.availableQuantity,
        totalQuantity: p.quantity,
        status: isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : p.status === 'ACTIVE' ? 'Active' : p.status,
        rawStatus: p.status,
        harvestDate: p.transparency?.harvestDate
          ? new Date(p.transparency.harvestDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'N/A',
        packingDate: p.transparency?.packingDate
          ? new Date(p.transparency.packingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'N/A',
        expiryDate: p.transparency?.expiryDate
          ? new Date(p.transparency.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'N/A',
        expiryDays,
        isExpiringSoon,
        ingredients: p.transparency?.ingredients || `100% ${p.name}`,
        origin: p.transparency?.origin || p.location,
        batchNumber: p.transparency?.batchNumber || `FD-BATCH-${p.id.slice(-6).toUpperCase()}`
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        products: formatted,
        counts: {
          total: products.length,
          active: products.filter((p) => p.status === 'ACTIVE' && p.availableQuantity > 0).length,
          outOfStock: products.filter((p) => p.availableQuantity === 0 || p.status === 'OUT_OF_STOCK').length,
          lowStock: products.filter((p) => p.availableQuantity > 0 && p.availableQuantity < 15).length
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/farmers/me/orders
 * Protected: FARMER role only.
 * Returns orders containing products from this farmer, strictly isolating this farmer's items.
 */
export async function getMyFarmerOrders(req, res, next) {
  try {
    const farmerProfileId = req.user.farmerProfile?.id;
    if (!farmerProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile record is missing.'
      });
    }

    const { status, search } = req.query;

    // Find orders that have at least one OrderItem belonging to this farmer
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            farmerId: farmerProfileId
          }
        },
        ...(status && status !== 'All' && {
          status: status.toUpperCase()
        })
      },
      include: {
        consumer: {
          include: {
            user: {
              select: { name: true, phone: true }
            }
          }
        },
        items: {
          where: {
            farmerId: farmerProfileId // Multi-farmer isolation: only include this farmer's items!
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const statusMap = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      PACKED: 'Packed',
      SHIPPED: 'Out for Delivery',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled'
    };

    const formatted = orders.map((o) => {
      const farmerAmount = o.items.reduce((acc, it) => acc + it.subtotal, 0);
      const productsSummary = o.items.map((it) => `${it.product.name} (${it.quantity} ${it.product.unit})`).join(', ');

      return {
        id: `#FD${o.id.slice(-6).toUpperCase()}`,
        rawId: o.id,
        customer: o.consumer?.user?.name || 'Local Consumer',
        customerPhone: o.consumer?.user?.phone || 'Not provided',
        date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        createdAt: o.createdAt,
        status: statusMap[o.status] || o.status,
        rawStatus: o.status,
        amount: `₹${farmerAmount}`,
        totalAmount: farmerAmount,
        productsSummary,
        deliveryAddress: o.deliveryAddress,
        items: o.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          name: it.product.name,
          quantity: it.quantity,
          unit: it.product.unit,
          price: it.unitPrice,
          subtotal: it.subtotal,
          image: it.product.imageUrl
        }))
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        orders: formatted
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/farmers/me/orders/:id
 * Protected: FARMER role only. Scoped order view.
 */
export async function getMyFarmerOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const farmerProfileId = req.user.farmerProfile?.id;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { id: { endsWith: id.replace('#FD', '').replace('FD', '').toLowerCase() } },
          { id: { endsWith: id.replace('#FD', '').replace('FD', '').toUpperCase() } }
        ],
        items: {
          some: {
            farmerId: farmerProfileId
          }
        }
      },
      include: {
        consumer: {
          include: {
            user: {
              select: { name: true, phone: true }
            }
          }
        },
        items: {
          where: {
            farmerId: farmerProfileId
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                imageUrl: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you do not have permission to view this order.'
      });
    }

    const farmerAmount = order.items.reduce((acc, it) => acc + it.subtotal, 0);

    const statusMap = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      PACKED: 'Packed',
      SHIPPED: 'Out for Delivery',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled'
    };

    return res.status(200).json({
      success: true,
      data: {
        order: {
          id: `#FD${order.id.slice(-6).toUpperCase()}`,
          rawId: order.id,
          customer: order.consumer?.user?.name || 'Local Consumer',
          customerPhone: order.consumer?.user?.phone || 'Not provided',
          date: new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: statusMap[order.status] || order.status,
          rawStatus: order.status,
          amount: `₹${farmerAmount}`,
          deliveryAddress: order.deliveryAddress,
          items: order.items.map((it) => ({
            id: it.id,
            name: it.product.name,
            quantity: it.quantity,
            unit: it.product.unit,
            price: it.unitPrice,
            subtotal: it.subtotal,
            image: it.product.imageUrl
          }))
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/farmers/me/orders/:id/status
 * Protected: FARMER role only.
 * Update order fulfillment status for orders containing products from this farmer.
 */
export async function updateFarmerOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const farmerProfileId = req.user.farmerProfile?.id;
    const { status } = req.body;

    // Verify order exists and has items for this farmer
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { id: { endsWith: id.replace('#FD', '').replace('FD', '').toLowerCase() } },
          { id: { endsWith: id.replace('#FD', '').replace('FD', '').toUpperCase() } }
        ],
        items: {
          some: {
            farmerId: farmerProfileId
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied.'
      });
    }

    // Normalize status string
    const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
    const validStatuses = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Allowed statuses: ${validStatuses.join(', ')}`
      });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: normalizedStatus
      }
    });

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${updated.status}.`,
      data: {
        orderId: updated.id,
        status: updated.status,
        order: {
          id: updated.id,
          status: updated.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/farmers/me/dashboard
 * Protected: FARMER role only.
 * Returns real database statistics (no invented fake stats).
 */
export async function getFarmerDashboardStats(req, res, next) {
  try {
    const farmerProfileId = req.user.farmerProfile?.id;
    if (!farmerProfileId) {
      return res.status(400).json({
        success: false,
        message: 'Farmer profile record is missing.'
      });
    }

    const [
      totalProducts,
      activeListings,
      outOfStock,
      farmerOrderItems,
      recentOrdersRaw
    ] = await Promise.all([
      // 1. Total products
      prisma.product.count({
        where: { farmerId: farmerProfileId }
      }),
      // 2. Active listings
      prisma.product.count({
        where: {
          farmerId: farmerProfileId,
          status: 'ACTIVE',
          availableQuantity: { gt: 0 }
        }
      }),
      // 3. Out of stock
      prisma.product.count({
        where: {
          farmerId: farmerProfileId,
          OR: [
            { availableQuantity: 0 },
            { status: 'OUT_OF_STOCK' }
          ]
        }
      }),
      // 4. Farmer order items for sales calculations
      prisma.orderItem.findMany({
        where: { farmerId: farmerProfileId },
        include: {
          order: {
            select: { status: true, createdAt: true }
          }
        }
      }),
      // 5. Recent orders for this farmer
      prisma.order.findMany({
        where: {
          items: {
            some: { farmerId: farmerProfileId }
          }
        },
        include: {
          consumer: {
            include: {
              user: { select: { name: true } }
            }
          },
          items: {
            where: { farmerId: farmerProfileId },
            include: {
              product: { select: { name: true, unit: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Calculate Pending Orders count
    const pendingOrdersCount = farmerOrderItems.filter((it) => it.order.status === 'PENDING').length;

    // Calculate Total Sales (sum of subtotals of all completed/confirmed orders)
    const totalSales = farmerOrderItems
      .filter((it) => it.order.status !== 'CANCELLED')
      .reduce((acc, it) => acc + it.subtotal, 0);

    const statusMap = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      PACKED: 'Packed',
      SHIPPED: 'Out for Delivery',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled'
    };

    const recentOrders = recentOrdersRaw.map((o) => {
      const farmerAmount = o.items.reduce((acc, it) => acc + it.subtotal, 0);
      const productsSummary = o.items.map((it) => `${it.product.name} (${it.quantity} ${it.product.unit})`).join(', ');

      return {
        id: `#FD${o.id.slice(-6).toUpperCase()}`,
        rawId: o.id,
        customer: o.consumer?.user?.name || 'Local Customer',
        productsSummary,
        amount: `₹${farmerAmount}`,
        date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: statusMap[o.status] || o.status,
        rawStatus: o.status
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts: {
            value: totalProducts,
            change: `${activeListings} Active`,
            trend: 'up'
          },
          activeListings: {
            value: activeListings,
            change: `${outOfStock} Out of Stock`,
            trend: outOfStock > 0 ? 'down' : 'up'
          },
          pendingOrders: {
            value: pendingOrdersCount,
            change: pendingOrdersCount > 0 ? 'Requires attention' : 'All clear',
            trend: pendingOrdersCount > 0 ? 'up' : 'neutral'
          },
          totalSales: {
            value: `₹${totalSales.toLocaleString('en-IN')}`,
            rawValue: totalSales,
            change: 'Direct customer sales',
            trend: 'up'
          },
          outOfStock: {
            value: outOfStock
          }
        },
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/farmers
 * Public: Returns public list of farmers (never exposes credentials or private user details)
 */
export async function getPublicFarmers(req, res, next) {
  try {
    const farmers = await prisma.farmerProfile.findMany({
      select: {
        id: true,
        farmName: true,
        location: true,
        description: true,
        verified: true,
        verificationStatus: true,
        user: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            products: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = farmers.map((f) => ({
      id: f.id,
      ownerName: f.user.name,
      farmName: f.farmName,
      location: f.location,
      description: f.description,
      verified: f.verified,
      verificationStatus: f.verificationStatus,
      activeProductsCount: f._count.products
    }));

    return res.status(200).json({
      success: true,
      data: {
        farmers: formatted
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/farmers/:id
 * Public: Returns single public farmer with active products
 */
export async function getFarmerById(req, res, next) {
  try {
    const { id } = req.params;

    const farmer = await prisma.farmerProfile.findFirst({
      where: {
        OR: [
          { id },
          { userId: id },
          { farmName: { equals: id.replace(/-/g, ' '), mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        farmName: true,
        location: true,
        description: true,
        farmAcreage: true,
        verified: true,
        verificationStatus: true,
        user: {
          select: {
            name: true
          }
        },
        products: {
          where: { status: 'ACTIVE' },
          include: {
            transparency: true
          }
        }
      }
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found.'
      });
    }

    const formattedProducts = farmer.products.map((p) => ({
      ...p,
      image: p.imageUrl || '',
      farmerName: farmer.farmName,
      verified: farmer.verified,
      harvestFreshness: p.transparency?.harvestDate
        ? `Harvested on ${new Date(p.transparency.harvestDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
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
        farmer: {
          id: farmer.id,
          ownerName: farmer.user.name,
          farmName: farmer.farmName,
          location: farmer.location,
          description: farmer.description,
          farmAcreage: farmer.farmAcreage,
          verified: farmer.verified,
          verificationStatus: farmer.verificationStatus,
          products: formattedProducts
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
