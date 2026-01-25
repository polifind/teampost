"use client";

import { useState } from "react";
import Link from "next/link";

interface SubscriptionPaywallProps {
  scheduledPostCount: number;
  onClose?: () => void;
}

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function SubscriptionPaywall({
  scheduledPostCount,
  onClose,
}: SubscriptionPaywallProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        alert("Failed to start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-claude-lg max-w-md w-full p-8 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-claude-text-tertiary hover:text-claude-text transition-colors"
          >
            <XIcon />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-accent-coral/10 text-accent-coral flex items-center justify-center mx-auto mb-4">
            <SparklesIcon />
          </div>
          <h2 className="text-2xl font-bold text-claude-text mb-2">
            You've used your 10 free posts!
          </h2>
          <p className="text-claude-text-secondary">
            Great work! You've scheduled {scheduledPostCount} posts. Upgrade to keep
            your AI Agent ghostwriter working for you.
          </p>
        </div>

        <div className="bg-claude-bg-secondary rounded-claude p-4 mb-6">
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold text-claude-text">$20</span>
            <span className="text-claude-text-secondary">/month</span>
          </div>
          <p className="text-sm text-claude-text-tertiary">Cancel anytime</p>
        </div>

        <ul className="space-y-3 mb-6">
          {[
            "Unlimited AI-generated posts",
            "Your AI Agent keeps learning your voice",
            "Unlimited regenerations & edits",
            "Priority processing",
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-claude-text text-sm">
              <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                <CheckIcon />
              </div>
              {item}
            </li>
          ))}
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className="btn-primary w-full justify-center mb-3"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : (
            "Upgrade to Unlimited"
          )}
        </button>

        <p className="text-center text-xs text-claude-text-tertiary">
          Secure checkout powered by Stripe
        </p>
      </div>
    </div>
  );
}
