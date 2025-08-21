"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, DollarSign, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";

interface Expense {
  id: string;
  name: string;
  amount: number;
}

interface IncomeExpenseFormProps {
  monthlyIncome?: number;
  fixedExpenses?: Expense[];
  onIncomeChange?: (income: number) => void;
  onExpensesChange?: (expenses: Expense[]) => void;
}

const IncomeExpenseForm = ({
  monthlyIncome = 5000,
  fixedExpenses = [
    { id: "1", name: "Rent", amount: 1200 },
    { id: "2", name: "Groceries", amount: 400 },
    { id: "3", name: "Utilities", amount: 150 },
    { id: "4", name: "Internet", amount: 80 },
  ],
  onIncomeChange = () => {},
  onExpensesChange = () => {},
}: IncomeExpenseFormProps) => {
  const [income, setIncome] = useState(monthlyIncome.toString());
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>(fixedExpenses);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [showAllExpenses, setShowAllExpenses] = useState(false);

  // Update internal state when props change
  useEffect(() => {
    setExpenses(fixedExpenses);
  }, [fixedExpenses]);

  useEffect(() => {
    setIncome(monthlyIncome.toString());
  }, [monthlyIncome]);

  const handleIncomeChange = (value: string) => {
    setIncome(value);
  };

  const startEditingIncome = () => {
    setIncome(monthlyIncome.toString());
    setIsEditingIncome(true);
  };

  const cancelEditingIncome = () => {
    setIncome(monthlyIncome.toString());
    setIsEditingIncome(false);
  };

  const saveIncome = async () => {
    const numValue = parseFloat(income) || 0;
    onIncomeChange(numValue);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyIncome: numValue }),
      });
    } catch (e) {
      // noop
    }
    setIsEditingIncome(false);
  };

  const addExpense = async () => {
    if (newExpenseName.trim() && newExpenseAmount) {
      const newExpense: Expense = {
        id: Date.now().toString(),
        name: newExpenseName.trim(),
        amount: parseFloat(newExpenseAmount) || 0,
      };
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      onExpensesChange(updatedExpenses);
      // Persist
      try {
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newExpense.name, amount: newExpense.amount }),
        });
        const data = await res.json();
        if (res.ok && data?.id) {
          // replace temp id with server id
          setExpenses((prev) => prev.map((e) => (e === newExpense ? { ...e, id: data.id } : e)));
        }
      } catch (e) {
        // noop
      }
      setNewExpenseName("");
      setNewExpenseAmount("");
    }
  };

  const removeExpense = async (id: string) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
    onExpensesChange(updatedExpenses);
    try {
      await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    } catch (e) {
      // noop
    }
  };

  const updateExpense = async (
    id: string,
    field: "name" | "amount",
    value: string,
  ) => {
    const updatedExpenses = expenses.map((expense) => {
      if (expense.id === id) {
        return {
          ...expense,
          [field]: field === "amount" ? parseFloat(value) || 0 : value,
        };
      }
      return expense;
    });
    setExpenses(updatedExpenses);
    onExpensesChange(updatedExpenses);
    try {
      const payload: any = { id };
      if (field === "name") payload.name = value;
      if (field === "amount") payload.amount = parseFloat(value) || 0;
      await fetch("/api/expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // noop
    }
  };

  return (
    <div className="space-y-6">
      {/* Monthly Income Section */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Monthly Income</h3>
              <p className="text-green-100 text-sm">Set your total monthly earnings</p>
            </div>
          </div>
          {!isEditingIncome && (
            <Button 
              variant="outline" 
              onClick={startEditingIncome}
              className="border-white/30 text-black bg-white/90 hover:bg-white text-sm px-3 py-1"
            >
              Edit Income
            </Button>
          )}
        </div>

        {!isEditingIncome ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold mb-1">${monthlyIncome.toLocaleString()}</div>
              <p className="text-green-100 text-sm">per month</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                <Input
                  id="income"
                  type="number"
                  placeholder="5000"
                  value={income}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  className="text-lg font-medium pl-8 bg-white text-gray-900"
                />
              </div>
              <Button 
                type="button" 
                onClick={saveIncome} 
                className="bg-white text-green-600 hover:bg-green-50 text-sm px-3 py-1"
              >
                Save
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={cancelEditingIncome}
                className="border-white/30 text-black bg-white/90 hover:bg-white text-sm px-3 py-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Expenses Section */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Fixed Monthly Expenses</h3>
              <p className="text-red-100">Manage your recurring expenses</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Existing Expenses */}
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-red-100">
                <TrendingDown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No expenses yet.</p>
                <p className="text-sm opacity-75">Add your first expense to get started!</p>
              </div>
            ) : (
              <>
                {/* Show first 4 expenses always, or all if expanded */}
                {(showAllExpenses ? expenses : expenses.slice(0, 4)).map((expense) => (
                  <div key={expense.id} className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <Input
                      placeholder="Expense name"
                      value={expense.name}
                      onChange={(e) => updateExpense(expense.id, "name", e.target.value)}
                      className="flex-1 bg-white text-gray-900"
                    />
                    <div className="relative w-28">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={expense.amount.toString()}
                        onChange={(e) => updateExpense(expense.id, "amount", e.target.value)}
                        className="w-28 pl-8 bg-white text-gray-900"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeExpense(expense.id)}
                      className="flex-shrink-0 border-white/30 text-black bg-white/90 hover:bg-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Show expand/collapse button if more than 4 expenses */}
                {expenses.length > 4 && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllExpenses(!showAllExpenses)}
                      className="border-white/30 text-black bg-white/90 hover:bg-white transition-all duration-200"
                    >
                      {showAllExpenses ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less ({expenses.length - 4} hidden)
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Show All ({expenses.length - 4} more)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Add New Expense */}
          <div className="border-t border-white/20 pt-4">
            <div className="flex items-center gap-3">
              <Input
                placeholder="New expense name"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                className="flex-1 bg-white text-gray-900"
              />
              <div className="relative w-28">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  className="w-28 pl-8 bg-white text-gray-900"
                />
              </div>
              <Button
                onClick={addExpense}
                size="icon"
                className="flex-shrink-0 bg-white text-red-600 hover:bg-red-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total Section */}
          <div className="border-t border-white/20 pt-4">
            <div className="flex items-center justify-between bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <span className="font-semibold text-lg">Total Fixed Monthly Expenses:</span>
              <span className="text-2xl font-bold">
                ${expenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseForm;
