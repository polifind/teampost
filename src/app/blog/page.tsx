"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getAllPosts } from "./posts";

const SITE_URL = "https://teampost.ai";

const CATEGORIES = [
  { key: "All", label: "All Articles" },
  { key: "LinkedIn", label: "LinkedIn" },
  { key: "Alternatives", label: "Alternatives" },
  { key: "Comparisons", label: "Comparisons" },
  { key: "Going Direct", label: "Going Direct" },
  { key: "Product", label: "Product" },
  { key: "About", label: "About" },
];

const CATEGORY_COLORS: Record<string, string> = {
  LinkedIn: "bg-blue-50 text-blue-700 border-blue-200",
  Alternatives: "bg-amber-50 text-amber-700 border-amber-200",
  Comparisons: "bg-purple-50 text-purple-700 border-purple-200",
  "Going Direct": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Product: "bg-rose-50 text-rose-700 border-rose-200",
  About: "bg-slate-50 text-slate-700 border-slate-200",
};

function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] || "bg-gray-50 text-gray-700 border-gray-200";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogPage() {
  const allPosts = getAllPosts();
  const [activeCategory, setActiveCategory] = useState("All");

  const availableCategories = CATEGORIES.filter(
    (cat) => cat.key === "All" || allPosts.some((p) => p.category === cat.key)
  );

  const filteredPosts =
    activeCategory === "All"
      ? allPosts
      : allPosts.filter((p) => p.category === activeCategory);

  const [featuredPost, ...remainingPosts] = filteredPosts;

  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "TeamPost Blog",
    description:
      "Expert insights on LinkedIn content strategy, going direct, ghostwriting, and building your professional brand.",
    url: `${SITE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: "TeamPost",
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: allPosts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />

      {/* Top Nav */}
      <nav className="border-b border-gray-200 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-coral to-accent-coral/70 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 text-lg">TeamPost</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/blog" className="text-sm text-gray-900 font-medium">
              Blog
            </Link>
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg bg-accent-coral text-white hover:bg-accent-coral/90 transition-colors font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-accent-coral uppercase tracking-wider mb-3">
              The TeamPost Blog
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Insights on LinkedIn, Going Direct & Professional Branding
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Strategies and playbooks for executives and teams building their brand on LinkedIn. Written by Rohan Pavuluri.
            </p>
          </div>
        </div>
      </header>

      {/* Sticky Category Bar */}
      <div className="sticky top-[65px] z-40 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {availableCategories.map((cat) => {
              const count =
                cat.key === "All"
                  ? allPosts.length
                  : allPosts.filter((p) => p.category === cat.key).length;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {cat.label}
                  <span
                    className={`text-xs tabular-nums ${
                      isActive ? "text-gray-400" : "text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No articles in this category yet.</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <Link href={`/blog/${featuredPost.slug}`} className="block group mb-12">
                <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-gray-300">
                  <div className="p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-5">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryStyle(
                          featuredPost.category
                        )}`}
                      >
                        {featuredPost.category}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatDate(featuredPost.publishedAt)}
                      </span>
                      <span className="text-sm text-gray-400">&middot;</span>
                      <span className="text-sm text-gray-400">{featuredPost.readingTime}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-accent-coral transition-colors leading-tight">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed mb-6 max-w-3xl">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-3">
                      <Image
                        src="/rohan-pavuluri.jpg"
                        alt={featuredPost.author}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{featuredPost.author}</p>
                        <p className="text-xs text-gray-400">Creator, TeamPost</p>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Post Grid */}
            {remainingPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {remainingPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                    <article className="bg-white rounded-xl border border-gray-200 p-6 h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:border-gray-300">
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getCategoryStyle(
                            post.category
                          )}`}
                        >
                          {post.category}
                        </span>
                        <span className="text-xs text-gray-400">{post.readingTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-accent-coral transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-grow leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Image
                            src="/rohan-pavuluri.jpg"
                            alt={post.author}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-medium text-gray-600">{post.author}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-coral to-accent-coral/70 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                  />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">TeamPost</span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} TeamPost. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
