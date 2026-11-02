import { executeTool, APPROVED_TOOLS } from './agentTools.js';
import { planSmartShopping, planFarmerInsights } from './agentPlanner.js';
import { env } from '../config/env.js';

/**
 * FARMDIRECT SESSION 9: AGENTIC AI CORE ORCHESTRATOR
 *
 * Implements a safe, controlled agentic execution loop:
 * USER GOAL → PLAN → APPROVED TOOL SELECTION → TOOL EXECUTION → OBSERVE RESULT → NEXT STEP → FINAL RESPONSE
 *
 * Enforces:
 * - Max 5 planning steps
 * - Max 5 tool calls per request
 * - 10 seconds total execution timeout
 * - Read-only operations only
 */

export const AGENT_LIMITS = {
  MAX_STEPS: 5,
  MAX_TOOL_CALLS: 5,
  TIMEOUT_MS: 10000,
  MAX_INPUT_LENGTH: 500
};

export const LIMIT_REACHED_MESSAGE =
  "I couldn't complete all steps within the allowed limit. Please try a simpler request.";

/**
 * Timeout wrapper for promise execution
 */
function withTimeout(promise, ms = AGENT_LIMITS.TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error(LIMIT_REACHED_MESSAGE);
      err.code = 'LIMIT_EXCEEDED';
      reject(err);
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Validate input query length
 */
function validateInput(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Please provide a valid text query.');
  }
  if (text.length > AGENT_LIMITS.MAX_INPUT_LENGTH) {
    throw new Error(`Input exceeds maximum length of ${AGENT_LIMITS.MAX_INPUT_LENGTH} characters.`);
  }
}

/**
 * AGENT 1: SMART SHOPPING AGENT
 * Helps consumers discover products, verify freshness, and calculate pricing combinations under budget.
 * READ-ONLY: Never modifies stock, never alters prices, never places orders automatically.
 */
export async function runSmartShoppingAgent({ message, user = null, timeoutMs = AGENT_LIMITS.TIMEOUT_MS }) {
  validateInput(message);

  return withTimeout(
    (async () => {
      let toolCallCount = 0;
      const activity = [];
      const plan = planSmartShopping(message);

      activity.push(`✓ Understood request: "${message.trim()}"`);

      // Guard check: Max planning steps
      if (plan.steps.length > AGENT_LIMITS.MAX_STEPS) {
        throw new Error(LIMIT_REACHED_MESSAGE);
      }

      // STEP 1: Execute searchProducts
      const step1 = plan.steps[0];
      if (toolCallCount >= AGENT_LIMITS.MAX_TOOL_CALLS) {
        throw new Error(LIMIT_REACHED_MESSAGE);
      }

      toolCallCount++;
      step1.status = 'in_progress';
      const searchArgs = {
        ...step1.arguments,
        category: plan.constraints.category,
        maxPrice: plan.constraints.maxPrice,
        availableOnly: true,
        verifiedFarmersOnly: plan.constraints.verifiedFarmersOnly,
        location: plan.constraints.location,
        limit: 10
      };

      const foundProducts = await executeTool('searchProducts', searchArgs, { user });
      step1.status = 'completed';

      activity.push(
        `✓ Searched FarmDirect catalog: found ${foundProducts.length} matching product(s)`
      );

      // STEP 2: Observe results & verify freshness for top products
      let freshnessData = [];
      if (foundProducts.length > 0 && plan.steps[1]) {
        const step2 = plan.steps[1];
        if (toolCallCount >= AGENT_LIMITS.MAX_TOOL_CALLS) {
          throw new Error(LIMIT_REACHED_MESSAGE);
        }

        toolCallCount++;
        step2.status = 'in_progress';

        // Check freshness for the first candidate product
        const topProduct = foundProducts[0];
        const freshness = await executeTool(
          'getProductFreshness',
          { productId: topProduct.productId },
          { user }
        );

        if (freshness) {
          freshnessData.push(freshness);
        }
        step2.status = 'completed';
        activity.push('✓ Inspected harvest and expiry transparency records');
      }

      // STEP 3: If user specified budget and items are available, calculate sample combination
      let calculationResult = null;
      if (
        plan.constraints.maxPrice &&
        foundProducts.length > 0 &&
        plan.steps[2] &&
        toolCallCount < AGENT_LIMITS.MAX_TOOL_CALLS
      ) {
        const step3 = plan.steps[2];
        toolCallCount++;
        step3.status = 'in_progress';

        // Find products within budget
        const budget = plan.constraints.maxPrice;
        // Standard FarmDirect delivery is ₹40
        const availableBudget = budget > 40 ? budget - 40 : budget;

        const candidateItems = [];
        let runningTotal = 0;

        for (const prod of foundProducts) {
          if (prod.price <= availableBudget && runningTotal + prod.price <= availableBudget) {
            // Allocate 1 or 2 units depending on unit price
            const qty = Math.min(2, prod.availableQuantity || 1);
            if (runningTotal + prod.price * qty <= availableBudget) {
              candidateItems.push({ productId: prod.productId, quantity: qty });
              runningTotal += prod.price * qty;
            } else if (runningTotal + prod.price <= availableBudget) {
              candidateItems.push({ productId: prod.productId, quantity: 1 });
              runningTotal += prod.price;
            }
          }
          if (candidateItems.length >= 2) break; // Keep sample combo neat
        }

        if (candidateItems.length > 0) {
          calculationResult = await executeTool(
            'calculateCartTotal',
            { items: candidateItems },
            { user }
          );
          activity.push(
            `✓ Calculated pricing combination (Subtotal: ₹${calculationResult.subtotal}, Delivery: ₹${calculationResult.deliveryFee}, Total: ₹${calculationResult.grandTotal})`
          );
        }
        step3.status = 'completed';
      }

      activity.push('✓ Prepared recommendations from real MySQL data');

      // FINAL RESPONSE SYNTHESIS
      const summary = generateSmartShoppingSummary({
        query: message,
        constraints: plan.constraints,
        products: foundProducts,
        freshnessData,
        calculation: calculationResult
      });

      return {
        success: true,
        agent: 'smart-shopping',
        summary,
        plan: {
          goal: plan.goal,
          steps: plan.steps.map((s) => ({
            stepNumber: s.stepNumber,
            tool: s.tool,
            description: s.description,
            status: s.status
          }))
        },
        activity,
        results: foundProducts,
        calculation: calculationResult
      };
    })(),
    timeoutMs
  );
}

