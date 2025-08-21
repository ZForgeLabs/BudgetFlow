import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    SUPABASE_URL: process.env.SUPABASE_URL ? "Set" : "Not set",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set (length: " + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ")" : "Not set",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set (length: " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ")" : "Not set",
  };
  
  return NextResponse.json({ 
    environment: process.env.NODE_ENV,
    env_vars: envVars
  });
}
