import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Missing Anon Key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Missing Service Role Key"),
  TRACKING_SECRET: z.string().min(16, "TRACKING_SECRET must be at least 16 characters"),
});

// Validate environment variables on boot
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables. Check console for details.");
}

export const env = parsed.data;
