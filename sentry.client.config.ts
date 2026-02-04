import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring sample rate (0.0 to 1.0)
  // 0.1 = 10% of transactions for free tier
  tracesSampleRate: 0.1,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Capture unhandled promise rejections
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ["error"],
    }),
  ],

  // Filter out noisy errors
  ignoreErrors: [
    // Network errors users cause by navigating away
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
  ],
});
