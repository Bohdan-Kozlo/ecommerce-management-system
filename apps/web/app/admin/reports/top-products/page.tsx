"use client";

import { useEffect, useState } from "react";
import { getTopProducts, TopProduct } from "@/services/report/report.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import { Package } from "lucide-react";

const chartConfig = {
  totalQuantitySold: {
    label: "Quantity Sold",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function TopProductsPage() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const to = new Date();
        const from = new Date();
        from.setDate(from.getDate() - 30);

        const data = await getTopProducts(
          from.toISOString(),
          to.toISOString(),
          10
        );
        setTopProducts(data);
      } catch (error) {
        console.error("Failed to fetch top products data:", error);
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

  const totalQuantitySold = topProducts.reduce(
    (sum, product) => sum + product.totalQuantitySold,
    0
  );
  const totalRevenue = topProducts.reduce(
    (sum, product) => sum + product.totalRevenue,
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Top Products</h1>
        <p className="text-muted-foreground">
          Best selling products for the last 30 days
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Total Units Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantitySold}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Products Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topProducts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Volume by Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis
                  type="category"
                  dataKey="productName"
                  width={200}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`${value} units`, "Quantity Sold"]}
                    />
                  }
                />
                <Bar
                  dataKey="totalQuantitySold"
                  fill="hsl(var(--chart-1))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Product Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-right p-4 font-medium">Units Sold</th>
                  <th className="text-right p-4 font-medium">Revenue</th>
                  <th className="text-right p-4 font-medium">Orders</th>
                  <th className="text-right p-4 font-medium">Avg/Order</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product.productId} className="border-b">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground font-medium w-6">
                          #{index + 1}
                        </span>
                        {product.imageUrl ? (
                          <div className="relative w-12 h-12 rounded-md overflow-hidden border">
                            <Image
                              src={product.imageUrl}
                              alt={product.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center border">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">
                          {product.productName}
                        </span>
                      </div>
                    </td>
                    <td className="text-right p-4 font-medium">
                      {product.totalQuantitySold}
                    </td>
                    <td className="text-right p-4 font-medium">
                      ${product.totalRevenue.toFixed(2)}
                    </td>
                    <td className="text-right p-4">{product.ordersCount}</td>
                    <td className="text-right p-4">
                      {(
                        product.totalQuantitySold / product.ordersCount
                      ).toFixed(1)}
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
