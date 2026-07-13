import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-internal-secret");
    if (!secret || secret !== env.TRACKING_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { page, referrer } = await req.json();

    if (!page) {
      return NextResponse.json({ error: "Page is required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from("visits")
      .insert([
        {
          page,
          referrer: referrer || "direct",
          visited_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error("Supabase insert error (track-visit):", error);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
