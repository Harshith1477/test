import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { env } from "@/lib/env";
import { contactSchema } from "@/lib/validations";
import { isTrustedOrigin } from "@/lib/verify-origin";

function sanitize(input: string): string {
  return input.replace(/[<>]/g, '');
}

export async function POST(req: Request) {
  try {
    if (!isTrustedOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const data = await req.json();

    // Zod Validation
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const validData = parsed.data;

    // Honeypot check
    if (validData.website_url) {
      return NextResponse.json({ error: "Bot detected" }, { status: 403 });
    }

    // Sanitization
    const name = sanitize(validData.name);
    const email = sanitize(validData.email);
    const phone = validData.phone ? sanitize(validData.phone) : undefined;
    const service = validData.service ? sanitize(validData.service) : undefined;
    const budget = validData.budget ? sanitize(validData.budget) : undefined;
    const message = sanitize(validData.message);

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from('leads')
      .insert([
        { 
          name,
          email,
          phone,
          service,
          budget,
          message,
          status: 'New'
        }
      ]);

    if (error) {
      console.error("Supabase insert error (contact):", error);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process submission:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
