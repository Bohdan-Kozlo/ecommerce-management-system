"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProducts } from "@/services/product/product.service";
import { getCategories } from "@/services/category/category.service";
import type {
  IProduct,
  IProductFilters,
} from "@/shared/types/product.interface";
import type { ICategory } from "@/shared/types/category.interface";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(
    searchParams.get("sort") || "createdAt_desc"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [showFilters, setShowFilters] = useState(false);

  const limit = 12;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function fetchCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    try {
      const filters: IProductFilters = {
        search: searchParams.get("search") || undefined,
        category: searchParams.get("category") || undefined,
        minPrice: searchParams.get("minPrice")
          ? Number(searchParams.get("minPrice"))
          : undefined,
        maxPrice: searchParams.get("maxPrice")
          ? Number(searchParams.get("maxPrice"))
          : undefined,
        sort:
          (searchParams.get("sort") as IProductFilters["sort"]) || undefined,
        page: Number(searchParams.get("page")) || 1,
        limit,
      };

      const data = await getProducts(filters);
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setPage(data.page);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }

  function updateFilters() {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    params.set("page", "1");

    router.push(`/products?${params.toString()}`);
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("createdAt_desc");
    setPage(1);
    router.push("/products");
  }

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/products?${params.toString()}`);
  }

  const hasActiveFilters = search || category || minPrice || maxPrice;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Products</h1>
        <p className="text-muted-foreground">
          Browse our collection of {total} products
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateFilters()}
              className="pl-9"
            />
          </div>
          <Button onClick={updateFilters}>Search</Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {category && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCategory("")}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Min Price</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Price</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt_desc">
                        Newest first
                      </SelectItem>
                      <SelectItem value="createdAt_asc">
                        Oldest first
                      </SelectItem>
                      <SelectItem value="price_asc">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price_desc">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="name_asc">Name: A to Z</SelectItem>
                      <SelectItem value="name_desc">Name: Z to A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={updateFilters} className="flex-1">
                  Apply Filters
                </Button>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge variant="secondary">
                Search: {search}
                <button
                  onClick={() => {
                    setSearch("");
                    updateFilters();
                  }}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {category && (
              <Badge variant="secondary">
                Category:{" "}
                {categories.find((c) => c.id === category)?.name || category}
                <button
                  onClick={() => {
                    setCategory("");
                    updateFilters();
                  }}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {minPrice && (
              <Badge variant="secondary">
                Min: ${minPrice}
                <button
                  onClick={() => {
                    setMinPrice("");
                    updateFilters();
                  }}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {maxPrice && (
              <Badge variant="secondary">
                Max: ${maxPrice}
                <button
                  onClick={() => {
                    setMaxPrice("");
                    updateFilters();
                  }}
                  className="ml-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" className="mt-4">
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <div className="relative h-48 bg-muted">
                  {product.productImages &&
                  product.productImages.length > 0 &&
                  product.productImages[0] ? (
                    <Image
                      src={product.productImages[0].url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No image
                    </div>
                  )}
                  {product.stock === 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 right-2"
                    >
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  {product.Category && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {product.Category.name}
                    </p>
                  )}
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.stock > 0 && (
                      <Badge variant="secondary">
                        {product.stock} in stock
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  // Show first, last, current, and adjacent pages
                  return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                })
                .map((p, idx, arr) => {
                  // Add ellipsis if there's a gap
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && p - prev > 1;

                  return (
                    <div key={p} className="flex items-center gap-2">
                      {showEllipsis && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={page === p ? "default" : "outline"}
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </Button>
                    </div>
                  );
                })}
              <Button
                variant="outline"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
