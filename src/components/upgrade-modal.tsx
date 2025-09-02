"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Lock, CheckCircle } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureType: 'expenses' | 'subscriptions' | 'savings' | 'graphs';
}

export function UpgradeModal({ isOpen, onClose, featureType }: UpgradeModalProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const getFeatureName = () => {
    switch (featureType) {
      case 'expenses': return 'expenses';
      case 'subscriptions': return 'subscriptions';
      case 'savings': return 'savings goals';
      case 'graphs': return 'visual graphs';
      default: return 'features';
    }
  };

  const getLimitText = () => {
    switch (featureType) {
      case 'expenses': return '5 expenses';
      case 'subscriptions': return '5 subscriptions';
      case 'savings': return '5 savings goals';
      case 'graphs': return 'graphs';
      default: return 'features';
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // TODO: Implement Stripe checkout
      console.log('Upgrade to Pro clicked for:', featureType);
      // For now, just close the modal
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-blue-100">
              <Crown className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            You've reached your limit of {getLimitText()}. Unlock unlimited access to all features!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pro Features List */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Pro Features Include:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unlimited expenses</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unlimited subscriptions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unlimited savings goals</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Advanced visual graphs</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">$9.99</div>
            <div className="text-sm text-gray-600">per month</div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
            >
              {isUpgrading ? 'Upgrading...' : 'Upgrade to Pro'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center text-xs text-gray-500">
            <p>✓ Cancel anytime • ✓ 7-day free trial • ✓ Secure payment</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
