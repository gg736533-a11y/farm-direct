/**
 * FARMDIRECT SESSION 9: AGENT PLANNER
 * 
 * Separates goal understanding, multi-step planning, and step formulation.
 * Enforces maximum of 5 planning steps.
 * Never exposes raw chain-of-thought or internal prompts to the user.
 */

const MAX_PLANNING_STEPS = 5;

/**
 * Extracts shopping constraints from natural language query
 * Supports English and common bilingual phrases (e.g. "₹500 kulla fresh vegetables venum")
 */
export function extractShoppingConstraints(query = '') {
  const q = String(query).toLowerCase().trim();

  // 1. Detect Category
  let category = null;
  if (
    q.includes('vegetable') ||
    q.includes('veggie') ||
    q.includes('tomato') ||
    q.includes('onion') ||
    q.includes('potato') ||
    q.includes('greens') ||
    q.includes('spinach') ||
    q.includes('keerai') ||
    q.includes('thakkali')
  ) {
    category = 'VEGETABLES';
  } else if (
    q.includes('fruit') ||
    q.includes('banana') ||
    q.includes('apple') ||
    q.includes('mango') ||
    q.includes('papaya')
  ) {
    category = 'FRUITS';
  } else if (q.includes('egg') || q.includes('muttai')) {
    category = 'EGGS';
  } else if (
    q.includes('dairy') ||
    q.includes('milk') ||
    q.includes('ghee') ||
    q.includes('butter') ||
    q.includes('curd') ||
    q.includes('paal') ||
    q.includes('nei')
  ) {
    category = 'DAIRY';
  } else if (
    q.includes('grain') ||
    q.includes('rice') ||
    q.includes('millet') ||
    q.includes('wheat') ||
    q.includes('flour') ||
    q.includes('arisi')
  ) {
    category = 'GRAINS';
  } else if (q.includes('honey') || q.includes('then')) {
    category = 'HONEY';
  } else if (q.includes('nut') || q.includes('peanut') || q.includes('groundnut')) {
    category = 'NUTS';
  }

  // 2. Detect Budget / Max Price
  let maxPrice = null;
  // Match "under 500", "below 300", "500 kulla", "within ₹500", "budget 500", "₹500", "500 rs"
  const budgetMatch =
    q.match(/(?:under|below|within|max|budget|<=|<)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) ||
    q.match(/(\d+)\s*(?:kulla|kulle|ullaga|below|under)/i) ||
    q.match(/(?:₹|rs\.?)\s*(\d+)/i);

  if (budgetMatch) {
    maxPrice = Number(budgetMatch[1]);
  }

  // 3. Detect Verified Only
  const verifiedFarmersOnly =
    q.includes('verified') || q.includes('certified') || q.includes('trusted');

  // 4. Detect Freshness concern
  const checkFreshness =
    q.includes('fresh') ||
    q.includes('harvest') ||
    q.includes('expiry') ||
    q.includes('new') ||
    q.includes('pudhu');

  // 5. Detect Location
  let location = null;
  const locMatch = q.match(/(?:near|in|from|around)\s+([a-zA-Z]+)/i);
  if (locMatch && !['the', 'verified', 'our', 'local', 'fresh'].includes(locMatch[1].toLowerCase())) {
    location = locMatch[1];
  } else if (q.includes('salem')) {
    location = 'Salem';
  } else if (q.includes('madurai')) {
    location = 'Madurai';
  } else if (q.includes('coimbatore')) {
    location = 'Coimbatore';
  }

  return {
    category,
    maxPrice,
    verifiedFarmersOnly,
    checkFreshness,
    location,
    originalQuery: query
  };
}

/**
 * Builds a structured plan for the Smart Shopping Agent
 * Guaranteed <= MAX_PLANNING_STEPS (5)
 */
export function planSmartShopping(userMessage) {
  const constraints = extractShoppingConstraints(userMessage);

  const goal = constraints.category
    ? `Find ${constraints.category.toLowerCase()}${constraints.maxPrice ? ` within ₹${constraints.maxPrice}` : ''} from local farmers`
    : `Find quality farm produce${constraints.maxPrice ? ` within ₹${constraints.maxPrice}` : ''}`;

  const steps = [
    {
      stepNumber: 1,
      tool: 'searchProducts',
      description: 'Search available products in MySQL matching category, budget, and location',
      arguments: {
        category: constraints.category,
        maxPrice: constraints.maxPrice,
        availableOnly: true,
        verifiedFarmersOnly: constraints.verifiedFarmersOnly,
        location: constraints.location,
        limit: 10
      },
      status: 'pending'
    }
  ];

  // Step 2: Freshness inspection step
  steps.push({
    stepNumber: 2,
    tool: 'getProductFreshness',
    description: 'Inspect harvest and expiry dates from verified transparency records',
    arguments: {}, // Populated dynamically after product search
    status: 'pending'
  });

  // Step 3: Combination and Cart Calculation step
  if (constraints.maxPrice) {
    steps.push({
      stepNumber: 3,
      tool: 'calculateCartTotal',
      description: `Calculate pricing combination under ₹${constraints.maxPrice} using live database prices`,
      arguments: {}, // Populated dynamically based on found products
      status: 'pending'
    });
  }

  // Safety check on steps count
  const safeSteps = steps.slice(0, MAX_PLANNING_STEPS);

  return {
    goal,
    constraints,
    steps: safeSteps
  };
}

/**
 * Builds a structured plan for the Farmer Insight Agent
 * Strictly scoped to authenticated farmer ID.
 * Guaranteed <= MAX_PLANNING_STEPS (5)
 */
export function planFarmerInsights(farmerId, userMessage = '') {
  if (!farmerId) {
    throw new Error('Authenticated farmer ID is required for planning.');
  }

  const goal = 'Inspect farmer inventory for low stock levels, approaching expiries, and missing transparency data';

  const steps = [
    {
      stepNumber: 1,
      tool: 'getFarmerProducts',
      description: 'Fetch active product listings for authenticated farmer from database',
      arguments: { farmerId },
      status: 'pending'
    },
    {
      stepNumber: 2,
      tool: 'getProductFreshness',
      description: 'Audit harvest, packing, and expiry data for active listings',
      arguments: { farmerId },
      status: 'pending'
    }
  ];

  return {
    goal,
    farmerId,
    userMessage,
    steps: steps.slice(0, MAX_PLANNING_STEPS)
  };
}
