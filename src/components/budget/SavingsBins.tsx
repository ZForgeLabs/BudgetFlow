"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Target, Settings2, PiggyBank, Calendar, DollarSign } from "lucide-react";

interface SavingsBin {
  id: string;
  name: string;
  currentAmount: number;
  goalAmount: number;
  monthlyAllocation: number;
  scheduledFrequency?: "weekly" | "semi-weekly" | "monthly" | "custom" | null;
  customMonth?: number | null; // 1-12
  customDay?: number | null; // 1-31
  nextTransferDate?: string | null;
}

interface SavingsBinsProps {
  savingsBins?: SavingsBin[];
  availableAmount?: number;
  onBinsChange?: (bins: SavingsBin[]) => void;
}

const frequencyOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "semi-weekly", label: "Semi-Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom Time" },
];

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function getLastDayOfMonth(year: number, monthIndexZeroBased: number) {
  return new Date(year, monthIndexZeroBased + 1, 0).getDate();
}

function normalizeDay(year: number, monthIndexZeroBased: number, day: number) {
  const last = getLastDayOfMonth(year, monthIndexZeroBased);
  return Math.min(day, last);
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function addMonths(base: Date, months: number) {
  const d = new Date(base);
  const targetMonth = d.getMonth() + months;
  const year = d.getFullYear() + Math.floor(targetMonth / 12);
  const month = ((targetMonth % 12) + 12) % 12;
  const day = Math.min(d.getDate(), getLastDayOfMonth(year, month));
  return new Date(year, month, day);
}

function computeNextTransferDate(
  frequency: SavingsBin["scheduledFrequency"],
  customMonth: number | null,
  customDay: number | null,
): string | null {
  const now = new Date();
  if (!frequency) return null;

  if (frequency === "weekly") {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return formatDate(d);
  }
  if (frequency === "semi-weekly") {
    const d = new Date(now);
    d.setDate(d.getDate() + 3);
    return formatDate(d);
  }
  if (frequency === "monthly") {
    // Next transfer is one month from now on today's day-of-month (clamped)
    const next = addMonths(now, 1);
    return formatDate(next);
  }
  // custom
  const monthIdx = customMonth ? customMonth - 1 : null;
  const dom = customDay ?? 1;
  if (monthIdx === null || dom <= 0) return null;
  const y = now.getFullYear();
  const candidate = new Date(y, monthIdx, normalizeDay(y, monthIdx, dom));
  if (candidate <= now) {
    const nextYear = y + 1;
    return formatDate(new Date(nextYear, monthIdx, normalizeDay(nextYear, monthIdx, dom)));
  }
  return formatDate(candidate);
}

const SavingsBins = ({
  savingsBins = [
    {
      id: "1",
      name: "Emergency Fund",
      currentAmount: 2500,
      goalAmount: 10000,
      monthlyAllocation: 500,
      scheduledFrequency: null,
      customMonth: null,
      customDay: null,
      nextTransferDate: null,
    },
    {
      id: "2",
      name: "Vacation",
      currentAmount: 800,
      goalAmount: 3000,
      monthlyAllocation: 300,
      scheduledFrequency: null,
      customMonth: null,
      customDay: null,
      nextTransferDate: null,
    },
    {
      id: "3",
      name: "Retirement",
      currentAmount: 15000,
      goalAmount: 50000,
      monthlyAllocation: 800,
      scheduledFrequency: null,
      customMonth: null,
      customDay: null,
      nextTransferDate: null,
    },
  ],
  availableAmount = 1600,
  onBinsChange = () => {},
}: SavingsBinsProps) => {
  const { toast } = useToast();
  const [bins, setBins] = useState<SavingsBin[]>(savingsBins);
  const [newBinName, setNewBinName] = useState("");
  const [newBinGoal, setNewBinGoal] = useState("");

  // Update internal state when props change
  useEffect(() => {
    setBins(savingsBins);
  }, [savingsBins]);

  // UI state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [savedInputs, setSavedInputs] = useState<Record<string, string>>({});

  const totalAllocated = useMemo(
    () => bins.reduce((sum, bin) => sum + bin.monthlyAllocation, 0),
    [bins],
  );
  const remainingAmount = availableAmount - totalAllocated;

  const addBin = async () => {
    if (newBinName.trim() && newBinGoal) {
      const newBin: SavingsBin = {
        id: Date.now().toString(),
        name: newBinName.trim(),
        currentAmount: 0,
        goalAmount: parseFloat(newBinGoal) || 0,
        monthlyAllocation: 0,
        scheduledFrequency: null,
        customMonth: null,
        customDay: null,
        nextTransferDate: null,
      };
      const updatedBins = [...bins, newBin];
      setBins(updatedBins);
      onBinsChange(updatedBins);
      try {
        const res = await fetch("/api/bins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newBin.name, goalAmount: newBin.goalAmount }),
        });
        const data = await res.json();
        if (res.ok && data?.id) {
          setBins((prev) => prev.map((b) => (b === newBin ? { ...b, id: data.id } : b)));
          onBinsChange(updatedBins);
        }
      } catch (e) {}
      setNewBinName("");
      setNewBinGoal("");
    }
  };

  const removeBin = async (id: string) => {
    const updatedBins = bins.filter((bin) => bin.id !== id);
    setBins(updatedBins);
    onBinsChange(updatedBins);
    try { await fetch(`/api/bins?id=${id}`, { method: "DELETE" }); } catch (e) {}
  };

  const updateBinAllocation = async (id: string, allocation: number) => {
    console.log('Updating bin allocation:', { id, allocation });
    const updatedBins = bins.map((bin) =>
      bin.id === id ? { ...bin, monthlyAllocation: allocation } : bin,
    );
    setBins(updatedBins);
    onBinsChange(updatedBins);
    try {
      const response = await fetch("/api/bins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, monthlyAllocation: allocation }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to update allocation:', errorData);
        toast({ title: "Failed to save allocation", description: "Please try again" });
      } else {
        console.log('Allocation updated successfully');
      }
    } catch (e) {
      console.error('Error updating allocation:', e);
      toast({ title: "Failed to save allocation", description: "Please try again" });
    }
  };

  const addToSavedAmount = async (id: string) => {
    const raw = savedInputs[id] ?? "";
    const delta = parseFloat(raw) || 0;
    if (delta <= 0) {
      toast({ title: "Enter a positive amount" });
      return;
    }
    
    const bin = bins.find((b) => b.id === id);
    if (!bin) {
      toast({ title: "Bin not found" });
      return;
    }
    
    const newAmount = bin.currentAmount + delta;
    
    // Update local state immediately for better UX
    const updatedBins = bins.map((bin) =>
      bin.id === id ? { ...bin, currentAmount: newAmount } : bin,
    );
    setBins(updatedBins);
    onBinsChange(updatedBins);
    setSavedInputs((prev) => ({ ...prev, [id]: "" }));
    
    // Update in database
    try {
      const res = await fetch("/api/bins", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, currentAmount: newAmount }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to update saved amount:', errorText);
        toast({ title: "Failed to save amount", description: "Please try again" });
      } else {
        toast({ title: "Transfer successful", description: "Saved amount updated" });
      }
    } catch (e) {
      console.error('Error updating saved amount:', e);
      toast({ title: "Failed to save amount", description: "Please try again" });
    }
  };

  const updateBinScheduleLocal = (
    id: string,
    frequency: SavingsBin["scheduledFrequency"],
    customMonth: number | null,
    customDay: number | null,
  ) => {
    const updatedBins = bins.map((bin) => {
      if (bin.id !== id) return bin;
      const next = computeNextTransferDate(frequency, customMonth, customDay);
      return { ...bin, scheduledFrequency: frequency, customMonth, customDay, nextTransferDate: next };
    });
    setBins(updatedBins);
    onBinsChange(updatedBins);
  };

  const submitSchedule = async (
    id: string,
    frequency: SavingsBin["scheduledFrequency"],
    customMonth: number | null,
    customDay: number | null,
  ) => {
    console.log('Submitting schedule:', { id, frequency, customMonth, customDay });
    
    if (!frequency) {
      toast({ title: "Select a frequency" });
      return;
    }
    if (frequency === "custom" && (!customMonth || !customDay)) {
      toast({ title: "Select month and day for custom time" });
      return;
    }
    
    try {
      const bin = bins.find((b) => b.id === id);
      console.log('Found bin for schedule:', bin);
      
      if (!bin) {
        toast({ title: "Bin not found" });
        return;
      }
      
      const scheduleData = {
        binId: id,
        name: bin.name,
        frequency,
        customMonth,
        customDay,
        monthlyAllocation: bin.monthlyAllocation ?? 0,
      };
      
      console.log('Sending schedule data:', scheduleData);
      
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleData),
      });
      
      console.log('Schedule response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Schedule save failed:', errorText);
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }
      
      const responseData = await res.json();
      console.log('Schedule save response:', responseData);
      
      const next = computeNextTransferDate(frequency, customMonth, customDay);
      updateBinScheduleLocal(id, frequency, customMonth, customDay);
      
      // Show transfer amount information
      let transferAmount = 0;
      switch (frequency) {
        case 'weekly':
          transferAmount = (bin.monthlyAllocation ?? 0) / 4;
          break;
        case 'semi-weekly':
          transferAmount = (bin.monthlyAllocation ?? 0) / 2;
          break;
        case 'monthly':
        case 'custom':
          transferAmount = bin.monthlyAllocation ?? 0;
          break;
      }
      
      // Format the success message
      let successMessage = `$${transferAmount.toFixed(2)} will be transferred ${frequency}`;
      
      if (frequency === 'custom' && customMonth && customDay) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthName = monthNames[customMonth - 1];
        const currentYear = new Date().getFullYear();
        const nextYear = customMonth < new Date().getMonth() + 1 ? currentYear + 1 : currentYear;
        successMessage = `$${transferAmount.toFixed(2)} will be transferred ${monthName} ${customDay}, ${nextYear}`;
      } else if (next) {
        successMessage += ` starting ${next}`;
      }
      
      toast({ 
        title: "Transfer scheduled", 
        description: successMessage
      });
    } catch (e) {
      console.error('Error saving schedule:', e);
      toast({ title: "Failed to save schedule", description: e instanceof Error ? e.message : "Please try again" });
    }
  };

  const cancelSchedule = async (binId: string) => {
    try {
      const res = await fetch(`/api/schedules?binId=${binId}`, {
        method: "DELETE",
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Request failed: ${res.status} - ${errorText}`);
      }
      
      // Update local state to remove the schedule
      const updatedBins = bins.map((b) =>
        b.id === binId 
          ? { 
              ...b, 
              scheduledFrequency: null, 
              customMonth: null, 
              customDay: null, 
              nextTransferDate: null 
            } 
          : b
      );
      setBins(updatedBins);
      onBinsChange(updatedBins);
      
      toast({ 
        title: "Schedule cancelled", 
        description: "The scheduled transfer has been cancelled" 
      });
    } catch (e) {
      console.error('Error cancelling schedule:', e);
      toast({ 
        title: "Failed to cancel schedule", 
        description: e instanceof Error ? e.message : "Please try again" 
      });
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  };

  const getAllocationPercentage = (allocation: number) => {
    const baseline = totalAllocated > availableAmount ? totalAllocated : availableAmount;
    if (baseline <= 0) return 0;
    const pct = (allocation / baseline) * 100;
    return Math.max(0, Math.min(pct, 100));
  };

  const getAllocationTitle = (frequency: SavingsBin["scheduledFrequency"]) => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly allocation';
      case 'semi-weekly':
        return 'Semi-weekly allocation';
      case 'monthly':
        return 'Monthly allocation';
      case 'custom':
        return 'Custom allocation';
      default:
        return 'Monthly allocation';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Savings & Investment Bins</h3>
            <p className="text-blue-100">Organize your savings goals</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-blue-100">Available to allocate:</div>
          <div className="text-2xl font-bold">${remainingAmount.toLocaleString()}</div>
          {remainingAmount < 0 && (
            <div className="text-red-200 text-sm mt-1">
              Over-allocated by ${Math.abs(remainingAmount).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Existing Bins */}
        <div className="space-y-4">
          {bins.map((bin) => {
            const goalPct = getProgressPercentage(
              bin.currentAmount,
              bin.goalAmount,
            );
            const allocationPct = getAllocationPercentage(bin.monthlyAllocation);
            const scheduledFrequencyValue = bin.scheduledFrequency ?? "none";
            const isOpen = expanded[bin.id] ?? false;
            return (
              <div key={bin.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-4 border border-white/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-lg">{bin.name}</h3>
                    <div className="text-blue-100 text-sm">
                      ${bin.currentAmount.toLocaleString()} saved · Goal ${bin.goalAmount.toLocaleString()}
                    </div>
                    {bin.nextTransferDate && (
                      <div className="text-xs text-blue-200 mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Next transfer on {bin.nextTransferDate}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpanded((prev) => ({ ...prev, [bin.id]: !isOpen }))}
                      className="border-white/30 text-black bg-white/90 hover:bg-white"
                    >
                      <Settings2 className="h-4 w-4 mr-1" /> {isOpen ? "Hide" : "Manage"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeBin(bin.id)}
                      className="border-white/30 text-black bg-white/90 hover:bg-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-blue-100">
                    <span>Goal progress</span>
                    <span>{goalPct.toFixed(1)}%</span>
                  </div>
                  <Progress value={goalPct} className="h-2" indicatorClassName="bg-green-500" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-blue-100">
                    <span>{getAllocationTitle(bin.scheduledFrequency)}</span>
                    <span>${bin.monthlyAllocation.toLocaleString()}</span>
                  </div>
                  <Progress value={allocationPct} className="h-2" indicatorClassName="bg-yellow-500" />
                </div>

                {isOpen && (
                  <div className="pt-2 border-t border-white/20 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-blue-100">Add to saved amount</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="e.g. 50"
                            value={savedInputs[bin.id] ?? ""}
                            onChange={(e) =>
                              setSavedInputs((prev) => ({ ...prev, [bin.id]: e.target.value }))
                            }
                            className="bg-white/90 text-gray-900 placeholder-gray-600 border-white/30"
                          />
                          <Button onClick={() => addToSavedAmount(bin.id)} className="bg-white text-blue-600 hover:bg-blue-50">Save</Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-blue-100">Monthly allocation</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={bin.monthlyAllocation.toString()}
                          onChange={(e) =>
                            updateBinAllocation(
                              bin.id,
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="bg-white/90 text-gray-900 placeholder-gray-600 border-white/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-white">Scheduled transfer</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-blue-100">Frequency</Label>
                            <div className="space-y-2">
                              <div className="flex flex-col space-y-1">
                                {frequencyOptions.map((f) => (
                                  <button
                                    key={f.value}
                                    type="button"
                                    className={`px-3 py-2 text-sm rounded-md transition-colors text-left ${bin.scheduledFrequency === f.value ? "bg-white text-blue-600" : "text-white hover:bg-white/20 border border-white/30"}`}
                                    onClick={() =>
                                      updateBinScheduleLocal(
                                        bin.id,
                                        f.value as SavingsBin["scheduledFrequency"],
                                        bin.customMonth ?? null,
                                        bin.customDay ?? null,
                                      )
                                    }
                                  >
                                    {f.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          {bin.scheduledFrequency === "custom" && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-sm text-blue-100">Month</Label>
                                <Select
                                  value={bin.customMonth ? String(bin.customMonth) : "none"}
                                  onValueChange={(val) =>
                                    updateBinScheduleLocal(
                                      bin.id,
                                      bin.scheduledFrequency ?? null,
                                      val === "none" ? null : parseInt(val, 10),
                                      bin.customDay ?? null,
                                    )
                                  }
                                >
                                  <SelectTrigger className="bg-white/90 text-gray-900 border-white/30">
                                    <SelectValue placeholder="Select month" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {monthOptions.map((m) => (
                                      <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-blue-100">Day</Label>
                                <Select
                                  value={bin.customDay ? String(bin.customDay) : "none"}
                                  onValueChange={(val) =>
                                    updateBinScheduleLocal(
                                      bin.id,
                                      bin.scheduledFrequency ?? null,
                                      bin.customMonth ?? null,
                                      val === "none" ? null : parseInt(val, 10),
                                    )
                                  }
                                >
                                  <SelectTrigger className="bg-white/90 text-gray-900 border-white/30">
                                    <SelectValue placeholder="Select day" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                                      <SelectItem key={d} value={String(d)}>
                                        {d}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="mt-4">
                          <Button
                            className="w-full bg-white text-blue-600 hover:bg-blue-50"
                            onClick={() =>
                              submitSchedule(
                                bin.id,
                                bin.scheduledFrequency ?? null,
                                bin.customMonth ?? null,
                                bin.customDay ?? null,
                              )
                            }
                          >
                            Save Schedule
                          </Button>
                        </div>
                        {bin.scheduledFrequency && (
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10 mt-4">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-blue-100">
                                <div className="font-medium mb-1">Current Schedule:</div>
                                <div>
                                  {frequencyOptions.find(f => f.value === bin.scheduledFrequency)?.label}
                                  {bin.scheduledFrequency === "custom" && bin.customMonth && bin.customDay
                                    ? ` on ${monthOptions.find(m => Number(m.value) === bin.customMonth)?.label} ${bin.customDay}`
                                    : ""}
                                </div>
                                {bin.nextTransferDate && (
                                  <div className="text-xs text-blue-200 mt-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Next transfer: {bin.nextTransferDate}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelSchedule(bin.id)}
                                className="border-red-300 text-red-300 hover:bg-red-500 hover:text-white transition-colors"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Bin */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h4 className="font-medium text-white mb-3 text-lg">
            Add New Savings Bin
          </h4>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="new-bin-name" className="text-sm text-blue-100">
                Bin Name
              </Label>
              <Input
                id="new-bin-name"
                placeholder="e.g., Car Fund, Wedding"
                value={newBinName}
                onChange={(e) => setNewBinName(e.target.value)}
                className="bg-white/90 text-gray-900 placeholder-gray-600 border-white/30"
              />
            </div>
            <div className="w-32">
              <Label htmlFor="new-bin-goal" className="text-sm text-blue-100">
                Goal Amount
              </Label>
              <Input
                id="new-bin-goal"
                type="number"
                placeholder="5000"
                value={newBinGoal}
                onChange={(e) => setNewBinGoal(e.target.value)}
                className="bg-white/90 text-gray-900 placeholder-gray-600 border-white/30"
              />
            </div>
            <Button onClick={addBin} className="flex-shrink-0 bg-white text-blue-600 hover:bg-blue-50 font-semibold">
              <Plus className="h-4 w-4 mr-1" />
              Add Bin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingsBins;