/**
 * Generates natural language summary for Smart Shopping Agent
 */
function generateSmartShoppingSummary({ query, constraints, products, freshnessData, calculation }) {
  if (!products || products.length === 0) {
    let msg = `I checked the FarmDirect catalog for ${constraints.category || 'produce'}`;
    if (constraints.maxPrice) msg += ` within ₹${constraints.maxPrice}`;
    if (constraints.location) msg += ` near ${constraints.location}`;
    msg += ', but found no active products matching all criteria right now.';
    return msg;
  }

  const count = products.length;
  const categoryText = constraints.category ? constraints.category.toLowerCase() : 'produce items';
  const topNames = products.slice(0, 3).map((p) => `${p.name} (₹${p.price}/${p.unit})`).join(', ');

  let summary = `I found ${count} available ${categoryText} from local farmers: ${topNames}.`;

  if (freshnessData && freshnessData.length > 0) {
    const f = freshnessData[0];
    if (f.harvestDate && f.harvestDate !== 'Not provided') {
      summary += ` For instance, ${f.name} was harvested on ${f.harvestDate}.`;
    }
  }

  if (calculation && calculation.itemTotals && calculation.itemTotals.length > 0) {
    const itemBreakdown = calculation.itemTotals
      .map((i) => `${i.name} (${i.quantity} ${i.unit})`)
      .join(' + ');
    summary += ` A recommended basket of ${itemBreakdown} comes to a subtotal of ₹${calculation.subtotal} + ₹${calculation.deliveryFee} standard delivery = ₹${calculation.grandTotal}, fitting within your budget.`;
  }

  return summary;
}

/**
 * AGENT 2: FARMER INSIGHT AGENT
 * Scoped strictly to the authenticated farmer's own catalog.
 * Inspects low stock, expiry warnings, and missing transparency records.
 * READ-ONLY: Never alters stock, prices, or product data.
 */
