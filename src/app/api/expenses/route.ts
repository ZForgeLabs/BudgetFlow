import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = createRouteHandlerClient();
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const { data, error } = await supabase
			.from("expenses")
			.select("id, name, amount")
			.eq("user_id", user.id)
			.order("id", { ascending: true });
		if (error) throw error;
		return NextResponse.json({ items: data ?? [] });
	} catch {
		return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const { name, amount } = await req.json();
		if (!name || amount === undefined) {
			return NextResponse.json({ error: "Missing fields" }, { status: 400 });
		}
		const supabase = createRouteHandlerClient();
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const { data, error } = await supabase
			.from("expenses")
			.insert({ user_id: user.id, name, amount })
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
		const supabase = createRouteHandlerClient();
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const { error } = await supabase
			.from("expenses")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id);
		if (error) throw error;
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Failed to delete" }, { status: 400 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const { id, name, amount } = await req.json();
		if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
		const supabase = createRouteHandlerClient();
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const updates: any = {};
		if (name !== undefined) updates.name = name;
		if (amount !== undefined) updates.amount = amount;
		const { error } = await supabase
			.from("expenses")
			.update(updates)
			.eq("id", id)
			.eq("user_id", user.id);
		if (error) throw error;
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}


