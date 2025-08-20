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
  const [fixedExpenses, setFixedExpenses] = useState<Expense[]>([
    { id: "1", name: "Rent", amount: 1200 },
    { id: "2", name: "Groceries", amount: 400 },
    { id: "3", name: "Utilities", amount: 150 },
    { id: "4", name: "Internet", amount: 80 },
  ]);
  const [savingsBins, setSavingsBins] = useState<SavingsBin[]>([
    {
      id: "1",
      name: "Emergency Fund",
      currentAmount: 2500,
      goalAmount: 10000,
      monthlyAllocation: 500,
    },
    {
      id: "2",
      name: "Vacation",
      currentAmount: 800,
      goalAmount: 3000,
      monthlyAllocation: 300,
    },
    {
      id: "3",
      name: "Retirement",
      currentAmount: 15000,
      goalAmount: 50000,
      monthlyAllocation: 800,
    },
  ]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const [subs, setSubs] = useState<any[]>([]);
  const [subName, setSubName] = useState("");
  const [subAmount, setSubAmount] = useState<number | "">("");
  const [subOccurrence, setSubOccurrence] = useState<"monthly" | "bi-monthly" | "annually">("monthly");
  const [subStartDate, setSubStartDate] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setIsLoggedIn(!!session)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadSubs = async () => {
      const res = await fetch("/api/subscriptions", { cache: "no-store" });
      if (res.ok) {
        const { items } = await res.json();
        setSubs(items);
      }
    };
    if (isLoggedIn) loadSubs();
  }, [isLoggedIn]);

  const totalExpenses = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSavings = savingsBins.reduce((sum, b) => sum + b.monthlyAllocation, 0);
  const remainingBalance = monthlyIncome - totalExpenses - totalSavings;
  const availableForSavings = monthlyIncome - totalExpenses;

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

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Personal Budget Planner</h1>
          <p className="text-gray-600 text-lg">Manage your monthly income, expenses, and savings goals</p>
        </div>

        <div className="flex justify-end mb-4">
          {isLoggedIn ? (
            <Button
              variant="secondary"
              disabled={signingOut}
              onClick={async () => {
                setSigningOut(true);
                await supabase.auth.signOut();
                router.replace("/login");
              }}
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </Button>
          ) : (
            <Button asChild>
              <a href="/login">Log in</a>
            </Button>
          )}
        </div>

        <FinancialSummary
          monthlyIncome={monthlyIncome}
          totalExpenses={totalExpenses}
          totalSavings={totalSavings}
          remainingBalance={remainingBalance}
        />

        <SpendingCharts
          monthlyIncome={monthlyIncome}
          totalFixedExpenses={totalExpenses}
          totalSubscriptionsMonthly={totalSubscriptionsMonthly}
        />

        <IncomeExpenseForm
          monthlyIncome={monthlyIncome}
          fixedExpenses={fixedExpenses}
          onIncomeChange={setMonthlyIncome}
          onExpensesChange={setFixedExpenses}
        />

        <SavingsBins
          savingsBins={savingsBins}
          availableAmount={availableForSavings}
          onBinsChange={setSavingsBins}
        />

        <div className="bg-white border rounded-lg p-4 space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Subscriptions</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <Input
                placeholder="Name (e.g., Netflix)"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
              />
              <div className="relative">
                <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={subAmount}
                  onChange={(e) => setSubAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="pl-5"
                />
              </div>
              <Select value={subOccurrence} onValueChange={(v) => setSubOccurrence(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Occurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="bi-monthly">Bi-monthly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={subStartDate} onChange={(e) => setSubStartDate(e.target.value)} />
              <Button
                onClick={async () => {
                  if (!subName || subAmount === "" || !subOccurrence || !subStartDate) return;
                  const res = await fetch("/api/subscriptions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: subName,
                      amount: Number(subAmount),
                      occurrence: subOccurrence,
                      startDate: subStartDate,
                    }),
                  });
                  if (res.ok) {
                    const r2 = await fetch("/api/subscriptions", { cache: "no-store" });
                    const { items } = await r2.json();
                    setSubs(items);
                    setSubName("");
                    setSubAmount("");
                    setSubOccurrence("monthly");
                    setSubStartDate("");
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <ul className="text-sm space-y-1">
            {subs.length === 0 ? (
              <li className="text-gray-500">No subscriptions yet.</li>
            ) : (
              subs.map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <span>
                    {s.name} — ${Number(s.amount).toFixed(2)} — Next: {new Date(s.next_payment_date).toLocaleDateString()}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={async () => {
                      await fetch(`/api/subscriptions?id=${s.id}`, { method: "DELETE" });
                      setSubs((prev) => prev.filter((x) => x.id !== s.id));
                    }}
                  >
                    Delete
                  </Button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}


