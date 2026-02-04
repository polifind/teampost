import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "./posts";

export const metadata = {
  title: "Blog | TeamPost",
  description: "Insights on going direct, LinkedIn strategy, and building your professional brand.",
};

export default function BlogPage() {
  const posts = getAllPosts();

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
            <Link href="/blog" className="text-sm text-claude-text font-medium">
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

      {/* Header */}
      <header className="py-16 px-6 bg-gradient-to-br from-accent-coral to-accent-coral/80">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            The TeamPost Blog
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            How going direct transforms sales, marketing, recruiting, and investor brand.
          </p>
        </div>
      </header>

      {/* Blog Posts */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-xl border border-claude-border p-8 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-violet-100 text-violet-700">
                  {post.category}
                </span>
                <span className="text-sm text-claude-text-tertiary">{post.readingTime}</span>
              </div>
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-bold text-claude-text mb-3 hover:text-accent-coral transition-colors">
                  {post.title}
                </h2>
              </Link>
              <p className="text-claude-text-secondary mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/rohan-pavuluri.jpg"
                    alt={post.author}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-claude-text">{post.author}</p>
                    <p className="text-xs text-claude-text-tertiary">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-medium text-accent-coral hover:text-accent-coral/80 flex items-center gap-1"
                >
                  Read more
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

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
