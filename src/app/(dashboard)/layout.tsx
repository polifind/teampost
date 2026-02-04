"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Posts", href: "/posts" },
  { name: "Magic Drafts", href: "/magic-drafts", icon: SparklesIcon },
  { name: "Settings", href: "/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Pages that should not show the shared navigation (they have their own)
  const pagesWithOwnNav = ["/onboarding", "/create", "/admin"];
  const shouldShowNav = !pagesWithOwnNav.some(page => pathname.startsWith(page));

  if (!shouldShowNav) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-claude-bg">
      <header className="sticky top-0 bg-claude-bg/80 backdrop-blur-md border-b border-claude-border z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo size="md" />
          </Link>
          <nav className="flex items-center gap-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm flex items-center gap-1.5 ${
                    isActive
                      ? "text-accent-coral font-medium"
                      : "text-claude-text-secondary hover:text-claude-text"
                  }`}
                >
                  {item.icon && <item.icon />}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
