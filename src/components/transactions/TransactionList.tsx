"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Filter, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import TransactionCard from "./TransactionCard";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: "Fixed" | "Variable" | "Goals";
  date: Date;
  notes?: string;
}

interface TransactionListProps {
  transactions?: Transaction[];
}

const TransactionList = ({ transactions = [] }: TransactionListProps) => {
  // Default transactions for demo purposes
  const defaultTransactions: Transaction[] = [
    {
      id: "1",
      description: "Rent payment",
      amount: 1200,
      category: "Fixed",
      date: new Date(2023, 5, 1),
      notes: "Monthly apartment rent",
    },
    {
      id: "2",
      description: "Grocery shopping",
      amount: 85.75,
      category: "Variable",
      date: new Date(2023, 5, 3),
      notes: "Weekly groceries",
    },
    {
      id: "3",
      description: "Savings contribution",
      amount: 300,
      category: "Goals",
      date: new Date(2023, 5, 5),
      notes: "Emergency fund contribution",
    },
    {
      id: "4",
      description: "Internet bill",
      amount: 65,
      category: "Fixed",
      date: new Date(2023, 5, 7),
      notes: "Monthly internet service",
    },
    {
      id: "5",
      description: "Restaurant dinner",
      amount: 42.5,
      category: "Variable",
      date: new Date(2023, 5, 10),
      notes: "Dinner with friends",
    },
  ];

  const allTransactions =
    transactions.length > 0 ? transactions : defaultTransactions;

  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  // Sort transactions
  const sortedTransactions = [...allTransactions].sort((a, b) => {
    if (sortBy === "date") {
      return sortDirection === "asc"
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime();
    } else if (sortBy === "amount") {
      return sortDirection === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    } else if (sortBy === "category") {
      return sortDirection === "asc"
        ? a.category.localeCompare(b.category)
        : b.category.localeCompare(a.category);
    }
    return 0;
  });

  // Filter transactions
  const filteredTransactions = sortedTransactions.filter((transaction) => {
    // Filter by category
    if (filterCategory && transaction.category !== filterCategory) {
      return false;
    }

    // Filter by date range
    if (filterDateRange.from && transaction.date < filterDateRange.from) {
      return false;
    }
    if (filterDateRange.to && transaction.date > filterDateRange.to) {
      return false;
    }

    return true;
  });

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const clearFilters = () => {
    setFilterCategory(null);
    setFilterDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="w-full bg-gradient-to-br from-white via-gray-50 to-electric-50 rounded-xl p-6 shadow-lg border border-electric-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-electric-600 to-vibrant-600 bg-clip-text text-transparent mb-4 md:mb-0">
          ✨ Transactions
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as "date" | "amount" | "category")
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={toggleSortDirection}>
              <SortDesc
                className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`}
              />
            </Button>
          </div>

          {/* Filter Controls */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Transactions</h4>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Category</h5>
                  <Select
                    value={filterCategory || ""}
                    onValueChange={(value) => setFilterCategory(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="Fixed">Fixed</SelectItem>
                      <SelectItem value="Variable">Variable</SelectItem>
                      <SelectItem value="Goals">Goals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Date Range</h5>
                  <Calendar
                    mode="range"
                    selected={{
                      from: filterDateRange.from,
                      to: filterDateRange.to,
                    }}
                    onSelect={(range) =>
                      setFilterDateRange({
                        from: range?.from,
                        to: range?.to,
                      })
                    }
                    className="rounded-md border"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-gray-500">No transactions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              id={transaction.id}
              description={transaction.description}
              amount={transaction.amount}
              category={transaction.category}
              date={transaction.date.toISOString().split("T")[0]}
              notes={transaction.notes}
            />
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredTransactions.length} of {allTransactions.length}{" "}
        transactions
      </div>
    </div>
  );
};

export default TransactionList;
