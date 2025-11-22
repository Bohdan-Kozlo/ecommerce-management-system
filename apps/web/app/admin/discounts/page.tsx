"use client";

import { useEffect, useState } from "react";
import {
  getAllDiscounts,
  deleteDiscount,
  getAllPromocodes,
  deletePromocode,
} from "@/services/discount.service";
import { getProducts } from "@/services/product.service";
import { IDiscount, IPromocode } from "@/shared/types/discount.interface";
import { IProduct } from "@/shared/types/product.interface";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DiscountDialog } from "@/components/admin/discount-dialog";
import { PromocodeDialog } from "@/components/admin/promocode-dialog";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<IDiscount[]>([]);
  const [promocodes, setPromocodes] = useState<IPromocode[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscount, setSelectedDiscount] = useState<IDiscount | null>(
    null
  );
  const [selectedPromocode, setSelectedPromocode] = useState<IPromocode | null>(
    null
  );
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isPromocodeDialogOpen, setIsPromocodeDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [discountsData, promocodesData, productsData] = await Promise.all([
      getAllDiscounts(),
      getAllPromocodes(),
      getProducts(),
    ]);
    if (discountsData) setDiscounts(discountsData);
    if (promocodesData) setPromocodes(promocodesData);
    if (productsData) setProducts(productsData.products);
    setLoading(false);
  };

  const handleDeleteDiscount = async (id: string) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      const result = await deleteDiscount(id);
      if (result) {
        fetchData();
      }
    }
  };

  const handleDeletePromocode = async (id: string) => {
    if (confirm("Are you sure you want to delete this promocode?")) {
      const result = await deletePromocode(id);
      if (result) {
        fetchData();
      }
    }
  };

  const handleCreateDiscount = () => {
    setSelectedDiscount(null);
    setIsDiscountDialogOpen(true);
  };

  const handleEditDiscount = (discount: IDiscount) => {
    setSelectedDiscount(discount);
    setIsDiscountDialogOpen(true);
  };

  const handleCreatePromocode = () => {
    setSelectedPromocode(null);
    setIsPromocodeDialogOpen(true);
  };

  const handleEditPromocode = (promocode: IPromocode) => {
    setSelectedPromocode(promocode);
    setIsPromocodeDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDiscountDialogOpen(false);
    setIsPromocodeDialogOpen(false);
    setSelectedDiscount(null);
    setSelectedPromocode(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Discounts & Promocodes Management
        </h1>
      </div>

      <Tabs defaultValue="discounts" className="w-full">
        <TabsList>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
          <TabsTrigger value="promocodes">Promocodes</TabsTrigger>
        </TabsList>

        <TabsContent value="discounts">
          <div className="flex justify-end mb-4">
            <Button onClick={handleCreateDiscount}>
              <Plus className="mr-2 h-4 w-4" />
              Create Discount
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Discount Value</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-500"
                    >
                      No discounts found
                    </TableCell>
                  </TableRow>
                ) : (
                  discounts.map((discount) => (
                    <TableRow key={discount.id}>
                      <TableCell className="font-medium">
                        {discount.product?.name || "Unknown Product"}
                      </TableCell>
                      <TableCell>{discount.value}%</TableCell>
                      <TableCell>
                        {new Date(discount.startDate).toLocaleDateString(
                          "en-US"
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(discount.endDate).toLocaleDateString("en-US")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={discount.isActive ? "default" : "secondary"}
                        >
                          {discount.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDiscount(discount)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDiscount(discount.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="promocodes">
          <div className="flex justify-end mb-4">
            <Button onClick={handleCreatePromocode}>
              <Plus className="mr-2 h-4 w-4" />
              Create Promocode
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount Value</TableHead>
                  <TableHead>Min Order Amount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promocodes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-gray-500"
                    >
                      No promocodes found
                    </TableCell>
                  </TableRow>
                ) : (
                  promocodes.map((promocode) => (
                    <TableRow key={promocode.id}>
                      <TableCell className="font-mono font-medium">
                        {promocode.code}
                      </TableCell>
                      <TableCell>{promocode.value}%</TableCell>
                      <TableCell>
                        {promocode.minOrderAmount.toFixed(2)} UAH
                      </TableCell>
                      <TableCell>
                        {promocode.usedCount} / {promocode.maxUsage}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={promocode.isActive ? "default" : "secondary"}
                        >
                          {promocode.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPromocode(promocode)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePromocode(promocode.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <DiscountDialog
        open={isDiscountDialogOpen}
        onOpenChange={setIsDiscountDialogOpen}
        discount={selectedDiscount}
        products={products}
        onSuccess={handleDialogClose}
      />

      <PromocodeDialog
        open={isPromocodeDialogOpen}
        onOpenChange={setIsPromocodeDialogOpen}
        promocode={selectedPromocode}
        onSuccess={handleDialogClose}
      />
    </div>
  );
}
