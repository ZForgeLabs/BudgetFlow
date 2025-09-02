import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
	try {
		const supabase = createRouteHandlerClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

		// Get user's subscription status
		const { data: profile, error: profileError } = await supabase
			.from("profiles")
			.select("subscription_status")
			.eq("user_id", user.id)
			.single();
		
		if (profileError && profileError.code !== "PGRST116") throw profileError;
		
		const subscriptionStatus = profile?.subscription_status ?? 'free';
		const isPro = subscriptionStatus === 'pro';

		// Get current counts for free users
		let expensesCount = 0;
		let subscriptionsCount = 0;
		let savingsBinsCount = 0;

		if (!isPro) {
			// Count expenses
			const { count: expensesCountResult } = await supabase
				.from("expenses")
				.select("*", { count: "exact", head: true })
				.eq("user_id", user.id);
			expensesCount = expensesCountResult ?? 0;

			// Count subscriptions
			const { count: subscriptionsCountResult } = await supabase
				.from("subscriptions")
				.select("*", { count: "exact", head: true })
				.eq("user_id", user.id);
			subscriptionsCount = subscriptionsCountResult ?? 0;

			// Count savings bins
			const { count: savingsBinsCountResult } = await supabase
				.from("savings_bins")
				.select("*", { count: "exact", head: true })
				.eq("user_id", user.id);
			savingsBinsCount = savingsBinsCountResult ?? 0;
		}

		// Define limits
		const limits = {
			expenses: isPro ? -1 : 5, // -1 means unlimited
			subscriptions: isPro ? -1 : 5,
			savingsBins: isPro ? -1 : 5,
			graphs: isPro
		};

		// Define current usage
		const usage = {
			expenses: expensesCount,
			subscriptions: subscriptionsCount,
			savingsBins: savingsBinsCount
		};

		// Check if user can add more items
		const canAdd = {
			expenses: isPro || expensesCount < 5,
			subscriptions: isPro || subscriptionsCount < 5,
			savingsBins: isPro || savingsBinsCount < 5
		};

		return NextResponse.json({
			subscriptionStatus,
			isPro,
			limits,
			usage,
			canAdd
		});
	} catch (error) {
		console.error('Feature limits error:', error);
		return NextResponse.json({ error: "Failed to fetch feature limits" }, { status: 500 });
	}
}
