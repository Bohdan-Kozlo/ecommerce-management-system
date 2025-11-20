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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Upload } from "lucide-react";
import type { IProduct } from "@/shared/types/product.interface";
import type { ICategory } from "@/shared/types/category.interface";
import Image from "next/image";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    categoryId?: string;
    images?: File[];
    existingImageUrls?: string[];
  }) => Promise<void>;
  product?: IProduct;
  categories: ICategory[];
  mode: "create" | "edit";
}

export function ProductDialog({
  open,
  onOpenChange,
  onSubmit,
  product,
  categories,
  mode,
}: ProductDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && mode === "edit") {
      setName(product.name);
      setDescription(product.description || "");
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setCategoryId(product.categoryId || "");
      setExistingImages(product.productImages.map((img) => img.url));
      setNewImages([]);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategoryId("");
      setNewImages([]);
      setExistingImages([]);
    }
  }, [product, mode, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...filesArray]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        name,
        description: description || undefined,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        categoryId: categoryId || undefined,
        images: newImages.length > 0 ? newImages : undefined,
        existingImageUrls: mode === "edit" ? existingImages : undefined,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Product" : "Edit Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Images</Label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={url}
                      alt={`Product ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Images Preview */}
            {newImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {newImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-24 object-cover rounded"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <Label htmlFor="images" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  <span>Upload Images</span>
                </div>
              </Label>
              <span className="text-sm text-gray-500">
                ({existingImages.length + newImages.length}/10)
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
