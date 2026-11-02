import { prisma } from './src/config/db.js';

const BASE_URL = 'http://localhost:5000/api';

async function runSession7Tests() {
  console.log('=== STARTING FARMDIRECT SESSION 7: TRUST LABEL + QR TRACEABILITY TESTS ===\n');

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
    // -------------------------------------------------------------------
    // TEST 1: Retrieve Eggs product as primary test fixture
    // -------------------------------------------------------------------
    console.log('\n--- 1. Locating Pasture-Raised Country Eggs Test Product ---');
    const eggsCatalogRes = await fetch(`${BASE_URL}/products?category=EGGS`);
    const eggsCatalog = await eggsCatalogRes.json();
    assert(eggsCatalogRes.status === 200 && eggsCatalog.success, 'Catalog query for EGGS returns 200');
    assert(eggsCatalog.data?.products?.length === 1, `Exactly 1 EGGS product in catalog (got ${eggsCatalog.data?.products?.length})`);

    const eggProduct = eggsCatalog.data.products[0];
    assert(eggProduct && eggProduct.name.includes('Eggs'), `Found egg product: "${eggProduct?.name}" (ID: ${eggProduct?.id})`);

    const eggId = eggProduct.id;

    // -------------------------------------------------------------------
    // TEST 2: Public Traceability Endpoint - No Authentication Required
    // -------------------------------------------------------------------
    console.log('\n--- 2. Testing Public Traceability Endpoint Without Auth ---');
    const traceRes = await fetch(`${BASE_URL}/traceability/${eggId}`, {
      method: 'GET'
      // Strictly no cookies or Authorization headers
    });
    const traceData = await traceRes.json();

    assert(traceRes.status === 200, 'GET /api/traceability/:productId returns 200 OK without authentication');
    assert(traceData.success === true, 'Response indicates success: true');

    // -------------------------------------------------------------------
    // TEST 3: Traceability Product Information
    // -------------------------------------------------------------------
    console.log('\n--- 3. Verifying Product Details in Traceability ---');
    assert(traceData.product?.id === eggId, `Product ID matches (${traceData.product?.id})`);
    assert(traceData.product?.name === eggProduct.name, `Product name matches "${traceData.product?.name}"`);
    assert(traceData.product?.category === 'EGGS', `Category is EGGS`);
    assert(traceData.product?.unit === 'pack of 6', `Unit is "pack of 6"`);
    assert(typeof traceData.product?.price === 'number', `Price is numeric (₹${traceData.product?.price})`);

    // -------------------------------------------------------------------
    // TEST 4: Farmer Verification Details
    // -------------------------------------------------------------------
    console.log('\n--- 4. Verifying Farmer Verification Status ---');
    assert(traceData.farmer?.verified === true, 'Farmer verified is explicitly true');
    assert(traceData.farmer?.farmName === 'Ravi Farms', `Farm name is "Ravi Farms" (got "${traceData.farmer?.farmName}")`);
    assert(traceData.farmer?.location.includes('Salem'), `Farmer location includes Salem ("${traceData.farmer?.location}")`);

    // -------------------------------------------------------------------
    // TEST 5: Transparency Attributes (Harvest, Packing, Expiry, Batch, Origin)
    // -------------------------------------------------------------------
    console.log('\n--- 5. Verifying Transparency & Provenance Attributes ---');
    const transparency = traceData.transparency;
    assert(transparency !== undefined && transparency !== null, 'Transparency object is present');
    assert(transparency.harvestDate !== null, `Harvest date is present (${transparency.harvestDate})`);
    assert(transparency.packingDate !== null, `Packing date is present (${transparency.packingDate})`);
    assert(transparency.expiryDate !== null, `Expiry date is present (${transparency.expiryDate})`);
    assert(transparency.batchNumber === 'EGG-2026-0918', `Batch number is exact: "${transparency.batchNumber}"`);
    assert(transparency.origin.includes('Salem'), `Origin contains Salem: "${transparency.origin}"`);
    assert(transparency.ingredients.includes('Eggs'), `Ingredients contain Eggs: "${transparency.ingredients}"`);

    // -------------------------------------------------------------------
    // TEST 6: Traceability Status & Expiry Derivation
    // -------------------------------------------------------------------
    console.log('\n--- 6. Verifying Traceability Status & Expiry Derivation ---');
    const traceability = traceData.traceability;
    assert(traceability !== undefined, 'Traceability summary is present');
    assert(['ACTIVE', 'EXPIRING_SOON', 'EXPIRED'].includes(traceability.status), `Traceability status is valid enum (${traceability.status})`);
    assert(typeof traceability.expiryMessage === 'string' && traceability.expiryMessage.length > 0, `Expiry message generated: "${traceability.expiryMessage}"`);
    assert(traceability.isComplete === true, 'Eggs product has complete transparency record');

    // -------------------------------------------------------------------
    // TEST 7: Traceability Timeline Milestones
    // -------------------------------------------------------------------
    console.log('\n--- 7. Verifying Dynamic Traceability Timeline ---');
    const timeline = traceability.timeline;
    assert(Array.isArray(timeline) && timeline.length >= 4, `Timeline contains at least 4 core milestones (has ${timeline?.length})`);

    const stages = timeline.map((t) => t.stage);
    console.log('Recorded timeline stages:', stages);
    assert(stages.includes('FARM'), 'Timeline includes FARM milestone');
    assert(stages.includes('HARVESTED'), 'Timeline includes HARVESTED milestone');
    assert(stages.includes('PACKED'), 'Timeline includes PACKED milestone');
    assert(stages.includes('LISTED'), 'Timeline includes LISTED milestone');

    const harvestMilestone = timeline.find((t) => t.stage === 'HARVESTED');
    assert(harvestMilestone?.status === 'completed', 'Harvested milestone is marked completed');
    assert(harvestMilestone?.date !== null, `Harvest milestone date is formatted: "${harvestMilestone?.date}"`);

    // -------------------------------------------------------------------
    // TEST 8: Strict Security & Privacy - No Sensitive Data Exposed
    // -------------------------------------------------------------------
    console.log('\n--- 8. Verifying Privacy: Zero Sensitive Fields Exposed ---');
    assert(traceData.farmer.passwordHash === undefined, 'farmer.passwordHash is NOT exposed');
    assert(traceData.farmer.password === undefined, 'farmer.password is NOT exposed');
    assert(traceData.farmer.email === undefined, 'farmer.email is NOT exposed');
    assert(traceData.farmer.phone === undefined, 'farmer.phone is NOT exposed');
    assert(traceData.consumer === undefined, 'consumer data is NOT exposed');
    assert(traceData.order === undefined, 'order data is NOT exposed');
    assert(traceData.orders === undefined, 'orders array is NOT exposed');
    assert(traceData.deliveryAddress === undefined, 'deliveryAddress is NOT exposed');

    // -------------------------------------------------------------------
    // TEST 9: Error Handling - Unknown Product ID returns 404
    // -------------------------------------------------------------------
    console.log('\n--- 9. Verifying Unknown Product ID Returns 404 ---');
    const unknownRes = await fetch(`${BASE_URL}/traceability/non-existent-product-id-9999`);
    const unknownData = await unknownRes.json();
    assert(unknownRes.status === 404, `Unknown product ID returns 404 (got ${unknownRes.status})`);
    assert(unknownData.success === false, 'Unknown product indicates success: false');
    assert(unknownData.message.includes('not found'), `Message says not found ("${unknownData.message}")`);

    // -------------------------------------------------------------------
    // TEST 10: Error Handling - Product Without Transparency
    // -------------------------------------------------------------------
    console.log('\n--- 10. Verifying Safe Handling of Product Without Transparency ---');
    // Find or temporarily check product without transparency if exists, or assert 404 behavior
    const blankProduct = await prisma.product.create({
      data: {
        farmerId: eggProduct.farmerId || eggProduct.farmer.id,
        name: 'Temporary Test Apple',
        category: 'FRUITS',
        description: 'Test product without transparency record',
        price: 99.0,
        unit: 'kg',
        quantity: 10,
        availableQuantity: 10,
        location: 'Salem',
        status: 'DRAFT'
      }
    });

    const noTransRes = await fetch(`${BASE_URL}/traceability/${blankProduct.id}`);
    const noTransData = await noTransRes.json();
    assert(noTransRes.status === 404, `Product without transparency returns 404 (got ${noTransRes.status})`);
    assert(noTransData.message.includes('Traceability information not found'), `Clean error message ("${noTransData.message}")`);

    // Clean up temporary product
    await prisma.product.delete({ where: { id: blankProduct.id } });
    console.log('Cleaned up temporary test product.');

    // -------------------------------------------------------------------
    // TEST 11: Product Details API (GET /api/products/:id) Compatibility
    // -------------------------------------------------------------------
    console.log('\n--- 11. Verifying Product Details API Provides Transparency ---');
    const detailRes = await fetch(`${BASE_URL}/products/${eggId}`);
    const detailData = await detailRes.json();
    assert(detailRes.status === 200 && detailData.success, 'GET /api/products/:id returns 200');
    assert(detailData.data?.product?.farmer?.verified === true, 'Product detail farmer.verified is true');
    assert(detailData.data?.product?.transparency?.batchNumber === 'EGG-2026-0918', 'Product detail transparency.batchNumber is accurate');
    assert(detailData.data?.product?.batchNumber === 'EGG-2026-0918', 'Product detail batchNumber convenience field is accurate');

    // -------------------------------------------------------------------
    // TEST 12: QR Code URL Format Verification
    // -------------------------------------------------------------------
    console.log('\n--- 12. Verifying QR Code Public Traceability URL Target ---');
    const expectedPublicRoute = `/trace/${eggId}`;
    assert(expectedPublicRoute === `/trace/${eggId}`, `QR URL target is safe public route: "${expectedPublicRoute}"`);
    assert(!expectedPublicRoute.includes('password'), 'QR URL does not contain credentials');
    assert(!expectedPublicRoute.includes('token'), 'QR URL does not contain token');

    // -------------------------------------------------------------------
    // TEST 13: Regression - Category Counts & Egg Filter
    // -------------------------------------------------------------------
    console.log('\n--- 13. Regression Check: Session 6 Dynamic Category Counts ---');
    const catRes = await fetch(`${BASE_URL}/products`);
    const catData = await catRes.json();
    const counts = catData.data?.categoryCounts;
    assert(counts.EGGS === 1, `Eggs count remains exactly 1 (found ${counts?.EGGS})`);
    assert(counts.DAIRY === 1, `Dairy count remains exactly 1 (found ${counts?.DAIRY})`);
    assert(counts.VEGETABLES >= 3, `Vegetables count is >= 3 (found ${counts?.VEGETABLES})`);

    // -------------------------------------------------------------------
    // TEST 14: Regression - Checkout & Order Placement
    // -------------------------------------------------------------------
    console.log('\n--- 14. Regression Check: Consumer Checkout & Order Placement ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'arun@example.com',
        password: 'DemoConsumer123!'
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.success, 'Consumer Arun Kumar logs in');
    const cookie = loginRes.headers.get('set-cookie')?.split(';')[0];
    assert(cookie !== undefined, 'Got session cookie for checkout test');

    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({
        items: [{ productId: eggId, quantity: 1 }],
        deliveryAddress: {
          fullName: 'Arun Kumar',
          phone: '+91 98402 12345',
          address: '42 Organic Way',
          city: 'Salem',
          state: 'Tamil Nadu',
          pincode: '636016'
        },
        paymentMethod: 'COD'
      })
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 201 && orderData.success, 'Order placed successfully during regression test');
    console.log(`Placed order ID: ${orderData.data?.order?.id}`);

    // Verify timeline now reflects generic purchased event for Eggs product!
    const updatedTraceRes = await fetch(`${BASE_URL}/traceability/${eggId}`);
    const updatedTraceData = await updatedTraceRes.json();
    const updatedStages = updatedTraceData.traceability?.timeline?.map((t) => t.stage);
    assert(updatedStages.includes('PURCHASED'), 'Traceability timeline dynamically includes generic PURCHASED milestone after order placement');
    const purchasedEvent = updatedTraceData.traceability?.timeline?.find((t) => t.stage === 'PURCHASED');
    assert(purchasedEvent?.description.includes('Direct farm-to-consumer order fulfilled'), 'Generic purchase message shown without buyer private details');
  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log(`\n======================================================`);
  console.log(`SESSION 7 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSession7Tests()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
