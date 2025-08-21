"use client";

import React from "react";
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Legend,
	Tooltip,
	PieChart,
	Pie,
	Cell,
	RadialBarChart,
	RadialBar,
	LineChart,
	Line,
	Area,
	AreaChart,
} from "recharts";

type SpendingChartsProps = {
	monthlyIncome: number;
	totalFixedExpenses: number;
	totalSubscriptionsMonthly: number;
};

// Modern gradient colors
const COLORS = {
	income: "#10b981",
	expenses: "#ef4444", 
	subscriptions: "#f59e0b",
	remaining: "#8b5cf6",
	savings: "#3b82f6"
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		return (
			<div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 backdrop-blur-sm">
				<p className="font-semibold text-gray-800 mb-2">{label}</p>
				{payload.map((entry: any, index: number) => (
					<p key={index} className="text-sm" style={{ color: entry.color }}>
						{entry.name}: <span className="font-semibold">${Number(entry.value).toLocaleString()}</span>
					</p>
				))}
			</div>
		);
	}
	return null;
};

export default function SpendingCharts({
	monthlyIncome,
	totalFixedExpenses,
	totalSubscriptionsMonthly,
}: SpendingChartsProps) {
	const totalOutflow = totalFixedExpenses + totalSubscriptionsMonthly;
	const remaining = Math.max(0, monthlyIncome - totalOutflow);

	const pieData = [
		{ name: "Fixed Expenses", value: totalFixedExpenses, color: COLORS.expenses },
		{ name: "Subscriptions", value: totalSubscriptionsMonthly, color: COLORS.subscriptions },
		{ name: "Remaining", value: remaining, color: COLORS.remaining },
	];

	const barData = [
		{ 
			name: "Monthly", 
			Income: monthlyIncome, 
			"Fixed Expenses": totalFixedExpenses,
			"Subscriptions": totalSubscriptionsMonthly 
		}
	];

	// Radial data for modern donut chart
	const radialData = pieData.map(item => ({
		...item,
		fill: item.color,
		stroke: item.color,
	}));

	return (
		<div className="space-y-6">
			{/* Modern Bar Chart */}
			<div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-bold text-gray-800">Monthly Overview</h3>
					<div className="flex space-x-4 text-sm">
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 rounded-full bg-green-500"></div>
							<span className="text-gray-600">Income</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 rounded-full bg-red-500"></div>
							<span className="text-gray-600">Expenses</span>
						</div>
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 rounded-full bg-orange-500"></div>
							<span className="text-gray-600">Subscriptions</span>
						</div>
					</div>
				</div>
				<div className="h-80">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
							<XAxis 
								dataKey="name" 
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: '#64748b' }}
							/>
							<YAxis 
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: '#64748b' }}
								tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Bar 
								dataKey="Income" 
								fill={COLORS.income}
								radius={[4, 4, 0, 0]}
								className="hover:opacity-80 transition-opacity"
							/>
							<Bar 
								dataKey="Fixed Expenses" 
								fill={COLORS.expenses}
								radius={[4, 4, 0, 0]}
								className="hover:opacity-80 transition-opacity"
							/>
							<Bar 
								dataKey="Subscriptions" 
								fill={COLORS.subscriptions}
								radius={[4, 4, 0, 0]}
								className="hover:opacity-80 transition-opacity"
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Modern Donut Chart */}
			<div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-bold text-gray-800">Spending Breakdown</h3>
					<div className="text-right">
						<p className="text-2xl font-bold text-gray-800">${totalOutflow.toLocaleString()}</p>
						<p className="text-sm text-gray-500">Total Monthly Outflow</p>
					</div>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="h-80">
						<ResponsiveContainer width="100%" height="100%">
							<RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData}>
								<RadialBar 
									dataKey="value" 
									cornerRadius={10}
									className="hover:opacity-80 transition-opacity"
								/>
								<Tooltip content={<CustomTooltip />} />
							</RadialBarChart>
						</ResponsiveContainer>
					</div>
					<div className="flex flex-col justify-center space-y-4">
						{pieData.map((item, index) => (
							<div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
								<div className="flex items-center space-x-3">
									<div 
										className="w-4 h-4 rounded-full" 
										style={{ backgroundColor: item.color }}
									></div>
									<span className="font-medium text-gray-700">{item.name}</span>
								</div>
								<div className="text-right">
									<p className="font-bold text-gray-800">${item.value.toLocaleString()}</p>
									<p className="text-xs text-gray-500">
										{((item.value / totalOutflow) * 100).toFixed(1)}%
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>


		</div>
	);
}


