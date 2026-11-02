import {
  runSmartShoppingAgent,
  runFarmerInsightAgent,
  LIMIT_REACHED_MESSAGE
} from '../agents/farmDirectAgent.js';

/**
 * POST /api/agent/smart-shopping
 * Available to authenticated consumers and shoppers.
 * READ-ONLY agent that searches real products, checks freshness, and calculates cart combinations.
 */
export async function handleSmartShoppingAgent(req, res) {
  try {
    const rawInput = req.body.message || req.body.query || req.body.text;

    if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid shopping query or request.'
      });
    }

    if (rawInput.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Request exceeds maximum allowed length of 500 characters.'
      });
    }

    const response = await runSmartShoppingAgent({
      message: rawInput.trim(),
      user: req.user || null
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('Smart Shopping Agent error:', error.message);

    if (
      error.message === LIMIT_REACHED_MESSAGE ||
      error.code === 'LIMIT_EXCEEDED' ||
      error.message.includes('within the allowed limit')
    ) {
      return res.status(200).json({
        success: false,
        message: LIMIT_REACHED_MESSAGE
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Agent service is temporarily unavailable.'
    });
  }
}

/**
 * POST /api/agent/farmer-insights
 * Protected: FARMER role only.
 * Reads strictly from authenticated req.user.farmerProfile.id.
 * NEVER trusts client-supplied farmerId.
 */
export async function handleFarmerInsightAgent(req, res) {
  try {
    const farmerProfileId = req.user?.farmerProfile?.id;
    if (!farmerProfileId) {
      return res.status(400).json({
        success: false,
        message: 'No associated farmer profile found for this account.'
      });
    }

    const rawMessage = req.body.message || req.body.query || '';

    if (rawMessage && typeof rawMessage === 'string' && rawMessage.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Request exceeds maximum allowed length of 500 characters.'
      });
    }

    const response = await runFarmerInsightAgent({
      message: typeof rawMessage === 'string' ? rawMessage.trim() : '',
      farmerId: farmerProfileId,
      user: req.user
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error('Farmer Insight Agent error:', error.message);

    if (
      error.message === LIMIT_REACHED_MESSAGE ||
      error.code === 'LIMIT_EXCEEDED' ||
      error.message.includes('within the allowed limit')
    ) {
      return res.status(200).json({
        success: false,
        message: LIMIT_REACHED_MESSAGE
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Agent service is temporarily unavailable.'
    });
  }
}
