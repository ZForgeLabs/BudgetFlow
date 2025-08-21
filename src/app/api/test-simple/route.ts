import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        error: "Missing environment variables",
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      });
    }
    
    // Create a direct Supabase client (not using auth helpers)
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection by checking if we can query the subscriptions table
    const { data, error } = await supabase
      .from('subscriptions')
      .select('count')
      .limit(1);
    
    if (error) {
      return NextResponse.json({ 
        error: "Database connection failed",
        details: error
      });
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Database connection successful",
      data: data
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Test failed",
      details: error
    });
  }
}
