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
import { Switch } from "@/components/ui/switch";
import {
  IPromocode,
  ICreatePromocodeDto,
  IUpdatePromocodeDto,
} from "@/shared/types/discount.interface";
import { createPromocode, updatePromocode } from "@/services/discount.service";

interface PromocodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promocode: IPromocode | null;
  onSuccess: () => void;
}

export function PromocodeDialog({
  open,
  onOpenChange,
  promocode,
  onSuccess,
}: PromocodeDialogProps) {
  const [formData, setFormData] = useState({
    value: 0,
    minOrderAmount: 0,
    maxUsage: 1,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (promocode) {
      setFormData({
        value: promocode.value,
        minOrderAmount: promocode.minOrderAmount,
        maxUsage: promocode.maxUsage,
        isActive: promocode.isActive,
      });
    } else {
      setFormData({
        value: 0,
        minOrderAmount: 0,
        maxUsage: 1,
        isActive: true,
      });
    }
  }, [promocode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (promocode) {
        const updateData: IUpdatePromocodeDto = {
          value: formData.value,
          minOrderAmount: formData.minOrderAmount,
          maxUsage: formData.maxUsage,
          isActive: formData.isActive,
        };
        await updatePromocode(promocode.id, updateData);
      } else {
        const createData: ICreatePromocodeDto = {
          value: formData.value,
          minOrderAmount: formData.minOrderAmount,
          maxUsage: formData.maxUsage,
          isActive: formData.isActive,
        };
        await createPromocode(createData);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving promocode:", error);
      alert("Failed to save promocode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {promocode ? "Edit Promocode" : "Create Promocode"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {promocode && (
            <div className="space-y-2">
              <Label>Code</Label>
              <Input value={promocode.code} disabled />
              <p className="text-sm text-gray-500">
                Code cannot be changed after creation
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="value">Discount Value (%)</Label>
            <Input
              id="value"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.value || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  value: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minOrderAmount">Minimum Order Amount (UAH)</Label>
            <Input
              id="minOrderAmount"
              type="number"
              min="0"
              step="0.01"
              value={formData.minOrderAmount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minOrderAmount: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxUsage">Maximum Usage Count</Label>
            <Input
              id="maxUsage"
              type="number"
              min="1"
              value={formData.maxUsage || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxUsage: parseInt(e.target.value) || 1,
                })
              }
              required
            />
          </div>

          {promocode && (
            <div className="space-y-2">
              <Label>Current Usage</Label>
              <Input value={`${promocode.usedCount} times`} disabled />
            </div>
          )}

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
