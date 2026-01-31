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

const DollarIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MegaphoneIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const SlackIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-claude-border last:border-b-0 px-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left hover:text-accent-coral transition-colors"
      >
        <span className="font-medium text-claude-text pr-4">{question}</span>
        <span className={`text-claude-text-secondary transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </span>
      </button>
      {isOpen && (
        <div className="pb-5 text-claude-text-secondary">
          {answer}
        </div>
      )}
    </div>
  );
};

export default function LandingPage() {
  const [email, setEmail] = useState("");

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

      {/* Hero Section - Company/Team Focused */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-coral-light text-accent-coral text-sm font-medium mb-6">
            <SparklesIcon />
            <span>A $20,000/year Ghostwriter for Every Employee</span>
          </div>

          <h1 className="text-5xl font-bold text-claude-text mb-6 leading-tight text-balance">
            Turn Your Entire Company Into a
            <span className="gradient-text"> LinkedIn Content Machine</span>
          </h1>

          <p className="text-xl text-claude-text-secondary mb-8 max-w-2xl mx-auto text-balance">
            Give every employee the white-glove ghostwriting experience. Generate more pipeline, amplify your brand,
            and attract top talent. All through authentic employee content that posts automatically.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-claude-text-tertiary mb-10">
            <span className="flex items-center gap-2">
              <DollarIcon />
              More sales pipeline
            </span>
            <span className="flex items-center gap-2">
              <MegaphoneIcon />
              Free brand reach
            </span>
            <span className="flex items-center gap-2">
              <UsersIcon />
              Better hiring
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-3">
              Start Free Trial
              <ArrowRightIcon />
            </Link>
            <p className="text-sm text-claude-text-tertiary">
              First 10 posts free • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof - Why LinkedIn Matters */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-claude-bg-secondary to-white rounded-claude-lg border border-claude-border p-10 md:p-14">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-claude-text mb-2">
                Ever wonder why you keep seeing these companies all over LinkedIn?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { name: "Lovable", description: "AI app builder", logo: "https://lovable.dev/img/logo/lovable-icon-bg-light.png" },
                { name: "Clay", description: "Data enrichment", logo: "https://cdn.prod.website-files.com/61477f2c24a826836f969afe/677c0a6767557563354e34a3_Clay%20icon.png" },
                { name: "Cursor", description: "AI code editor", logo: "https://cursor.com/favicon.ico" },
              ].map((company) => (
                <div key={company.name} className="bg-white rounded-claude-lg p-6 border border-claude-border text-center">
                  <img src={company.logo} alt={company.name} className="w-12 h-12 mx-auto mb-3 object-contain" />
                  <div className="text-xl font-bold text-claude-text mb-1">{company.name}</div>
                  <div className="text-sm text-claude-text-tertiary">{company.description}</div>
                </div>
              ))}
            </div>

            <div className="max-w-2xl mx-auto text-center space-y-4">
              <p className="text-claude-text">
                The fastest-growing B2B companies have figured it out: <span className="font-semibold">employees posting about the journey, product launches, and company wins</span> is the most effective way to generate leads.
              </p>
              <p className="text-claude-text-secondary">
                Every B2B founder will tell you LinkedIn is a top 3 channel. Yet it's 100x underutilized by almost every company.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-claude-border text-center">
              <p className="text-lg text-claude-text mb-2">
                In an ideal world, every employee posts every week.
              </p>
              <p className="text-xl font-semibold text-accent-coral">
                TeamPost makes that possible.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-coral/10 text-accent-coral font-medium">
              <SparklesIcon />
              Be the next Lovable, Clay, and Cursor on LinkedIn
            </p>
          </div>
        </div>
      </section>

      {/* Revenue Impact Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-accent-coral/5 to-accent-coral/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              LinkedIn content drives real revenue
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Employee posts outperform company pages and paid ads. TeamPost turns your entire
              workforce into a content engine, without adding to anyone's workload.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Sales */}
            <div className="bg-white rounded-claude-lg p-8 border border-claude-border">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-6">
                <DollarIcon />
              </div>
              <h3 className="text-xl font-bold text-claude-text mb-3">For Sales Leaders</h3>
              <p className="text-claude-text-secondary mb-4">
                Your reps' posts generate warm inbound. Prospects who engage with employee content
                are 5x more likely to convert.
              </p>
              <ul className="space-y-2">
                {[
                  "Build pipeline through thought leadership",
                  "Warm up cold accounts organically",
                  "Shorten sales cycles with trust",
                  "Every rep becomes a brand ambassador",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-claude-text">
                    <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Marketing */}
            <div className="bg-white rounded-claude-lg p-8 border border-claude-border">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <MegaphoneIcon />
              </div>
              <h3 className="text-xl font-bold text-claude-text mb-3">For Marketing Leaders</h3>
              <p className="text-claude-text-secondary mb-4">
                Employee content gets 8x more engagement than company pages. Amplify your brand
                reach without spending more on ads.
              </p>
              <ul className="space-y-2">
                {[
                  "8x more reach than company posts",
                  "Authentic voices build brand trust",
                  "Zero ad spend for organic reach",
                  "Consistent content across the org",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-claude-text">
                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recruiting */}
            <div className="bg-white rounded-claude-lg p-8 border border-claude-border">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <UsersIcon />
              </div>
              <h3 className="text-xl font-bold text-claude-text mb-3">For Recruiting Leaders</h3>
              <p className="text-claude-text-secondary mb-4">
                Candidates research employees before applying. When your team is visible and
                active, you attract better talent faster.
              </p>
              <ul className="space-y-2">
                {[
                  "Showcase your culture authentically",
                  "Attract passive candidates",
                  "Reduce cost per hire",
                  "Employees become recruiters",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-claude-text">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
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

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              From zero to 5 weeks of content in 15 minutes
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Each employee gets their own AI ghostwriter that learns their voice,
              writes their posts, and handles scheduling automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-coral-light text-accent-coral flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <div className="text-xs text-accent-coral font-medium mb-2">STEP 1</div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">
                Answer Questions
              </h3>
              <p className="text-claude-text-secondary text-sm">
                Your AI Agent asks about career stories, lessons learned, and professional experiences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-coral-light text-accent-coral flex items-center justify-center mx-auto mb-4">
                <SparklesIcon />
              </div>
              <div className="text-xs text-accent-coral font-medium mb-2">STEP 2</div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">
                AI Writes Posts
              </h3>
              <p className="text-claude-text-secondary text-sm">
                Your ghostwriter transforms answers into polished LinkedIn posts in your authentic voice.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-coral-light text-accent-coral flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </div>
              <div className="text-xs text-accent-coral font-medium mb-2">STEP 3</div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">
                Review & Approve
              </h3>
              <p className="text-claude-text-secondary text-sm">
                Quick review, make edits if needed. Your AI learns your preferences for next time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-coral-light text-accent-coral flex items-center justify-center mx-auto mb-4">
                <CalendarIcon />
              </div>
              <div className="text-xs text-accent-coral font-medium mb-2">STEP 4</div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">
                Auto-Post to LinkedIn
              </h3>
              <p className="text-claude-text-secondary text-sm">
                Posts automatically go live on your schedule. One per week, completely hands-off.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Slack Integration - Your Ghostwriter in Slack */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#4A154B]/5 to-[#4A154B]/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A154B]/10 text-[#4A154B] text-sm font-medium mb-4">
              <SlackIcon className="w-4 h-4" />
              <span>Slack Integration</span>
            </div>
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Your personal ghostwriter, right in Slack
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              No new app to learn. Just DM your TeamPost bot with ideas, and it drafts, refines, and schedules your LinkedIn posts. Like texting your ghostwriter.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Slack conversation mockup */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Slack header */}
              <div className="bg-[#4A154B] text-white px-4 py-3 flex items-center gap-3">
                <SlackIcon className="w-5 h-5" />
                <span className="font-medium">TeamPost</span>
                <span className="text-white/60 text-sm">App</span>
              </div>

              {/* Conversation */}
              <div className="p-4 space-y-4 bg-gray-50">
                {/* User message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-gray-300 flex-shrink-0" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm text-gray-900">You</span>
                      <span className="text-xs text-gray-500">10:32 AM</span>
                    </div>
                    <p className="text-sm text-gray-800 mt-1">
                      hey - quick bullets for a post:<br/>
                      • just hit $1M ARR<br/>
                      • bootstrapped, no outside funding<br/>
                      • took 18 months<br/><br/>
                      Monday at 9am EST
                    </p>
                  </div>
                </div>

                {/* Bot response */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded bg-accent-coral flex items-center justify-center flex-shrink-0">
                    <SparklesIcon />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm text-gray-900">TeamPost</span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-1.5 rounded">APP</span>
                      <span className="text-xs text-gray-500">10:32 AM</span>
                    </div>
                    <div className="mt-2 bg-white rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500 mb-2">Here's your LinkedIn post draft:</p>
                      <p className="text-xs text-accent-coral mb-2">📅 Will be scheduled for: Monday 9:00 AM EST</p>
                      <div className="border-l-2 border-gray-200 pl-3 text-sm text-gray-800">
                        We just hit $1M ARR.<br/><br/>
                        No VCs. No outside funding. Just us.<br/><br/>
                        18 months of saying no to everything except what mattered...<br/><br/>
                        <span className="text-gray-400">[Read more]</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1.5 bg-[#007a5a] text-white text-xs font-medium rounded">✅ Approve & Schedule</button>
                        <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">🔄 Regenerate</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Benefits */}
            <div className="space-y-8">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#4A154B]/10 text-[#4A154B] flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-claude-text mb-2">Just DM your ideas</h3>
                <p className="text-claude-text-secondary">
                  Send bullet points, rough thoughts, or even voice notes. Your AI ghostwriter turns them into polished LinkedIn posts instantly.
                </p>
              </div>

              <div>
                <div className="w-12 h-12 rounded-xl bg-[#4A154B]/10 text-[#4A154B] flex items-center justify-center mb-4">
                  <CalendarIcon />
                </div>
                <h3 className="text-xl font-semibold text-claude-text mb-2">Say when, it posts</h3>
                <p className="text-claude-text-secondary">
                  Include "Monday at 9am EST" in your message and it schedules automatically. One tap to approve. Zero friction.
                </p>
              </div>

              <div>
                <div className="w-12 h-12 rounded-xl bg-[#4A154B]/10 text-[#4A154B] flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-claude-text mb-2">Refine with feedback</h3>
                <p className="text-claude-text-secondary">
                  Don't like the draft? Just reply with feedback. "Make it shorter" or "add more storytelling" — your ghostwriter adapts instantly.
                </p>
              </div>

              <div>
                <div className="w-12 h-12 rounded-xl bg-[#4A154B]/10 text-[#4A154B] flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-claude-text mb-2">Drop in photos too</h3>
                <p className="text-claude-text-secondary">
                  Drag photos into the chat and they're automatically attached to your post. Your ghostwriter handles everything.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-claude-text-secondary mb-6">
              It's like having a $20,000/year ghostwriter who lives in your Slack and works with you one-on-one.
            </p>
            <Link href="/signup" className="btn-primary bg-[#4A154B] hover:bg-[#3d1140] inline-flex items-center gap-2">
              <SlackIcon className="w-5 h-5" />
              Get Your Slack Ghostwriter
            </Link>
          </div>
        </div>
      </section>

      {/* Why Not ChatGPT/Claude */}
      <section className="py-20 px-6 bg-claude-bg-secondary">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Why not just use ChatGPT or Claude?
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              You could ask every employee to prompt engineer their own LinkedIn posts.
              Good luck getting consistent output from 500 people.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* DIY AI */}
            <div className="bg-white rounded-claude-lg p-8 border border-claude-border">
              <div className="text-claude-text-tertiary text-sm font-medium mb-4">DIY WITH CHATGPT / CLAUDE</div>
              <div className="text-2xl font-bold text-claude-text mb-6">Hope Everyone Figures It Out</div>
              <ul className="space-y-4">
                {[
                  "Every employee prompts differently",
                  "Most give up after 2 bad outputs",
                  "No voice consistency across the org",
                  "Zero visibility into who's posting",
                  "Copy/paste into LinkedIn manually",
                  "No scheduling, no automation",
                  "Marketing has no control",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-claude-text-secondary">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* TeamPost */}
            <div className="bg-white rounded-claude-lg p-8 border-2 border-accent-coral relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-coral text-white text-xs font-medium rounded-full">
                BUILT FOR SCALE
              </div>
              <div className="text-accent-coral text-sm font-medium mb-4">TEAMPOST</div>
              <div className="text-2xl font-bold text-claude-text mb-6">Structure, Strategy & Accountability</div>
              <ul className="space-y-4">
                {[
                  "Weekly structure keeps employees posting consistently",
                  "Proven LinkedIn strategies built into every post",
                  "Accountability through scheduled content calendar",
                  "Admins draft posts for hundreds of employees",
                  "Dashboard shows every scheduled post",
                  "Auto-posts directly to LinkedIn",
                  "One marketer can run 1,000 accounts",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-claude-text">
                    <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-accent-coral/5 rounded-claude-lg p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                </div>
                <h3 className="font-semibold text-claude-text mb-2">LinkedIn-Native AI</h3>
                <p className="text-sm text-claude-text-secondary">
                  Trained specifically on high-performing LinkedIn content. Knows what hooks, formats, and CTAs actually drive engagement.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-claude-text mb-2">Full Visibility</h3>
                <p className="text-sm text-claude-text-secondary">
                  See every post before it goes live. Track engagement across the org. Know exactly what your employees are saying.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center mx-auto mb-4">
                  <UsersIcon />
                </div>
                <h3 className="font-semibold text-claude-text mb-2">Scale Without Headcount</h3>
                <p className="text-sm text-claude-text-secondary">
                  One social media manager can generate content for your entire company. No need to hire an army of ghostwriters.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-claude-text-secondary mt-8">
            ChatGPT is a blank canvas. TeamPost is a turnkey content engine for your entire workforce.
          </p>
        </div>
      </section>

      {/* Why Not Just Use Buffer? */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Why not just use a scheduling tool?
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Buffer, Hootsuite, and other schedulers assume you already have content.
              TeamPost actually helps you create it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional Schedulers */}
            <div className="bg-white rounded-claude-lg p-8 border border-claude-border">
              <div className="text-claude-text-tertiary text-sm font-medium mb-4">TRADITIONAL SCHEDULERS</div>
              <div className="text-2xl font-bold text-claude-text mb-6">Buffer, Hootsuite, Later</div>
              <ul className="space-y-4">
                {[
                  { text: "You still have to write everything", bad: true },
                  { text: "Staring at a blank page every week", bad: true },
                  { text: "No help with ideas or content strategy", bad: true },
                  { text: "Schedule posts, but where do posts come from?", bad: true },
                  { text: "Employees give up after a few weeks", bad: true },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-claude-text-secondary">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* TeamPost */}
            <div className="bg-white rounded-claude-lg p-8 border-2 border-accent-coral relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-coral text-white text-xs font-medium rounded-full">
                THE BETTER WAY
              </div>
              <div className="text-accent-coral text-sm font-medium mb-4">TEAMPOST</div>
              <div className="text-2xl font-bold text-claude-text mb-6">Writing + Scheduling in One</div>
              <ul className="space-y-4">
                {[
                  { text: "AI ghostwriter creates posts for you", good: true },
                  { text: "Just answer questions about your experience", good: true },
                  { text: "Learns your voice and improves over time", good: true },
                  { text: "5 weeks of content in 15 minutes", good: true },
                  { text: "Auto-posts to LinkedIn on schedule", good: true },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-claude-text">
                    <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center text-claude-text-secondary mt-8">
            The hardest part of LinkedIn isn't scheduling. It's knowing what to write.
            <span className="text-accent-coral font-medium"> TeamPost solves that.</span>
          </p>
        </div>
      </section>

      {/* Ghostwriter Comparison */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              A $20,000 ghostwriter for every employee
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Elite executives pay ghostwriters $20,000+ for LinkedIn content.
              Now your entire team gets the same experience at a fraction of the cost.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional Ghostwriter */}
            <div className="bg-claude-bg-secondary rounded-claude-lg p-8 border border-claude-border">
              <div className="text-claude-text-tertiary text-sm font-medium mb-2">TRADITIONAL GHOSTWRITER</div>
              <div className="text-4xl font-bold text-claude-text mb-2">$20,000+</div>
              <p className="text-claude-text-secondary mb-6">Per executive, per year</p>
              <ul className="space-y-4">
                {[
                  "Only affordable for C-suite executives",
                  "Multiple discovery calls required",
                  "Weeks of back-and-forth edits",
                  "Limited to 10-20 posts per engagement",
                  "No scheduling included, you still post manually",
                  "Slow turnaround times",
                  "One person gets the benefit",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-claude-text-secondary">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* TeamPost */}
            <div className="bg-white rounded-claude-lg p-8 border-2 border-accent-coral relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-accent-coral text-white text-xs font-medium rounded-full">
                10,000x MORE AFFORDABLE
              </div>
              <div className="text-accent-coral text-sm font-medium mb-2">TEAMPOST AI GHOSTWRITER</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-claude-text">$20</span>
                <span className="text-claude-text-secondary">/user/month</span>
              </div>
              <p className="text-claude-text-secondary mb-6">For your entire team</p>
              <ul className="space-y-4">
                {[
                  "Every employee gets their own ghostwriter",
                  "Just answer questions, no meetings needed",
                  "Instant posts, instant revisions",
                  "Unlimited posts with subscription",
                  "Auto-posts directly to LinkedIn",
                  "Posts ready in seconds",
                  "Your whole company benefits",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-claude-text">
                    <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 bg-accent-coral/5 rounded-claude-lg p-6 text-center">
            <p className="text-claude-text">
              <span className="font-semibold">The math:</span> A single executive ghostwriter costs $20,000/year.
              TeamPost gives <span className="text-accent-coral font-semibold">100 employees</span> unlimited AI ghostwriting for the same price.
            </p>
          </div>
        </div>
      </section>

      {/* The AI Ghostwriter Experience */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-coral-light text-accent-coral text-sm font-medium mb-4">
              <SparklesIcon />
              <span>The AI Ghostwriter Experience</span>
            </div>
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Like having a $20,000 ghostwriter for every employee
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Elite executives pay ghostwriters $20,000+ for LinkedIn content.
              TeamPost gives that same experience to your entire team.
            </p>
          </div>

          {/* Conversation Demo */}
          <div className="card-hover p-8 bg-gradient-to-br from-white to-claude-bg-secondary mb-12">
            <div className="max-w-2xl mx-auto space-y-4">
              {/* AI Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-coral flex items-center justify-center flex-shrink-0">
                  <SparklesIcon />
                </div>
                <div className="bg-claude-bg-secondary rounded-claude-lg rounded-tl-none p-4 max-w-md">
                  <p className="text-sm text-claude-text">
                    Tell me about a moment in your career that changed everything.
                  </p>
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-3 justify-end">
                <div className="bg-accent-coral text-white rounded-claude-lg rounded-tr-none p-4 max-w-md">
                  <p className="text-sm">
                    I got rejected from a job at Starbucks when I was 19. The manager said I wasn't a good fit for customer service.
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
                    That's a great hook! What happened after? Where are you now compared to that 19-year-old?
                  </p>
                </div>
              </div>

              {/* User Response */}
              <div className="flex gap-3 justify-end">
                <div className="bg-accent-coral text-white rounded-claude-lg rounded-tr-none p-4 max-w-md">
                  <p className="text-sm">
                    Now I run a company with 50 employees. We even have a great customer service team.
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
                    Here's your draft:
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
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="w-12 h-12 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">Learns Every Voice</h3>
              <p className="text-claude-text-secondary text-sm">
                Each employee's AI adapts to their unique style. Sales reps sound different from engineers, and that's the point.
              </p>
            </div>

            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="w-12 h-12 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">Asks Smart Questions</h3>
              <p className="text-claude-text-secondary text-sm">
                Great ghostwriters know what details make posts go viral. The AI digs for the specific moments that resonate.
              </p>
            </div>

            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="w-12 h-12 rounded-xl bg-accent-coral/10 text-accent-coral flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">Unlimited Revisions</h3>
              <p className="text-claude-text-secondary text-sm">
                Don't like the hook? Want a different angle? Regenerate instantly. The AI refines based on feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Questions */}
      <section className="py-20 px-6 bg-claude-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Types of questions we'll ask
            </h2>
            <p className="text-lg text-claude-text-secondary">
              Here's a sample of the prompts that unlock your best professional stories
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
              ...and many more tailored to your experience
            </p>
          </div>
        </div>
      </section>

      {/* Results Stats */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              The numbers speak for themselves
            </h2>
            <p className="text-lg text-claude-text-secondary">
              What happens when you activate employee content at scale
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border text-center">
              <div className="text-4xl font-bold text-accent-coral mb-2">8x</div>
              <div className="text-claude-text font-medium mb-2">More Reach</div>
              <p className="text-sm text-claude-text-secondary">
                Employee posts vs. company page posts
              </p>
            </div>
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border text-center">
              <div className="text-4xl font-bold text-accent-coral mb-2">15 min</div>
              <div className="text-claude-text font-medium mb-2">Per Employee</div>
              <p className="text-sm text-claude-text-secondary">
                Creates 5 weeks of scheduled content
              </p>
            </div>
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border text-center">
              <div className="text-4xl font-bold text-accent-coral mb-2">5x</div>
              <div className="text-claude-text font-medium mb-2">Higher Convert</div>
              <p className="text-sm text-claude-text-secondary">
                Leads who engage with employee content
              </p>
            </div>
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border text-center">
              <div className="text-4xl font-bold text-accent-coral mb-2">$0</div>
              <div className="text-claude-text font-medium mb-2">Ad Spend</div>
              <p className="text-sm text-claude-text-secondary">
                Pure organic reach through your team
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Use Cases */}
      <section className="py-20 px-6 bg-gradient-to-br from-claude-bg-secondary to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Coordinate your company's biggest moments
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              The best companies use LinkedIn to amplify announcements across their entire workforce.
              TeamPost makes it effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Launches */}
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-claude-text">Product Launches</h3>
              </div>
              <p className="text-claude-text-secondary text-sm mb-4">
                Share talking points with your team and watch your launch go viral.
                50 employees posting beats any ad campaign.
              </p>
              <p className="text-xs text-claude-text-tertiary italic">
                "Our Series B announcement reached 2M+ impressions through employee posts alone."
              </p>
            </div>

            {/* Fundraising */}
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-claude-text">Fundraising Announcements</h3>
              </div>
              <p className="text-claude-text-secondary text-sm mb-4">
                Amplify your funding news across the entire team. Build credibility with
                investors, customers, and future hires simultaneously.
              </p>
              <p className="text-xs text-claude-text-tertiary italic">
                "Every employee shared their own take on our funding. Authentic and coordinated."
              </p>
            </div>

            {/* Hiring */}
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UsersIcon />
                </div>
                <h3 className="text-lg font-semibold text-claude-text">Critical Hiring Pushes</h3>
              </div>
              <p className="text-claude-text-secondary text-sm mb-4">
                Fill your hardest roles by activating your network. Engineering posts from
                engineers. Sales posts from sales. Authentic referrals at scale.
              </p>
              <p className="text-xs text-claude-text-tertiary italic">
                "We filled 3 senior roles in 2 weeks through employee LinkedIn posts."
              </p>
            </div>

            {/* Thought Leadership */}
            <div className="bg-white rounded-claude-lg p-6 border border-claude-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-claude-text">Industry Thought Leadership</h3>
              </div>
              <p className="text-claude-text-secondary text-sm mb-4">
                Position your company as the expert. When your whole team shares insights,
                you dominate the conversation in your space.
              </p>
              <p className="text-xs text-claude-text-tertiary italic">
                "Our sales team's posts generate more qualified leads than our entire ad budget."
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-claude-text-secondary mb-4">
              Enterprise teams get admin controls to share talking points, coordinate timing, and track results.
            </p>
            <a href="#pricing" className="text-accent-coral font-medium hover:underline">
              See Enterprise pricing →
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-claude-bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-accent-coral text-sm font-medium mb-4">
              <SparklesIcon />
              <span>Simple Pricing</span>
            </div>
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Start free. Scale when ready.
            </h2>
            <p className="text-lg text-claude-text-secondary max-w-2xl mx-auto">
              Every employee gets 10 free posts. Upgrade individuals or your whole team
              when you see the results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <div className="bg-white rounded-claude-lg p-8 border border-claude-border">
              <div className="text-claude-text-secondary text-sm font-medium mb-2">FREE FOREVER</div>
              <div className="text-4xl font-bold text-claude-text mb-2">$0</div>
              <p className="text-claude-text-secondary mb-6">First 10 posts per employee</p>

              <ul className="space-y-3 mb-8">
                {[
                  "10 AI-generated posts",
                  "Full conversation experience",
                  "AI learns your voice",
                  "LinkedIn autoposting included",
                  "No credit card required",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-claude-text text-sm">
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
                MOST POPULAR
              </div>
              <div className="text-accent-coral text-sm font-medium mb-2">PRO</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-claude-text">$20</span>
                <span className="text-claude-text-secondary">/user/month</span>
              </div>
              <p className="text-claude-text-secondary mb-6">For growing teams</p>

              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited AI-generated posts",
                  "Priority AI processing",
                  "Advanced voice learning",
                  "LinkedIn autoposting included",
                  "Unlimited regenerations",
                  "Cancel anytime",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-claude-text text-sm">
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

            {/* Enterprise Tier */}
            <div className="bg-white rounded-claude-lg p-8 border border-claude-border relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-claude-text text-white text-xs font-medium rounded-full">
                10+ EMPLOYEES
              </div>
              <div className="text-claude-text-secondary text-sm font-medium mb-2">ENTERPRISE</div>
              <div className="text-4xl font-bold text-claude-text mb-2">Custom</div>
              <p className="text-claude-text-secondary mb-6">For company-wide rollouts</p>

              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Pro, plus:",
                  "Admin dashboard & analytics",
                  "Company-wide talking points",
                  "Coordinate product launches",
                  "Amplify hiring campaigns",
                  "Fundraising announcements",
                  "Volume discounts",
                  "Weekly coaching from LinkedIn expert",
                  "White-glove onboarding",
                  "Same-day support",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-claude-text text-sm">
                    <div className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                      <CheckIcon />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="mailto:rohan.pavuluri@gmail.com?subject=TeamPost%20Enterprise%20Inquiry"
                className="btn-ghost w-full justify-center text-accent-coral border-accent-coral hover:bg-accent-coral-light"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Contact
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-coral-light text-accent-coral text-sm font-medium mb-4">
            <SparklesIcon />
            <span>Start Free Today</span>
          </div>
          <h2 className="text-3xl font-bold text-claude-text mb-4">
            Ready to turn your team into thought leaders?
          </h2>
          <p className="text-lg text-claude-text-secondary mb-8">
            Give every employee their own AI ghostwriter. First 10 posts are free.
            see the pipeline, brand reach, and hiring results for yourself.
          </p>
          <Link href="/signup" className="btn-primary text-lg px-8 py-3">
            Start Your Free Trial
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-claude-text mb-2">Our Story</h2>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-claude-lg border border-amber-200 p-8 md:p-12 relative">
            <div className="absolute top-6 right-8 text-6xl text-amber-200 font-serif">"</div>

            <div className="space-y-6 text-claude-text leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              <p className="text-lg">
                I started TeamPost because I was overseeing my company's LinkedIn channel. I realized three things.
              </p>

              <p>
                <span className="font-semibold">First,</span> nobody wants to follow a LinkedIn brand account. They only want to follow people.
              </p>

              <p>
                <span className="font-semibold">Second,</span> despite ChatGPT and Claude, I found a crazy amount of value in having my own ghostwriter who would meet with me each week, ask me open-ended questions, and then draft posts. He knew how to get eyeballs on LinkedIn. He also held me accountable to regular posts. I started to get so much inbound from customers and candidates when I started posting.
              </p>

              <p>
                <span className="font-semibold">Third,</span> I realized that I wanted everyone at my company to post every week on LinkedIn. It would be amazing for our recruiting (every engineer is connected to other engineers), sales & marketing, and even press and investors. I felt like I was always seeing a small number of companies like Lovable show up in my feed. And I wanted to be able to share talking points every couple of months for big launches.
              </p>

              <p>
                So I built TeamPost to make this possible.
              </p>

              <p>
                I think employee content creation is 100x underutilized as a company tool. Most employees want to build their own professional brand but just aren't good at it. It's a massive, untapped win-win.
              </p>

              <div className="pt-6 border-t border-amber-200 mt-8">
                <p className="font-semibold text-lg">Rohan Pavuluri</p>
                <p className="text-claude-text-secondary text-sm">Creator, TeamPost</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-claude-bg-secondary">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="bg-white rounded-claude-lg border border-claude-border divide-y divide-claude-border">
            <FAQItem
              question="Who should be on the platform?"
              answer="Everyone at your company. Yes, everyone. Most companies start with SDRs, AEs, recruiters, marketers, CS reps, and execs, but engineers and PMs are also important. The more employees posting, the more reach and pipeline you generate."
            />
            <FAQItem
              question="How long does it take to get started?"
              answer="Each employee spends about 15 minutes answering questions in a guided conversation. From that single session, they get 5 weeks of scheduled LinkedIn content. No writing required."
            />
            <FAQItem
              question="Will the posts actually sound like me?"
              answer="Yes. TeamPost learns your voice through the conversation. It picks up on your tone, word choices, and storytelling style. Posts come out sounding authentically you, not generic AI slop."
            />
            <FAQItem
              question="Can employees edit posts before they go live?"
              answer="Absolutely. Every post is reviewed and approved before scheduling. Employees can edit, regenerate, or request a different angle. Nothing posts without their approval."
            />
            <FAQItem
              question="How does the LinkedIn auto-posting work?"
              answer="Employees connect their LinkedIn account once through a secure OAuth flow. After that, approved posts go live automatically on their chosen schedule. No copy-pasting required."
            />
            <FAQItem
              question="What if we want to coordinate a company-wide announcement?"
              answer="Enterprise plans include admin controls. Marketing can share talking points, draft posts for employees, and coordinate timing for product launches, funding announcements, or hiring pushes."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="Every employee gets their first 10 posts completely free. No credit card required. Try it with your team and see the results before upgrading."
            />
          </div>
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
            <Link href="/privacy" className="hover:text-claude-text transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-claude-text transition-colors">Terms</Link>
            <a href="mailto:rohan.pavuluri@gmail.com" className="hover:text-claude-text transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
