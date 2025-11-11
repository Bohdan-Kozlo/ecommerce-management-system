"use client";

import { useEffect, useState } from "react";
import {
  getSalesByCategory,
  SalesByCategory,
} from "@/services/report/report.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const chartConfig = {
  totalRevenue: {
    label: "Total Revenue ($)",
    color: "hsl(var(--chart-1))",
  },
  totalItemsSold: {
    label: "Items Sold",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function SalesByCategoryPage() {
  const [salesData, setSalesData] = useState<SalesByCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 30);

        const data = await getSalesByCategory(
          from.toISOString(),
          to.toISOString()
        );
        setSalesData(data);
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-8 w-64 bg-muted rounded mb-2" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
        <div className="h-96 bg-muted rounded" />
      </div>
    );
  }

  const totalRevenue = salesData.reduce(
    (sum, cat) => sum + cat.totalRevenue,
    0
  );
  const totalItems = salesData.reduce(
    (sum, cat) => sum + cat.totalItemsSold,
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales by Category</h1>
        <p className="text-muted-foreground">
          Breakdown of sales performance by product category
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Revenue Across Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Items Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue and Items by Category</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Blue bars show revenue ($) on the left axis, Orange bars show items
            sold on the right axis
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="categoryName"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  className="text-xs"
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  className="text-xs"
                  label={{
                    value: "Revenue ($)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                  label={{
                    value: "Items Sold",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  yAxisId="left"
                  dataKey="totalRevenue"
                  fill="hsl(var(--chart-1))"
                  radius={[4, 4, 0, 0]}
                  name="Revenue ($)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="totalItemsSold"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                  name="Items Sold"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Category Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-right p-4 font-medium">Revenue</th>
                  <th className="text-right p-4 font-medium">Items Sold</th>
                  <th className="text-right p-4 font-medium">Orders</th>
                  <th className="text-right p-4 font-medium">Avg Order</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((category) => (
                  <tr key={category.categoryId} className="border-b">
                    <td className="p-4 font-medium">{category.categoryName}</td>
                    <td className="text-right p-4">
                      ${category.totalRevenue.toFixed(2)}
                    </td>
                    <td className="text-right p-4">
                      {category.totalItemsSold}
                    </td>
                    <td className="text-right p-4">{category.totalOrders}</td>
                    <td className="text-right p-4">
                      ${category.averageOrderValue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
