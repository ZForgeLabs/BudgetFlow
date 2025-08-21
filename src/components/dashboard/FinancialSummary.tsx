import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSignIcon,
  PiggyBankIcon,
} from "lucide-react";

interface FinancialSummaryProps {
  monthlyIncome?: number;
  totalExpenses?: number;
  totalSubscriptions?: number;
  totalSavings?: number;
  remainingBalance?: number;
}

const FinancialSummary = ({
  monthlyIncome = 5000,
  totalExpenses = 1830,
  totalSubscriptions = 0,
  totalSavings = 1600,
  remainingBalance = 1570,
}: FinancialSummaryProps) => {
  const isBalancePositive = remainingBalance >= 0;
  const afterExpensesBalance = monthlyIncome - totalExpenses;
  const afterSubscriptionsBalance = afterExpensesBalance - totalSubscriptions;

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Monthly Income */}
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100">
              <ArrowDownIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Monthly Income
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                ${monthlyIncome.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Fixed Expenses */}
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-red-100">
              <ArrowUpIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Fixed Expenses
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                ${totalExpenses.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Subscriptions */}
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-orange-100">
              <DollarSignIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Subscriptions
              </p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                ${totalSubscriptions.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Total Savings */}
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100">
              <PiggyBankIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Savings</p>
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                ${totalSavings.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Remaining Balance */}
          <div className="flex items-center space-x-4">
            <div
              className={`p-3 rounded-full ${isBalancePositive ? "bg-emerald-100" : "bg-red-100"}`}
            >
              <DollarSignIcon
                className={`h-6 w-6 ${isBalancePositive ? "text-emerald-600" : "text-red-600"}`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Leftover</p>
              <h3
                className={`text-xl lg:text-2xl font-bold ${isBalancePositive ? "text-emerald-600" : "text-red-600"}`}
              >
                ${Math.abs(remainingBalance).toLocaleString()}
                {!isBalancePositive && " (Over)"}
              </h3>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              After expenses:{" "}
              <span className="font-semibold">
                ${afterExpensesBalance.toLocaleString()}
              </span>
              {afterExpensesBalance < 0 && (
                <span className="text-red-600 ml-1">(Deficit)</span>
              )}
            </div>
            <div>
              After subscriptions:{" "}
              <span className="font-semibold">
                ${afterSubscriptionsBalance.toLocaleString()}
              </span>
              {afterSubscriptionsBalance < 0 && (
                <span className="text-red-600 ml-1">(Deficit)</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;
