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
			icon: '��'
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
		<Card className={`border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-lg hover:shadow-xl transition-all duration-300 max-w-md mx-auto ${className}`}>
			<CardHeader className="text-center pb-4">
				<div className="flex justify-center mb-3">
					<div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border border-blue-200/50">
						<span className="text-2xl">{info.icon}</span>
					</div>
				</div>
				<CardTitle className="text-xl font-semibold text-gray-800 mb-2">{info.title}</CardTitle>
				<CardDescription className="text-sm text-gray-600 leading-relaxed">
					{info.description}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{currentCount !== undefined && limit !== undefined && (
					<div className="text-center">
						<Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700 px-3 py-1 text-sm font-medium">
							{currentCount} of {limit} used
						</Badge>
					</div>
				)}
				
				<div className="space-y-3 bg-white/60 rounded-lg p-4 border border-blue-100/50">
					<div className="flex items-center gap-3 text-sm text-gray-700">
						<div className="p-1.5 rounded-full bg-green-100">
							<CheckCircle className="h-3.5 w-3.5 text-green-600" />
						</div>
						<span className="font-medium">Unlimited {feature === 'expenses' ? 'expenses' : feature === 'subscriptions' ? 'subscriptions' : 'savings goals'}</span>
					</div>
					<div className="flex items-center gap-3 text-sm text-gray-700">
						<div className="p-1.5 rounded-full bg-green-100">
							<CheckCircle className="h-3.5 w-3.5 text-green-600" />
						</div>
						<span className="font-medium">Advanced graphs & analytics</span>
					</div>
					<div className="flex items-center gap-3 text-sm text-gray-700">
						<div className="p-1.5 rounded-full bg-green-100">
							<CheckCircle className="h-3.5 w-3.5 text-green-600" />
						</div>
						<span className="font-medium">Priority support</span>
					</div>
				</div>

				<div className="text-center">
					<Button 
						onClick={handleUpgrade}
						disabled={isUpgrading}
						className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
					>
						{isUpgrading ? (
							<>
								<Zap className="h-4 w-4 mr-2 animate-pulse" />
								Upgrading...
							</>
						) : (
							<>
								<Crown className="h-4 w-4 mr-2" />
								Upgrade to Pro - $9.99/month
							</>
						)}
					</Button>
				</div>

				<div className="text-center text-xs text-gray-500 bg-white/40 rounded-lg py-2">
					✨ Cancel anytime • No setup fees
				</div>
			</CardContent>
		</Card>
	);
}