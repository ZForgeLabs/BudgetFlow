import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
  try {
    console.log("Test subscriptions API - starting");
    
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log("Test subscriptions API - auth error:", authError);
      return NextResponse.json({ error: "Auth error", details: authError }, { status: 401 });
    }
    
    if (!user) {
      console.log("Test subscriptions API - no user");
      return NextResponse.json({ error: "No user" }, { status: 401 });
    }
    
    console.log("Test subscriptions API - user found:", user.id);
    
    // Test 1: Check if table exists by trying to select from it
    const { data: tableTest, error: tableError } = await supabase
      .from("subscriptions")
      .select("count")
      .limit(1);
    
    if (tableError) {
      console.log("Test subscriptions API - table error:", tableError);
      return NextResponse.json({ error: "Table error", details: tableError }, { status: 500 });
    }
    
    console.log("Test subscriptions API - table exists, testing insert");
    
    // Test 2: Try to insert a test record
    const testData = {
      user_id: user.id,
      name: "Test Subscription",
      amount: 9.99,
      occurrence: "monthly",
      start_date: new Date().toISOString().split('T')[0]
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from("subscriptions")
      .insert(testData)
      .select("id")
      .single();
    
    if (insertError) {
      console.log("Test subscriptions API - insert error:", insertError);
      return NextResponse.json({ error: "Insert error", details: insertError }, { status: 500 });
    }
    
    console.log("Test subscriptions API - insert successful, id:", insertData?.id);
    
    // Test 3: Try to fetch the record we just inserted
    const { data: fetchData, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", insertData.id)
      .single();
    
    if (fetchError) {
      console.log("Test subscriptions API - fetch error:", fetchError);
      return NextResponse.json({ error: "Fetch error", details: fetchError }, { status: 500 });
    }
    
    console.log("Test subscriptions API - fetch successful:", fetchData);
    
    // Test 4: Clean up - delete the test record
    const { error: deleteError } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", insertData.id);
    
    if (deleteError) {
      console.log("Test subscriptions API - delete error:", deleteError);
    } else {
      console.log("Test subscriptions API - cleanup successful");
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "All tests passed",
      user_id: user.id,
      test_data: fetchData
    });
    
  } catch (error) {
    console.log("Test subscriptions API - caught error:", error);
    return NextResponse.json({ error: "Test failed", details: error }, { status: 500 });
  }
}
