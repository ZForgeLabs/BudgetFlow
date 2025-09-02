"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpgradePromptProps {
	feature: 'expenses' | 'subscriptions' | 'savingsBins' | 'graphs';
	currentCount?: number;
	limit?: number;
	className?: string;
}

export function UpgradePrompt({ feature, currentCount, limit, className = '' }: UpgradePromptProps) {
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
			icon: ''
		},
		graphs: {
			title: 'Graphs & Analytics',
			description: 'Upgrade to Pro to unlock advanced charts, spending insights, and financial analytics.',
			icon: '📈'
		}
	};

	const info = featureInfo[feature];

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
			</CardContent>
		</Card>
	);
}