import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isbot } from "isbot";
// Simple in-memory rate limiter for Edge middleware
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // requests per minute

// Media/static files stream via many HTTP range requests per page load — exempt them
// from the request counter so video/image playback can't trip the limiter. Bots are
// still blocked on these paths below; only the numeric rate-limit count skips them.
const STATIC_ASSET_PATTERN =
  /\.(?:mp4|webm|mov|png|jpg|jpeg|webp|gif|avif|svg|ico|css|js|woff2?|ttf|otf|map)$/i;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - record.lastReset > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Aggressively block all bots — runs on every request, including static assets,
  // so bots can't bypass this by requesting files directly.
  const userAgent = request.headers.get("user-agent") || "";
  if (isbot(userAgent)) {
    return new NextResponse("Access Denied: Bots are not allowed.", { status: 403 });
  }

  const isStaticAsset = STATIC_ASSET_PATTERN.test(pathname);

  // next/link prefetches send this header on every link that scrolls into view or is
  // hovered — without this exemption, normal browsing (menu open -> several links
  // prefetch) can silently exhaust the quota before the user's actual click navigates.
  const isPrefetch = request.headers.get("next-router-prefetch") !== null;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  if (!isStaticAsset && !isPrefetch && !checkRateLimit(ip)) {
    return new NextResponse("Too Many Requests. Please slow down.", { status: 429 });
  }

  if (isStaticAsset) {
    return NextResponse.next();
  }

  // Fresh per-request nonce so inline scripts (Next.js internals, GTM/GA init snippets)
  // can run without 'unsafe-inline' in script-src. 'strict-dynamic' lets the nonce'd GTM
  // container script load its own sub-scripts (GA, etc.) without allow-listing each one.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://*.google-analytics.com",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", cspHeader);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Apply secure settings
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
            });
            request.cookies.set(name, value);
          });
        },
      },
    }
  );

  // Protect Admin Dashboard Routes
  if (pathname.startsWith("/admin/dashboard")) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Optional: If user is already logged in and hits /admin, push them to dashboard
  if (pathname === "/admin") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Skip tracking for these paths and extensions
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return response;
  }

  // Fire and forget fetch to our API route
  const referrer = request.headers.get("referer") || "direct";
  const url = new URL("/api/track-visit", request.url);
  
  // Note: we don't await this because we want to fire and forget
  fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": process.env.TRACKING_SECRET!,
    },
    body: JSON.stringify({
      page: pathname,
      referrer: referrer,
    }),
  }).catch((error) => {
    console.error("Visit tracking fetch error:", error);
  });

  return response;
}

export const config = {
  // Match all request paths except _next internal static/image assets. Public static
  // files (images, videos, fonts, etc.) still run through this middleware for bot
  // blocking — see STATIC_ASSET_PATTERN above for what's exempted from rate limiting.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
