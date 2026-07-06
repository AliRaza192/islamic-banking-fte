// api/referral-program.js
// Referral Program — Track referrals and rewards
// POST /api/referral-program — Manage referrals

const ALLOWED_ORIGINS = [
  'https://islamic-banking-fte.vercel.app',
  'http://localhost:8000',
  'http://localhost:3000',
];

// Referral rewards configuration
const REFERRAL_CONFIG = {
  max_referrals_per_user: 10,
  reward_per_referral: 100, // PKR
  min_referrals_for_reward: 1,
  referral_expiry_days: 30,
  bonus_rewards: {
    5: 500, // 5 referrals = 500 PKR bonus
    10: 1500, // 10 referrals = 1500 PKR bonus
  },
};

/**
 * Generate unique referral code
 * @param {string} userId - User ID
 * @returns {string} Referral code
 */
function generateReferralCode(userId) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const userHash = userId.toString().slice(-4);
  return `IBF${timestamp}${random}${userHash}`.toUpperCase();
}

/**
 * Validate referral code
 * @param {string} code - Referral code
 * @returns {boolean} Is valid
 */
function validateReferralCode(code) {
  // Format: IBF + alphanumeric characters
  const codeRegex = /^IBF[A-Z0-9]{8,12}$/;
  return codeRegex.test(code);
}

/**
 * Store referral in database
 * @param {string} referrerId - Referrer user ID
 * @param {string} refereeId - Referee user ID
 * @param {string} referralCode - Referral code used
 * @returns {object} Storage result
 */
async function storeReferral(referrerId, refereeId, referralCode) {
  // In production, store in database
  // await db.query(
  //   'INSERT INTO referrals (referrer_id, referee_id, referral_code, status, created_at) VALUES ($1, $2, $3, $4, NOW())',
  //   [referrerId, refereeId, referralCode, 'pending']
  // );

  console.log('Referral stored:', {
    referrerId,
    refereeId,
    referralCode,
    status: 'pending',
  });

  return { success: true, message: 'Referral recorded' };
}

/**
 * Calculate referral rewards for a user
 * @param {string} userId - User ID
 * @returns {object} Reward calculation
 */
async function calculateRewards(userId) {
  // In production, query database
  // const result = await db.query(
  //   'SELECT COUNT(*) as total_referrals FROM referrals WHERE referrer_id = $1 AND status = $2',
  //   [userId, 'completed']
  // );

  const totalReferrals = 0; // From database
  const baseReward = totalReferrals * REFERRAL_CONFIG.reward_per_referral;

  // Calculate bonus
  let bonus = 0;
  for (const [threshold, bonusAmount] of Object.entries(REFERRAL_CONFIG.bonus_rewards)) {
    if (totalReferrals >= parseInt(threshold)) {
      bonus = bonusAmount;
    }
  }

  const totalReward = baseReward + bonus;

  return {
    total_referrals: totalReferrals,
    base_reward: baseReward,
    bonus,
    total_reward: totalReward,
    next_bonus_at: getNextBonusThreshold(totalReferrals),
    referral_config: REFERRAL_CONFIG,
  };
}

/**
 * Get next bonus threshold
 * @param {number} currentReferrals - Current referral count
 * @returns {object} Next threshold info
 */
function getNextBonusThreshold(currentReferrals) {
  const thresholds = Object.keys(REFERRAL_CONFIG.bonus_rewards)
    .map(Number)
    .sort((a, b) => a - b);

  for (const threshold of thresholds) {
    if (currentReferrals < threshold) {
      return {
        threshold,
        referrals_needed: threshold - currentReferrals,
        bonus: REFERRAL_CONFIG.bonus_rewards[threshold],
      };
    }
  }

  return null;
}

/**
 * Get referral statistics
 * @param {string} userId - User ID
 * @returns {object} Referral stats
 */
async function getReferralStats(userId) {
  // In production, query database
  // const result = await db.query(
  //   'SELECT * FROM referrals WHERE referrer_id = $1 ORDER BY created_at DESC',
  //   [userId]
  // );

  const rewards = await calculateRewards(userId);

  return {
    user_id: userId,
    referral_code: generateReferralCode(userId),
    stats: {
      total_referrals: rewards.total_referrals,
      pending_referrals: 0,
      completed_referrals: rewards.total_referrals,
      total_earned: rewards.total_reward,
      available_balance: rewards.total_reward,
    },
    config: REFERRAL_CONFIG,
    share_link: `https://islamic-banking-fte.vercel.app?ref=${generateReferralCode(userId)}`,
  };
}

/**
 * Process referral completion
 * @param {string} referralCode - Referral code
 * @param {string} refereeId - Referee user ID
 * @returns {object} Processing result
 */
async function processReferralCompletion(referralCode, refereeId) {
  if (!validateReferralCode(referralCode)) {
    return { success: false, error: 'Invalid referral code' };
  }

  // In production:
  // 1. Find referrer by code
  // 2. Check if referee is new user
  // 3. Update referral status to 'completed'
  // 4. Award points to referrer

  console.log('Referral completed:', { referralCode, refereeId });

  return {
    success: true,
    message: 'Referral completed',
    reward_awarded: REFERRAL_CONFIG.reward_per_referral,
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — Get referral stats
  if (req.method === 'GET') {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const userId = url.searchParams.get('user_id');
    const action = url.searchParams.get('action');

    if (action === 'validate' && url.searchParams.get('code')) {
      const code = url.searchParams.get('code');
      const isValid = validateReferralCode(code);
      return res.status(200).json({ code, valid: isValid });
    }

    if (!userId) {
      return res.status(400).json({ error: 'user_id required' });
    }

    const stats = await getReferralStats(userId);
    return res.status(200).json(stats);
  }

  // POST — Process referral
  if (req.method === 'POST') {
    try {
      const { action, user_id, referral_code, referee_id } = req.body;

      // Generate referral code
      if (action === 'generate_code' && user_id) {
        const code = generateReferralCode(user_id);
        return res.status(200).json({
          success: true,
          referral_code: code,
          share_link: `https://islamic-banking-fte.vercel.app?ref=${code}`,
        });
      }

      // Apply referral code
      if (action === 'apply_referral' && referral_code && referee_id) {
        const result = await processReferralCompletion(referral_code, referee_id);
        return res.status(200).json(result);
      }

      // Get rewards
      if (action === 'get_rewards' && user_id) {
        const rewards = await calculateRewards(user_id);
        return res.status(200).json(rewards);
      }

      return res.status(400).json({
        error: 'Invalid action',
        valid_actions: ['generate_code', 'apply_referral', 'get_rewards'],
      });
    } catch (err) {
      console.error('Referral error:', err.message);
      return res.status(500).json({ error: 'Referral processing failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
