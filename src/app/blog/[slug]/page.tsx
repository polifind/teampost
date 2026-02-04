import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "../posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {
      title: "Post Not Found | TeamPost Blog",
    };
  }
  return {
    title: `${post.title} | TeamPost Blog`,
    description: post.excerpt,
  };
}

// Simple markdown-like rendering for the content
function renderContent(content: string) {
  const lines = content.trim().split("\n");
  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headers
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-2xl font-bold text-claude-text mt-10 mb-4">
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-violet-400 pl-6 py-2 my-6 bg-violet-50/50 rounded-r-lg italic text-claude-text-secondary"
        >
          {quoteLines.join(" ")}
        </blockquote>
      );
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Bold headers like **Recruiting**:
    if (line.startsWith("**") && line.includes("**:")) {
      const boldMatch = line.match(/^\*\*(.+?)\*\*:(.*)$/);
      if (boldMatch) {
        elements.push(
          <p key={i} className="text-gray-700 mb-4 leading-relaxed">
            <strong className="text-claude-text">{boldMatch[1]}:</strong>
            {renderInlineFormatting(boldMatch[2])}
          </p>
        );
        i++;
        continue;
      }
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-gray-700 mb-4 leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return elements;
}

// Handle inline formatting like links and bold
function renderInlineFormatting(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Check for links [text](url)
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch && linkMatch.index !== undefined) {
      // Add text before the link
      if (linkMatch.index > 0) {
        parts.push(remaining.slice(0, linkMatch.index));
      }
      // Add the link
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-coral hover:underline"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch.index + linkMatch[0].length);
      continue;
    }

    // Check for bold **text**
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.slice(0, boldMatch.index));
      }
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="text-claude-text font-semibold">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // No more special formatting, add the rest
    parts.push(remaining);
    break;
  }

  return parts;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-claude-bg">
      {/* Navigation */}
      <nav className="border-b border-claude-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
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
            <span className="font-semibold text-claude-text">TeamPost</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-claude-text-secondary hover:text-claude-text">
              Home
            </Link>
            <Link href="/blog" className="text-sm text-claude-text-secondary hover:text-claude-text">
              Blog
            </Link>
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg bg-accent-coral text-white hover:bg-accent-coral/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-claude-text-secondary hover:text-claude-text mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-violet-100 text-violet-700">
              {post.category}
            </span>
            <span className="text-sm text-claude-text-tertiary">{post.readingTime}</span>
          </div>
          <h1 className="text-4xl font-bold text-claude-text mb-6 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4">
            <Image
              src="/rohan-pavuluri.jpg"
              alt={post.author}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-claude-text">{post.author}</p>
              <p className="text-sm text-claude-text-tertiary">
                {post.authorRole} ·{" "}
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">{renderContent(post.content)}</div>

        {/* Share section */}
        <div className="mt-12 pt-8 border-t border-claude-border">
          <p className="text-sm text-claude-text-secondary mb-4">Share this article</p>
          <div className="flex gap-3">
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                `https://teampost.vercel.app/blog/${post.slug}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#0077B5] text-white text-sm font-medium rounded-lg hover:bg-[#006399] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share on LinkedIn
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                `https://teampost.vercel.app/blog/${post.slug}`
              )}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl text-center">
          <h3 className="text-xl font-bold text-claude-text mb-2">
            Ready to start going direct?
          </h3>
          <p className="text-claude-text-secondary mb-6">
            TeamPost helps you turn your ideas into LinkedIn content. No ghostwriter required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-coral text-white font-medium rounded-lg hover:bg-accent-coral/90 transition-colors"
          >
            Get Started for Free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-claude-border py-8 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <p className="text-sm text-claude-text-tertiary">
            &copy; {new Date().getFullYear()} TeamPost. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-claude-text-tertiary hover:text-claude-text">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-claude-text-tertiary hover:text-claude-text">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
