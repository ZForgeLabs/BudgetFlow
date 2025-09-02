import { useState, useEffect } from 'react';

interface FeatureLimits {
	subscriptionStatus: 'free' | 'pro';
	isPro: boolean;
	limits: {
		expenses: number;
		subscriptions: number;
		savingsBins: number;
		graphs: boolean;
	};
	usage: {
		expenses: number;
		subscriptions: number;
		savingsBins: number;
	};
	canAdd: {
		expenses: boolean;
		subscriptions: boolean;
		savingsBins: boolean;
	};
}

export function useFeatureLimits() {
	const [featureLimits, setFeatureLimits] = useState<FeatureLimits | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
	// Admin mode for testing - disabled for production testing
	const [adminMode, setAdminMode] = useState(false);

	const fetchFeatureLimits = async () => {
		try {
			setLoading(true);
			setError(null);
			
			const response = await fetch('/api/feature-limits');
			if (!response.ok) {
				throw new Error('Failed to fetch feature limits');
			}
			
			const data = await response.json();
			setFeatureLimits(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchFeatureLimits();
	}, []);

	const refreshLimits = async () => {
		console.log('Refreshing feature limits...');
		await fetchFeatureLimits();
		// Use a timeout to log the updated state after React has processed the update
		setTimeout(() => {
			console.log('Feature limits refreshed:', featureLimits);
		}, 100);
	};

	// Admin mode overrides all restrictions
	const canAddExpense = adminMode || (featureLimits?.canAdd.expenses ?? false);
	const canAddSubscription = adminMode || (featureLimits?.canAdd.subscriptions ?? false);
	const canAddSavingsBin = adminMode || (featureLimits?.canAdd.savingsBins ?? false);
	const canAccessGraphs = adminMode || (featureLimits?.limits.graphs ?? false);
	const isPro = adminMode || (featureLimits?.isPro ?? false);
	const subscriptionStatus = adminMode ? 'admin' : (featureLimits?.subscriptionStatus ?? 'free');

	return {
		featureLimits,
		loading,
		error,
		refreshLimits,
		canAddExpense,
		canAddSubscription,
		canAddSavingsBin,
		canAccessGraphs,
		isPro,
		subscriptionStatus
	};
}
