"use server"

import { createAdminClient } from "@/lib/supabase-server";
import { isOnboardingFormType } from "@/lib/onboarding-forms";

const MAX_FORM_DATA_BYTES = 50_000;

function sanitizeFormData(value: unknown, depth = 0): unknown {
  if (depth > 5) return null;
  if (typeof value === "string") return value.replace(/[<>]/g, "").slice(0, 5000);
  if (Array.isArray(value)) return value.slice(0, 200).map((v) => sanitizeFormData(v, depth + 1));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>).slice(0, 100)) {
      out[key] = sanitizeFormData(val, depth + 1);
    }
    return out;
  }
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  return null;
}

export async function submitOnboardingForm(token: string, formType: string, formData: unknown) {
  try {
    if (!isOnboardingFormType(formType)) {
      return { success: false, error: "Invalid form type." };
    }

    if (!formData || typeof formData !== "object") {
      return { success: false, error: "Invalid form data." };
    }

    const serialized = JSON.stringify(formData);
    if (serialized.length > MAX_FORM_DATA_BYTES) {
      return { success: false, error: "Form data is too large." };
    }

    const cleanFormData = sanitizeFormData(formData);

    const supabaseAdmin = createAdminClient();

    // 1. Verify token and get client
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("token", token)
      .single();

    if (clientError || !client) {
      return { success: false, error: "Invalid or expired token." };
    }

    // 2. Insert or update the response
    const { error: insertError } = await supabaseAdmin
      .from("onboarding_responses")
      .upsert(
        {
          client_id: client.id,
          form_type: formType,
          data: cleanFormData,
        },
        { onConflict: 'client_id, form_type' }
      );

    if (insertError) throw insertError;

    // 3. Update client status if it's the first form
    await supabaseAdmin
      .from("clients")
      .update({ status: "in_progress" })
      .eq("id", client.id)
      .eq("status", "invited");

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting onboarding form:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function verifyOnboardingToken(token: string) {
  try {
    const supabaseAdmin = createAdminClient();
    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select("id, name, email")
      .eq("token", token)
      .single();

    if (error || !client) return { success: false, error: "Invalid token" };
    return { success: true, client };
  } catch (error: any) {
    console.error("Error verifying token:", error);
    return { success: false, error: "Something went wrong" };
  }
}
