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
} from "recharts";

type SpendingChartsProps = {
	monthlyIncome: number;
	totalFixedExpenses: number;
	totalSubscriptionsMonthly: number;
};

const COLORS = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"]; // red, blue, green, amber

export default function SpendingCharts({
	monthlyIncome,
	totalFixedExpenses,
	totalSubscriptionsMonthly,
}: SpendingChartsProps) {
	const totalOutflow = totalFixedExpenses + totalSubscriptionsMonthly;
	const remaining = Math.max(0, monthlyIncome - totalOutflow);

	const pieData = [
		{ name: "Fixed Expenses", value: totalFixedExpenses },
		{ name: "Subscriptions", value: totalSubscriptionsMonthly },
		{ name: "Remaining", value: remaining },
	];

	const barData = [
		{ 
			name: "Monthly", 
			Income: monthlyIncome, 
			"Fixed Expenses": totalFixedExpenses,
			"Subscriptions": totalSubscriptionsMonthly 
		}
	];

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<div className="bg-white border rounded-lg p-4">
				<h3 className="font-semibold mb-3">Income vs Outflow</h3>
				<div className="h-64">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={barData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip formatter={(v: number) => `$${Number(v).toLocaleString()}`} />
							<Legend />
							<Bar dataKey="Income" fill="#10b981" />
							<Bar dataKey="Fixed Expenses" fill="#ef4444" />
							<Bar dataKey="Subscriptions" fill="#f59e0b" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			<div className="bg-white border rounded-lg p-4">
				<h3 className="font-semibold mb-3">Breakdown</h3>
				<div className="h-64">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
								{pieData.map((_, i) => (
									<Cell key={i} fill={COLORS[i % COLORS.length]} />
								))}
							</Pie>
							<Tooltip formatter={(v: number) => `$${Number(v).toLocaleString()}`} />
						</PieChart>
					</ResponsiveContainer>
				</div>
				<div className="mt-2 text-sm text-gray-600">
					Income: ${monthlyIncome.toLocaleString()} • Outflow: ${totalOutflow.toLocaleString()} • Remaining: ${remaining.toLocaleString()}
				</div>
			</div>
		</div>
	);
}


