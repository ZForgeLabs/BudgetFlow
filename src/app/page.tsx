"use client";

import React, { useState } from "react";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import IncomeExpenseForm from "@/components/budget/IncomeExpenseForm";
import SavingsBins from "@/components/budget/SavingsBins";

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

export default function Home() {
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

  // Calculate totals
  const totalExpenses = fixedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const totalSavings = savingsBins.reduce(
    (sum, bin) => sum + bin.monthlyAllocation,
    0,
  );
  const remainingBalance = monthlyIncome - totalExpenses - totalSavings;
  const availableForSavings = monthlyIncome - totalExpenses;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Personal Budget Planner
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your monthly income, expenses, and savings goals
          </p>
        </div>

        {/* Financial Summary */}
        <FinancialSummary
          monthlyIncome={monthlyIncome}
          totalExpenses={totalExpenses}
          totalSavings={totalSavings}
          remainingBalance={remainingBalance}
        />

        {/* Income and Expenses Form */}
        <IncomeExpenseForm
          monthlyIncome={monthlyIncome}
          fixedExpenses={fixedExpenses}
          onIncomeChange={setMonthlyIncome}
          onExpensesChange={setFixedExpenses}
        />

        {/* Savings Bins */}
        <SavingsBins
          savingsBins={savingsBins}
          availableAmount={availableForSavings}
          onBinsChange={setSavingsBins}
        />

        {/* Quick Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Aim to save at least 20% of your income</li>
            <li>• Keep 3-6 months of expenses in your emergency fund</li>
            <li>• Review and adjust your budget monthly</li>
            <li>• Automate your savings to stay on track</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
