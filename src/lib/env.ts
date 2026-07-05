import { z } from "zod";

const envSchema = z.object({
  RESEND_API_KEY: z.string().default("placeholder_resend_key"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://recolt.io"),
  UPSTASH_REDIS_REST_URL: z.string().url().default("https://example-upstash-url.upstash.io"), // Added default for development until user adds real key
  UPSTASH_REDIS_REST_TOKEN: z.string().default("placeholder_token"),
});

// Validate environment variables on boot
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables. Check console for details.");
}

export const env = parsed.data;
