"use client";

import Link from "next/link";
import Logo from "@/components/Logo";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-claude-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-claude-bg/80 backdrop-blur-md border-b border-claude-border z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="btn-ghost text-sm">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-claude-text mb-2">Privacy Policy</h1>
          <p className="text-claude-text-secondary mb-12">Last updated: January 25, 2026</p>

          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-claude-text mb-4">1. Introduction</h2>
              <p className="text-claude-text-secondary leading-relaxed">
                TeamPost ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-claude-text mb-4">2. Information We Collect</h2>
              <p className="text-claude-text-secondary leading-relaxed mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-claude-text-secondary space-y-2">
                <li>Account information (name, email address, password)</li>
                <li>Profile information from your LinkedIn account when you connect it</li>
                <li>Content you create through our service, including responses to questions and generated posts</li>
                <li>Communications with us (support requests, feedback)</li>
                <li>Payment information (processed securely through Stripe)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-claude-text mb-4">3. How We Use Your Information</h2>
              <p className="text-claude-text-secondary leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-claude-text-secondary space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Generate personalized LinkedIn content based on your responses</li>
                <li>Post content to LinkedIn on your behalf (with your approval)</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments and questions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-claude-text mb-4">4. Information Sharing</h2>
              <p className="text-claude-text-secondary leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy. We may share information with service providers who assist us in operating our platform, processing payments (Stripe), and providing AI services (Anthropic). These parties are bound by contractual obligations to keep personal information confidential.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-claude-text mb-4">5. LinkedIn Integration</h2>
              <p className="text-claude-text-secondary leading-relaxed">
                When you connect your LinkedIn account, we access your profile information and the ability to post on your behalf. We only post content that you have explicitly approved. You can disconnect your LinkedIn account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-claude-text mb-4">6. Data Security</h2>
              <p className="text-claude-text-secondary leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-claude-text mb-4">7. Data Retention</h2>
              <p className="text-claude-text-secondary leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-claude-text mb-4">8. Your Rights</h2>
              <p className="text-claude-text-secondary leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-claude-text-secondary space-y-2">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Request data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-claude-text mb-4">9. Changes to This Policy</h2>
              <p className="text-claude-text-secondary leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-claude-text mb-4">10. Contact Us</h2>
              <p className="text-claude-text-secondary leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:{" "}
                <a href="mailto:rohan.pavuluri@gmail.com" className="text-accent-coral hover:underline">
                  rohan.pavuluri@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-claude-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-claude-text-secondary">
            © 2026 TeamPost. All rights reserved.
          </span>
          <div className="flex items-center gap-6 text-sm text-claude-text-secondary">
            <Link href="/privacy" className="hover:text-claude-text transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-claude-text transition-colors">Terms</Link>
            <a href="mailto:rohan.pavuluri@gmail.com" className="hover:text-claude-text transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
