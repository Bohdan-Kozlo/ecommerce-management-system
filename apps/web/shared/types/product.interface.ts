export interface IProductImage {
  id: string;
  url: string;
  productId: string;
}

export interface ICategory {
  id: string;
  name: string;
  description?: string;
}

export interface IDiscount {
  id: string;
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  productId: string;
}

export interface IProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
  Category?: ICategory;
  productImages?: IProductImage[];
  discount?: IDiscount[];
  createdAt: string;
  updatedAt: string;
}

export interface IProductsResponse {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?:
    | "price_asc"
    | "price_desc"
    | "name_asc"
    | "name_desc"
    | "createdAt_desc"
    | "createdAt_asc";
  page?: number;
  limit?: number;
}
