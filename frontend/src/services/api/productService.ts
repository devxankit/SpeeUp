import api from './config';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProductVariation {
  _id?: string;
  title: string;
  price: number;
  discPrice: number;
  stock: number;
  status: 'Available' | 'Sold out';
  sku?: string;
}

export interface Product {
  _id: string;
  productName: string;
  sellerId: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  publish: boolean;
  popular: boolean;
  dealOfDay: boolean;
  seoTitle?: string;
  seoKeywords?: string;
  seoImageAlt?: string;
  seoDescription?: string;
  smallDescription?: string;
  tags: string[];
  manufacturer?: string;
  madeIn?: string;
  taxId?: string;
  isReturnable: boolean;
  maxReturnDays?: number;
  totalAllowedQuantity: number;
  fssaiLicNo?: string;
  mainImageUrl?: string;
  galleryImageUrls: string[];
  variations: ProductVariation[];
  variationType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductData {
  productName: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  publish: boolean;
  popular: boolean;
  dealOfDay: boolean;
  seoTitle?: string;
  seoKeywords?: string;
  seoImageAlt?: string;
  seoDescription?: string;
  smallDescription?: string;
  tags?: string[];
  manufacturer?: string;
  madeIn?: string;
  taxId?: string;
  isReturnable: boolean;
  maxReturnDays?: number;
  totalAllowedQuantity: number;
  fssaiLicNo?: string;
  mainImageUrl?: string;
  galleryImageUrls?: string[];
  variations: ProductVariation[];
  variationType?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> { }

export interface GetProductsParams {
  search?: string;
  category?: string;
  status?: 'published' | 'unpublished' | 'popular' | 'dealOfDay';
  stock?: 'inStock' | 'outOfStock';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}


/**
 * Create a new product
 */
export const createProduct = async (data: CreateProductData): Promise<ApiResponse<Product>> => {
  const response = await api.post<ApiResponse<Product>>('/products', data);
  return response.data;
};

/**
 * Get seller's products with filters
 */
export const getProducts = async (params?: GetProductsParams): Promise<ApiResponse<Product[]>> => {
  const response = await api.get<ApiResponse<Product[]>>('/products', { params });
  return response.data;
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<ApiResponse<Product>> => {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data;
};

/**
 * Update product
 */
export const updateProduct = async (id: string, data: UpdateProductData): Promise<ApiResponse<Product>> => {
  const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
  return response.data;
};

/**
 * Update stock for a product variation
 */
export const updateStock = async (
  productId: string,
  variationId: string,
  stock: number,
  status?: 'Available' | 'Sold out'
): Promise<ApiResponse<Product>> => {
  const response = await api.patch<ApiResponse<Product>>(
    `/products/${productId}/variations/${variationId}/stock`,
    { stock, status }
  );
  return response.data;
};

/**
 * Bulk update stock for multiple variations
 */
export const bulkUpdateStock = async (updates: { productId: string, variationId: string, stock: number }[]): Promise<any> => {
  const response = await api.patch('/products/bulk-stock-update', { updates });
  return response.data;
};

/**
 * Delete product
 */
export const deleteProduct = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(`/products/${id}`);
  return response.data;
};

/**
 * Update product status (publish, popular, dealOfDay)
 */
export const updateProductStatus = async (
  id: string,
  status: { publish?: boolean; popular?: boolean; dealOfDay?: boolean }
): Promise<ApiResponse<Product>> => {
  const response = await api.patch<ApiResponse<Product>>(`/products/${id}/status`, status);
  return response.data;
};
