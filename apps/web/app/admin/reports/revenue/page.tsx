"use client";

import { useEffect, useState } from "react";
import { getRevenue, RevenueData } from "@/services/report/report.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 30);

        const data = await getRevenue(from.toISOString(), to.toISOString());
        setRevenueData(data);
      } catch (error) {
        console.error("Failed to fetch revenue data:", error);
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
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
        <div className="h-96 bg-muted rounded" />
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Revenue Report</h1>
          <p className="text-destructive">Failed to load data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Revenue Report</h1>
        <p className="text-muted-foreground">
          Overview of revenue for the last 30 days
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueData.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueData.averageOrderValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData.revenueByDate}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  className="text-xs"
                />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                  className="text-xs"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                      formatter={(value) => [
                        `$${Number(value).toFixed(2)}`,
                        "Revenue",
                      ]}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
