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
	totalSavings: number;
};

// Modern gradient colors
const COLORS = {
	income: "#10b981",
	expenses: "#ef4444", 
	subscriptions: "#f59e0b",
	savings: "#3b82f6",
	leftOver: "#8b5cf6"
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

// Custom pie chart tooltip
const PieTooltip = ({ active, payload }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0];
		return (
			<div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 backdrop-blur-sm">
				<div className="flex items-center space-x-2 mb-2">
					<div 
						className="w-3 h-3 rounded-full" 
						style={{ backgroundColor: data.payload.color }}
					></div>
					<p className="font-semibold text-gray-800">{data.name}</p>
				</div>
				<p className="text-sm text-gray-600">
					Amount: <span className="font-semibold">${data.value.toLocaleString()}</span>
				</p>
				<p className="text-sm text-gray-600">
					Percentage: <span className="font-semibold">{data.payload.percentage}%</span>
				</p>
			</div>
		);
	}
	return null;
};

export default function SpendingCharts({
	monthlyIncome,
	totalFixedExpenses,
	totalSubscriptionsMonthly,
	totalSavings,
}: SpendingChartsProps) {
	const totalOutflow = totalFixedExpenses + totalSubscriptionsMonthly + totalSavings;
	const leftOver = Math.max(0, monthlyIncome - totalOutflow);

	const pieData = [
		{ 
			name: "Fixed Expenses", 
			value: totalFixedExpenses, 
			color: COLORS.expenses,
			percentage: ((totalFixedExpenses / monthlyIncome) * 100).toFixed(1)
		},
		{ 
			name: "Subscriptions", 
			value: totalSubscriptionsMonthly, 
			color: COLORS.subscriptions,
			percentage: ((totalSubscriptionsMonthly / monthlyIncome) * 100).toFixed(1)
		},
		{ 
			name: "Savings", 
			value: totalSavings, 
			color: COLORS.savings,
			percentage: ((totalSavings / monthlyIncome) * 100).toFixed(1)
		},
		{ 
			name: "Left Over", 
			value: leftOver, 
			color: COLORS.leftOver,
			percentage: ((leftOver / monthlyIncome) * 100).toFixed(1)
		},
	];

	// Filter out zero values for cleaner display
	const filteredPieData = pieData.filter(item => item.value > 0);

	// Bar chart data - using a simpler structure
	const barData = [
		{ 
			name: "Income", 
			value: monthlyIncome,
			color: COLORS.income
		},
		{ 
			name: "Fixed Expenses", 
			value: totalFixedExpenses,
			color: COLORS.expenses
		},
		{ 
			name: "Subscriptions", 
			value: totalSubscriptionsMonthly,
			color: COLORS.subscriptions
		},
		{ 
			name: "Savings", 
			value: totalSavings,
			color: COLORS.savings
		},
		{ 
			name: "Left Over", 
			value: leftOver,
			color: COLORS.leftOver
		}
	];

	return (
		<div className="space-y-6">
			{/* Modern Horizontal Bar Chart */}
			<div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-bold text-gray-800">Monthly Budget Breakdown</h3>
					<div className="text-right">
						<p className="text-2xl font-bold text-gray-800">${monthlyIncome.toLocaleString()}</p>
						<p className="text-sm text-gray-500">Total Monthly Income</p>
					</div>
				</div>
				<div className="h-96">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart 
							data={barData} 
							layout="horizontal"
							margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
						>
							<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
							<XAxis 
								type="number"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: '#64748b' }}
								tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
							/>
							<YAxis 
								type="category"
								dataKey="name"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 14, fill: '#374151', fontWeight: 500 }}
								width={70}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Bar 
								dataKey="value" 
								radius={[0, 8, 8, 0]}
								className="hover:opacity-80 transition-opacity"
							>
								{barData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</div>
				{/* Legend */}
				<div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
					{barData.map((item, index) => (
						<div key={index} className="flex items-center space-x-2">
							<div 
								className="w-3 h-3 rounded-full" 
								style={{ backgroundColor: item.color }}
							></div>
							<span className="text-sm text-gray-600">{item.name}</span>
						</div>
					))}
				</div>
			</div>

			{/* Simple Pie Chart */}
			<div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
				<div className="flex items-center justify-between mb-6">
					<h3 className="text-xl font-bold text-gray-800">Budget Distribution</h3>
					<div className="text-right">
						<p className="text-2xl font-bold text-gray-800">${monthlyIncome.toLocaleString()}</p>
						<p className="text-sm text-gray-500">Total Monthly Income</p>
					</div>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="h-80 flex items-center justify-center">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={filteredPieData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, percentage }) => `${name}: ${percentage}%`}
									outerRadius={120}
									fill="#8884d8"
									dataKey="value"
								>
									{filteredPieData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip content={<PieTooltip />} />
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="flex flex-col justify-center space-y-4">
						{filteredPieData.map((item, index) => (
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
										{item.percentage}%
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


