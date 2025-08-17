"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

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
  const [expenses, setExpenses] = useState<Expense[]>(fixedExpenses);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");

  const handleIncomeChange = (value: string) => {
    setIncome(value);
    const numValue = parseFloat(value) || 0;
    onIncomeChange(numValue);
  };

  const addExpense = () => {
    if (newExpenseName.trim() && newExpenseAmount) {
      const newExpense: Expense = {
        id: Date.now().toString(),
        name: newExpenseName.trim(),
        amount: parseFloat(newExpenseAmount) || 0,
      };
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      onExpensesChange(updatedExpenses);
      setNewExpenseName("");
      setNewExpenseAmount("");
    }
  };

  const removeExpense = (id: string) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
    onExpensesChange(updatedExpenses);
  };

  const updateExpense = (
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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Income */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Monthly Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="income">Total Monthly Income</Label>
            <Input
              id="income"
              type="number"
              placeholder="5000"
              value={income}
              onChange={(e) => handleIncomeChange(e.target.value)}
              className="text-lg font-medium"
            />
          </div>
        </CardContent>
      </Card>

      {/* Fixed Expenses */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Fixed Monthly Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Expenses */}
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-2">
                <Input
                  placeholder="Expense name"
                  value={expense.name}
                  onChange={(e) =>
                    updateExpense(expense.id, "name", e.target.value)
                  }
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={expense.amount.toString()}
                  onChange={(e) =>
                    updateExpense(expense.id, "amount", e.target.value)
                  }
                  className="w-24"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeExpense(expense.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Expense */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="New expense name"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Amount"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                className="w-24"
              />
              <Button
                onClick={addExpense}
                size="icon"
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeExpenseForm;
