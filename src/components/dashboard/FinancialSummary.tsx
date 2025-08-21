import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  PiggyBankIcon,
  CreditCardIcon,
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

  // Calculate percentages for visual indicators
  const totalOutflow = totalExpenses + totalSubscriptions;
  const outflowPercentage = (totalOutflow / monthlyIncome) * 100;
  const savingsPercentage = (totalSavings / monthlyIncome) * 100;

  return (
    <div className="w-full space-y-6">
      {/* Main Financial Overview */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200 rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Financial Overview</h2>
          <p className="text-gray-600">Your monthly budget breakdown</p>
        </div>

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Monthly Income */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <TrendingUpIcon className="h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Income</div>
                <div className="text-xs opacity-75">Monthly</div>
              </div>
            </div>
            <div className="text-2xl font-bold mb-2">${monthlyIncome.toLocaleString()}</div>
            <div className="text-xs opacity-75">Total monthly earnings</div>
          </div>

          {/* Fixed Expenses */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <TrendingDownIcon className="h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Expenses</div>
                <div className="text-xs opacity-75">Fixed</div>
              </div>
            </div>
            <div className="text-2xl font-bold mb-2">${totalExpenses.toLocaleString()}</div>
            <div className="text-xs opacity-75">{((totalExpenses / monthlyIncome) * 100).toFixed(1)}% of income</div>
          </div>

          {/* Subscriptions */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <CreditCardIcon className="h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Subscriptions</div>
                <div className="text-xs opacity-75">Monthly</div>
              </div>
            </div>
            <div className="text-2xl font-bold mb-2">${totalSubscriptions.toLocaleString()}</div>
            <div className="text-xs opacity-75">{((totalSubscriptions / monthlyIncome) * 100).toFixed(1)}% of income</div>
          </div>

          {/* Total Savings */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <PiggyBankIcon className="h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Savings</div>
                <div className="text-xs opacity-75">Total</div>
              </div>
            </div>
            <div className="text-2xl font-bold mb-2">${totalSavings.toLocaleString()}</div>
            <div className="text-xs opacity-75">{savingsPercentage.toFixed(1)}% of income</div>
          </div>

          {/* Leftover */}
          <div className={`bg-gradient-to-br ${isBalancePositive ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <DollarSignIcon className="h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Leftover</div>
                <div className="text-xs opacity-75">{isBalancePositive ? 'Available' : 'Over Budget'}</div>
              </div>
            </div>
            <div className="text-2xl font-bold mb-2">
              ${Math.abs(remainingBalance).toLocaleString()}
              {!isBalancePositive && " (Over)"}
            </div>
            <div className="text-xs opacity-75">
              {isBalancePositive 
                ? `${((remainingBalance / monthlyIncome) * 100).toFixed(1)}% of income`
                : 'Exceeds monthly budget'
              }
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Utilization */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Utilization</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Total Outflow</span>
                  <span className="font-semibold">{outflowPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      outflowPercentage > 90 ? 'bg-red-500' : 
                      outflowPercentage > 75 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(outflowPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ${totalOutflow.toLocaleString()} of ${monthlyIncome.toLocaleString()}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Savings Rate</span>
                  <span className="font-semibold">{savingsPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(savingsPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ${totalSavings.toLocaleString()} of ${monthlyIncome.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">After Expenses</span>
                <span className={`font-semibold ${afterExpensesBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${afterExpensesBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">After Subscriptions</span>
                <span className={`font-semibold ${afterSubscriptionsBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${afterSubscriptionsBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Available for Savings</span>
                <span className="font-semibold text-blue-600">
                  ${Math.max(0, remainingBalance).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
