import { prisma } from './src/config/db.js';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('=== STARTING SESSION 6 COMPREHENSIVE INTEGRATION TESTS ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: Canonical Category Counts & Filtering Consistency
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Category Counts & Filtering Consistency ---');
    const catalogRes = await fetch(`${BASE_URL}/products`);
    const catalogData = await catalogRes.json();
    assert(catalogRes.status === 200 && catalogData.success, 'GET /api/products returns 200');

    const counts = catalogData.data?.categoryCounts;
    assert(counts !== undefined, 'Response includes dynamic categoryCounts');
    console.log('Dynamic Category Counts:', JSON.stringify(counts, null, 2));

    assert(counts.EGGS === 1, `Eggs count is exactly 1 (found ${counts?.EGGS})`);
    assert(counts.DAIRY === 1, `Dairy count is exactly 1 (found ${counts?.DAIRY})`);
    assert(counts.VEGETABLES >= 3, `Vegetables count is >= 3 (found ${counts?.VEGETABLES})`);

    // Now test filtering with category=EGGS
    const eggsRes = await fetch(`${BASE_URL}/products?category=EGGS`);
    const eggsData = await eggsRes.json();
    assert(eggsRes.status === 200, 'GET /api/products?category=EGGS returns 200');
    assert(eggsData.data.products.length === counts.EGGS, `Filtering category=EGGS returns ${counts.EGGS} product(s) (got ${eggsData.data.products.length})`);
    assert(eggsData.data.products[0]?.name.includes('Egg'), `Returned product is Egg product: "${eggsData.data.products[0]?.name}"`);

    // Test filtering with lowercase category=eggs
    const eggsLowerRes = await fetch(`${BASE_URL}/products?category=eggs`);
    const eggsLowerData = await eggsLowerRes.json();
    assert(eggsLowerData.data.products.length === counts.EGGS, 'Filtering category=eggs (lowercase) returns identical results');

    // Test filtering with category=DAIRY
    const dairyRes = await fetch(`${BASE_URL}/products?category=DAIRY`);
    const dairyData = await dairyRes.json();
    assert(dairyData.data.products.length === counts.DAIRY, `Filtering category=DAIRY returns ${counts.DAIRY} product(s) (got ${dairyData.data.products.length})`);
    assert(dairyData.data.products[0]?.name.includes('Ghee') || dairyData.data.products[0]?.category === 'DAIRY', 'Returned product is Dairy product');

    // Test filtering with category=VEGETABLES
    const vegRes = await fetch(`${BASE_URL}/products?category=VEGETABLES`);
    const vegData = await vegRes.json();
    assert(vegData.data.products.length === counts.VEGETABLES, `Filtering category=VEGETABLES matches counts.VEGETABLES (${counts.VEGETABLES})`);

    // -------------------------------------------------------------
    // TEST 2: Consumer Authentication & Order Placement
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Consumer Login & Checkout Flow ---');
    // Login as consumer: arun@example.com / DemoConsumer123!
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'arun@example.com',
        password: 'DemoConsumer123!'
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success, 'Consumer logged in successfully');
    const cookieHeader = loginRes.headers.get('set-cookie');
    assert(cookieHeader !== null, 'Received HTTP-only session cookie');

    // Extract cookie for subsequent authenticated requests
    const cookie = cookieHeader.split(';')[0];

    // Pick an active product for ordering
    const testProduct = eggsData.data.products[0];
    assert(testProduct !== undefined, 'Found test product for ordering');
    const initialStock = testProduct.availableQuantity;
    console.log(`Product "${testProduct.name}" (ID: ${testProduct.id}) initial stock: ${initialStock}, price: ₹${testProduct.price}`);

    // Place an order for quantity 1
    const orderPayload = {
      items: [
        {
          productId: testProduct.id,
          quantity: 1
        }
      ],
      deliveryAddress: {
        fullName: 'Arun Kumar',
        phone: '+91 98402 12345',
        address: '42 Organic Avenue, Fairlands',
        city: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636016'
      },
      paymentMethod: 'Cash on Delivery' // Test string variance
    };

    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify(orderPayload)
    });
    const orderData = await orderRes.json();
    console.log('Order creation response:', JSON.stringify(orderData, null, 2));

    assert(orderRes.status === 201 && orderData.success, 'Order successfully created with 201 status');
    assert(orderData.data?.order !== undefined, 'Order returned in data.order');
    const createdOrder = orderData.data.order;
    assert(createdOrder.paymentMethod === 'COD', `Payment method normalized to 'COD' (got ${createdOrder.paymentMethod})`);
    assert(createdOrder.items.length === 1, 'Order has exactly 1 item');
    assert(createdOrder.items[0].price === testProduct.price, `Item price locked to database price ₹${testProduct.price}`);
    assert(createdOrder.subtotal === testProduct.price, `Subtotal calculated correctly: ₹${createdOrder.subtotal}`);
    assert(createdOrder.totalAmount === testProduct.price + 40, `Total includes ₹40 delivery fee: ₹${createdOrder.totalAmount}`);

    // -------------------------------------------------------------
    // TEST 3: Database Verification: Stock Decrement & Transaction
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Database State & Inventory Decrement ---');
    const updatedDbProduct = await prisma.product.findUnique({
      where: { id: testProduct.id }
    });
    assert(
      updatedDbProduct.availableQuantity === initialStock - 1,
      `Database availableQuantity decremented from ${initialStock} to ${updatedDbProduct.availableQuantity}`
    );

    // -------------------------------------------------------------
    // TEST 4: Stock Protection / Over-Order Validation
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Insufficient Stock Rejection ---');
    const excessiveQty = updatedDbProduct.availableQuantity + 999;
    const overOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({
        items: [{ productId: testProduct.id, quantity: excessiveQty }],
        deliveryAddress: 'Salem, Tamil Nadu',
        paymentMethod: 'COD'
      })
    });
    const overOrderData = await overOrderRes.json();
    assert(
      overOrderRes.status === 400 && overOrderData.code === 'INSUFFICIENT_STOCK',
      `Correctly rejected over-order with 400 and code INSUFFICIENT_STOCK: "${overOrderData.message}"`
    );

    // -------------------------------------------------------------
    // TEST 5: Consumer Order History & Order Details
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Consumer Order History ---');
    const consumerOrdersRes = await fetch(`${BASE_URL}/orders`, {
      headers: { 'Cookie': cookie }
    });
    const consumerOrdersData = await consumerOrdersRes.json();
    assert(consumerOrdersRes.status === 200 && consumerOrdersData.success, 'GET /api/orders returns 200');
    assert(consumerOrdersData.data.orders.length > 0, `Consumer orders list returned ${consumerOrdersData.data.orders.length} order(s)`);
    assert(consumerOrdersData.data.orders[0].id === createdOrder.id, 'Most recent order matches created order ID');

    // Fetch single order details
    const orderDetailRes = await fetch(`${BASE_URL}/orders/${createdOrder.rawId}`, {
      headers: { 'Cookie': cookie }
    });
    const orderDetailData = await orderDetailRes.json();
    console.log('Order Detail Response Status:', orderDetailRes.status, 'Body:', JSON.stringify(orderDetailData, null, 2));
    assert(orderDetailRes.status === 200 && orderDetailData.success, 'GET /api/orders/:id returns 200');
    assert(orderDetailData.data?.order?.rawId === createdOrder.rawId, 'Order details match requested ID');

    // -------------------------------------------------------------
    // TEST 6: Farmer View & Status Lifecycle
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Farmer Order Management ---');
    // Login as farmer: ravi@farmdirect.example / DemoFarmer123!
    const farmerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ravi@farmdirect.example',
        password: 'DemoFarmer123!'
      })
    });
    const farmerLoginData = await farmerLoginRes.json();
    assert(farmerLoginRes.status === 200 && farmerLoginData.success, 'Farmer logged in successfully');
    const farmerCookie = farmerLoginRes.headers.get('set-cookie').split(';')[0];

    const farmerOrdersRes = await fetch(`${BASE_URL}/farmers/me/orders`, {
      headers: { 'Cookie': farmerCookie }
    });
    const farmerOrdersData = await farmerOrdersRes.json();
    assert(farmerOrdersRes.status === 200 && farmerOrdersData.success, 'GET /api/farmers/me/orders returns 200');
    const farmerOrder = farmerOrdersData.data.orders.find((o) => o.rawId === createdOrder.rawId || o.id === createdOrder.id);
    assert(farmerOrder !== undefined, 'Farmer can see the new order containing their product');

    // Update order status: PENDING -> CONFIRMED
    const updateStatusRes = await fetch(`${BASE_URL}/farmers/me/orders/${createdOrder.rawId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': farmerCookie
      },
      body: JSON.stringify({ status: 'CONFIRMED' })
    });
    const updateStatusData = await updateStatusRes.json();
    assert(updateStatusRes.status === 200 && updateStatusData.success, 'Farmer updated status to CONFIRMED');
    assert(updateStatusData.data.order.status === 'CONFIRMED', 'Updated status is CONFIRMED');

    // Verify consumer sees updated CONFIRMED status
    const verifiedOrderRes = await fetch(`${BASE_URL}/orders/${createdOrder.rawId}`, {
      headers: { 'Cookie': cookie }
    });
    const verifiedOrderData = await verifiedOrderRes.json();
    assert(verifiedOrderData.data.order.rawStatus === 'CONFIRMED', 'Consumer sees updated rawStatus CONFIRMED');

    console.log('\n=============================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('=============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Unhandled error during integration tests:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
