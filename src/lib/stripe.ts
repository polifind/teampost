import Stripe from "stripe";

// Lazy initialization to avoid build errors when STRIPE_SECRET_KEY is not set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return _stripe;
}

// Keep the old export for backward compatibility but make it lazy
export const stripe = {
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
} as unknown as Stripe;

// Price ID for the $20/month subscription
export const PRICE_ID = process.env.STRIPE_PRICE_ID!;

// Number of free posts before requiring subscription
export const FREE_POST_LIMIT = 10;

// Check if user has an active subscription
export function hasActiveSubscription(user: {
  stripeSubscriptionId?: string | null;
  stripeCurrentPeriodEnd?: Date | null;
}): boolean {
  if (!user.stripeSubscriptionId || !user.stripeCurrentPeriodEnd) {
    return false;
  }

  // Check if subscription period hasn't ended
  return user.stripeCurrentPeriodEnd > new Date();
}
