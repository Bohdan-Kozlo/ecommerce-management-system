"use client";

import { useState } from "react";
import { Package, User, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  OrderStatus,
  DeliveryMethod,
  type IOrderAdmin,
  type IOrderItemAdmin,
} from "@/shared/types/order.interface";
import {
  updateOrderStatus,
  updateDelivery,
} from "@/services/order/order.service";
import Image from "next/image";

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: IOrderAdmin;
  onUpdate: () => void;
}

export function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
  onUpdate,
}: OrderDetailsDialogProps) {
  const [status, setStatus] = useState(order.status);
  const [delivery, setDelivery] = useState({
    address: order.delivery?.address || "",
    email: order.delivery?.email || "",
    phone: order.delivery?.phone || "",
    method: order.delivery?.method || DeliveryMethod.COUIRIER,
  });
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true);
      await updateOrderStatus(order.id, newStatus);
      setStatus(newStatus as OrderStatus);
      onUpdate();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeliveryUpdate = async () => {
    try {
      setUpdating(true);
      await updateDelivery(order.id, delivery);
      onUpdate();
    } catch (error) {
      console.error("Failed to update delivery:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: "Pending",
      [OrderStatus.PAID]: "Paid",
      [OrderStatus.SHIPPED]: "Shipped",
      [OrderStatus.DELIVERED]: "Delivered",
      [OrderStatus.CANCELED]: "Canceled",
    };
    return labels[status];
  };

  const getMethodLabel = (method: DeliveryMethod) => {
    const labels: Record<DeliveryMethod, string> = {
      [DeliveryMethod.COUIRIER]: "Courier",
      [DeliveryMethod.LOCKER]: "Locker",
      [DeliveryMethod.DEPARTMENT]: "Post office",
    };
    return labels[method];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order #{order.id.slice(0, 8)}</span>
            <Badge>{getStatusLabel(status)}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Created at</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total amount</p>
              <p className="font-medium text-lg">
                {formatPrice(order.totalAmount)}
              </p>
            </div>
          </div>

          {/* Status Management */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <h3 className="font-semibold">Status management</h3>
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Order status</Label>
                <Select
                  value={status}
                  onValueChange={handleStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OrderStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={OrderStatus.PAID}>Paid</SelectItem>
                    <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
                    <SelectItem value={OrderStatus.DELIVERED}>
                      Delivered
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <h3 className="font-semibold">Customer information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p>
                  {order.user.firstName && order.user.lastName
                    ? `${order.user.firstName} ${order.user.lastName}`
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{order.user.email}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <h3 className="font-semibold">Delivery information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Address</Label>
                <Input
                  value={delivery.address}
                  onChange={(e) =>
                    setDelivery({ ...delivery, address: e.target.value })
                  }
                  disabled={updating}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={delivery.email}
                    onChange={(e) =>
                      setDelivery({ ...delivery, email: e.target.value })
                    }
                    disabled={updating}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={delivery.phone}
                    onChange={(e) =>
                      setDelivery({ ...delivery, phone: e.target.value })
                    }
                    disabled={updating}
                  />
                </div>
              </div>
              <div>
                <Label>Delivery method</Label>
                <Select
                  value={delivery.method}
                  onValueChange={(value) =>
                    setDelivery({
                      ...delivery,
                      method: value as DeliveryMethod,
                    })
                  }
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DeliveryMethod.COUIRIER}>
                      {getMethodLabel(DeliveryMethod.COUIRIER)}
                    </SelectItem>
                    <SelectItem value={DeliveryMethod.LOCKER}>
                      {getMethodLabel(DeliveryMethod.LOCKER)}
                    </SelectItem>
                    <SelectItem value={DeliveryMethod.DEPARTMENT}>
                      {getMethodLabel(DeliveryMethod.DEPARTMENT)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleDeliveryUpdate} disabled={updating}>
                Update delivery
              </Button>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <h3 className="font-semibold">Order items</h3>
            </div>
            <div className="space-y-3">
              {order.orderItems.map((item: IOrderItemAdmin) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  {item.product?.productImages?.[0]?.url ? (
                    <Image
                      src={item.product.productImages[0].url}
                      alt={item.product?.title || "Product image"}
                      width={60}
                      height={60}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-[60px] h-[60px] bg-muted rounded flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.price)}</p>
                    <p className="text-sm text-muted-foreground">
                      Total: {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promocode Info */}
          {order.promocode && (
            <>
              <Separator />
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">
                  Promocode applied: {order.promocode.code}
                </p>
                <p className="text-sm text-green-700">
                  Discount: {order.promocode.value}%
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
