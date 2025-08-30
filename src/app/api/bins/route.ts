import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = createRouteHandlerClient();
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
		const supabase = createRouteHandlerClient();
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
		const body = await req.json();
		console.log('PATCH /api/bins received:', body);

		const { id, currentAmount, monthlyAllocation } = body;
		if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

		const supabase = createRouteHandlerClient();
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const updates: any = {};
		if (currentAmount !== undefined) {
			updates.current_amount = currentAmount;
			console.log('Updating current_amount to:', currentAmount);
		}
		if (monthlyAllocation !== undefined) {
			updates.monthly_allocation = monthlyAllocation;
			console.log('Updating monthly_allocation to:', monthlyAllocation);
		}

		console.log('Final updates object:', updates);

		const { error } = await supabase
			.from("savings_bins")
			.update(updates)
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			console.error('Supabase update error:', error);
			throw error;
		}

		console.log('Successfully updated bin:', id);
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error('PATCH /api/bins error:', error);
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");
		if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
		const supabase = createRouteHandlerClient();
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


