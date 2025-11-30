"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Calendar, DollarSign, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserOrders } from "@/services/order.service";
import type { IOrder } from "@/shared/types/order.interface";
import { OrderStatus } from "@/shared/types/order.interface";

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  [OrderStatus.PAID]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [OrderStatus.SHIPPED]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  [OrderStatus.DELIVERED]:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  [OrderStatus.CANCELED]:
    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const data = await getUserOrders();
      if (data) {
        return setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-12 pb-8">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to create your first order
            </p>
            <Button onClick={() => router.push("/products")}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Order #{order.id.slice(0, 8)}
                </CardTitle>
                <Badge className={statusColors[order.status]}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-medium">
                      ₴{order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Items</p>
                    <p className="font-medium">
                      {order.orderItems?.length || 0} items
                    </p>
                  </div>
                </div>
              </div>

              {order.delivery && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">
                        {order.delivery.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.delivery.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
