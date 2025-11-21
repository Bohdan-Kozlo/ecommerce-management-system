"use client";

import { useEffect, useState, useOptimistic, startTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getUserCart,
  updateCartItemQuantity,
  removeItemFromCart,
  cleanCart,
} from "@/services/cart.service";
import type { ICart, ICartItem } from "@/shared/types/cart.interface";

type OptimisticAction =
  | { type: "update"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" };

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<ICart | null>(null);
  const [loading, setLoading] = useState(true);

  const [optimisticCart, setOptimisticCart] = useOptimistic(
    cart,
    (state, action: OptimisticAction) => {
      if (!state) return state;

      switch (action.type) {
        case "update": {
          return {
            ...state,
            cartItems: state.cartItems.map((item) =>
              item.productId === action.productId
                ? { ...item, quantity: action.quantity }
                : item
            ),
          };
        }
        case "remove": {
          return {
            ...state,
            cartItems: state.cartItems.filter(
              (item) => item.productId !== action.productId
            ),
          };
        }
        case "clear": {
          return {
            ...state,
            cartItems: [],
          };
        }
        default:
          return state;
      }
    }
  );

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    setLoading(true);
    try {
      const data = await getUserCart();
      if (data) {
        setCart(data);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateQuantity(productId: string, newQuantity: number) {
    if (newQuantity < 1) return;

    startTransition(() => {
      setOptimisticCart({ type: "update", productId, quantity: newQuantity });
    });

    if (cart) {
      setCart({
        ...cart,
        cartItems: cart.cartItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        ),
      });
    }

    try {
      await updateCartItemQuantity({
        productId,
        quantity: newQuantity,
      });
    } catch (error) {
      console.error("Failed to update quantity:", error);
      await fetchCart();
    }
  }

  async function handleRemoveItem(productId: string) {
    startTransition(() => {
      setOptimisticCart({ type: "remove", productId });
    });

    if (cart) {
      setCart({
        ...cart,
        cartItems: cart.cartItems.filter(
          (item) => item.productId !== productId
        ),
      });
    }

    try {
      await removeItemFromCart(productId);
    } catch (error) {
      console.error("Failed to remove item:", error);
      await fetchCart();
    }
  }

  async function handleClearCart() {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    startTransition(() => {
      setOptimisticCart({ type: "clear" });
    });

    if (cart) {
      setCart({
        ...cart,
        cartItems: [],
      });
    }

    try {
      await cleanCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      await fetchCart();
    }
  }

  function handleCheckout() {
    router.push("/checkout");
  }

  const displayCart = optimisticCart || cart;
  const cartItems = displayCart?.cartItems || [];
  const subtotalPrice = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-muted rounded mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-12 pb-8">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Shopping Cart</h1>
        <Button variant="outline" onClick={handleClearCart} disabled={loading}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Cart
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({totalItems} items)
                </span>
                <span className="font-medium">${subtotalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${subtotalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted p-3 rounded">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Tax and shipping will be calculated at checkout</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface CartItemCardProps {
  item: ICartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const { product, quantity } = item;
  const subtotal = product.price * quantity;
  const hasImage = product.productImages && product.productImages.length > 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div
            className="relative w-24 h-24 shrink-0 bg-muted rounded-md overflow-hidden cursor-pointer"
            onClick={() => (window.location.href = `/products/${product.id}`)}
          >
            {hasImage && product.productImages[0] ? (
              <Image
                src={product.productImages[0].url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                No image
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-4 mb-2">
              <div>
                <h3
                  className="font-semibold line-clamp-1 cursor-pointer hover:underline"
                  onClick={() =>
                    (window.location.href = `/products/${product.id}`)
                  }
                >
                  {product.name}
                </h3>
                {product.Category && (
                  <p className="text-sm text-muted-foreground">
                    {product.Category.name}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(product.id)}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {product.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => {
                    const newQty = parseInt(e.target.value);
                    if (
                      !isNaN(newQty) &&
                      newQty > 0 &&
                      newQty <= product.stock
                    ) {
                      onUpdateQuantity(product.id, newQty);
                    }
                  }}
                  className="w-16 h-8 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  ${product.price.toFixed(2)} each
                </p>
                <p className="text-lg font-bold">${subtotal.toFixed(2)}</p>
              </div>
            </div>

            {product.stock < 10 && (
              <p className="text-xs text-orange-600 mt-2">
                Only {product.stock} left in stock
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
