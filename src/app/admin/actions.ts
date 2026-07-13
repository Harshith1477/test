"use server"

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase-server";
import { env } from "@/lib/env";
import { loginSchema, newPasswordSchema } from "@/lib/validations";
import { isLoginLocked, recordFailedLoginAttempt, resetLoginAttempts } from "@/lib/login-rate-limit";
import { ONBOARDING_FORM_TYPES } from "@/lib/onboarding-forms";

export async function login(prevState: any, formData: FormData) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { error: "Invalid input format" };
  }

  const identifier = `${ip}:${parsed.data.email.toLowerCase()}`;

  if (isLoginLocked(identifier)) {
    return { error: "Too many failed attempts. Please try again in 15 minutes." };
  }

  try {
    const supabase = await createClient();

    // Auth goes through Supabase's secure auth mechanism
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      // Bootstrapping is disabled by default — it only runs when explicitly opted into
      // via ADMIN_BOOTSTRAP_ENABLED=true. This should only be turned on during initial
      // setup, not left on permanently, since it's an alternate account-creation path.
      const bootstrapEnabled = process.env.ADMIN_BOOTSTRAP_ENABLED === "true";
      const initialAdminEmail = process.env.ADMIN_MAIL_ID?.trim();
      const initialAdminPassword = process.env.ADMIN_PASSWORD?.trim();

      const matchesBootstrapCredentials =
        bootstrapEnabled &&
        !!initialAdminEmail &&
        !!initialAdminPassword &&
        parsed.data.email.toLowerCase() === initialAdminEmail.toLowerCase() &&
        parsed.data.password === initialAdminPassword;

      if (!matchesBootstrapCredentials) {
        recordFailedLoginAttempt(identifier);
        return { error: "Invalid email or password" };
      }

      const supabaseAdmin = createAdminClient();

      // Check if user actually exists to avoid random errors
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = usersData?.users?.some((u) => u.email === parsed.data.email);

      if (userExists) {
        recordFailedLoginAttempt(identifier);
        return { error: "Invalid email or password" };
      }

      // Create the user and auto-confirm them
      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        email_confirm: true,
      });

      if (createError) {
        recordFailedLoginAttempt(identifier);
        return { error: "Failed to auto-create admin user in Supabase" };
      }

      // Sign in again now that the user is created
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (signInError) {
        recordFailedLoginAttempt(identifier);
        return { error: "Failed to sign in after creation" };
      }

      // Success, fall through and let it redirect below
    }
  } catch (err) {
    console.error("Login Error:", err);
    return { error: "Something went wrong" };
  }

  resetLoginAttempts(identifier);

  // Redirect on success (outside of try-catch since redirect throws)
  redirect("/admin/dashboard");
}

export async function getAdminData() {
  try {
    const supabaseAdmin = createAdminClient();
    // Helper to fetch all pages of a table to bypass Supabase's 1000 row limit
    const fetchAll = async (table: string, orderColumn: string, ascending: boolean) => {
      let allData: any[] = [];
      let start = 0;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select("*")
          .order(orderColumn, { ascending })
          .range(start, start + limit - 1);
          
        if (error) throw error;
        
        if (data) {
          allData = [...allData, ...data];
          if (data.length < limit) {
            hasMore = false;
          } else {
            start += limit;
          }
        } else {
          hasMore = false;
        }
      }
      return allData;
    };

    const [leads, visits] = await Promise.all([
      fetchAll("leads", "created_at", false),
      fetchAll("visits", "visited_at", true)
    ]);

    return {
      success: true,
      leads,
      visits,
    };
  } catch (error: any) {
    console.error("Server Action Error (getAdminData):", error);
    return {
      success: false,
      error: "Something went wrong",
      leads: [],
      visits: []
    };
  }
}

const LEAD_STATUSES = ["New", "In Progress", "Closed"] as const;

export async function updateLeadStatus(id: string, status: string) {
  try {
    if (!(LEAD_STATUSES as readonly string[]).includes(status)) {
      throw new Error("Invalid status value");
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("leads").update({ status }).eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating lead status:", error);
    throw new Error("Something went wrong");
  }
}

export async function deleteLead(id: string) {
  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("leads").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting lead:", error);
    throw new Error("Something went wrong");
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function updateAdminPassword(newPassword: string) {
  try {
    const parsed = newPasswordSchema.safeParse(newPassword);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || "Password does not meet requirements" };
    }

    const supabase = await createClient();
    // Verify user is authenticated before allowing password update
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data
    });

    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update password:", error);
    return { success: false, error: "Something went wrong" };
  }
}

const DOMAIN = "https://recolt.io";

const ONBOARDING_ORDER = ONBOARDING_FORM_TYPES;

export async function getClientsWithResponses() {
  try {
    const supabaseAdmin = createAdminClient();
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (clientsError) throw clientsError;

    const { data: responses, error: responsesError } = await supabaseAdmin
      .from("onboarding_responses")
      .select("client_id, form_type");

    if (responsesError) throw responsesError;

    return { success: true, clients: clients || [], responses: responses || [] };
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    return { success: false, error: "Something went wrong", clients: [], responses: [] };
  }
}

export async function addClient(rawEmail: string, name: string) {
  try {
    const supabaseAdmin = createAdminClient();
    const email = rawEmail.trim();
    let client;
    
    // Check if client already exists (case-insensitive)
    const { data: existingClient } = await supabaseAdmin
      .from("clients")
      .select("*")
      .ilike("email", email)
      .maybeSingle();

    if (existingClient) {
      client = existingClient;
    } else {
      const { data, error } = await supabaseAdmin
        .from("clients")
        .insert([{ email, name }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // If a duplicate key error still occurs (e.g. race condition), fetch it
          const { data: fallbackClient } = await supabaseAdmin
            .from("clients")
            .select("*")
            .ilike("email", email)
            .maybeSingle();
          if (fallbackClient) {
            client = fallbackClient;
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      } else {
        client = data;
      }
    }

    // Resend email removed. Link available below:
    const link = `${DOMAIN}/onboard/${client.token}/welcome`;
    console.log("Welcome Link:", link);

    return { success: true, client };
  } catch (error: any) {
    console.error("Error adding client:", error);
    return { success: false, error: "Something went wrong" };
  }
}

export async function sendNextForm(clientId: string) {
  try {
    const supabaseAdmin = createAdminClient();
    // Get client details
    const { data: client, error: clientError } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientError || !client) throw new Error("Client not found");

    // Get completed forms
    const { data: responses, error: responsesError } = await supabaseAdmin
      .from("onboarding_responses")
      .select("form_type")
      .eq("client_id", clientId);

    if (responsesError) throw responsesError;

    const completedForms = responses.map((r: any) => r.form_type);
    
    // Find next pending form
    const nextForm = ONBOARDING_ORDER.find((form) => !completedForms.includes(form));

    if (!nextForm) {
      return { success: false, error: "All forms are already completed." };
    }

    const link = `${DOMAIN}/onboard/${client.token}/${nextForm}`;
    console.log("Next Form Link:", link);

    return { success: true, nextForm };
  } catch (error: any) {
    console.error("Error sending next form:", error);
    return { success: false, error: "Something went wrong" };
  }
}
