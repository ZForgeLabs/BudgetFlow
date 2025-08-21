"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Calendar } from "lucide-react";

interface PaymentStatusButtonProps {
  subscriptionId: string;
  nextBillingDate: string;
  lastPaidDate: string | null;
  onPaymentUpdate: () => void;
}

export default function PaymentStatusButton({
  subscriptionId,
  nextBillingDate,
  lastPaidDate,
  onPaymentUpdate,
}: PaymentStatusButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Check if payment is due (next billing date is today or in the past)
  const isPaymentDue = () => {
    const today = new Date();
    const billingDate = new Date(nextBillingDate);
    return billingDate <= today;
  };

  // Check if payment is overdue (more than 7 days past due)
  const isOverdue = () => {
    const today = new Date();
    const billingDate = new Date(nextBillingDate);
    const daysDiff = Math.floor((today.getTime() - billingDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 7;
  };

  // Check if recently paid (within last 30 days)
  const isRecentlyPaid = () => {
    if (!lastPaidDate) return false;
    const today = new Date();
    const paidDate = new Date(lastPaidDate);
    const daysDiff = Math.floor((today.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30 && !isPaymentDue();
  };

  const handleMarkAsPaid = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/subscriptions/update-billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      
      if (res.ok) {
        setIsPaid(true);
        onPaymentUpdate();
        
        // Reset the paid state after 3 seconds to show the check mark
        setTimeout(() => {
          setIsPaid(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button state and styling
  const getButtonState = () => {
    if (isPaid) {
      return {
        text: "Paid!",
        variant: "default" as const,
        icon: <Check className="h-4 w-4" />,
        className: "bg-green-500 hover:bg-green-600 text-white",
      };
    }

    if (isRecentlyPaid()) {
      return {
        text: "Paid",
        variant: "outline" as const,
        icon: <Check className="h-4 w-4 text-green-600" />,
        className: "border-green-500 text-green-600 hover:bg-green-50",
      };
    }

    if (isOverdue()) {
      return {
        text: "Overdue",
        variant: "destructive" as const,
        icon: <Calendar className="h-4 w-4" />,
        className: "bg-red-500 hover:bg-red-600 text-white",
      };
    }

    if (isPaymentDue()) {
      return {
        text: "Due Today",
        variant: "default" as const,
        icon: <Calendar className="h-4 w-4" />,
        className: "bg-orange-500 hover:bg-orange-600 text-white",
      };
    }

    return {
      text: "Mark as Paid",
      variant: "outline" as const,
      icon: <Calendar className="h-4 w-4" />,
      className: "border-gray-300 text-gray-700 hover:bg-gray-50",
    };
  };

  const buttonState = getButtonState();

  return (
    <Button
      variant={buttonState.variant}
      size="sm"
      disabled={isLoading || isRecentlyPaid()}
      onClick={handleMarkAsPaid}
      className={buttonState.className}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        buttonState.icon
      )}
      <span className="ml-2">{buttonState.text}</span>
    </Button>
  );
}
