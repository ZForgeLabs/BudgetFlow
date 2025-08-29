"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Icons } from "@/components/ui/icons";
import CustomLoginForm from "@/components/auth/CustomLoginForm";
import CustomSignupForm from "@/components/auth/CustomSignupForm";

// Separate component to handle search params
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignup, setIsSignup] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Check if user wants to sign up from URL parameter
    const signupParam = searchParams.get('signup');
    if (signupParam === 'true') {
      setIsSignup(true);
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) router.replace("/dashboard");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200 blur-3xl opacity-40" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-200 blur-3xl opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 text-blue-700 font-semibold">
            <Icons.react className="h-6 w-6" />
            <span>Welcome to</span>
          </div>
          <Link href="/" className="block">
            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
              BudgetFlow
            </h1>
          </Link>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            Plan your money with clarity. Track income, fixed expenses, savings goals,
            and subscriptions, then visualize it instantly. Sign in to access your personal dashboard.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="rounded-lg border bg-white/60 p-4">
              <div className="font-semibold text-gray-900">Per‑user data</div>
              <div className="mt-1">All data is tied to your account and protected.</div>
            </div>
            <div className="rounded-lg border bg-white/60 p-4">
              <div className="font-semibold text-gray-900">Smart charts</div>
              <div className="mt-1">Clear visuals of income, outflow, and remaining.</div>
            </div>
            <div className="rounded-lg border bg-white/60 p-4">
              <div className="font-semibold text-gray-900">Subscriptions</div>
              <div className="mt-1">Track amounts, occurrences, and start dates.</div>
            </div>
          </div>
        </section>

        <section id="signin" className="flex items-center">
          <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur rounded-xl border shadow p-6">
            <div className="flex items-center gap-2">
              <Icons.logo className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {isSignup ? "Create Account" : "Sign In"}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isSignup 
                ? "Create your account to start budgeting" 
                : "Sign in to access your dashboard"
              }
            </p>
            
            {showSuccessMessage ? (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Icons.check className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-800">
                      {isSignup ? "Account created successfully!" : "Signed in successfully!"}
                    </h3>
                    <p className="text-sm text-green-600">
                      {isSignup 
                        ? "Please check your email to verify your account." 
                        : "Redirecting to your dashboard..."
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                {isSignup ? (
                  <CustomSignupForm
                    onSuccess={() => setShowSuccessMessage(true)}
                    onSwitchToLogin={() => setIsSignup(false)}
                  />
                ) : (
                  <CustomLoginForm
                    onSuccess={() => {
                      setShowSuccessMessage(true);
                      setTimeout(() => router.replace("/dashboard"), 2000);
                    }}
                    onSwitchToSignup={() => setIsSignup(true)}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

// Loading fallback component
function LoginLoading() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200 blur-3xl opacity-40" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-200 blur-3xl opacity-40" />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-blue-700 font-semibold">
            <Icons.react className="h-6 w-6" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}