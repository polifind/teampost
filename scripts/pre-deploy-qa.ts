#!/usr/bin/env npx ts-node

/**
 * Pre-Deployment QA Checklist Script
 *
 * Run this before deploying to production to catch common issues.
 *
 * Usage: npm run qa
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface QAResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: QAResult[] = [];

function log(message: string, type: "info" | "success" | "error" | "warning" = "info") {
  const colors = {
    info: "\x1b[36m",
    success: "\x1b[32m",
    error: "\x1b[31m",
    warning: "\x1b[33m",
  };
  const reset = "\x1b[0m";
  console.log(`${colors[type]}${message}${reset}`);
}

function runCheck(name: string, fn: () => void | Promise<void>): void {
  const start = Date.now();
  try {
    const result = fn();
    if (result instanceof Promise) {
      result
        .then(() => {
          results.push({ name, passed: true, duration: Date.now() - start });
          log(`  ✓ ${name}`, "success");
        })
        .catch((err: Error) => {
          results.push({ name, passed: false, error: err.message, duration: Date.now() - start });
          log(`  ✗ ${name}: ${err.message}`, "error");
        });
    } else {
      results.push({ name, passed: true, duration: Date.now() - start });
      log(`  ✓ ${name}`, "success");
    }
  } catch (err) {
    const error = err as Error;
    results.push({ name, passed: false, error: error.message, duration: Date.now() - start });
    log(`  ✗ ${name}: ${error.message}`, "error");
  }
}

async function runQAChecks() {
  log("\n🔍 TeamPost Pre-Deployment QA Checklist\n", "info");
  log("=" .repeat(50), "info");

  // === BUILD CHECKS ===
  log("\n📦 Build Checks", "info");
  log("-".repeat(30), "info");

  runCheck("TypeScript compilation", () => {
    execSync("npx tsc --noEmit", { stdio: "pipe" });
  });

  runCheck("ESLint passes", () => {
    try {
      execSync("npm run lint", { stdio: "pipe" });
    } catch {
      // Lint warnings are ok, only fail on errors
      throw new Error("Linting failed with errors");
    }
  });

  runCheck("Next.js build succeeds", () => {
    execSync("npm run build", { stdio: "pipe", timeout: 300000 });
  });

  // === UNIT TESTS ===
  log("\n🧪 Unit Tests", "info");
  log("-".repeat(30), "info");

  runCheck("All tests pass", () => {
    execSync("npm run test:run", { stdio: "pipe", timeout: 120000 });
  });

  // === CRITICAL FILE CHECKS ===
  log("\n📄 Critical File Checks", "info");
  log("-".repeat(30), "info");

  runCheck("Auth configuration exists", () => {
    const authPath = path.join(process.cwd(), "src/lib/auth.ts");
    if (!fs.existsSync(authPath)) {
      throw new Error("src/lib/auth.ts not found");
    }
    const content = fs.readFileSync(authPath, "utf-8");
    if (!content.includes("authOptions")) {
      throw new Error("authOptions not exported from auth.ts");
    }
  });

  runCheck("Prisma schema is valid", () => {
    execSync("npx prisma validate", { stdio: "pipe" });
  });

  runCheck("Environment variables template exists", () => {
    const envExample = path.join(process.cwd(), ".env.example");
    const envLocal = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envExample) && !fs.existsSync(envLocal)) {
      log("    ⚠ Warning: No .env.example file found", "warning");
    }
  });

  // === AUTHENTICATION CHECKS ===
  log("\n🔐 Authentication Checks", "info");
  log("-".repeat(30), "info");

  runCheck("NextAuth API route exists", () => {
    const authRoute = path.join(process.cwd(), "src/app/api/auth/[...nextauth]/route.ts");
    if (!fs.existsSync(authRoute)) {
      throw new Error("NextAuth API route not found");
    }
  });

  runCheck("Signup API route exists", () => {
    const signupRoute = path.join(process.cwd(), "src/app/api/auth/signup/route.ts");
    if (!fs.existsSync(signupRoute)) {
      throw new Error("Signup API route not found");
    }
  });

  runCheck("Login page exists", () => {
    const loginPage = path.join(process.cwd(), "src/app/login/page.tsx");
    if (!fs.existsSync(loginPage)) {
      throw new Error("Login page not found");
    }
  });

  runCheck("Auth callback handling in auth config", () => {
    const authPath = path.join(process.cwd(), "src/lib/auth.ts");
    const content = fs.readFileSync(authPath, "utf-8");

    // Check for OAuth error handling
    if (!content.includes("OAuthAccountNotLinked")) {
      log("    ⚠ Warning: OAuthAccountNotLinked error handling may be missing", "warning");
    }

    // Check for session callback
    if (!content.includes("session:")) {
      throw new Error("Session callback not found in auth config");
    }
  });

  // === API ROUTE CHECKS ===
  log("\n🛣️  API Route Checks", "info");
  log("-".repeat(30), "info");

  const criticalRoutes = [
    "src/app/api/dashboard/route.ts",
    "src/app/api/posts/route.ts",
    "src/app/api/conversation/respond/route.ts",
    "src/app/api/personalization/guidelines/route.ts",
    "src/app/api/personalization/library/route.ts",
  ];

  criticalRoutes.forEach((route) => {
    runCheck(`${route} exists`, () => {
      const routePath = path.join(process.cwd(), route);
      if (!fs.existsSync(routePath)) {
        throw new Error(`${route} not found`);
      }

      const content = fs.readFileSync(routePath, "utf-8");

      // Check for auth protection
      if (!content.includes("getServerSession")) {
        log(`    ⚠ Warning: ${route} may not have auth protection`, "warning");
      }
    });
  });

  // === PAGE CHECKS ===
  log("\n📱 Page Checks", "info");
  log("-".repeat(30), "info");

  const criticalPages = [
    "src/app/(dashboard)/dashboard/page.tsx",
    "src/app/(dashboard)/create/page.tsx",
    "src/app/(dashboard)/posts/page.tsx",
    "src/app/(dashboard)/magic-drafts/page.tsx",
    "src/app/(dashboard)/settings/page.tsx",
    "src/app/(dashboard)/layout.tsx",
    "src/app/page.tsx",
  ];

  criticalPages.forEach((page) => {
    runCheck(`${page} exists`, () => {
      const pagePath = path.join(process.cwd(), page);
      if (!fs.existsSync(pagePath)) {
        throw new Error(`${page} not found`);
      }
    });
  });

  // === SECURITY CHECKS ===
  log("\n🔒 Security Checks", "info");
  log("-".repeat(30), "info");

  runCheck("No hardcoded secrets in code", () => {
    const sensitivePatterns = [
      /sk-[a-zA-Z0-9]{20,}/g, // OpenAI/Anthropic keys
      /AKIA[0-9A-Z]{16}/g, // AWS keys
      /ghp_[a-zA-Z0-9]{36}/g, // GitHub tokens
    ];

    const srcDir = path.join(process.cwd(), "src");
    const files = getAllFiles(srcDir, [".ts", ".tsx", ".js", ".jsx"]);

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      for (const pattern of sensitivePatterns) {
        if (pattern.test(content)) {
          throw new Error(`Potential secret found in ${file}`);
        }
      }
    }
  });

  runCheck("Environment variables used for secrets", () => {
    const authPath = path.join(process.cwd(), "src/lib/auth.ts");
    const content = fs.readFileSync(authPath, "utf-8");

    if (content.includes('secret: "') || content.includes("secret: '")) {
      throw new Error("Hardcoded secret found in auth config");
    }
  });

  // Wait a moment for async checks
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // === SUMMARY ===
  log("\n" + "=".repeat(50), "info");
  log("📊 QA Summary", "info");
  log("=".repeat(50), "info");

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  log(`\n  Total checks: ${results.length}`, "info");
  log(`  Passed: ${passed}`, "success");
  if (failed > 0) {
    log(`  Failed: ${failed}`, "error");
    log("\n  Failed checks:", "error");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        log(`    - ${r.name}: ${r.error}`, "error");
      });
  }

  log("\n", "info");

  if (failed > 0) {
    log("❌ QA checks failed. Please fix issues before deploying.", "error");
    process.exit(1);
  } else {
    log("✅ All QA checks passed! Safe to deploy.", "success");
    process.exit(0);
  }
}

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some((ext) => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Run the checks
runQAChecks().catch((err) => {
  log(`\nFatal error: ${err.message}`, "error");
  process.exit(1);
});
