/**
 * Centralized Razorpay Configuration & Credential Resolver
 * Supports both TEST MODE (rzp_test_...) and LIVE MODE (rzp_live_...)
 */
export function getActiveRazorpayCredentials() {
  // Check if explicit LIVE credentials are provided
  if (
    process.env.RAZORPAY_MODE === 'live' &&
    process.env.RAZORPAY_LIVE_KEY_ID &&
    process.env.RAZORPAY_LIVE_KEY_SECRET
  ) {
    return {
      key: process.env.RAZORPAY_LIVE_KEY_ID.trim(),
      secret: process.env.RAZORPAY_LIVE_KEY_SECRET.trim(),
      isLive: true,
      mode: 'LIVE' as const,
    };
  }

  // Check if primary PAYMENT_GATEWAY_KEY is already a live key
  if (process.env.PAYMENT_GATEWAY_KEY?.trim().startsWith('rzp_live_')) {
    return {
      key: process.env.PAYMENT_GATEWAY_KEY.trim(),
      secret: (process.env.PAYMENT_GATEWAY_SECRET || '').trim(),
      isLive: true,
      mode: 'LIVE' as const,
    };
  }

  // Fallback to active credentials (Test Mode)
  return {
    key: (process.env.PAYMENT_GATEWAY_KEY || 'rzp_test_TqhZzQ6kTYijYR').trim(),
    secret: (process.env.PAYMENT_GATEWAY_SECRET || '7pBHAWd3CrfDAV6FbFVraZfO').trim(),
    isLive: false,
    mode: 'TEST' as const,
  };
}
