"use client";

import { useRouter } from "next/navigation";
import { XCircle, ShoppingCart, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment was cancelled. Your cart items are still saved and you
            can complete your purchase anytime.
          </p>
          <div className="bg-muted p-4 rounded-lg text-sm text-left">
            <p className="font-medium mb-2">What happens next?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Your order has not been created</li>
              <li>• No charges were made to your card</li>
              <li>• Your cart items remain saved</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={() => router.push("/checkout")}
            className="w-full"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Checkout
          </Button>
          <Button
            onClick={() => router.push("/cart")}
            variant="outline"
            className="w-full"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            View Cart
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
