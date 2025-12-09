"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  MapPin,
  Package,
  Tag,
  Truck,
  X,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserCart } from "@/services/cart.service";
import {
  validatePromocode,
  type IPromocodeValidationResponse,
} from "@/services/discount.service";
import { createOrder } from "@/services/order.service";
import { createPayment } from "@/services/payment.service";
import { getDeliveryOptions } from "@/services/delivery.service";
import type { ICart } from "@/shared/types/cart.interface";
import {
  DeliveryMethod,
  type IDeliveryOption,
} from "@/shared/types/order.interface";

const DELIVERY_ICONS = {
  [DeliveryMethod.COUIRIER]: Truck,
  [DeliveryMethod.LOCKER]: Package,
  [DeliveryMethod.DEPARTMENT]: MapPin,
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<ICart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deliveryOptions, setDeliveryOptions] = useState<IDeliveryOption[]>([]);

  // Form state
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    DeliveryMethod.COUIRIER
  );

  // Promocode state
  const [promocode, setPromocode] = useState("");
  const [promocodeLoading, setPromocodeLoading] = useState(false);
  const [appliedPromocode, setAppliedPromocode] =
    useState<IPromocodeValidationResponse | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [cartData, optionsData] = await Promise.all([
        getUserCart(),
        getDeliveryOptions(),
      ]);

      if (cartData) {
        setCart(cartData);
      }
      if (optionsData) {
        setDeliveryOptions(optionsData);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyPromocode() {
    if (!promocode.trim()) return;

    setPromocodeLoading(true);
    try {
      const result = await validatePromocode({
        code: promocode.trim(),
        orderAmount: subtotalPrice,
      });

      if (result) {
        if (result.valid) {
          setAppliedPromocode(result);
        } else {
          alert(result.message || "Invalid promocode");
          setAppliedPromocode(null);
        }
      } else {
        alert("Failed to validate promocode");
        setAppliedPromocode(null);
      }
    } catch (error) {
      console.error("Failed to validate promocode:", error);
      alert("Failed to validate promocode");
      setAppliedPromocode(null);
    } finally {
      setPromocodeLoading(false);
    }
  }

  function handleRemovePromocode() {
    setPromocode("");
    setAppliedPromocode(null);
  }

  async function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault();

    if (!cart || cart.cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    if (!email || !address) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        promocode: appliedPromocode?.promocode?.code,
        delivery: {
          email,
          phone: phone || undefined,
          address,
          method: deliveryMethod,
        },
      });

      if (!order) {
        throw new Error("Failed to create order");
      }

      const paymentResponse = await createPayment({
        orderId: order.id,
        provider: "stripe",
        currency: "UAH",
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
        delivery: {
          email,
          phone: phone || undefined,
          address,
          method: deliveryMethod,
        },
      });

      if (!paymentResponse) {
        throw new Error("Failed to create payment");
      }

      window.location.href = paymentResponse.url;
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to place order. Please try again.");
      setSubmitting(false);
    }
  }

  const cartItems = cart?.cartItems || [];

  const calculateItemPrice = (item: (typeof cartItems)[0]) => {
    const product = item.product;
    if (
      product?.discount &&
      product.discount.length > 0 &&
      product.discount[0]
    ) {
      return Math.max(product.price - product.discount[0].value, 0);
    }
    return product?.price || 0;
  };

  const subtotalPrice = cartItems.reduce(
    (sum, item) => sum + calculateItemPrice(item) * item.quantity,
    0
  );
  const discountAmount = appliedPromocode?.discountAmount || 0;
  const selectedDelivery = deliveryOptions.find(
    (m) => m.method === deliveryMethod
  );
  const deliveryPrice = selectedDelivery?.price || 0;
  const totalPrice = subtotalPrice - discountAmount + deliveryPrice;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-muted rounded" />
            </div>
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-12 pb-8">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products before checkout
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
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deliveryOptions.map((option) => {
                  const Icon = DELIVERY_ICONS[option.method] || Truck;
                  const isSelected = deliveryMethod === option.method;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDeliveryMethod(option.method)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" />
                          <div>
                            <p className="font-medium">{option.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">
                            ₴{option.price.toFixed(2)}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="address">
                    Full Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="Street, City, ZIP Code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => {
                    const hasImage =
                      item.product.productImages &&
                      item.product.productImages.length > 0;

                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 shrink-0 bg-muted rounded overflow-hidden">
                          {hasImage && item.product.productImages?.[0] ? (
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                          {item.product.discount &&
                          item.product.discount.length > 0 &&
                          item.product.discount[0] ? (
                            <>
                              <p className="text-sm font-semibold text-red-600">
                                ₴
                                {(
                                  calculateItemPrice(item) * item.quantity
                                ).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground line-through">
                                ₴
                                {(item.product.price * item.quantity).toFixed(
                                  2
                                )}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-semibold">
                              ₴{(item.product.price * item.quantity).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t pt-4">
                  {/* Promocode Section */}
                  <div className="space-y-3 mb-4">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Promo Code
                    </p>

                    {appliedPromocode?.valid ? (
                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {appliedPromocode.promocode?.code}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleRemovePromocode}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter code"
                          value={promocode}
                          onChange={(e) =>
                            setPromocode(e.target.value.toUpperCase())
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleApplyPromocode();
                            }
                          }}
                          disabled={promocodeLoading}
                        />
                        <Button
                          type="button"
                          onClick={handleApplyPromocode}
                          disabled={!promocode.trim() || promocodeLoading}
                          variant="secondary"
                        >
                          {promocodeLoading ? "..." : "Apply"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₴{subtotalPrice.toFixed(2)}</span>
                    </div>

                    {appliedPromocode?.valid && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span>-₴{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>₴{deliveryPrice.toFixed(2)}</span>
                    </div>

                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₴{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting || !email || !address}
                >
                  {submitting ? "Processing..." : "Continue to Payment"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  You will be redirected to Stripe for secure payment
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
