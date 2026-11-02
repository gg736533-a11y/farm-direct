/**
 * Session 6 Comprehensive Verification Script
 * Tests all 38 requirements covering Farmer Product Management, Consumer Shopping,
 * Security & Pricing Tampering, Stock Deductions, Atomic Transactions,
 * Multi-Farmer Order Isolation, and Favorites.
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const cookies = res.headers.get('set-cookie');
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data, cookies, ok: res.ok };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('🧪 Starting FarmDirect Session 6 Full End-to-End Verification');
  console.log('=============================================================\n');

  // 1. Health Check
  console.log('--- 1. Health & Server Check ---');
  const healthRes = await request(`${BASE_URL}/health`);
  assert(healthRes.status === 200 && healthRes.data?.status === 'ok', 'Server health endpoint returns 200 OK');

  // 2. Authentication
  console.log('\n--- 2. Authentication Checks ---');
  // 2.1 Farmer Login
  const farmerLogin = await request(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'ravi@farmdirect.example', password: 'DemoFarmer123!' })
  });
  assert(farmerLogin.status === 200 && farmerLogin.data?.success === true, 'Farmer login successful');
  assert(farmerLogin.data?.data?.user?.role === 'FARMER', 'User role is FARMER');
  const farmerCookie = farmerLogin.cookies ? farmerLogin.cookies.split(';')[0] : '';
  assert(farmerCookie.includes('farmdirect_token='), 'HTTP-only authentication cookie received for farmer');

  // 2.2 Consumer Login
  const consumerLogin = await request(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'arun@example.com', password: 'DemoConsumer123!' })
  });
  assert(consumerLogin.status === 200 && consumerLogin.data?.success === true, 'Consumer login successful');
  assert(consumerLogin.data?.data?.user?.role === 'CONSUMER', 'User role is CONSUMER');
  const consumerCookie = consumerLogin.cookies ? consumerLogin.cookies.split(';')[0] : '';
  assert(consumerCookie.includes('farmdirect_token='), 'HTTP-only authentication cookie received for consumer');

  // 3. Farmer Product Management
  console.log('\n--- 3. Farmer Product Management ---');
  // 3.1 Get Farmer's Products
  const myProductsRes = await request(`${BASE_URL}/farmers/me/products`, {
    headers: { Cookie: farmerCookie }
  });
  assert(myProductsRes.status === 200 && Array.isArray(myProductsRes.data?.data?.products), 'Farmer can list their own products');
  const initialProductCount = myProductsRes.data?.data?.products?.length || 0;
  console.log(`     (Farmer has ${initialProductCount} products currently)`);

  // 3.2 Date Validation on Product Creation (Expiry before Harvest MUST fail)
  const invalidDateProduct = await request(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { Cookie: farmerCookie },
    body: JSON.stringify({
      name: 'Invalid Date Mangoes',
      category: 'fruits',
      description: 'Juicy organic Salem mangoes',
      price: 150,
      unit: '1 kg',
      availableQuantity: 20,
      location: 'Salem, Tamil Nadu',
      harvestDate: '2026-09-25T00:00:00.000Z',
      expiryDate: '2026-09-20T00:00:00.000Z' // Expiry is before harvest!
    })
  });
  assert(invalidDateProduct.status === 400, 'Product with expiryDate < harvestDate rejected with 400 Bad Request');

  // 3.3 Valid Product Creation
  const newProductRes = await request(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { Cookie: farmerCookie },
    body: JSON.stringify({
      name: 'Salem Malgova Mangoes Test',
      category: 'fruits',
      description: 'Naturally ripened authentic Salem Malgova mangoes',
      price: 140,
      unit: '1 kg',
      quantity: 50,
      availableQuantity: 50,
      location: 'Salem, Tamil Nadu',
      harvestDate: '2026-09-18T00:00:00.000Z',
      packingDate: '2026-09-18T00:00:00.000Z',
      expiryDate: '2026-09-28T00:00:00.000Z',
      origin: 'Ravi Organic Orchards, Salem',
      ingredients: '100% Tree-Ripened Fresh Mangoes'
    })
  });
  assert(newProductRes.status === 201 && newProductRes.data?.success === true, 'Farmer successfully created a new product with transparency data');
  const createdProductId = newProductRes.data?.data?.product?.id;
  assert(createdProductId !== undefined, `Created product ID: ${createdProductId}`);

  // 3.4 Consumer cannot create a product (Role check)
  const consumerCreateProduct = await request(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { Cookie: consumerCookie },
    body: JSON.stringify({
      name: 'Hacker Apples',
      category: 'fruits',
      description: 'Unauthorized creation',
      price: 100,
      unit: '1 kg',
      availableQuantity: 10,
      location: 'Salem'
    })
  });
  assert(consumerCreateProduct.status === 403, 'Consumer forbidden from creating products (403 Forbidden)');

  // 3.5 Quick stock update: set to 0 -> auto OUT_OF_STOCK
  const setZeroStock = await request(`${BASE_URL}/products/${createdProductId}`, {
    method: 'PATCH',
    headers: { Cookie: farmerCookie },
    body: JSON.stringify({ availableQuantity: 0 })
  });
  assert(setZeroStock.status === 200, 'Farmer updated stock to 0');
  assert(setZeroStock.data?.data?.product?.status === 'OUT_OF_STOCK', 'Setting stock to 0 automatically flips status to OUT_OF_STOCK');

  // 3.6 Quick stock update: restore stock > 0 -> auto ACTIVE
  const restoreStock = await request(`${BASE_URL}/products/${createdProductId}`, {
    method: 'PATCH',
    headers: { Cookie: farmerCookie },
    body: JSON.stringify({ availableQuantity: 35 })
  });
  assert(restoreStock.status === 200, 'Farmer updated stock to 35');
  assert(restoreStock.data?.data?.product?.status === 'ACTIVE', 'Restoring stock > 0 automatically restores status to ACTIVE');

  // 4. Consumer Shopping, Search, & Filters
  console.log('\n--- 4. Consumer Shopping & Filtering ---');
  // 4.1 Search by query
  const searchRes = await request(`${BASE_URL}/products?search=Malgova`);
  assert(searchRes.status === 200, 'Search query endpoint returns 200');
  assert(searchRes.data?.data?.products?.some(p => p.id === createdProductId), 'Search query found newly created product');

  // 4.2 Category filter
  const categoryRes = await request(`${BASE_URL}/products?category=fruits`);
  assert(categoryRes.status === 200, 'Category filter returns 200');
  assert(categoryRes.data?.data?.products?.every(p => p.category?.toLowerCase() === 'fruits'), 'All products in response match category fruits');

  // 4.3 Price filter
  const priceFilterRes = await request(`${BASE_URL}/products?minPrice=50&maxPrice=150`);
  assert(priceFilterRes.status === 200, 'Price filter returns 200');
  assert(priceFilterRes.data?.data?.products?.every(p => p.price >= 50 && p.price <= 150), 'All products fall within price range [50, 150]');

  // 4.4 Get single product details with transparency
  const detailRes = await request(`${BASE_URL}/products/${createdProductId}`);
  assert(detailRes.status === 200 && detailRes.data?.data?.product?.transparency !== null, 'Single product details includes transparency metadata');

  // 5. Favorites
  console.log('\n--- 5. Favorites Persistence ---');
  // 5.1 Add to favorites
  const addFavRes = await request(`${BASE_URL}/favorites`, {
    method: 'POST',
    headers: { Cookie: consumerCookie },
    body: JSON.stringify({ productId: createdProductId })
  });
  assert(addFavRes.status === 200 || addFavRes.status === 201, 'Consumer added product to favorites');

  // 5.2 List favorites
  const listFavRes = await request(`${BASE_URL}/favorites`, {
    headers: { Cookie: consumerCookie }
  });
  assert(listFavRes.status === 200, 'Consumer listed favorites');
  const favIds = listFavRes.data?.data?.favorites || [];
  assert(favIds.includes(createdProductId), 'Favorites list contains the favorited product ID');

  // 5.3 Remove from favorites
  const removeFavRes = await request(`${BASE_URL}/favorites/${createdProductId}`, {
    method: 'DELETE',
    headers: { Cookie: consumerCookie }
  });
  assert(removeFavRes.status === 200, 'Consumer removed product from favorites');

  // 6. Security, Pricing Tampering & Order Creation
  console.log('\n--- 6. Orders, Security & Stock Verification ---');
  // 6.1 Stock limit enforcement: ordering more than available
  const excessOrder = await request(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { Cookie: consumerCookie },
    body: JSON.stringify({
      items: [{ productId: createdProductId, quantity: 9999 }], // More than 35 available
      deliveryAddress: '12 Anna Nagar, Chennai - 600040',
      paymentMethod: 'COD'
    })
  });
  assert(excessOrder.status === 400, 'Ordering more than available stock rejected with 400 Bad Request');

  // 6.2 Price tampering test: Frontend sends unitPrice: 1 and subtotal: 2, but actual DB price is 140!
  const tamperOrder = await request(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { Cookie: consumerCookie },
    body: JSON.stringify({
      items: [{ productId: createdProductId, quantity: 2, price: 1, subtotal: 2 }], // Tampered!
      deliveryAddress: '12 Anna Nagar, Chennai - 600040',
      paymentMethod: 'COD',
      totalAmount: 2 // Tampered total!
    })
  });
  assert(tamperOrder.status === 201, 'Order created successfully');
  // Check that backend ignored frontend price (1) and calculated 2 * 140 = 280 + 40 delivery fee = 320
  const createdOrder = tamperOrder.data?.data?.order;
  assert(createdOrder.totalAmount === 320, `Backend security enforced: actual total is ₹320 (₹280 items + ₹40 delivery fee, not tampered ₹2)`);

  // 6.3 Verify atomic stock decrement in DB (35 - 2 = 33)
  const productAfterOrder = await request(`${BASE_URL}/products/${createdProductId}`);
  assert(productAfterOrder.data?.data?.product?.availableQuantity === 33, 'Product availableQuantity atomically decremented from 35 to 33 in MySQL');

  // 6.4 Consumer Order History
  const consumerOrders = await request(`${BASE_URL}/orders`, {
    headers: { Cookie: consumerCookie }
  });
  assert(consumerOrders.status === 200 && consumerOrders.data?.data?.orders?.length > 0, 'Consumer can view their order history');

  // 6.5 Consumer Single Order Detail
  const singleOrderRes = await request(`${BASE_URL}/orders/${createdOrder.id}`, {
    headers: { Cookie: consumerCookie }
  });
  assert(singleOrderRes.status === 200, 'Consumer can view single order detail');

  // 7. Farmer Order Management & Dashboard
  console.log('\n--- 7. Farmer Order Management & Isolation ---');
  // 7.1 Farmer Orders List (Isolated to farmer's products)
  const farmerOrdersRes = await request(`${BASE_URL}/farmers/me/orders`, {
    headers: { Cookie: farmerCookie }
  });
  assert(farmerOrdersRes.status === 200, 'Farmer can list orders containing their products');
  const foundOrder = farmerOrdersRes.data?.data?.orders?.find(o => o.rawId === createdOrder.id || o.id.includes(createdOrder.id.slice(-6).toUpperCase()));
  assert(foundOrder !== undefined, 'Farmer found the order placed by consumer');

  // 7.2 Farmer Order Status Progression
  const orderIdToUpdate = foundOrder?.rawId || createdOrder.id;
  // Advance to CONFIRMED
  const statusConfirmed = await request(`${BASE_URL}/farmers/me/orders/${orderIdToUpdate}/status`, {
    method: 'PATCH',
    headers: { Cookie: farmerCookie },
    body: JSON.stringify({ status: 'CONFIRMED' })
  });
  assert(statusConfirmed.status === 200 && statusConfirmed.data?.data?.status === 'CONFIRMED', 'Farmer advanced order status to CONFIRMED');

  // Advance to PACKED
  const statusPacked = await request(`${BASE_URL}/farmers/me/orders/${orderIdToUpdate}/status`, {
    method: 'PATCH',
    headers: { Cookie: farmerCookie },
    body: JSON.stringify({ status: 'PACKED' })
  });
  assert(statusPacked.status === 200 && statusPacked.data?.data?.status === 'PACKED', 'Farmer advanced order status to PACKED');

  // Advance to SHIPPED (Out for Delivery)
  const statusShipped = await request(`${BASE_URL}/farmers/me/orders/${orderIdToUpdate}/status`, {
    method: 'PATCH',
    headers: { Cookie: farmerCookie },
    body: JSON.stringify({ status: 'SHIPPED' })
  });
  assert(statusShipped.status === 200 && statusShipped.data?.data?.status === 'SHIPPED', 'Farmer advanced order status to SHIPPED');

  // Advance to DELIVERED
  const statusDelivered = await request(`${BASE_URL}/farmers/me/orders/${orderIdToUpdate}/status`, {
    method: 'PATCH',
    headers: { Cookie: farmerCookie },
    body: JSON.stringify({ status: 'DELIVERED' })
  });
  assert(statusDelivered.status === 200 && statusDelivered.data?.data?.status === 'DELIVERED', 'Farmer advanced order status to DELIVERED');

  // Reject Invalid Status
  const invalidStatusRes = await request(`${BASE_URL}/farmers/me/orders/${orderIdToUpdate}/status`, {
    method: 'PATCH',
    headers: { Cookie: farmerCookie },
    body: JSON.stringify({ status: 'INVALID_STATUS_XYZ' })
  });
  assert(invalidStatusRes.status === 400, 'Invalid order status rejected with 400 Bad Request');

  // 7.3 Farmer Dashboard Real Statistics (Not fake mock data)
  const dashboardRes = await request(`${BASE_URL}/farmers/me/dashboard`, {
    headers: { Cookie: farmerCookie }
  });
  assert(dashboardRes.status === 200, 'Farmer dashboard endpoint returns 200 OK');
  const dashData = dashboardRes.data?.data;
  assert(dashData?.stats?.totalProducts?.value > 0, `Dashboard totalProducts: ${dashData?.stats?.totalProducts?.value}`);
  assert(dashData?.stats?.activeListings?.value > 0, `Dashboard activeListings: ${dashData?.stats?.activeListings?.value}`);
  assert(dashData?.stats?.totalSales?.rawValue >= 280, `Dashboard real sales: ${dashData?.stats?.totalSales?.value} (contains confirmed sales)`);

  // 8. Safe Product Deletion (Ordered product soft-deactivates, does not violate foreign keys)
  console.log('\n--- 8. Safe Product Deletion / Inactivation ---');
  const deleteOrderedProduct = await request(`${BASE_URL}/products/${createdProductId}`, {
    method: 'DELETE',
    headers: { Cookie: farmerCookie }
  });
  assert(deleteOrderedProduct.status === 200, 'Delete product endpoint executed cleanly');
  assert(deleteOrderedProduct.data?.message?.includes('deactivated') || deleteOrderedProduct.data?.data?.product?.status === 'INACTIVE', 'Product with existing orders was safely deactivated without throwing foreign key database error');

  // 9. Error Sanitization (No DB stack traces leaked)
  console.log('\n--- 9. Error Sanitization & Security ---');
  const badEndpointRes = await request(`${BASE_URL}/products/invalid-uuid-99999`);
  assert(badEndpointRes.status === 404, 'Non-existent product returned 404');
  const rawResponse = JSON.stringify(badEndpointRes.data);
  assert(!rawResponse.includes('PrismaClientKnownRequestError') && !rawResponse.includes('at async') && !rawResponse.includes('prisma'), 'Database stack traces and Prisma internals are NOT leaked in error response');

  console.log('\n=============================================================');
  console.log(`📊 Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
