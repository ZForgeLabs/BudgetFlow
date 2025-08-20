import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
	try {
		const supabase = createRouteHandlerClient({ cookies });
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const { data, error } = await supabase
			.from("savings_bins")
			.select("id, name, current_amount, goal_amount, monthly_allocation")
			.eq("user_id", user.id)
			.order("created_at", { ascending: true });
		if (error) throw error;
		return NextResponse.json({ items: data ?? [] });
	} catch {
		return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const { name, goalAmount } = await req.json();
		if (!name || goalAmount === undefined) {
			return NextResponse.json({ error: "Missing fields" }, { status: 400 });
		}
		const supabase = createRouteHandlerClient({ cookies });
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const { data, error } = await supabase
			.from("savings_bins")
			.insert({ user_id: user.id, name, goal_amount: goalAmount, current_amount: 0, monthly_allocation: 0 })
			.select("id")
			.single();
		if (error) throw error;
		return NextResponse.json({ ok: true, id: data?.id ?? null });
	} catch {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const { id, currentAmount, monthlyAllocation } = await req.json();
		if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
		const supabase = createRouteHandlerClient({ cookies });
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const updates: any = {};
		if (currentAmount !== undefined) updates.current_amount = currentAmount;
		if (monthlyAllocation !== undefined) updates.monthly_allocation = monthlyAllocation;
		const { error } = await supabase
			.from("savings_bins")
			.update(updates)
			.eq("id", id)
			.eq("user_id", user.id);
		if (error) throw error;
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");
		if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
		const supabase = createRouteHandlerClient({ cookies });
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const { error } = await supabase
			.from("savings_bins")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id);
		if (error) throw error;
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
	}
}


