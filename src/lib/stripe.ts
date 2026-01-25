import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

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
