import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { contactSchema } from "@/lib/validations";
import DOMPurify from "isomorphic-dompurify";

// Rate limiting state via Upstash Redis
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// 100 requests per 1 hour
const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: false,
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    
    // Rate Limiting
    // Bypass if the user hasn't configured real Upstash credentials yet
    if (ip !== "unknown" && env.UPSTASH_REDIS_REST_TOKEN !== "placeholder_token") {
      const { success } = await rateLimit.limit(`contact_${ip}`);
      if (!success) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }
    }

    const data = await req.json();

    // Zod Validation
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const validData = parsed.data;

    // Honeypot check
    if (validData.website_url) {
      return NextResponse.json({ success: true });
    }

    // Sanitization
    const name = DOMPurify.sanitize(validData.name);
    const email = DOMPurify.sanitize(validData.email);
    const phone = validData.phone ? DOMPurify.sanitize(validData.phone) : undefined;
    const service = validData.service ? DOMPurify.sanitize(validData.service) : undefined;
    const budget = validData.budget ? DOMPurify.sanitize(validData.budget) : undefined;
    const message = DOMPurify.sanitize(validData.message);

    // Backend implementation removed for frontend-only
    console.log("Contact form submitted:", { name, email, phone, service, budget, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process submission:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
