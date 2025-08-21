import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get all schedules for the user
    const { data: schedules, error: schedulesError } = await supabase
      .from("schedules")
      .select(`
        id,
        bin_id,
        name,
        frequency,
        custom_month,
        custom_day,
        monthly_allocation,
        created_at
      `)
      .eq("user_id", user.id);

    if (schedulesError) {
      console.error('Error fetching schedules:', schedulesError);
      return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
    }

    const processedTransfers = [];

    for (const schedule of schedules || []) {
      let shouldTransfer = false;

      // Check if today is the day for transfer based on frequency
      switch (schedule.frequency) {
        case 'weekly':
          // Transfer every week on the same day of the week
          const scheduleDay = new Date(schedule.created_at).getDay();
          shouldTransfer = today.getDay() === scheduleDay;
          break;

        case 'semi-weekly':
          // Transfer every 2 weeks on the same day
          const weeksSinceCreation = Math.floor((today.getTime() - new Date(schedule.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000));
          const scheduleDay = new Date(schedule.created_at).getDay();
          shouldTransfer = today.getDay() === scheduleDay && weeksSinceCreation % 2 === 0;
          break;

        case 'monthly':
          // Transfer on the same day of the month
          const scheduleDate = new Date(schedule.created_at).getDate();
          shouldTransfer = today.getDate() === scheduleDate;
          break;

        case 'custom':
          // Transfer on specific month and day
          shouldTransfer = today.getMonth() + 1 === schedule.custom_month && today.getDate() === schedule.custom_day;
          break;
      }

      if (shouldTransfer) {
        // Get the current bin data
        const { data: bin, error: binError } = await supabase
          .from("savings_bins")
          .select("current_amount, monthly_allocation")
          .eq("id", schedule.bin_id)
          .single();

        if (binError) {
          console.error(`Error fetching bin ${schedule.bin_id}:`, binError);
          continue;
        }

        // Calculate transfer amount based on frequency
        let transferAmount = 0;
        switch (schedule.frequency) {
          case 'weekly':
            transferAmount = schedule.monthly_allocation / 4; // Weekly = monthly / 4
            break;
          case 'semi-weekly':
            transferAmount = schedule.monthly_allocation / 2; // Semi-weekly = monthly / 2
            break;
          case 'monthly':
          case 'custom':
            transferAmount = schedule.monthly_allocation;
            break;
        }

        // Update the bin's current amount
        const newAmount = bin.current_amount + transferAmount;
        const { error: updateError } = await supabase
          .from("savings_bins")
          .update({ current_amount: newAmount })
          .eq("id", schedule.bin_id);

        if (updateError) {
          console.error(`Error updating bin ${schedule.bin_id}:`, updateError);
          continue;
        }

        processedTransfers.push({
          scheduleId: schedule.id,
          binId: schedule.bin_id,
          binName: schedule.name,
          transferAmount: transferAmount,
          newTotal: newAmount,
          frequency: schedule.frequency
        });

        console.log(`Processed transfer for ${schedule.name}: $${transferAmount.toFixed(2)}`);
      }
    }

    return NextResponse.json({ 
      ok: true, 
      processedTransfers,
      message: `Processed ${processedTransfers.length} transfers`
    });

  } catch (error) {
    console.error('Error processing schedules:', error);
    return NextResponse.json({ 
      error: "Failed to process schedules",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
