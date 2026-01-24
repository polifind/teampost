"use client";

import Link from "next/link";
import { useState } from "react";
import Logo, { LogoIcon } from "@/components/Logo";

// Icons
const MicIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export default function LandingPage() {
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: <MicIcon />,
      title: "Just Talk",
      description: "Answer 10 simple questions with your voice. Share your stories, lessons, and experiences naturally.",
    },
    {
      icon: <SparklesIcon />,
      title: "AI Magic",
      description: "Our AI transforms your voice notes into 10 polished LinkedIn posts optimized for engagement.",
    },
    {
      icon: <CalendarIcon />,
      title: "Auto-Schedule",
      description: "Connect LinkedIn and schedule posts for 10 weeks. One post per week, completely hands-off.",
    },
  ];

  const questions = [
    "Tell me about a career turning point",
    "Describe a failure that taught you something",
    "What's the best advice you've received?",
    "Who influenced your career the most?",
    "A risk that paid off",
  ];

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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-coral-light text-accent-coral text-sm font-medium mb-6">
            <LinkedInIcon />
            <span>LinkedIn Content, Simplified</span>
          </div>

          <h1 className="text-5xl font-bold text-claude-text mb-6 leading-tight text-balance">
            Turn your stories into
            <span className="gradient-text"> 10 weeks </span>
            of LinkedIn content
          </h1>

          <p className="text-xl text-claude-text-secondary mb-6 max-w-2xl mx-auto text-balance">
            Just talk. Our AI listens to your experiences and creates engaging LinkedIn posts
            that sound like you. Schedule them once, and you're done for 10 weeks.
          </p>

          <p className="text-sm text-claude-text-tertiary mb-10">
            Built by the most successful creators on LinkedIn.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-3">
              Start for Free
              <ArrowRightIcon />
            </Link>
            <p className="text-sm text-claude-text-tertiary">
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Demo Visual */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="card-hover p-8 bg-gradient-to-br from-white to-claude-bg-secondary">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Voice Recording Side */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-claude-text-secondary text-sm font-medium">
                  <span className="w-6 h-6 rounded-full bg-accent-coral text-white flex items-center justify-center text-xs">1</span>
                  Answer questions with your voice
                </div>
                <div className="bg-white rounded-claude-lg border border-claude-border p-6">
                  <p className="text-lg text-claude-text mb-4">
                    "{questions[0]}"
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="w-14 h-14 rounded-full bg-accent-coral text-white flex items-center justify-center hover:bg-accent-coral-hover transition-colors">
                      <MicIcon />
                    </button>
                    <div className="flex-1 h-12 bg-claude-bg-tertiary rounded-claude flex items-center px-4 gap-1">
                      {[12, 18, 24, 16, 28, 20, 14, 26, 18, 22, 16, 30, 12, 24, 18, 20, 26, 14, 22, 16].map((height, i) => (
                        <div
                          key={i}
                          className="w-1 bg-accent-coral rounded-full"
                          style={{ height: `${height}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Post Side */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-claude-text-secondary text-sm font-medium">
                  <span className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center text-xs">2</span>
                  Get polished LinkedIn posts
                </div>
                <div className="post-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-claude-bg-tertiary" />
                    <div>
                      <p className="font-medium text-claude-text text-sm">Your Name</p>
                      <p className="text-xs text-claude-text-tertiary">CEO at Company</p>
                    </div>
                  </div>
                  <p className="text-claude-text text-sm leading-relaxed">
                    The best career decision I ever made was saying "yes" to something that terrified me.
                    <br /><br />
                    Three years ago, I was offered a role that felt way above my capabilities. Imposter syndrome hit hard...
                  </p>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-claude-border text-claude-text-tertiary text-xs">
                    <span>👍 247 likes</span>
                    <span>💬 34 comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-claude-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              How it works
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Three simple steps to transform your expertise into consistent LinkedIn content
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent-coral-light text-accent-coral flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-claude-text mb-3">
                  {feature.title}
                </h3>
                <p className="text-claude-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Questions */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Questions we'll ask you
            </h2>
            <p className="text-lg text-claude-text-secondary">
              Simple prompts that unlock your best professional stories
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Tell me about a significant career turning point",
              "Describe a failure that taught you something important",
              "What's the best professional advice you've ever received?",
              "A time you took a risk that paid off",
              "What habit has been most impactful for your productivity?",
            ].map((question, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-claude-lg bg-white border border-claude-border hover:border-accent-coral transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-claude-bg-tertiary text-claude-text-secondary flex items-center justify-center text-sm font-medium group-hover:bg-accent-coral-light group-hover:text-accent-coral transition-colors">
                  {index + 1}
                </div>
                <p className="text-claude-text">{question}</p>
              </div>
            ))}
            <p className="text-center text-claude-text-tertiary text-sm mt-4">
              + 5 more thought-provoking questions
            </p>
          </div>
        </div>
      </section>

      {/* Why Companies Love It */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Why companies love it
            </h2>
            <p className="text-lg text-claude-text-secondary">
              Top companies say LinkedIn is their most underutilized marketing channel
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "Employee posts outperform ads for B2B lead generation",
              "Authentic content reaches customers organically — no ad spend",
              "Boost visibility with candidates and make hiring easier",
              "Build credibility and trust with investors and partners",
              "Employee content gets 8x more engagement than company pages",
              "Give every team member a personal LinkedIn strategist",
              "Win-win: company gets free marketing, employees build their brand",
              "Turn your team into thought leaders in your industry",
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-coral/10 text-accent-coral flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckIcon />
                </div>
                <p className="text-claude-text">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Employees Love It */}
      <section className="py-20 px-6 bg-claude-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Why employees love it
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "No writing skills needed — just talk naturally",
              "Posts sound like you, not generic AI content",
              "Build your personal brand effortlessly",
              "10 weeks of content in under 30 minutes",
              "Automated scheduling — set it and forget it",
              "Increase your visibility and career opportunities",
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckIcon />
                </div>
                <p className="text-claude-text">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-claude-text mb-4">
            Ready to build your LinkedIn presence?
          </h2>
          <p className="text-lg text-claude-text-secondary mb-8">
            Join thousands of professionals who've transformed their LinkedIn game.
            It's completely free.
          </p>
          <Link href="/signup" className="btn-primary text-lg px-8 py-3">
            Get Started for Free
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-claude-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <LogoIcon size={24} />
            <span className="text-sm text-claude-text-secondary">
              © 2025 TeamPost. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-claude-text-secondary">
            <a href="#" className="hover:text-claude-text transition-colors">Privacy</a>
            <a href="#" className="hover:text-claude-text transition-colors">Terms</a>
            <a href="#" className="hover:text-claude-text transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
