"use client";

import { supabase } from "@/lib/supabase/client";
import React, { useState, useEffect } from "react";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import IncomeExpenseForm from "@/components/budget/IncomeExpenseForm";
import SavingsBins from "@/components/budget/SavingsBins";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import SpendingCharts from "@/components/dashboard/SpendingCharts";
import PaymentStatusButton from "@/components/subscriptions/PaymentStatusButton";
import { CreditCard, Calendar, DollarSign, ChevronDown, ChevronUp } from "lucide-react";

interface Expense {
  id: string;
  name: string;
  amount: number;
}

interface SavingsBin {
  id: string;
  name: string;
  currentAmount: number;
  goalAmount: number;
  monthlyAllocation: number;
}

export default function DashboardPage() {
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [fixedExpenses, setFixedExpenses] = useState<Expense[]>([]);
  const [savingsBins, setSavingsBins] = useState<SavingsBin[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const [subs, setSubs] = useState<any[]>([]);
  const [subName, setSubName] = useState("");
  const [subAmount, setSubAmount] = useState<number | "">("");
  const [subOccurrence, setSubOccurrence] = useState<"monthly" | "bi-monthly" | "annually">("monthly");
  const [subStartDate, setSubStartDate] = useState("");
  const [userName, setUserName] = useState("");
  const [showAllSubscriptions, setShowAllSubscriptions] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setIsLoggedIn(!!session)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      // profile income and name
      const resProfile = await fetch("/api/profile", { cache: "no-store" });
      if (resProfile.ok) {
        const { monthlyIncome: mi, firstName } = await resProfile.json();
        if (typeof mi === "number" && !Number.isNaN(mi)) setMonthlyIncome(mi);
        if (firstName) setUserName(firstName);
      }
      // expenses
      const resExp = await fetch("/api/expenses", { cache: "no-store" });
      if (resExp.ok) {
        const { items } = await resExp.json();
        setFixedExpenses(items.map((e: any) => ({ id: String(e.id), name: e.name, amount: Number(e.amount) || 0 })));
      }
      // bins
      const resBins = await fetch("/api/bins", { cache: "no-store" });
      if (resBins.ok) {
        const { items } = await resBins.json();
        setSavingsBins(
          items.map((b: any) => ({
            id: String(b.id),
            name: b.name,
            currentAmount: Number(b.current_amount) || 0,
            goalAmount: Number(b.goal_amount) || 0,
            monthlyAllocation: Number(b.monthly_allocation) || 0,
          })),
        );
      }
      // subscriptions
      const resSubs = await fetch("/api/subscriptions", { cache: "no-store" });
      console.log("Subscriptions API response:", resSubs.status);
      if (resSubs.ok) {
        const { items } = await resSubs.json();
        console.log("Setting subscriptions:", items);
        setSubs(items);
      } else {
        console.error("Failed to load subscriptions:", await resSubs.text());
      }
    };
    if (isLoggedIn) loadAll();
  }, [isLoggedIn]);

  // Debug: Track savingsBins changes
  useEffect(() => {
    console.log('SavingsBins state changed:', savingsBins);
  }, [savingsBins]);

  const refreshDashboardData = async () => {
    console.log('Refreshing dashboard data...');
    // Refresh the bins data
    const binsRes = await fetch("/api/bins", { cache: "no-store" });
    if (binsRes.ok) {
      const { items } = await binsRes.json();
      setSavingsBins(
        items.map((b: any) => ({
          id: String(b.id),
          name: b.name,
          currentAmount: Number(b.current_amount) || 0,
          goalAmount: Number(b.goal_amount) || 0,
          monthlyAllocation: Number(b.monthly_allocation) || 0,
        })),
      );
    }
  };

  const totalExpenses = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSavings = savingsBins.reduce((sum, b) => sum + b.monthlyAllocation, 0);
  const totalSaved = savingsBins.reduce((sum, b) => sum + b.currentAmount, 0);
  const remainingBalance = monthlyIncome - totalExpenses - totalSavings;
  const availableForSavings = monthlyIncome - totalExpenses - totalSaved;

  // Debug logging
  console.log('Dashboard calculations:', {
    monthlyIncome,
    totalExpenses,
    totalSavings,
    totalSaved,
    remainingBalance,
    availableForSavings,
    savingsBinsCount: savingsBins.length
  });

  const processScheduledTransfers = async () => {
    try {
      const res = await fetch("/api/schedules/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      
      if (data.processedTransfers && data.processedTransfers.length > 0) {
        // Refresh the bins data to show updated amounts
        const binsRes = await fetch("/api/bins", { cache: "no-store" });
        if (binsRes.ok) {
          const { items } = await binsRes.json();
          setSavingsBins(
            items.map((b: any) => ({
              id: String(b.id),
              name: b.name,
              currentAmount: Number(b.current_amount) || 0,
              goalAmount: Number(b.goal_amount) || 0,
              monthlyAllocation: Number(b.monthly_allocation) || 0,
            })),
          );
        }
        
        // Show success message
        alert(`${data.processedTransfers.length} transfers completed successfully!`);
      } else {
        alert("No scheduled transfers were due today.");
      }
    } catch (e) {
      console.error('Error processing transfers:', e);
      alert("Failed to process transfers. Please try again.");
    }
  };

  const monthlyize = (occurrence: string, amount: number) => {
    if (occurrence === "monthly") return amount;
    if (occurrence === "bi-monthly") return amount / 2;
    if (occurrence === "annually") return amount / 12;
    return amount;
  };

  const totalSubscriptionsMonthly = subs.reduce((sum, s) => {
    const amt = Number(s.amount) || 0;
    return sum + monthlyize(String(s.occurrence ?? "monthly"), amt);
  }, 0);

  // Calculate total subscription amount (not monthlyized)
  const totalSubscriptionsAmount = subs.reduce((sum, s) => {
    return sum + (Number(s.amount) || 0);
  }, 0);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
              <p className="text-gray-600">Manage your budget and track your progress</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={processScheduledTransfers}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Process Transfers
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                setSigningOut(true);
                await supabase.auth.signOut();
                router.push("/login");
              }}
              disabled={signingOut}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {signingOut ? "Signing out..." : "Sign Out"}
            </Button>
          </div>
        </div>

        <FinancialSummary
          monthlyIncome={monthlyIncome}
          totalExpenses={totalExpenses}
          totalSubscriptions={totalSubscriptionsMonthly}
          totalSavings={totalSavings}
          remainingBalance={remainingBalance - totalSubscriptionsMonthly}
        />

        <IncomeExpenseForm
          monthlyIncome={monthlyIncome}
          fixedExpenses={fixedExpenses}
          onIncomeChange={setMonthlyIncome}
          onExpensesChange={setFixedExpenses}
        />

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Subscriptions</h3>
                <p className="text-orange-100">Manage your recurring payments</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-orange-100">Total Monthly:</div>
              <div className="text-2xl font-bold">${totalSubscriptionsMonthly.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <Input
                placeholder="Name (e.g., Netflix)"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="bg-white/90 text-gray-900 placeholder-gray-600 border-white/30"
              />
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={subAmount}
                  onChange={(e) => setSubAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="pl-8 bg-white/90 text-gray-900 placeholder-gray-600 border-white/30"
                />
              </div>
              <Select value={subOccurrence} onValueChange={(v) => setSubOccurrence(v as any)}>
                <SelectTrigger className="bg-white/90 text-gray-900 border-white/30">
                  <SelectValue placeholder="Occurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="bi-monthly">Bi-monthly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                type="date" 
                value={subStartDate} 
                onChange={(e) => setSubStartDate(e.target.value)}
                className="bg-white/90 text-gray-900 border-white/30"
              />
              <Button
                className="bg-white text-orange-600 hover:bg-orange-50 font-semibold"
                onClick={async () => {
                  console.log("Adding subscription:", { subName, subAmount, subOccurrence, subStartDate });
                  if (!subName || subAmount === "" || !subOccurrence || !subStartDate) {
                    console.log("Validation failed - missing fields");
                    return;
                  }
                  try {
                    const payload = {
                      name: subName,
                      amount: Number(subAmount),
                      occurrence: subOccurrence,
                      startDate: subStartDate,
                    };
                    console.log("Sending payload:", payload);
                    const res = await fetch("/api/subscriptions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    console.log("Response status:", res.status);
                    if (res.ok) {
                      const data = await res.json();
                      console.log("Response data:", data);
                      const r2 = await fetch("/api/subscriptions", { cache: "no-store" });
                      const { items } = await r2.json();
                      console.log("Updated subscriptions:", items);
                      setSubs(items);
                      setSubName("");
                      setSubAmount("");
                      setSubOccurrence("monthly");
                      setSubStartDate("");
                    } else {
                      const errorText = await res.text();
                      console.error("Failed to add subscription:", errorText);
                    }
                  } catch (error) {
                    console.error("Error adding subscription:", error);
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {subs.length === 0 ? (
              <div className="text-center py-8 text-orange-100">
                <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No subscriptions yet.</p>
                <p className="text-sm opacity-75">Add your first subscription to get started!</p>
              </div>
            ) : (
              <>
                {/* Show first 4 subscriptions always, or all if expanded */}
                {(showAllSubscriptions ? subs : subs.slice(0, 4)).map((s) => (
                  <div key={s.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 rounded-lg bg-white/20">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{s.name}</h4>
                            <p className="text-orange-100 text-sm">${Number(s.amount).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-orange-100 text-xs space-y-1">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3" />
                            <span>Started: {new Date(s.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-3 w-3" />
                            <span>Next Payment: {s.next_billing_date ? new Date(s.next_billing_date).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <PaymentStatusButton
                          subscriptionId={s.id}
                          nextBillingDate={s.next_billing_date || s.start_date}
                          lastPaidDate={s.last_paid_date}
                          onPaymentUpdate={() => {
                            // Refresh the subscriptions list
                            fetch("/api/subscriptions", { cache: "no-store" })
                              .then(res => res.json())
                              .then(({ items }) => setSubs(items))
                              .catch(error => console.error("Error refreshing subscriptions:", error));
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/30 text-black bg-white/90 hover:bg-white"
                          onClick={async () => {
                            await fetch(`/api/subscriptions?id=${s.id}`, { method: "DELETE" });
                            setSubs((prev) => prev.filter((x) => x.id !== s.id));
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Show expand/collapse button if more than 4 subscriptions */}
                {subs.length > 4 && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllSubscriptions(!showAllSubscriptions)}
                      className="border-white/30 text-black bg-white/90 hover:bg-white transition-all duration-200"
                    >
                      {showAllSubscriptions ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less ({subs.length - 4} hidden)
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Show All ({subs.length - 4} more)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <SpendingCharts
          monthlyIncome={monthlyIncome}
          totalFixedExpenses={totalExpenses}
          totalSubscriptionsMonthly={totalSubscriptionsMonthly}
          totalSavings={totalSavings}
          totalSaved={totalSaved}
        />

        <SavingsBins
          savingsBins={savingsBins}
          availableAmount={availableForSavings}
          onBinsChange={setSavingsBins}
          refreshDashboardData={refreshDashboardData}
        />

        {/* Feedback Button */}
        <div className="flex justify-center mt-8 mb-6">
          <Button
            asChild
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSeju0-ry23OahtQk06yAVfhuUl-aOY5v5MKsHX_3iKxOTbssQ/viewform?usp=header" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              💬 Suggest Feedback
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}


