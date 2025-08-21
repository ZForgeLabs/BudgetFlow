import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

const allowed = new Set(["monthly", "bi-monthly", "annually"]);

export async function GET() {
	try {
		const supabase = createRouteHandlerClient({ cookies });
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError) {
			console.log("Subscriptions GET - auth error:", authError);
			return NextResponse.json({ error: "Authentication error", details: authError }, { status: 401 });
		}
		
		if (!user) {
			console.log("Subscriptions GET - unauthorized");
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		console.log("Subscriptions GET - fetching for user_id:", user.id);
		const { data, error } = await supabase
			.from("subscriptions")
			.select("id, name, amount, occurrence, start_date, next_billing_date, last_paid_date, created_at")
			.eq("user_id", user.id)
			.order("created_at", { ascending: false });

		if (error) {
			console.log("Subscriptions GET - database error:", error);
			throw error;
		}
		console.log("Subscriptions GET - success, found items:", data?.length || 0);
		return NextResponse.json({ items: data ?? [] });
	} catch (error) {
		console.log("Subscriptions GET - caught error:", error);
		return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		console.log("Subscriptions POST - received body:", body);
		const { name, amount, occurrence, startDate } = body ?? {};
		if (!name || amount === undefined || !occurrence || !startDate) {
			console.log("Subscriptions POST - validation failed:", { name, amount, occurrence, startDate });
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}
		if (!allowed.has(occurrence)) {
			console.log("Subscriptions POST - invalid occurrence:", occurrence);
			return NextResponse.json({ error: "Invalid occurrence" }, { status: 400 });
		}

		const supabase = createRouteHandlerClient({ cookies });
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		
		if (authError) {
			console.log("Subscriptions POST - auth error:", authError);
			return NextResponse.json({ error: "Authentication error", details: authError }, { status: 401 });
		}
		
		if (!user) {
			console.log("Subscriptions POST - unauthorized");
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Calculate next billing date based on occurrence
		const startDateObj = new Date(startDate);
		let nextBillingDate = new Date(startDateObj);
		
		if (occurrence === "monthly") {
			nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
		} else if (occurrence === "bi-monthly") {
			nextBillingDate.setMonth(nextBillingDate.getMonth() + 2);
		} else if (occurrence === "annually") {
			nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
		}
		
		console.log("Subscriptions POST - inserting with user_id:", user.id);
		console.log("Subscriptions POST - calculated next billing date:", nextBillingDate.toISOString().split('T')[0]);
		
		const { data, error } = await supabase
			.from("subscriptions")
			.insert({
				user_id: user.id,
				name,
				amount,
				occurrence,
				start_date: startDate,
				next_billing_date: nextBillingDate.toISOString().split('T')[0],
			})
			.select("id")
			.single();

		if (error) {
			console.log("Subscriptions POST - database error:", error);
			throw error;
		}
		console.log("Subscriptions POST - success, inserted id:", data?.id);
		return NextResponse.json({ ok: true, id: data?.id ?? null });
	} catch (error) {
		console.log("Subscriptions POST - caught error:", error);
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
			.from("subscriptions")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) throw error;
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
	}
}
