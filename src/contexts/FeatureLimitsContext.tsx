'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';

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

interface FeatureLimitsContextType {
	featureLimits: FeatureLimits | null;
	loading: boolean;
	error: string | null;
	refreshLimits: () => Promise<void>;
	canAddExpense: boolean;
	canAddSubscription: boolean;
	canAddSavingsBin: boolean;
	canAccessGraphs: boolean;
	isPro: boolean;
	subscriptionStatus: string;
}

const FeatureLimitsContext = createContext<FeatureLimitsContextType | undefined>(undefined);

// Global flag to prevent multiple fetches across provider recreations
let globalHasFetched = false;

export function FeatureLimitsProvider({ children }: { children: ReactNode }) {
	const [featureLimits, setFeatureLimits] = useState<FeatureLimits | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
	// Admin mode for testing - disabled for production testing
	const [adminMode] = useState(false);

	const fetchFeatureLimits = useCallback(async () => {
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
	}, []);

	// Only fetch once when the provider mounts
	useEffect(() => {
		if (!globalHasFetched && !featureLimits) {
			globalHasFetched = true;
			fetchFeatureLimits();
		}
	}, [fetchFeatureLimits, featureLimits]);

	const refreshLimits = useCallback(async () => {
		await fetchFeatureLimits();
	}, [fetchFeatureLimits]);

	// Admin mode overrides all restrictions
	const canAddExpense = adminMode || (featureLimits?.canAdd.expenses ?? false);
	const canAddSubscription = adminMode || (featureLimits?.canAdd.subscriptions ?? false);
	const canAddSavingsBin = adminMode || (featureLimits?.canAdd.savingsBins ?? false);
	const canAccessGraphs = adminMode || (featureLimits?.limits.graphs ?? false);
	const isPro = adminMode || (featureLimits?.isPro ?? false);
	const subscriptionStatus = adminMode ? 'admin' : (featureLimits?.subscriptionStatus ?? 'free');

	const value = useMemo(() => ({
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
	}), [
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
	]);

	return (
		<FeatureLimitsContext.Provider value={value}>
			{children}
		</FeatureLimitsContext.Provider>
	);
}

export function useFeatureLimits() {
	const context = useContext(FeatureLimitsContext);
	if (context === undefined) {
		throw new Error('useFeatureLimits must be used within a FeatureLimitsProvider');
	}
	return context;
}
