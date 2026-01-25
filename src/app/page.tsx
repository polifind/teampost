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
      title: "AI Agent Magic",
      description: "Our AI Agent transforms your voice into 10 polished LinkedIn posts—learning your style with every interaction.",
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
            <a href="#pricing" className="text-sm text-claude-text-secondary hover:text-claude-text transition-colors">
              Pricing
            </a>
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
            <SparklesIcon />
            <span>Your Personal AI Agent Ghostwriter</span>
          </div>

          <h1 className="text-5xl font-bold text-claude-text mb-6 leading-tight text-balance">
            A $20,000 ghostwriter.
            <span className="gradient-text"> Now an AI Agent. </span>
          </h1>

          <p className="text-xl text-claude-text-secondary mb-6 max-w-2xl mx-auto text-balance">
            Elite executives pay ghostwriters $20,000+ for LinkedIn content. TeamPost's AI Agent
            delivers the same quality—learning your voice, crafting viral posts, and managing
            your entire content calendar. Just talk, and watch the magic happen.
          </p>

          <p className="text-sm text-claude-text-tertiary mb-10">
            Powered by the same strategies top creators use to go viral.
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

      {/* What a Real Ghostwriter Does */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              What does a $20,000 ghostwriter actually do?
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              They don't just write. They have conversations with you, help you brainstorm ideas,
              keep your content organized, and manage the entire posting process.
              <span className="text-accent-coral font-medium"> That's exactly what TeamPost does.</span>
            </p>
          </div>

          {/* Conversation Demo */}
          <div className="card-hover p-8 bg-gradient-to-br from-white to-claude-bg-secondary">
            <div className="max-w-2xl mx-auto space-y-4">
              {/* AI Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-coral flex items-center justify-center flex-shrink-0">
                  <SparklesIcon />
                </div>
                <div className="bg-claude-bg-secondary rounded-claude-lg rounded-tl-none p-4 max-w-md">
                  <p className="text-sm text-claude-text">
                    Hey! I'm your AI Agent ghostwriter. Tell me about a moment in your career that changed everything.
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-3 justify-end">
                <div className="bg-accent-coral text-white rounded-claude-lg rounded-tr-none p-4 max-w-md">
                  <p className="text-sm">
                    Well, I once got rejected from a job at a coffee shop. Now I run a company...
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-claude-bg-tertiary flex-shrink-0" />
              </div>

              {/* AI Follow-up */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-coral flex items-center justify-center flex-shrink-0">
                  <SparklesIcon />
                </div>
                <div className="bg-claude-bg-secondary rounded-claude-lg rounded-tl-none p-4 max-w-md">
                  <p className="text-sm text-claude-text">
                    That's a great hook! What coffee shop was it? What did they actually say when they rejected you?
                    <span className="text-accent-coral"> Those specific details make posts go viral.</span>
                  </p>
                </div>
              </div>

              {/* User Response */}
              <div className="flex gap-3 justify-end">
                <div className="bg-accent-coral text-white rounded-claude-lg rounded-tr-none p-4 max-w-md">
                  <p className="text-sm">
                    It was Starbucks! The manager said I "wasn't a good fit for customer service." I was 19.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-claude-bg-tertiary flex-shrink-0" />
              </div>

              {/* AI Draft */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-coral flex items-center justify-center flex-shrink-0">
                  <SparklesIcon />
                </div>
                <div className="bg-claude-bg-secondary rounded-claude-lg rounded-tl-none p-4 max-w-md">
                  <p className="text-sm text-claude-text mb-3">
                    Perfect. Here's your draft:
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-claude-border">
                    <p className="text-sm text-claude-text leading-relaxed">
                      I got rejected from Starbucks.
                      <br /><br />
                      The manager said I wasn't "a good fit for customer service."
                      <br /><br />
                      I was 19. Needed the job. Walked out embarrassed.
                      <br /><br />
                      15 years later, I run a company with 50 employees...
                    </p>
                  </div>
                  <p className="text-xs text-claude-text-tertiary mt-2">
                    Want me to adjust anything? I'll remember your preferences for future posts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Full Ghostwriter Experience */}
      <section className="py-20 px-6 bg-claude-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              The complete ghostwriter experience
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Everything a premium ghostwriter does—conversation, brainstorming, organization,
              and publishing—all handled by your AI Agent
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="card text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-coral-light text-accent-coral flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <div className="text-xs text-accent-coral font-medium mb-2">STEP 1</div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">
                Conversation
              </h3>
              <p className="text-claude-text-secondary text-sm">
                Your AI Agent asks smart questions to draw out your best stories—just like a real ghostwriter would.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-coral-light text-accent-coral flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <div className="text-xs text-accent-coral font-medium mb-2">STEP 2</div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">
                Brainstorm
              </h3>
              <p className="text-claude-text-secondary text-sm">
                Together, you refine angles, find the hook, and shape raw ideas into compelling narratives.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-coral-light text-accent-coral flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div className="text-xs text-accent-coral font-medium mb-2">STEP 3</div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">
                Organize
              </h3>
              <p className="text-claude-text-secondary text-sm">
                Your posts are saved, organized by topic, and ready to review. Resume any conversation anytime.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-coral-light text-accent-coral flex items-center justify-center mx-auto mb-4">
                <CalendarIcon />
              </div>
              <div className="text-xs text-accent-coral font-medium mb-2">STEP 4</div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">
                Publish
              </h3>
              <p className="text-claude-text-secondary text-sm">
                Approve your post and it's automatically scheduled. Your AI Agent handles the rest.
              </p>
            </div>
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

      {/* AI Agent Value Proposition */}
      <section className="py-20 px-6 bg-gradient-to-br from-accent-coral/5 to-accent-coral/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-accent-coral text-sm font-medium mb-4">
              <SparklesIcon />
              <span>The AI Agent Advantage</span>
            </div>
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Not just AI writing. A true ghostwriting relationship.
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Most AI tools just generate generic content. TeamPost's AI Agent works <em>with</em> you—
              having real conversations, learning your preferences, and getting better every time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="w-12 h-12 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">Remembers Everything</h3>
              <p className="text-claude-text-secondary text-sm">
                Like a real ghostwriter, your AI Agent learns your preferences. Say "shorter sentences" once—it remembers forever.
              </p>
            </div>

            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="w-12 h-12 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">Asks the Right Questions</h3>
              <p className="text-claude-text-secondary text-sm">
                Great ghostwriters know what details make posts go viral. Your AI Agent digs for the specific moments that resonate.
              </p>
            </div>

            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="w-12 h-12 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">Iterates With You</h3>
              <p className="text-claude-text-secondary text-sm">
                Don't like the hook? Want a different angle? Your AI Agent refines drafts based on your feedback—unlimited revisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              The ghostwriter experience, without the price tag
            </h2>
            <p className="text-lg text-claude-text-secondary">
              Compare what you'd pay a human ghostwriter vs. TeamPost's AI Agent
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional Ghostwriter */}
            <div className="bg-claude-bg-secondary rounded-claude-lg p-8 border border-claude-border">
              <div className="text-claude-text-tertiary text-sm font-medium mb-2">TRADITIONAL GHOSTWRITER</div>
              <div className="text-4xl font-bold text-claude-text mb-6">$20,000+</div>
              <ul className="space-y-3">
                {[
                  "Multiple discovery calls required",
                  "Weeks of back-and-forth edits",
                  "Limited to 10-20 posts",
                  "No scheduling included",
                  "Slow turnaround times",
                  "One style, limited flexibility",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-claude-text-secondary">
                    <svg className="w-5 h-5 text-claude-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* TeamPost AI Agent */}
            <div className="bg-white rounded-claude-lg p-8 border-2 border-accent-coral relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-coral text-white text-xs font-medium rounded-full">
                RECOMMENDED
              </div>
              <div className="text-accent-coral text-sm font-medium mb-2">TEAMPOST AI AGENT</div>
              <div className="text-4xl font-bold text-claude-text mb-6">Free to start</div>
              <ul className="space-y-3">
                {[
                  "Just talk — no meetings needed",
                  "Instant posts, instant edits",
                  "Unlimited regenerations",
                  "Auto-scheduling built in",
                  "Posts ready in seconds",
                  "Learns and adapts to your style",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-claude-text">
                    <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center">
                      <CheckIcon />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Results */}
      <section className="py-20 px-6 bg-claude-bg-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Real results from real professionals
            </h2>
            <p className="text-lg text-claude-text-secondary">
              See what happens when you let an AI Agent handle your LinkedIn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="text-4xl font-bold text-accent-coral mb-2">10x</div>
              <div className="text-claude-text font-medium mb-2">More Engagement</div>
              <p className="text-sm text-claude-text-secondary">
                Average increase in post engagement after switching to AI Agent-written content
              </p>
            </div>
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="text-4xl font-bold text-accent-coral mb-2">30 min</div>
              <div className="text-claude-text font-medium mb-2">For 10 Weeks</div>
              <p className="text-sm text-claude-text-secondary">
                That's all it takes to create and schedule 10 weeks of professional content
              </p>
            </div>
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="text-4xl font-bold text-accent-coral mb-2">$0</div>
              <div className="text-claude-text font-medium mb-2">To Get Started</div>
              <p className="text-sm text-claude-text-secondary">
                No credit card required. Start creating content with your AI Agent today
              </p>
            </div>
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
              "Give every team member their own AI Agent ghostwriter",
              "Win-win: company gets free marketing, employees build their brand",
              "Turn your team into thought leaders with AI Agent assistance",
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
              Why employees love their AI Agent
            </h2>
            <p className="text-lg text-claude-text-secondary">
              It's like having a personal content strategist in your pocket
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              "No writing skills needed — just talk naturally",
              "Your AI Agent captures your authentic voice",
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-coral-light text-accent-coral text-sm font-medium mb-4">
              <SparklesIcon />
              <span>Simple Pricing</span>
            </div>
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Start free. Upgrade when you're ready.
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Your first 10 posts are completely free. No credit card required.
              Only pay when you want to keep the magic going.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-claude-lg p-8 border border-claude-border">
              <div className="text-claude-text-secondary text-sm font-medium mb-2">FREE FOREVER</div>
              <div className="text-4xl font-bold text-claude-text mb-2">$0</div>
              <p className="text-claude-text-secondary mb-6">First 10 posts on us</p>

              <ul className="space-y-3 mb-8">
                {[
                  "10 AI-generated posts",
                  "Full conversation experience",
                  "AI Agent learns your voice",
                  "Auto-scheduling included",
                  "No credit card required",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-claude-text">
                    <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                      <CheckIcon />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="btn-ghost w-full justify-center">
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-claude-lg p-8 border-2 border-accent-coral relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-coral text-white text-xs font-medium rounded-full">
                BEST VALUE
              </div>
              <div className="text-accent-coral text-sm font-medium mb-2">UNLIMITED</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-claude-text">$20</span>
                <span className="text-claude-text-secondary">/month</span>
              </div>
              <p className="text-claude-text-secondary mb-6">After your first 10 posts</p>

              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited AI-generated posts",
                  "Priority AI processing",
                  "Advanced voice learning",
                  "Unlimited regenerations",
                  "Full conversation history",
                  "Cancel anytime",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-claude-text">
                    <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                      <CheckIcon />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="btn-primary w-full justify-center">
                Start Free Trial
                <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <p className="text-center text-claude-text-tertiary text-sm mt-8">
            That's less than the cost of a single coffee per week for unlimited professional content.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-claude-bg-secondary">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-accent-coral text-sm font-medium mb-4">
            <SparklesIcon />
            <span>Start Free Today</span>
          </div>
          <h2 className="text-3xl font-bold text-claude-text mb-4">
            Ready to meet your AI Agent ghostwriter?
          </h2>
          <p className="text-lg text-claude-text-secondary mb-8">
            Join thousands of professionals who've replaced expensive ghostwriters
            with TeamPost's AI Agent. Your first 10 posts are completely free.
          </p>
          <Link href="/signup" className="btn-primary text-lg px-8 py-3">
            Get Your AI Agent
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
              © 2026 TeamPost. All rights reserved.
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
