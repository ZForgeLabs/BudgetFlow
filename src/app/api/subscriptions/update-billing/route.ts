import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriptionId } = body;
    
    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscription ID" }, { status: 400 });
    }

    const supabase = createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current subscription
    const { data: subscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("next_billing_date, occurrence, last_paid_date")
      .eq("id", subscriptionId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    // Calculate new next billing date
    const currentBillingDate = new Date(subscription.next_billing_date);
    let newBillingDate = new Date(currentBillingDate);
    
    if (subscription.occurrence === "monthly") {
      newBillingDate.setMonth(newBillingDate.getMonth() + 1);
    } else if (subscription.occurrence === "bi-monthly") {
      newBillingDate.setMonth(newBillingDate.getMonth() + 2);
    } else if (subscription.occurrence === "annually") {
      newBillingDate.setFullYear(newBillingDate.getFullYear() + 1);
    }

    // Update the subscription with new billing date and mark as paid
    const today = new Date().toISOString().split('T')[0];
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ 
        next_billing_date: newBillingDate.toISOString().split('T')[0],
        last_paid_date: today
      })
      .eq("id", subscriptionId)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update billing date" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      newBillingDate: newBillingDate.toISOString().split('T')[0] 
    });

  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
