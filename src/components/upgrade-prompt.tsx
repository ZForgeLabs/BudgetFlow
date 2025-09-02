"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Zap, CheckCircle } from 'lucide-react';

interface UpgradePromptProps {
	feature: 'expenses' | 'subscriptions' | 'savingsBins' | 'graphs';
	currentCount?: number;
	limit?: number;
	onUpgrade: () => void;
	className?: string;
}

export function UpgradePrompt({ feature, currentCount, limit, onUpgrade, className = '' }: UpgradePromptProps) {
	const [isUpgrading, setIsUpgrading] = useState(false);

	const featureInfo = {
		expenses: {
			title: 'Expense Limit Reached',
			description: `You've reached your limit of ${limit} expenses. Upgrade to Pro for unlimited expense tracking.`,
			icon: '📊'
		},
		subscriptions: {
			title: 'Subscription Limit Reached',
			description: `You've reached your limit of ${limit} subscriptions. Upgrade to Pro for unlimited subscription tracking.`,
			icon: '🔄'
		},
		savingsBins: {
			title: 'Savings Goal Limit Reached',
			description: `You've reached your limit of ${limit} savings goals. Upgrade to Pro for unlimited goal tracking.`,
			icon: '🎯'
		},
		graphs: {
			title: 'Graphs & Analytics',
			description: 'Upgrade to Pro to unlock advanced charts, spending insights, and financial analytics.',
			icon: '📈'
		}
	};

	const info = featureInfo[feature];

	const handleUpgrade = async () => {
		setIsUpgrading(true);
		try {
			await onUpgrade();
		} finally {
			setIsUpgrading(false);
		}
	};

	return (
		<Card className={`border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 max-w-md mx-auto ${className}`}>
			<CardHeader className="text-center pb-3">
				<div className="flex justify-center mb-2">
					<span className="text-2xl">{info.icon}</span>
				</div>
				<CardTitle className="text-lg text-amber-800">{info.title}</CardTitle>
				<CardDescription className="text-sm text-amber-700">
					{info.description}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{currentCount !== undefined && limit !== undefined && (
					<div className="text-center">
						<Badge variant="secondary" className="text-sm">
							{currentCount} / {limit} used
						</Badge>
					</div>
				)}
				
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-xs text-amber-700">
						<CheckCircle className="h-3 w-3 text-green-600" />
						<span>Unlimited {feature === 'expenses' ? 'expenses' : feature === 'subscriptions' ? 'subscriptions' : 'savings goals'}</span>
					</div>
					<div className="flex items-center gap-2 text-xs text-amber-700">
						<CheckCircle className="h-3 w-3 text-green-600" />
						<span>Advanced graphs & analytics</span>
					</div>
					<div className="flex items-center gap-2 text-xs text-amber-700">
						<CheckCircle className="h-3 w-3 text-green-600" />
						<span>Priority support</span>
					</div>
				</div>

				<div className="text-center">
					<Button 
						onClick={handleUpgrade}
						disabled={isUpgrading}
						className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-4 py-2 text-sm"
					>
						{isUpgrading ? (
							<>
								<Zap className="h-3 w-3 mr-1 animate-pulse" />
								Upgrading...
							</>
						) : (
							<>
								<Crown className="h-3 w-3 mr-1" />
								Upgrade to Pro - $9.99/month
							</>
						)}
					</Button>
				</div>

				<div className="text-center text-xs text-amber-600">
					Cancel anytime • No setup fees
				</div>
			</CardContent>
		</Card>
	);
}
