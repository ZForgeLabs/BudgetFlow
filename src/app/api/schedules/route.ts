import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

const allowed = new Set(["weekly", "semi-weekly", "monthly", "custom"]);

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("schedules")
      .select("id, bin_id, name, frequency, custom_month, custom_day, monthly_allocation, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received schedule request body:', body);
    
    const { binId, name, frequency, customMonth, customDay, monthlyAllocation } = body ?? {};
    
    // Validation
    if (!binId) {
      return NextResponse.json({ error: "Missing binId" }, { status: 400 });
    }
    if (!frequency) {
      return NextResponse.json({ error: "Missing frequency" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }
    if (frequency === "custom" && (!customMonth || !customDay)) {
      return NextResponse.json({ error: "Custom schedule requires month and day" }, { status: 400 });
    }
    if (!allowed.has(frequency)) {
      return NextResponse.json({ error: `Invalid frequency: ${frequency}` }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    console.log('Inserting schedule with data:', {
      user_id: user.id,
      bin_id: binId,
      name,
      frequency,
      custom_month: customMonth,
      custom_day: customDay,
      monthly_allocation: monthlyAllocation,
    });

    const { data, error } = await supabase
      .from("schedules")
      .insert({
        user_id: user.id,
        bin_id: binId,
        name,
        frequency,
        custom_month: customMonth,
        custom_day: customDay,
        monthly_allocation: monthlyAllocation,
      })
      .select("id")
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 400 });
    }
    
    console.log('Schedule created successfully:', data);
    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (error) {
    console.error('Unexpected error in POST /api/schedules:', error);
    return NextResponse.json({ 
      error: "Invalid request", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const binId = searchParams.get("binId");
    
    if (!id && !binId) {
      return NextResponse.json({ error: "Missing id or binId" }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let query = supabase
      .from("schedules")
      .delete()
      .eq("user_id", user.id);
    
    if (id) {
      query = query.eq("id", id);
    } else if (binId) {
      query = query.eq("bin_id", binId);
    }

    const { error } = await query;

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 400 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/schedules:', error);
    return NextResponse.json({ 
      error: "Failed to delete", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 400 });
  }
}