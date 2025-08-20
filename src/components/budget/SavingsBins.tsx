"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Target, Settings2 } from "lucide-react";

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

  // UI state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [savedInputs, setSavedInputs] = useState<Record<string, string>>({});

  const totalAllocated = useMemo(
    () => bins.reduce((sum, bin) => sum + bin.monthlyAllocation, 0),
    [bins],
  );
  const remainingAmount = availableAmount - totalAllocated;

  const addBin = () => {
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
      setNewBinName("");
      setNewBinGoal("");
    }
  };

  const removeBin = (id: string) => {
    const updatedBins = bins.filter((bin) => bin.id !== id);
    setBins(updatedBins);
    onBinsChange(updatedBins);
  };

  const updateBinAllocation = (id: string, allocation: number) => {
    const updatedBins = bins.map((bin) =>
      bin.id === id ? { ...bin, monthlyAllocation: allocation } : bin,
    );
    setBins(updatedBins);
    onBinsChange(updatedBins);
  };

  const addToSavedAmount = (id: string) => {
    const raw = savedInputs[id] ?? "";
    const delta = parseFloat(raw) || 0;
    if (delta <= 0) {
      toast({ title: "Enter a positive amount" });
      return;
    }
    const updatedBins = bins.map((bin) =>
      bin.id === id ? { ...bin, currentAmount: bin.currentAmount + delta } : bin,
    );
    setBins(updatedBins);
    onBinsChange(updatedBins);
    setSavedInputs((prev) => ({ ...prev, [id]: "" }));
    toast({ title: "Transfer successful", description: "Saved amount updated" });
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
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          binId: id,
          name: bin?.name,
          frequency,
          customMonth,
          customDay,
          monthlyAllocation: bin?.monthlyAllocation ?? 0,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const next = computeNextTransferDate(frequency, customMonth, customDay);
      updateBinScheduleLocal(id, frequency, customMonth, customDay);
      toast({ title: "Transfer scheduled", description: next ? `Next transfer on ${next}` : undefined });
    } catch (e) {
      toast({ title: "Failed to save schedule" });
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

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Savings & Investment Bins
        </CardTitle>
        <div className="text-sm text-gray-600">
          Available to allocate: {" "}
          <span className="font-semibold">
            ${remainingAmount.toLocaleString()}
          </span>
          {remainingAmount < 0 && (
            <span className="text-red-600 ml-2">
              (Over-allocated by ${Math.abs(remainingAmount).toLocaleString()})
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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
              <div key={bin.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900">{bin.name}</h3>
                    <div className="text-sm text-gray-600">
                      ${bin.currentAmount.toLocaleString()} saved · Goal ${bin.goalAmount.toLocaleString()}
                    </div>
                    {bin.nextTransferDate && (
                      <div className="text-xs text-blue-700 mt-1">
                        Next transfer on {bin.nextTransferDate}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpanded((prev) => ({ ...prev, [bin.id]: !isOpen }))}
                    >
                      <Settings2 className="h-4 w-4 mr-1" /> {isOpen ? "Hide" : "Manage"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeBin(bin.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Goal progress</span>
                    <span>{goalPct.toFixed(1)}%</span>
                  </div>
                  <Progress value={goalPct} className="h-2" indicatorClassName="bg-blue-500" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Monthly allocation</span>
                    <span>${bin.monthlyAllocation.toLocaleString()}</span>
                  </div>
                  <Progress value={allocationPct} className="h-2" indicatorClassName="bg-blue-500" />
                </div>

                {isOpen && (
                  <div className="pt-2 border-t space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Add to saved amount</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="e.g. 50"
                            value={savedInputs[bin.id] ?? ""}
                            onChange={(e) =>
                              setSavedInputs((prev) => ({ ...prev, [bin.id]: e.target.value }))
                            }
                          />
                          <Button onClick={() => addToSavedAmount(bin.id)} className="bg-blue-600 hover:bg-blue-700 text-white">Save</Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Monthly allocation</Label>
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
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900">Scheduled monthly transfer</div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">Frequency</Label>
                            <div className="inline-flex flex-wrap items-center gap-2">
                              <div className="flex rounded-full bg-gray-100 p-1">
                                <button
                                  type="button"
                                  className={`px-3 py-1 text-sm rounded-full transition-colors ${!bin.scheduledFrequency ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
                                  onClick={() =>
                                    updateBinScheduleLocal(
                                      bin.id,
                                      null,
                                      bin.customMonth ?? null,
                                      bin.customDay ?? null,
                                    )
                                  }
                                >
                                  None
                                </button>
                                {frequencyOptions.map((f) => (
                                  <button
                                    key={f.value}
                                    type="button"
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${bin.scheduledFrequency === f.value ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"}`}
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
                                <Label className="text-sm">Month</Label>
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
                                  <SelectTrigger>
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
                                <Label className="text-sm">Day</Label>
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
                                  <SelectTrigger>
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
                          <div className="flex items-end">
                            <Button
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
                        </div>
                        {bin.scheduledFrequency && (
                          <div className="text-xs text-gray-600">
                            Scheduled: {frequencyOptions.find(f => f.value === bin.scheduledFrequency)?.label}
                            {bin.scheduledFrequency === "custom" && bin.customMonth && bin.customDay
                              ? ` on ${monthOptions.find(m => Number(m.value) === bin.customMonth)?.label} ${bin.customDay}`
                              : ""}
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
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">
            Add New Savings Bin
          </h4>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="new-bin-name" className="text-sm">
                Bin Name
              </Label>
              <Input
                id="new-bin-name"
                placeholder="e.g., Car Fund, Wedding"
                value={newBinName}
                onChange={(e) => setNewBinName(e.target.value)}
              />
            </div>
            <div className="w-32">
              <Label htmlFor="new-bin-goal" className="text-sm">
                Goal Amount
              </Label>
              <Input
                id="new-bin-goal"
                type="number"
                placeholder="5000"
                value={newBinGoal}
                onChange={(e) => setNewBinGoal(e.target.value)}
              />
            </div>
            <Button onClick={addBin} className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-1" />
              Add Bin
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavingsBins;
