"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, Target } from "lucide-react";

interface SavingsBin {
  id: string;
  name: string;
  currentAmount: number;
  goalAmount: number;
  monthlyAllocation: number;
}

interface SavingsBinsProps {
  savingsBins?: SavingsBin[];
  availableAmount?: number;
  onBinsChange?: (bins: SavingsBin[]) => void;
}

const SavingsBins = ({
  savingsBins = [
    {
      id: "1",
      name: "Emergency Fund",
      currentAmount: 2500,
      goalAmount: 10000,
      monthlyAllocation: 500,
    },
    {
      id: "2",
      name: "Vacation",
      currentAmount: 800,
      goalAmount: 3000,
      monthlyAllocation: 300,
    },
    {
      id: "3",
      name: "Retirement",
      currentAmount: 15000,
      goalAmount: 50000,
      monthlyAllocation: 800,
    },
  ],
  availableAmount = 1600,
  onBinsChange = () => {},
}: SavingsBinsProps) => {
  const [bins, setBins] = useState<SavingsBin[]>(savingsBins);
  const [newBinName, setNewBinName] = useState("");
  const [newBinGoal, setNewBinGoal] = useState("");

  const addBin = () => {
    if (newBinName.trim() && newBinGoal) {
      const newBin: SavingsBin = {
        id: Date.now().toString(),
        name: newBinName.trim(),
        currentAmount: 0,
        goalAmount: parseFloat(newBinGoal) || 0,
        monthlyAllocation: 0,
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
    const updatedBins = bins.map((bin) => {
      if (bin.id === id) {
        return { ...bin, monthlyAllocation: allocation };
      }
      return bin;
    });
    setBins(updatedBins);
    onBinsChange(updatedBins);
  };

  const totalAllocated = bins.reduce(
    (sum, bin) => sum + bin.monthlyAllocation,
    0,
  );
  const remainingAmount = availableAmount - totalAllocated;

  const getProgressPercentage = (current: number, goal: number) => {
    return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Savings & Investment Bins
        </CardTitle>
        <div className="text-sm text-gray-600">
          Available to allocate:{" "}
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
            const progressPercentage = getProgressPercentage(
              bin.currentAmount,
              bin.goalAmount,
            );
            return (
              <div key={bin.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{bin.name}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBin(bin.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${bin.currentAmount.toLocaleString()} saved</span>
                    <span>Goal: ${bin.goalAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {progressPercentage.toFixed(1)}% complete
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor={`allocation-${bin.id}`} className="text-sm">
                    Monthly allocation:
                  </Label>
                  <Input
                    id={`allocation-${bin.id}`}
                    type="number"
                    placeholder="0"
                    value={bin.monthlyAllocation.toString()}
                    onChange={(e) =>
                      updateBinAllocation(
                        bin.id,
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="w-24"
                  />
                </div>
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
            <Button onClick={addBin} className="flex-shrink-0">
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
