import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const coreFeatures = [
  {
    title: "Product catalog",
    description:
      "Publish product cards with photos, short descriptions, categories, and stock levels.",
  },
  {
    title: "Customer profiles",
    description:
      "Register shoppers and keep their personal details, preferences, and history in one place.",
  },
  {
    title: "Cart and checkout",
    description:
      "Let customers build carts, apply promo codes, and follow every order status with ease.",
  },
  {
    title: "Shipping and payments",
    description:
      "Offer simple delivery options and accept secure online payments through Stripe.",
  },
];

const reportHighlights = [
  {
    title: "Sales by category",
    description: "See which product groups bring in the most revenue.",
  },
  {
    title: "Revenue timeline",
    description: "Track income for any period and spot changes early.",
  },
  {
    title: "Top products",
    description: "Find the items people buy most so you can restock on time.",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Minimal e-commerce management system
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed sm:text-lg">
            Manage products, customers, orders, and reporting from a single
            clean dashboard. Launch fast, keep the checkout simple, and monitor
            your numbers without extra noise.
          </p>
          <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:w-auto">
            <Button asChild className="w-full sm:w-auto">
              <Link
                href="/auth/sign-in"
                className="flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
            <Link
              href="/catalog"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full sm:w-auto"
              )}
            >
              Browse catalog
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/50 px-6 py-14">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
          {coreFeatures.map((feature) => (
            <Card key={feature.title} className="h-full text-left">
              <CardHeader className="gap-2">
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl font-semibold text-foreground">
              Reports that keep you growing
            </h2>
            <p className="text-sm text-muted-foreground">
              Get the metrics you need in real time and make confident
              decisions.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {reportHighlights.map((report) => (
              <Card key={report.title} className="border-dashed">
                <CardHeader className="gap-2 p-4">
                  <CardTitle className="text-base">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
