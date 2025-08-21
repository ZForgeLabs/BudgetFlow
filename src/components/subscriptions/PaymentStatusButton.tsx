"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, Calendar, RotateCcw } from "lucide-react";

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
  const [isUndoing, setIsUndoing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if payment is due (next billing date is today or in the past)
  const isPaymentDue = () => {
    const billingDate = new Date(nextBillingDate);
    return billingDate <= currentTime;
  };

  // Check if payment is overdue (more than 7 days past due)
  const isOverdue = () => {
    const billingDate = new Date(nextBillingDate);
    const daysDiff = Math.floor((currentTime.getTime() - billingDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 7;
  };

  // Check if recently paid (within last 30 days)
  const isRecentlyPaid = () => {
    if (!lastPaidDate) return false;
    const paidDate = new Date(lastPaidDate);
    const daysDiff = Math.floor((currentTime.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30 && !isPaymentDue();
  };

  // Set up automatic timer to check payment status
  useEffect(() => {
    // Update time every minute to check for date changes
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Initial update
    updateTime();

    // Set up interval to check every minute
    intervalRef.current = setInterval(updateTime, 60000); // 60 seconds

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Force refresh when payment status changes
  useEffect(() => {
    // If payment is now due and we were previously showing "Paid", refresh the data
    if (isPaymentDue() && isRecentlyPaid()) {
      onPaymentUpdate();
    }
  }, [currentTime, isPaymentDue, isRecentlyPaid, onPaymentUpdate]);

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

  const handleUndoPayment = async () => {
    // Simple confirmation dialog
    if (!confirm("Are you sure you want to undo the last payment? This will reset the billing date.")) {
      return;
    }
    
    setIsUndoing(true);
    try {
      const res = await fetch("/api/subscriptions/undo-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      });
      
      if (res.ok) {
        onPaymentUpdate();
      }
    } catch (error) {
      console.error("Error undoing payment:", error);
    } finally {
      setIsUndoing(false);
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
    <div className="flex items-center gap-2">
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
      
      {/* Undo button - only show when recently paid */}
      {isRecentlyPaid() && !isPaymentDue() && (
        <Button
          variant="outline"
          size="sm"
          disabled={isUndoing}
          onClick={handleUndoPayment}
          className="border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          {isUndoing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          <span className="ml-2">Undo</span>
        </Button>
      )}
      
      {isPaymentDue() && isRecentlyPaid() && (
        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
          Due
        </div>
      )}
    </div>
  );
}
