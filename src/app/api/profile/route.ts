import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
	try {
		const supabase = createRouteHandlerClient({ cookies });
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const { data, error } = await supabase
			.from("profiles")
			.select("monthly_income")
			.eq("user_id", user.id)
			.single();
		if (error && error.code !== "PGRST116") throw error; // no rows
		
		// Get user's name from auth user data
		const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
		
		return NextResponse.json({ 
			monthlyIncome: data?.monthly_income ?? null,
			fullName: fullName
		});
	} catch {
		return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const { monthlyIncome } = await req.json();
		if (monthlyIncome === undefined || monthlyIncome === null) {
			return NextResponse.json({ error: "Missing monthlyIncome" }, { status: 400 });
		}
		const supabase = createRouteHandlerClient({ cookies });
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		const { error } = await supabase
			.from("profiles")
			.upsert({ user_id: user.id, monthly_income: monthlyIncome }, { onConflict: "user_id" });
		if (error) throw error;
		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}


