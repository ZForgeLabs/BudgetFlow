"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionCardProps {
  id: string;
  description: string;
  amount: number;
  category: "Fixed" | "Variable" | "Goals";
  date: string;
  notes?: string;
  onDelete?: (id: string) => void;
}

const TransactionCard = ({
  id = "1",
  description = "Grocery Shopping",
  amount = 85.75,
  category = "Variable",
  date = "2023-05-15",
  notes = "",
  onDelete,
}: TransactionCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Fixed":
        return "bg-gradient-to-r from-electric-100 to-electric-200 text-electric-800 hover:from-electric-200 hover:to-electric-300 border border-electric-300 shadow-sm";
      case "Variable":
        return "bg-gradient-to-r from-energy-100 to-energy-200 text-energy-800 hover:from-energy-200 hover:to-energy-300 border border-energy-300 shadow-sm";
      case "Goals":
        return "bg-gradient-to-r from-vibrant-100 to-vibrant-200 text-vibrant-800 hover:from-vibrant-200 hover:to-vibrant-300 border border-vibrant-300 shadow-sm";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 border border-gray-300 shadow-sm";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="w-full mb-3 bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:shadow-lg hover:shadow-electric-500/20 transition-all duration-300 hover:scale-[1.02] hover:border-electric-300">
      <CardContent className="p-0">
        <div
          className="flex items-center justify-between p-4 cursor-pointer group"
          onClick={toggleExpand}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {expanded ? (
                <ChevronUp className="h-5 w-5 text-electric-600 group-hover:text-electric-700 transition-colors duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-electric-600 group-hover:text-electric-700 transition-colors duration-200" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-electric-800 transition-colors duration-200">
                {description}
              </h3>
              <p className="text-sm text-gray-500 group-hover:text-electric-600 transition-colors duration-200">
                {formatDate(date)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge
              className={cn(
                getCategoryColor(category),
                "font-medium px-3 py-1 rounded-full transition-all duration-200",
              )}
            >
              {category}
            </Badge>
            <span
              className={cn(
                "font-bold text-lg transition-all duration-200",
                amount < 0
                  ? "text-red-600 group-hover:text-red-700"
                  : "text-emerald-600 group-hover:text-emerald-700",
              )}
            >
              {formatCurrency(amount)}
            </span>
          </div>
        </div>

        {expanded && (
          <div className="px-4 pb-4 pt-0 border-t border-gradient-to-r from-electric-200 to-vibrant-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="mt-3 text-sm text-gray-600">
              {notes ? (
                <div className="p-3 bg-gradient-to-r from-electric-50 to-vibrant-50 rounded-lg border border-electric-200">
                  <p className="font-semibold mb-1 text-electric-800">Notes:</p>
                  <p className="text-gray-700">{notes}</p>
                </div>
              ) : (
                <p className="text-gray-400 italic p-3 bg-gray-50 rounded-lg border border-gray-200">
                  No additional notes
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="flex items-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-200 transform hover:scale-105"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