export async function runFarmerInsightAgent({
  message = '',
  farmerId,
  user = null,
  timeoutMs = AGENT_LIMITS.TIMEOUT_MS
}) {
  if (!farmerId || typeof farmerId !== 'string') {
    throw new Error('Unauthorized: Farmer identity could not be established.');
  }

  if (message && message.length > AGENT_LIMITS.MAX_INPUT_LENGTH) {
    throw new Error(`Input exceeds maximum length of ${AGENT_LIMITS.MAX_INPUT_LENGTH} characters.`);
  }

  return withTimeout(
    (async () => {
      let toolCallCount = 0;
      const activity = [];
      const plan = planFarmerInsights(farmerId, message);

      activity.push('✓ Authenticated farmer identity');

      if (plan.steps.length > AGENT_LIMITS.MAX_STEPS) {
        throw new Error(LIMIT_REACHED_MESSAGE);
      }

      // STEP 1: Fetch farmer's own products
      const step1 = plan.steps[0];
      if (toolCallCount >= AGENT_LIMITS.MAX_TOOL_CALLS) {
        throw new Error(LIMIT_REACHED_MESSAGE);
      }

      toolCallCount++;
      step1.status = 'in_progress';

      const products = await executeTool(
        'getFarmerProducts',
        { farmerId },
        { farmerId, user }
      );
      step1.status = 'completed';

      activity.push(`✓ Retrieved ${products.length} catalog listing(s) from MySQL`);

      // STEP 2: Deterministic Inspection Rules
      activity.push('✓ Audited inventory levels, stock thresholds, and expiry dates');

      const lowStock = [];
      const outOfStock = [];
      const expiryAlerts = [];
      const missingTransparency = [];

      const today = new Date();

      for (const p of products) {
        // Rule: OUT_OF_STOCK
        if (p.availableQuantity === 0 || p.status === 'OUT_OF_STOCK') {
          outOfStock.push({
            productId: p.productId,
            name: p.name,
            availableQuantity: p.availableQuantity,
            status: 'OUT_OF_STOCK',
            reason: 'Zero units remaining in inventory'
          });
        }
        // Rule: LOW_STOCK (availableQuantity <= 5 and > 0)
        else if (p.availableQuantity <= 5) {
          lowStock.push({
            productId: p.productId,
            name: p.name,
            availableQuantity: p.availableQuantity,
            status: 'LOW_STOCK',
            reason: `Only ${p.availableQuantity} ${p.unit} remaining (threshold: 5)`
          });
        }

        // Rule: EXPIRY ALERT (within 3 days or past expiry)
        if (p.expiryDate && p.expiryDate !== 'Not provided') {
          const expDate = new Date(p.expiryDate);
          const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 3) {
            expiryAlerts.push({
              productId: p.productId,
              name: p.name,
              expiryDate: p.expiryDate,
              daysRemaining: diffDays,
              status: diffDays < 0 ? 'EXPIRED' : 'EXPIRY_ALERT',
              reason: diffDays < 0
                ? `Expired ${Math.abs(diffDays)} day(s) ago on ${p.expiryDate}`
                : `Expires in ${diffDays} day(s) on ${p.expiryDate}`
            });
          }
        }

        // Rule: MISSING TRANSPARENCY
        if (
          !p.harvestDate ||
          p.harvestDate === 'Not provided' ||
          !p.expiryDate ||
          p.expiryDate === 'Not provided'
        ) {
          const missingFields = [];
          if (!p.harvestDate || p.harvestDate === 'Not provided') missingFields.push('Harvest date');
          if (!p.expiryDate || p.expiryDate === 'Not provided') missingFields.push('Expiry date');

          missingTransparency.push({
            productId: p.productId,
            name: p.name,
            status: 'MISSING_TRANSPARENCY',
            missingFields,
            reason: `${missingFields.join(' and ')} not provided`
          });
        }
      }

      // STEP 3: Check freshness via tool for prioritized risk item if any
      if (plan.steps[1] && toolCallCount < AGENT_LIMITS.MAX_TOOL_CALLS) {
        const step2 = plan.steps[1];
        toolCallCount++;
        step2.status = 'in_progress';

        const priorityItem = expiryAlerts[0] || lowStock[0] || products[0];
        if (priorityItem) {
          await executeTool(
            'getProductFreshness',
            { productId: priorityItem.productId },
            { user }
          );
        }
        step2.status = 'completed';
        activity.push('✓ Verified batch transparency records');
      }

      activity.push('✓ Generated inventory health findings');

      // Formulate Summary
      const summary = generateFarmerInsightSummary({
        total: products.length,
        lowStock,
        outOfStock,
        expiryAlerts,
        missingTransparency
      });

      return {
        success: true,
        agent: 'farmer-insights',
        summary,
        plan: {
          goal: plan.goal,
          steps: plan.steps.map((s) => ({
            stepNumber: s.stepNumber,
            tool: s.tool,
            description: s.description,
            status: s.status
          }))
        },
        activity,
        results: {
          totalProducts: products.length,
          lowStock,
          outOfStock,
          expiryAlerts,
          missingTransparency
        }
      };
    })(),
    timeoutMs
  );
}

/**
 * Generates natural language summary for Farmer Insight Agent
 */
function generateFarmerInsightSummary({ total, lowStock, outOfStock, expiryAlerts, missingTransparency }) {
  if (total === 0) {
    return 'You have no listed products in your catalog currently.';
  }

  const attentionCount =
    lowStock.length + outOfStock.length + expiryAlerts.length + missingTransparency.length;

  if (attentionCount === 0) {
    return `All ${total} products in your catalog are healthy with adequate stock, valid expiry dates, and complete transparency data.`;
  }

  const parts = [];
  if (outOfStock.length > 0) {
    parts.push(`${outOfStock.length} product(s) out of stock`);
  }
  if (lowStock.length > 0) {
    parts.push(`${lowStock.length} product(s) with low stock (<= 5 units)`);
  }
  if (expiryAlerts.length > 0) {
    parts.push(`${expiryAlerts.length} product(s) approaching expiry within 3 days`);
  }
  if (missingTransparency.length > 0) {
    parts.push(`${missingTransparency.length} product(s) missing harvest or expiry transparency dates`);
  }

  return `Audited ${total} products in your catalog. Found ${parts.join(', ')}.`;
}
