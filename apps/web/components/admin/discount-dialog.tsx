"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  IDiscount,
  ICreateDiscountDto,
  IUpdateDiscountDto,
} from "@/shared/types/discount.interface";
import { IProduct } from "@/shared/types/product.interface";
import { createDiscount, updateDiscount } from "@/services/discount.service";

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: IDiscount | null;
  products: IProduct[];
  onSuccess: () => void;
}

export function DiscountDialog({
  open,
  onOpenChange,
  discount,
  products,
  onSuccess,
}: DiscountDialogProps) {
  const [formData, setFormData] = useState({
    productId: "",
    value: 0,
    startDate: "",
    endDate: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (discount) {
      setFormData({
        productId: discount.productId,
        value: discount.value,
        startDate: discount.startDate?.split("T")?.[0] || "",
        endDate: discount.endDate?.split("T")?.[0] || "",
        isActive: discount.isActive,
      });
    } else {
      setFormData({
        productId: "",
        value: 0,
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
  }, [discount, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (discount) {
        const updateData: IUpdateDiscountDto = {
          productId: formData.productId,
          value: formData.value,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isActive,
        };
        await updateDiscount(discount.id, updateData);
      } else {
        const createData: ICreateDiscountDto = {
          productId: formData.productId,
          value: formData.value,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isActive,
        };
        await createDiscount(createData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving discount:", error);
      alert("Failed to save discount");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {discount ? "Edit Discount" : "Create Discount"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select
              value={formData.productId}
              onValueChange={(value) =>
                setFormData({ ...formData, productId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Discount Value (%)</Label>
            <Input
              id="value"
              type="number"
              min="0"
              max="100"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: parseFloat(e.target.value) })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
