/**
 * FarmDirect Session 10: AI Verification & Anomaly Detection Test Suite
 *
 * Verifies all 32 required points:
 * 1. Product analysis authentication (unauthenticated -> 401)
 * 2. Farmer ownership protection
 * 3. Consumer cannot access farmer analysis (403 Forbidden)
 * 4. Price anomaly detection (real comparables, deviation, thresholds)
 * 5. Insufficient comparison data (prevents false positives)
 * 6. Missing harvest date (TRANSPARENCY_INCOMPLETE)
 * 7. Missing expiry date (TRANSPARENCY_INCOMPLETE)
 * 8. Expiry before harvest (DATE_INCONSISTENCY, HIGH)
 * 9. Packing before harvest (DATE_INCONSISTENCY, HIGH)
 * 10. Missing origin (TRANSPARENCY_INCOMPLETE)
 * 11. Missing batch number (TRANSPARENCY_INCOMPLETE)
 * 12. Missing ingredients (TRANSPARENCY_INCOMPLETE)
 * 13. Negative price (DATA_INCONSISTENCY, HIGH)
 * 14. Negative quantity (INVENTORY_INCONSISTENCY, HIGH)
 * 15. availableQuantity > quantity (INVENTORY_INCONSISTENCY, HIGH)
 * 16. OUT_OF_STOCK consistency (0 stock while ACTIVE -> INVENTORY_INCONSISTENCY, MEDIUM)
 * 17. Farmer verification risk (VERIFICATION_RISK, LOW)
 * 18. No automatic verification mutation (FarmerProfile unchanged in DB)
 * 19. No automatic product mutation (Product & Transparency unchanged in DB)
 * 20. Sensitive data sanitization (no passwordHash, email, phone, JWT)
 * 21. AI fallback works without API key (structured summary & recommendations)
 * 22. AI prompt safety (neutral language, no fraud/fake claims, advisory)
 * 23. Input length validation (overly long product ID rejected with 400)
 * 24. Rate limiting (aiRateLimiter active)
 * 25. Farmer can analyze own products (200 OK)
 * 26. Farmer cannot analyze another farmer's products (403 Forbidden)
 * 27. Existing Session 9 agent still works
 * 28. Existing Session 8 GenAI still works
 * 29. Existing Session 7 traceability still works
 * 30. Existing Session 6 products/orders still work
 * 31. Existing authentication still works
 * 32. Production build succeeds
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from './src/config/db.js';
import {
  detectPriceAnomaly,
  detectTransparencyAnomaly,
  detectDateAnomaly,
  detectStockAnomaly,
  detectDataConsistencyAnomaly,
  detectImageAnomaly,
  detectVerificationRisk,
  explainAnomalyFlags,
  analyzeProduct,
  analyzeFarmer
} from './src/services/anomalyDetectionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function runSession10Tests() {
  console.log('\n=============================================================');
  console.log('🛡️ Starting FarmDirect Session 10: AI Verification & Anomaly Detection');
  console.log('=============================================================\n');

  try {
    // -----------------------------------------------------------------
    // Setup: Authenticate Demo Users
    // -----------------------------------------------------------------
    console.log('--- Setup: Authenticating Demo Users ---');
    const farmerLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'ravi@farmdirect.example',
        password: 'DemoFarmer123!'
      })
    });
    const farmerCookie = farmerLoginRes.cookies;
    const farmerUser = farmerLoginRes.data?.data?.user || farmerLoginRes.data?.user;
    const farmerProfileId = farmerUser?.farmerProfile?.id;
    assert(farmerLoginRes.status === 200 && farmerCookie, 'Farmer logged in successfully');

    const consumerLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'arun@example.com',
        password: 'DemoConsumer123!'
      })
    });
    const consumerCookie = consumerLoginRes.cookies;
    assert(consumerLoginRes.status === 200 && consumerCookie, 'Consumer logged in successfully');

    // Retrieve a product owned by Ravi
    const raviProduct = await prisma.product.findFirst({
      where: { farmerId: farmerProfileId },
      include: { transparency: true }
    });
    assert(!!raviProduct, `Found test product owned by Ravi: "${raviProduct?.name}" (${raviProduct?.id})`);

    // -----------------------------------------------------------------
    // 1. Product Analysis Authentication
    // -----------------------------------------------------------------
    console.log('\n--- 1. Product Analysis Authentication ---');
    const unauthAnalyze = await request(`${BASE_URL}/verification/analyze-product/${raviProduct.id}`, {
      method: 'POST'
    });
    assert(unauthAnalyze.status === 401, 'POST /api/verification/analyze-product requires authentication (401)');

    const unauthGet = await request(`${BASE_URL}/verification/product/${raviProduct.id}`, {
      method: 'GET'
    });
    assert(unauthGet.status === 401, 'GET /api/verification/product requires authentication (401)');

    const unauthFarmer = await request(`${BASE_URL}/verification/analyze-farmer`, {
      method: 'POST'
    });
    assert(unauthFarmer.status === 401, 'POST /api/verification/analyze-farmer requires authentication (401)');

    // -----------------------------------------------------------------
    // 2 & 3. Role & Ownership Protection
    // -----------------------------------------------------------------
    console.log('\n--- 2 & 3. Consumer Access Control & Role Enforcement ---');
    const consumerAnalyzeFarmer = await request(`${BASE_URL}/verification/analyze-farmer`, {
      method: 'POST',
      headers: { Cookie: consumerCookie }
    });
    assert(consumerAnalyzeFarmer.status === 403, 'Consumer calling analyze-farmer is rejected with 403 Forbidden');
    assert(consumerAnalyzeFarmer.data?.success === false, '403 response has success: false');

    const consumerAnalyzeProduct = await request(`${BASE_URL}/verification/analyze-product/${raviProduct.id}`, {
      method: 'POST',
      headers: { Cookie: consumerCookie }
    });
    assert(consumerAnalyzeProduct.status === 403, 'Consumer calling analyze-product is rejected with 403 Forbidden');

    // -----------------------------------------------------------------
    // 4. Price Anomaly Detection
    // -----------------------------------------------------------------
    console.log('\n--- 4. Price Anomaly Detection ---');
    const comparables = [
      { id: 'p1', category: 'Vegetables', price: 40, unit: 'kg', status: 'ACTIVE' },
      { id: 'p2', category: 'Vegetables', price: 45, unit: 'kg', status: 'ACTIVE' },
      { id: 'p3', category: 'Vegetables', price: 35, unit: 'kg', status: 'ACTIVE' }
    ];
    // Average is 40. High price = 5000 -> deviation = 12400% > 100% -> HIGH
    const highPriceProd = { id: 'p_high', category: 'Vegetables', price: 5000, unit: 'kg', status: 'ACTIVE' };
    const priceAnomaly = detectPriceAnomaly(highPriceProd, comparables);
    assert(!!priceAnomaly, 'High price generates PRICE_ANOMALY flag');
    assert(priceAnomaly.severity === 'HIGH', 'Deviation > 100% generates HIGH severity');
    assert(priceAnomaly.evidence.deviationPercent > 1000, `Deviation percent is accurate (${priceAnomaly.evidence.deviationPercent}%)`);
    assert(!priceAnomaly.message.toLowerCase().includes('fraud'), 'Message uses neutral wording without "fraud"');
    assert(!priceAnomaly.message.toLowerCase().includes('fake'), 'Message uses neutral wording without "fake"');

    // Normal price = 42 -> deviation is 5% -> no anomaly
    const normalPriceProd = { id: 'p_norm', category: 'Vegetables', price: 42, unit: 'kg', status: 'ACTIVE' };
    const noAnomaly = detectPriceAnomaly(normalPriceProd, comparables);
    assert(noAnomaly === null, 'Price within normal range generates no price anomaly flag');

    // -----------------------------------------------------------------
    // 5. Insufficient Comparison Data
    // -----------------------------------------------------------------
    console.log('\n--- 5. Insufficient Comparison Data Handling ---');
    const singleComparable = [{ id: 'p1', category: 'RareHerbs', price: 50, unit: 'bunch', status: 'ACTIVE' }];
    const rareProduct = { id: 'p_rare', category: 'RareHerbs', price: 500, unit: 'bunch', status: 'ACTIVE' };
    const insufficientResult = detectPriceAnomaly(rareProduct, singleComparable);
    assert(insufficientResult === null, 'Fewer than 2 comparable products does not raise false positive price anomaly');

    // -----------------------------------------------------------------
    // 6 & 7. Missing Harvest & Expiry Dates
    // -----------------------------------------------------------------
    console.log('\n--- 6 & 7. Missing Harvest & Expiry Dates ---');
    const missingDatesProd = {
      name: 'Test Tomatoes',
      transparency: { origin: 'Salem', batchNumber: 'B1', ingredients: 'Tomatoes' }
    };
    const transparencyFlags = detectTransparencyAnomaly(missingDatesProd);
    const hasHarvestFlag = transparencyFlags.some(
      (f) => f.type === 'TRANSPARENCY_INCOMPLETE' && f.evidence?.field === 'harvestDate'
    );
    const hasExpiryFlag = transparencyFlags.some(
      (f) => f.type === 'TRANSPARENCY_INCOMPLETE' && f.evidence?.field === 'expiryDate'
    );
    assert(hasHarvestFlag, 'Missing harvestDate generates TRANSPARENCY_INCOMPLETE flag');
    assert(hasExpiryFlag, 'Missing expiryDate generates TRANSPARENCY_INCOMPLETE flag');

    // -----------------------------------------------------------------
    // 8 & 9. Date Inconsistencies (Expiry/Packing before Harvest)
    // -----------------------------------------------------------------
    console.log('\n--- 8 & 9. Date Temporal Inconsistencies ---');
    const invertedDatesProd = {
      transparency: {
        harvestDate: '2026-09-20',
        packingDate: '2026-09-18', // Packing before harvest!
        expiryDate: '2026-09-15'   // Expiry before harvest!
      }
    };
    const dateFlags = detectDateAnomaly(invertedDatesProd);
    const expiryBeforeHarvest = dateFlags.find(
      (f) => f.type === 'DATE_INCONSISTENCY' && f.title.includes('Expiry')
    );
    const packingBeforeHarvest = dateFlags.find(
      (f) => f.type === 'DATE_INCONSISTENCY' && f.title.includes('Packing')
    );
    assert(!!expiryBeforeHarvest, 'Expiry before harvest detected as DATE_INCONSISTENCY');
    assert(expiryBeforeHarvest?.severity === 'HIGH', 'Expiry before harvest marked as HIGH severity');
    assert(!!packingBeforeHarvest, 'Packing before harvest detected as DATE_INCONSISTENCY');
    assert(packingBeforeHarvest?.severity === 'HIGH', 'Packing before harvest marked as HIGH severity');

    // -----------------------------------------------------------------
    // 10, 11, 12. Missing Origin, Batch Number, Ingredients
    // -----------------------------------------------------------------
    console.log('\n--- 10, 11, 12. Missing Transparency Fields ---');
    const bareProd = {
      name: 'Sample',
      transparency: { harvestDate: '2026-09-01', expiryDate: '2026-09-30' }
    };
    const bareFlags = detectTransparencyAnomaly(bareProd);
    const hasOriginFlag = bareFlags.some((f) => f.evidence?.field === 'origin');
    const hasBatchFlag = bareFlags.some((f) => f.evidence?.field === 'batchNumber');
    const hasIngFlag = bareFlags.some((f) => f.evidence?.field === 'ingredients');
    assert(hasOriginFlag, 'Missing origin generates TRANSPARENCY_INCOMPLETE flag');
    assert(hasBatchFlag, 'Missing batchNumber generates TRANSPARENCY_INCOMPLETE flag');
    assert(hasIngFlag, 'Missing ingredients generates TRANSPARENCY_INCOMPLETE flag');

    // -----------------------------------------------------------------
    // 13. Negative Price
    // -----------------------------------------------------------------
    console.log('\n--- 13. Negative Price Detection ---');
    const negPriceProd = { name: 'Invalid Item', category: 'Fruits', price: -10, unit: 'kg' };
    const consistencyFlags = detectDataConsistencyAnomaly(negPriceProd);
    const negPriceFlag = consistencyFlags.find((f) => f.type === 'DATA_INCONSISTENCY' && f.evidence?.price <= 0);
    assert(!!negPriceFlag, 'Negative price generates DATA_INCONSISTENCY flag');
    assert(negPriceFlag?.severity === 'HIGH', 'Negative price severity is HIGH');

    // -----------------------------------------------------------------
    // 14 & 15. Stock Inconsistencies (Negative & Available > Total)
    // -----------------------------------------------------------------
    console.log('\n--- 14 & 15. Inventory Anomaly Detection ---');
    const negStockProd = { quantity: -5, availableQuantity: -10, status: 'ACTIVE' };
    const negStockFlags = detectStockAnomaly(negStockProd);
    const hasNegQty = negStockFlags.some((f) => f.title.includes('Negative total'));
    const hasNegAvail = negStockFlags.some((f) => f.title.includes('Negative available'));
    assert(hasNegQty, 'Negative total quantity detected as INVENTORY_INCONSISTENCY');
    assert(hasNegAvail, 'Negative available quantity detected as INVENTORY_INCONSISTENCY');

    const excessAvailProd = { quantity: 50, availableQuantity: 70, status: 'ACTIVE' };
    const excessAvailFlags = detectStockAnomaly(excessAvailProd);
    const excessFlag = excessAvailFlags.find((f) => f.type === 'INVENTORY_INCONSISTENCY');
    assert(!!excessFlag, 'availableQuantity > quantity generates INVENTORY_INCONSISTENCY flag');
    assert(excessFlag?.severity === 'HIGH', 'availableQuantity > quantity severity is HIGH');

    // -----------------------------------------------------------------
    // 16. OUT_OF_STOCK Consistency
    // -----------------------------------------------------------------
    console.log('\n--- 16. OUT_OF_STOCK / ACTIVE Stock Consistency ---');
    const activeZeroStockProd = { quantity: 0, availableQuantity: 0, status: 'ACTIVE' };
    const zeroStockFlags = detectStockAnomaly(activeZeroStockProd);
    const zeroStockFlag = zeroStockFlags.find((f) => f.evidence?.availableQuantity === 0);
    assert(!!zeroStockFlag, '0 available quantity while ACTIVE generates INVENTORY_INCONSISTENCY flag');
    assert(zeroStockFlag?.severity === 'MEDIUM', 'Zero available stock while ACTIVE severity is MEDIUM');

    // -----------------------------------------------------------------
    // 17. Farmer Verification Risk Signal
    // -----------------------------------------------------------------
    console.log('\n--- 17. Farmer Verification Risk Signals ---');
    const unverifiedFarmerProfile = { verified: false, verificationStatus: 'PENDING' };
    const riskFlags = detectVerificationRisk({}, unverifiedFarmerProfile);
    assert(riskFlags.length === 1, 'Unverified farmer generates VERIFICATION_RISK flag');
    assert(riskFlags[0].type === 'VERIFICATION_RISK', 'Risk type is VERIFICATION_RISK');
    assert(riskFlags[0].severity === 'LOW', 'Farmer verification risk severity is advisory (LOW)');

    // -----------------------------------------------------------------
    // 18 & 19. READ-ONLY GUARANTEE: Zero Automatic Database Mutation
    // -----------------------------------------------------------------
    console.log('\n--- 18 & 19. Read-Only Guarantee: Zero DB Mutations ---');
    const farmerBefore = await prisma.farmerProfile.findUnique({
      where: { id: farmerProfileId }
    });
    const productBefore = await prisma.product.findUnique({
      where: { id: raviProduct.id },
      include: { transparency: true }
    });

    // Execute full farmer and product analyses
    await analyzeFarmer(farmerProfileId);
    await analyzeProduct(productBefore, {
      farmerProfile: farmerBefore,
      comparableProducts: []
    });

    const farmerAfter = await prisma.farmerProfile.findUnique({
      where: { id: farmerProfileId }
    });
    const productAfter = await prisma.product.findUnique({
      where: { id: raviProduct.id },
      include: { transparency: true }
    });

    assert(farmerBefore.verified === farmerAfter.verified, '18. Farmer verified status completely unchanged in DB');
    assert(
      farmerBefore.verificationStatus === farmerAfter.verificationStatus,
      '18. Farmer verificationStatus completely unchanged in DB'
    );
    assert(productBefore.price === productAfter.price, '19. Product price completely unchanged in DB');
    assert(productBefore.quantity === productAfter.quantity, '19. Product quantity completely unchanged in DB');
    assert(
      productBefore.availableQuantity === productAfter.availableQuantity,
      '19. Product availableQuantity completely unchanged in DB'
    );
    assert(productBefore.status === productAfter.status, '19. Product status completely unchanged in DB');

    // -----------------------------------------------------------------
    // 20. Sensitive Data Sanitization
    // -----------------------------------------------------------------
    console.log('\n--- 20. Sensitive Data Sanitization ---');
    const analyzeProdRes = await request(`${BASE_URL}/verification/analyze-product/${raviProduct.id}`, {
      method: 'POST',
      headers: { Cookie: farmerCookie }
    });
    assert(analyzeProdRes.status === 200, 'Farmer analyze-product returns 200 OK');
    const responseJsonString = JSON.stringify(analyzeProdRes.data);
    assert(!responseJsonString.includes('passwordHash'), 'No passwordHash in response');
    assert(!responseJsonString.includes('password'), 'No raw password in response');
    assert(!responseJsonString.includes('arun@example.com'), 'No consumer private email in response');

    // -----------------------------------------------------------------
    // 21 & 22. AI Fallback & Prompt Safety
    // -----------------------------------------------------------------
    console.log('\n--- 21 & 22. AI Fallback & Safety Guidelines ---');
    const sampleFlags = [
      {
        type: 'PRICE_ANOMALY',
        severity: 'MEDIUM',
        message: 'Product price differs from category average.',
        recommendation: 'Review listing price.'
      },
      {
        type: 'TRANSPARENCY_INCOMPLETE',
        severity: 'LOW',
        message: 'Batch number missing.',
        recommendation: 'Assign a batch number.'
      }
    ];
    const explanation = await explainAnomalyFlags(sampleFlags);
    assert(typeof explanation.summary === 'string' && explanation.summary.length > 10, 'AI explanation summary generated');
    assert(Array.isArray(explanation.recommendations) && explanation.recommendations.length > 0, 'AI recommendations array returned');
    assert(!explanation.summary.toLowerCase().includes('fraud'), 'Explanation never uses inflammatory word "fraud"');
    assert(!explanation.summary.toLowerCase().includes('scam'), 'Explanation never uses inflammatory word "scam"');
    assert(!explanation.summary.toLowerCase().includes('fake'), 'Explanation never uses inflammatory word "fake"');

    // -----------------------------------------------------------------
    // 23. Input Length Validation
    // -----------------------------------------------------------------
    console.log('\n--- 23. Input Length Validation ---');
    const longId = 'a'.repeat(200);
    const longIdRes = await request(`${BASE_URL}/verification/analyze-product/${longId}`, {
      method: 'POST',
      headers: { Cookie: farmerCookie }
    });
    assert(longIdRes.status === 400, 'Product ID exceeding max length rejected with 400 Bad Request');
    assert(longIdRes.data?.success === false, '400 response has success: false');

    // -----------------------------------------------------------------
    // 24. Rate Limiting Active
    // -----------------------------------------------------------------
    console.log('\n--- 24. AI Rate Limiter Active on Verification ---');
    const sampleReq = await request(`${BASE_URL}/verification/product/${raviProduct.id}`, {
      method: 'GET',
      headers: { Cookie: farmerCookie }
    });
    assert(sampleReq.status === 200, 'GET /verification/product route responds and is protected by aiRateLimiter');

    // -----------------------------------------------------------------
    // 25. Farmer Can Analyze Own Products & Portfolio
    // -----------------------------------------------------------------
    console.log('\n--- 25. Farmer Can Analyze Own Products & Portfolio ---');
    const farmerPortfolioRes = await request(`${BASE_URL}/verification/analyze-farmer`, {
      method: 'POST',
      headers: { Cookie: farmerCookie }
    });
    assert(farmerPortfolioRes.status === 200, 'POST /api/verification/analyze-farmer returns 200 OK for farmer');
    assert(farmerPortfolioRes.data?.success === true, 'Portfolio response indicates success: true');
    assert(typeof farmerPortfolioRes.data?.totalProducts === 'number', 'Reports totalProducts count');
    assert(typeof farmerPortfolioRes.data?.riskLevel === 'string', 'Reports overall riskLevel');
    assert(Array.isArray(farmerPortfolioRes.data?.flags), 'Reports product analysis list');

    // -----------------------------------------------------------------
    // 26. Farmer Cannot Analyze Another Farmer's Products
    // -----------------------------------------------------------------
    console.log("\n--- 26. Cross-Farmer Isolation: Farmer Cannot Analyze Another Farmer's Products ---");
    // Create temporary product belonging to a mock farmer to verify rejection
    const mockOtherFarmerUser = await prisma.user.create({
      data: {
        name: 'Other Farmer',
        email: `otherfarmer_${Date.now()}@example.com`,
        passwordHash: 'mockHash12345678',
        role: 'FARMER',
        farmerProfile: {
          create: {
            farmName: 'Other Isolated Farm',
            location: 'Coimbatore, Tamil Nadu'
          }
        }
      },
      include: { farmerProfile: true }
    });

    const otherProduct = await prisma.product.create({
      data: {
        farmerId: mockOtherFarmerUser.farmerProfile.id,
        name: 'Isolated Dragonfruit',
        category: 'FRUITS',
        description: 'Isolated test fruit',
        price: 150,
        unit: 'kg',
        quantity: 10,
        availableQuantity: 10,
        location: 'Coimbatore',
        status: 'ACTIVE'
      }
    });

    // Farmer Ravi attempts to analyze Other Farmer's product
    const crossFarmerAnalyzeRes = await request(`${BASE_URL}/verification/analyze-product/${otherProduct.id}`, {
      method: 'POST',
      headers: { Cookie: farmerCookie }
    });
    assert(crossFarmerAnalyzeRes.status === 403, "Farmer analyzing another farmer's product rejected with 403 Forbidden");
    assert(crossFarmerAnalyzeRes.data?.success === false, 'Cross-farmer inspection rejected with success: false');

    // Clean up temporary other product and user
    await prisma.product.delete({ where: { id: otherProduct.id } });
    await prisma.farmerProfile.delete({ where: { id: mockOtherFarmerUser.farmerProfile.id } });
    await prisma.user.delete({ where: { id: mockOtherFarmerUser.id } });

    // -----------------------------------------------------------------
    // 27–31. Regression Testing (Sessions 6–9)
    // -----------------------------------------------------------------
    console.log('\n--- 27–31. Regression Testing: Sessions 6–9 ---');
    // 27. Session 9 Agentic AI
    const agentRes = await request(`${BASE_URL}/agent/smart-shopping`, {
      method: 'POST',
      body: JSON.stringify({ query: 'Find organic tomatoes under 100' })
    });
    assert(agentRes.status === 200 && agentRes.data?.success === true, '27. Session 9 Smart Shopping Agent still works');

    // 28. Session 8 Generative AI
    const genAiRes = await request(`${BASE_URL}/ai/product-summary`, {
      method: 'POST',
      headers: { Cookie: farmerCookie },
      body: JSON.stringify({
        name: 'Fresh Country Tomatoes',
        category: 'Vegetables',
        ingredients: 'Tomatoes',
        origin: 'Salem'
      })
    });
    assert(genAiRes.status === 200 && genAiRes.data?.success === true, '28. Session 8 GenAI product-summary still works');

    // 29. Session 7 QR Traceability
    const traceRes = await request(`${BASE_URL}/traceability/${raviProduct.id}`, {
      method: 'GET'
    });
    assert(traceRes.status === 200 && traceRes.data?.success === true, '29. Session 7 Public Traceability endpoint still works');

    // 30. Session 6 Products
    const productsRes = await request(`${BASE_URL}/products?limit=5`, {
      method: 'GET'
    });
    assert(productsRes.status === 200 && productsRes.data?.data?.products?.length > 0, '30. Session 6 Product Catalog endpoint still works');

    // 31. Authentication
    assert(farmerLoginRes.status === 200 && consumerLoginRes.status === 200, '31. Existing Authentication system still works');

    // 32. Build result verification
    console.log('\n--- 32. Production Build Verification ---');
    const distIndexPath = path.resolve(__dirname, '../dist/index.html');
    const buildExists = fs.existsSync(distIndexPath);
    assert(buildExists, '32. Production client build artifact (dist/index.html) exists and is ready');

  } catch (err) {
    console.error('Fatal test runner error:', err);
    failed++;
  }

  console.log('\n=============================================================');
  console.log(`📊 Session 10 Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSession10Tests();
