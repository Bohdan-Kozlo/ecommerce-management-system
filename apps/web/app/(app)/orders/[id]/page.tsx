"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Package,
  MapPin,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserOrderById } from "@/services/order/order.service";
import type { IOrder } from "@/shared/types/order.interface";
import { OrderStatus, DeliveryMethod } from "@/shared/types/order.interface";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: typeof Clock }
> = {
  [OrderStatus.PENDING]: {
    label: "Pending Payment",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: Clock,
  },
  [OrderStatus.PAID]: {
    label: "Paid",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: CheckCircle2,
  },
  [OrderStatus.SHIPPED]: {
    label: "Shipped",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: Truck,
  },
  [OrderStatus.DELIVERED]: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: CheckCircle2,
  },
  [OrderStatus.CANCELED]: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: XCircle,
  },
};

const deliveryMethodLabels: Record<DeliveryMethod, string> = {
  [DeliveryMethod.COUIRIER]: "Courier Delivery",
  [DeliveryMethod.LOCKER]: "Parcel Locker",
  [DeliveryMethod.DEPARTMENT]: "Post Office",
};

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchOrder() {
    setLoading(true);
    try {
      const data = await getUserOrderById(id);
      setOrder(data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-8" />
          <div className="space-y-6">
            <div className="h-40 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-12 pb-8">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-6">
              The order you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have access to it.
            </p>
            <Button onClick={() => router.push("/orders")}>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/orders")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Order #{order.id.slice(0, 8)}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <Badge
            className={`${statusInfo.color} flex items-center gap-2 w-fit px-4 py-2`}
          >
            <StatusIcon className="h-4 w-4" />
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.orderItems?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.orderItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 shrink-0 bg-muted rounded overflow-hidden">
                    {item.product?.productImages &&
                    item.product.productImages.length > 0 &&
                    item.product.productImages[0] ? (
                      <Image
                        src={item.product.productImages[0].url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      {item.product?.name || "Product"}
                    </h3>
                    {item.product?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.product.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Qty: {item.quantity}
                      </span>
                      <span className="text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Delivery Information */}
          {order.delivery && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Delivery Address
                    </p>
                    <p className="font-medium">{order.delivery.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Delivery Method
                    </p>
                    <p className="font-medium">
                      {deliveryMethodLabels[order.delivery.method]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="font-medium">{order.delivery.email}</p>
                  </div>
                </div>

                {order.delivery.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone
                      </p>
                      <p className="font-medium">{order.delivery.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    $
                    {order.orderItems
                      ?.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </div>

                {order.promocodeId && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Promo Code Applied</span>
                    <span>
                      -$
                      {(
                        order.orderItems?.reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                        ) - order.totalAmount
                      ).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div
                className={`p-4 rounded-lg ${
                  order.status === OrderStatus.PAID ||
                  order.status === OrderStatus.SHIPPED ||
                  order.status === OrderStatus.DELIVERED
                    ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                    : order.status === OrderStatus.PENDING
                      ? "bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800"
                      : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign
                    className={`h-5 w-5 ${
                      order.status === OrderStatus.PAID ||
                      order.status === OrderStatus.SHIPPED ||
                      order.status === OrderStatus.DELIVERED
                        ? "text-green-600 dark:text-green-400"
                        : order.status === OrderStatus.PENDING
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">Payment Status</p>
                    <p
                      className={`text-xs ${
                        order.status === OrderStatus.PAID ||
                        order.status === OrderStatus.SHIPPED ||
                        order.status === OrderStatus.DELIVERED
                          ? "text-green-600 dark:text-green-400"
                          : order.status === OrderStatus.PENDING
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {order.status === OrderStatus.PAID ||
                      order.status === OrderStatus.SHIPPED ||
                      order.status === OrderStatus.DELIVERED
                        ? "Payment completed"
                        : order.status === OrderStatus.PENDING
                          ? "Awaiting payment"
                          : "Payment cancelled"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="h-full w-px bg-border" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">Order Placed</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {(order.status === OrderStatus.PAID ||
                  order.status === OrderStatus.SHIPPED ||
                  order.status === OrderStatus.DELIVERED) && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="h-full w-px bg-border" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">Payment Confirmed</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {(order.status === OrderStatus.SHIPPED ||
                  order.status === OrderStatus.DELIVERED) && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      {order.status === OrderStatus.DELIVERED && (
                        <div className="h-full w-px bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">Order Shipped</p>
                      <p className="text-xs text-muted-foreground">
                        In transit
                      </p>
                    </div>
                  </div>
                )}

                {order.status === OrderStatus.DELIVERED && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Delivered</p>
                      <p className="text-xs text-muted-foreground">
                        Order completed
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
