import {
  Apple,
  BarChart3,
  Package,
  PackageSearch,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-xl font-bold">
              Admin Panel
            </Link>
            <nav className="flex items-center gap-6">
              <Link
                href="/admin/reports/revenue"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                Revenue
              </Link>
              <Link
                href="/admin/reports/sales-by-category"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                Sales by Category
              </Link>
              <Link
                href="/admin/reports/top-products"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Package className="h-4 w-4" />
                Top Products
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Apple className="h-4 w-4" />
                Manage Products
              </Link>
              <Link
                href="/admin/orders"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <PackageSearch className="h-4 w-4" />
                Manage Orders
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Store
          </Link>
        </div>
      </div>
    </header>
  );
}
