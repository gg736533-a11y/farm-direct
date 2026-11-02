import { prisma } from '../config/db.js';

/**
 * Format delivery address object or string into standardized delivery string
 */
function formatDeliveryAddress(deliveryAddress) {
  if (typeof deliveryAddress === 'string') return deliveryAddress.trim();
  if (!deliveryAddress) return '';
  const { fullName, phone, address, city, state = 'Tamil Nadu', pincode } = deliveryAddress;
  return `${fullName} (${phone}), ${address}, ${city}, ${state} - ${pincode}`;
}

/**
 * POST /api/orders
 * Protected: CONSUMER role only.
 * Atomic transaction: Validates stock, calculates real prices, creates Order + OrderItems, decrements stock.
 */
export async function createOrder(req, res, next) {
  try {
    let consumerProfileId = req.user.consumerProfile?.id;
    if (!consumerProfileId) {
      // Auto-upsert consumer profile if missing for authenticated consumer
      const cp = await prisma.consumerProfile.upsert({
        where: { userId: req.user.id },
        update: {},
        create: {
          userId: req.user.id,
          phone: req.user.phone || '',
          defaultAddress: ''
        }
      });
      consumerProfileId = cp.id;
    }

    const { items, deliveryAddress, paymentMethod = 'COD' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        code: 'EMPTY_CART',
        message: 'Your order must contain at least one item.'
      });
    }

    // Normalize payment method to uppercase enum: 'COD', 'UPI', or 'CARD'
    let normPayment = 'COD';
    if (typeof paymentMethod === 'string') {
      const pmUpper = paymentMethod.toUpperCase();
      if (pmUpper.includes('UPI')) normPayment = 'UPI';
      else if (pmUpper.includes('CARD')) normPayment = 'CARD';
      else normPayment = 'COD';
    }

    // 1. Fetch current live database records for all requested products
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      include: {
        farmer: {
          select: {
            id: true,
            farmName: true
          }
        }
      }
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // 2. Validate all products exist, are ACTIVE, and have sufficient stock
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          code: 'PRODUCT_NOT_FOUND',
          message: `Product with ID ${item.productId} was not found.`
        });
      }

      if (product.status !== 'ACTIVE') {
        return res.status(409).json({
          success: false,
          code: 'PRODUCT_INACTIVE',
          message: `Product "${product.name}" is currently ${product.status.toLowerCase().replace('_', ' ')} and cannot be purchased.`
        });
      }

      const requestedQty = parseInt(item.quantity, 10) || 1;
      if (requestedQty <= 0) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_QUANTITY',
          message: `Invalid quantity for product "${product.name}".`
        });
      }

      if (product.availableQuantity < requestedQty) {
        return res.status(400).json({
          success: false,
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for "${product.name}". Only ${product.availableQuantity} available (requested ${requestedQty}).`
        });
      }
    }

    // 3. Calculate subtotal strictly from database prices (Never trust frontend price/total)
    let calculatedSubtotal = 0;
    const orderItemsToCreate = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      const qty = parseInt(item.quantity, 10);
      const itemSubtotal = product.price * qty;
      calculatedSubtotal += itemSubtotal;

      orderItemsToCreate.push({
        productId: product.id,
        farmerId: product.farmerId,
        quantity: qty,
        unitPrice: product.price, // Lock in price at moment of purchase
        subtotal: itemSubtotal
      });
    }

    const deliveryFee = calculatedSubtotal > 0 ? 40 : 0;
    const totalAmount = calculatedSubtotal + deliveryFee;
    const formattedAddress = formatDeliveryAddress(deliveryAddress);

    // 4. Atomic MySQL Transaction:
    //    a) Create Order
    //    b) Create OrderItems
    //    c) Decrement availableQuantity
    //    d) Toggle OUT_OF_STOCK if inventory depleted
    const result = await prisma.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          consumerId: consumerProfileId,
          status: 'PENDING',
          totalAmount,
          deliveryAddress: formattedAddress,
          paymentMethod: normPayment,
          items: {
            create: orderItemsToCreate
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  unit: true,
                  imageUrl: true
                }
              },
              farmer: {
                select: {
                  id: true,
                  farmName: true
                }
              }
            }
          }
        }
      });

      // Update Stock for each product
      for (const item of items) {
        const product = productMap.get(item.productId);
        const qty = parseInt(item.quantity, 10);
        const remainingStock = product.availableQuantity - qty;

        await tx.product.update({
          where: { id: product.id },
          data: {
            availableQuantity: remainingStock,
            ...(remainingStock === 0 && { status: 'OUT_OF_STOCK' })
          }
        });
      }

      return newOrder;
    });

    // Format convenient response for consumer UI
    const formattedOrder = {
      id: `#FD${result.id.slice(-6).toUpperCase()}`,
      rawId: result.id,
      orderDate: new Date(result.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: result.createdAt,
      status: result.status,
      total: result.totalAmount,
      totalAmount: result.totalAmount,
      subtotal: calculatedSubtotal,
      deliveryFee,
      deliveryAddress: result.deliveryAddress,
      paymentMethod: result.paymentMethod,
      farmerName: result.items[0]?.farmer?.farmName || 'Direct Farmers',
      items: result.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.product.name,
        quantity: it.quantity,
        unit: it.product.unit,
        price: it.unitPrice,
        total: it.subtotal,
        image: it.product.imageUrl,
        farmerName: it.farmer?.farmName || 'Direct Farmers',
        farmerId: it.farmerId
      })),
      timeline: [
        { step: 'Order Placed', time: 'Just now', completed: true },
        { step: 'Confirmed', time: 'Pending farm acknowledgement', completed: false },
        { step: 'Packed', time: 'In farm packing center', completed: false },
        { step: 'Out for Delivery', time: 'Pending dispatch', completed: false },
        { step: 'Delivered', time: 'Estimated in 2-3 days', completed: false }
      ]
    };

    return res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: {
        order: formattedOrder
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders
 * Protected: CONSUMER role only. Returns real orders belonging to authenticated consumer.
 */
export async function getConsumerOrders(req, res, next) {
  try {
    let consumerProfileId = req.user.consumerProfile?.id;
    if (!consumerProfileId) {
      const cp = await prisma.consumerProfile.findUnique({
        where: { userId: req.user.id }
      });
      if (cp) {
        consumerProfileId = cp.id;
      } else {
        return res.status(200).json({
          success: true,
          data: { orders: [] }
        });
      }
    }

    const orders = await prisma.order.findMany({
      where: {
        consumerId: consumerProfileId
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                imageUrl: true
              }
            },
            farmer: {
              select: {
                id: true,
                farmName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = orders.map((o) => {
      const subtotal = o.items.reduce((acc, it) => acc + it.subtotal, 0);
      const deliveryFee = Math.round(o.totalAmount - subtotal);

      return {
        id: `#FD${o.id.slice(-6).toUpperCase()}`,
        rawId: o.id,
        orderDate: new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        createdAt: o.createdAt,
        status: o.status === 'PENDING' ? 'Pending' : o.status === 'CONFIRMED' ? 'Confirmed' : o.status === 'PACKED' ? 'Packed' : o.status === 'SHIPPED' ? 'Out for Delivery' : o.status === 'DELIVERED' ? 'Delivered' : 'Cancelled',
        rawStatus: o.status,
        farmerName: o.items[0]?.farmer?.farmName || 'Local Farm',
        farmerId: o.items[0]?.farmerId || '',
        total: o.totalAmount,
        subtotal,
        deliveryFee: deliveryFee >= 0 ? deliveryFee : 40,
        deliveryAddress: o.deliveryAddress,
        paymentMethod: o.paymentMethod === 'COD' ? 'Cash on Delivery' : o.paymentMethod === 'UPI' ? 'UPI' : 'Card',
        items: o.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          name: it.product.name,
          quantity: it.quantity,
          unit: it.product.unit,
          price: it.unitPrice,
          total: it.subtotal,
          image: it.product.imageUrl,
          farmerName: it.farmer.farmName
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
 * GET /api/orders/:id
 * Protected: CONSUMER role only. View single order details with ownership verification.
 */
export async function getConsumerOrderById(req, res, next) {
  try {
    const { id } = req.params;
    let consumerProfileId = req.user.consumerProfile?.id;
    if (!consumerProfileId) {
      const cp = await prisma.consumerProfile.findUnique({
        where: { userId: req.user.id }
      });
      consumerProfileId = cp?.id;
    }

    // Search by raw cuid or formatted #FD prefix
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { id: { endsWith: id.replace('#FD', '').replace('FD', '').toLowerCase() } },
          { id: { endsWith: id.replace('#FD', '').replace('FD', '').toUpperCase() } }
        ]
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
                imageUrl: true
              }
            },
            farmer: {
              select: {
                id: true,
                farmName: true,
                location: true,
                user: {
                  select: { name: true, phone: true }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    // Enforce ownership: Consumer can only access their own order
    if (order.consumerId !== consumerProfileId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not authorized to view orders belonging to another consumer.'
      });
    }

    const subtotal = order.items.reduce((acc, it) => acc + it.subtotal, 0);
    const deliveryFee = Math.max(0, Math.round(order.totalAmount - subtotal));

    const statusMap = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      PACKED: 'Packed',
      SHIPPED: 'Out for Delivery',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled'
    };

    const formattedOrder = {
      id: `#FD${order.id.slice(-6).toUpperCase()}`,
      rawId: order.id,
      orderDate: new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdAt: order.createdAt,
      status: statusMap[order.status] || order.status,
      rawStatus: order.status,
      farmerName: order.items[0]?.farmer?.farmName || 'Verified Farm',
      farmerId: order.items[0]?.farmerId || '',
      farmerPhone: order.items[0]?.farmer?.user?.phone || '+91 94431 87654',
      total: order.totalAmount,
      subtotal,
      deliveryFee,
      deliveryAddress: order.deliveryAddress,
      paymentMethod: order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod === 'UPI' ? 'UPI' : 'Card',
      items: order.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        name: it.product.name,
        quantity: it.quantity,
        unit: it.product.unit,
        price: it.unitPrice,
        total: it.subtotal,
        image: it.product.imageUrl,
        farmerName: it.farmer.farmName
      })),
      timeline: [
        { step: 'Order Placed', time: new Date(order.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), completed: true },
        { step: 'Confirmed', time: ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'Confirmed by farm' : 'Pending', completed: ['CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'].includes(order.status) },
        { step: 'Packed', time: ['PACKED', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'Eco-boxed at farm hub' : 'Scheduled', completed: ['PACKED', 'SHIPPED', 'DELIVERED'].includes(order.status) },
        { step: 'Out for Delivery', time: ['SHIPPED', 'DELIVERED'].includes(order.status) ? 'Dispatched on runner' : 'Pending dispatch', completed: ['SHIPPED', 'DELIVERED'].includes(order.status) },
        { step: 'Delivered', time: order.status === 'DELIVERED' ? 'Delivered to customer' : 'Estimated in 2-3 days', completed: order.status === 'DELIVERED' }
      ]
    };

    return res.status(200).json({
      success: true,
      data: {
        order: formattedOrder
      }
    });
  } catch (error) {
    next(error);
  }
}
