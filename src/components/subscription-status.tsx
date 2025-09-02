"use client";

import { useEffect } from 'react';
import { useFeatureLimits } from '@/contexts/FeatureLimitsContext';
import { useStripe } from '@/hooks/useStripe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Lock, CheckCircle, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function SubscriptionStatus() {
	const { 
		featureLimits, 
		loading, 
		error, 
		isPro, 
		subscriptionStatus,
		refreshLimits
	} = useFeatureLimits();

	const { createCheckoutSession, createPortalSession, loading: stripeLoading } = useStripe();
	const { toast } = useToast();

	// Auto-refresh every 5 seconds to keep counts in sync
	// useEffect(() => {
	// 	const interval = setInterval(() => {
	// 		refreshLimits();
	// 	}, 5000);

	// 	return () => clearInterval(interval);
	// }, [refreshLimits]);

	const handleUpgrade = async () => {
		try {
			await createCheckoutSession();
		} catch (error) {
			toast({
				title: "Upgrade failed",
				description: "Please try again or contact support.",
				variant: "destructive",
			});
		}
	};

	const handleManageSubscription = async () => {
		try {
			await createPortalSession();
		} catch (error) {
			toast({
				title: "Failed to open billing portal",
				description: "Please try again or contact support.",
				variant: "destructive",
			});
		}
	};

	if (loading) {
		return (
			<Card className="animate-pulse">
				<CardHeader>
					<div className="h-4 bg-gray-200 rounded w-1/3"></div>
					<div className="h-3 bg-gray-200 rounded w-1/2"></div>
				</CardHeader>
				<CardContent>
					<div className="h-20 bg-gray-200 rounded"></div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className="border-red-200 bg-red-50">
				<CardContent className="pt-6">
					<p className="text-red-600 text-center">Error loading subscription status</p>
				</CardContent>
			</Card>
		);
	}

	if (!featureLimits) {
		return null;
	}



	if (isPro) {
		return (
			<Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
				<CardHeader className="text-center pb-4">
					<div className="flex justify-center mb-2">
						<Crown className="h-8 w-8 text-green-600" />
					</div>
					<CardTitle className="text-xl text-green-800">Pro Plan Active</CardTitle>
					<CardDescription className="text-green-700">
						You have access to all premium features
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div className="flex items-center gap-2 text-green-700">
							<CheckCircle className="h-4 w-4" />
							<span>Unlimited expenses</span>
						</div>
						<div className="flex items-center gap-2 text-green-700">
							<CheckCircle className="h-4 w-4" />
							<span>Unlimited subscriptions</span>
						</div>
						<div className="flex items-center gap-2 text-green-700">
							<CheckCircle className="h-4 w-4" />
							<span>Unlimited savings goals</span>
						</div>
						<div className="flex items-center gap-2 text-green-700">
							<CheckCircle className="h-4 w-4" />
							<span>Advanced graphs</span>
						</div>
					</div>
					
					<div className="text-center space-y-3">
						<Badge variant="outline" className="text-green-700 border-green-300">
							$9.99/month • Pro Plan
						</Badge>
						<Button
							onClick={handleManageSubscription}
							variant="outline"
							size="sm"
							className="border-green-300 text-green-700 hover:bg-green-50"
							disabled={stripeLoading}
						>
							<Settings className="h-4 w-4 mr-2" />
							{stripeLoading ? 'Loading...' : 'Manage Subscription'}
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Free user - show limits and upgrade option
	return (
		<Card className="border-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
			{/* Decorative background elements */}
			<div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
			<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
			<div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>
			
			<CardHeader className="text-center pb-6 relative z-10">
				<div className="flex justify-center mb-3">
					<div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
						<Lock className="h-6 w-6 text-white" />
					</div>
				</div>
				<CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
					Free Plan
				</CardTitle>
				<CardDescription className="text-slate-600 font-medium">
					Upgrade to Pro for unlimited access and advanced features
				</CardDescription>
			</CardHeader>
			
			<CardContent className="space-y-6 relative z-10">
				{/* Usage Stats */}
				<div className="grid grid-cols-3 gap-4">
					<div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20">
						<div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
							{featureLimits.usage.expenses}/5
						</div>
						<div className="text-sm font-medium text-slate-600 mt-1">Expenses</div>
					</div>
					<div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20">
						<div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
							{featureLimits.usage.subscriptions}/5
						</div>
						<div className="text-sm font-medium text-slate-600 mt-1">Subscriptions</div>
					</div>
					<div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/20">
						<div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
							{featureLimits.usage.savingsBins}/5
						</div>
						<div className="text-sm font-medium text-slate-600 mt-1">Savings Goals</div>
					</div>
				</div>

				{/* Feature List */}
				<div className="space-y-3">
					<div className="flex items-center gap-3 p-3 rounded-lg bg-white/40 backdrop-blur-sm">
						<div className="p-1.5 rounded-full bg-green-100">
							<CheckCircle className="h-4 w-4 text-green-600" />
						</div>
						<span className="text-slate-700 font-medium">Basic expense tracking</span>
					</div>
					<div className="flex items-center gap-3 p-3 rounded-lg bg-white/40 backdrop-blur-sm">
						<div className="p-1.5 rounded-full bg-green-100">
							<CheckCircle className="h-4 w-4 text-green-600" />
						</div>
						<span className="text-slate-700 font-medium">Basic subscription management</span>
					</div>
					<div className="flex items-center gap-3 p-3 rounded-lg bg-white/40 backdrop-blur-sm">
						<div className="p-1.5 rounded-full bg-green-100">
							<CheckCircle className="h-4 w-4 text-green-600" />
						</div>
						<span className="text-slate-700 font-medium">Basic savings goals</span>
					</div>
					<div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
						<div className="p-1.5 rounded-full bg-amber-100">
							<Lock className="h-4 w-4 text-amber-600" />
						</div>
						<span className="text-amber-800 font-medium">Graphs & analytics (Pro only)</span>
					</div>
				</div>

				{/* Upgrade Button */}
				<div className="text-center pt-2">
					<Button 
						onClick={handleUpgrade}
						className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
						disabled={stripeLoading}
					>
						<Crown className="h-4 w-4 mr-2" />
						{stripeLoading ? 'Processing...' : 'Upgrade to Pro - $9.99/month'}
					</Button>
					<p className="text-xs text-slate-500 mt-2">Cancel anytime • No setup fees</p>
				</div>
			</CardContent>
		</Card>
	);
}
