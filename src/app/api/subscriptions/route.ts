import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

const allowed = new Set(["monthly", "bi-monthly", "annually"]);

export async function GET() {
	try {
		const supabase = createRouteHandlerClient({ cookies });
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const { data, error } = await supabase
			.from("subscriptions")
			.select("id, name, amount, occurrence, start_date, created_at")
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
		const { name, amount, occurrence, startDate } = body ?? {};
		if (!name || amount === undefined || !occurrence || !startDate) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}
		if (!allowed.has(occurrence)) {
			return NextResponse.json({ error: "Invalid occurrence" }, { status: 400 });
		}

		const supabase = createRouteHandlerClient({ cookies });
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		const { data, error } = await supabase
			.from("subscriptions")
			.insert({
				user_id: user.id,
				name,
				amount,
				occurrence,
				start_date: startDate,
			})
			.select("id")
			.single();

		if (error) throw error;
		return NextResponse.json({ ok: true, id: data?.id ?? null });
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
