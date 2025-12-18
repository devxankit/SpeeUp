import api from './config';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Category {
  _id: string;
  name: string;
  imageUrl?: string;
  parentId?: string;
  isBestseller: boolean;
  hasWarning: boolean;
  groupCategory?: string;
  totalSubcategory?: number;
  totalProduct?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategory {
  _id: string;
  id?: string;
  categoryName: string;
  subcategoryName: string;
  subcategoryImage?: string;
  totalProduct?: number;
  parentId?: string;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: SubCategory[];
}

export interface GetCategoriesParams {
  includeSubcategories?: boolean;
  search?: string;
}

export interface GetSubcategoriesParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Get all categories (parent categories only by default)
 */
export const getCategories = async (params?: GetCategoriesParams): Promise<ApiResponse<Category[]>> => {
  const response = await api.get<ApiResponse<Category[]>>('/categories', { params });
  return response.data;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: string): Promise<ApiResponse<Category>> => {
  const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
  return response.data;
};

/**
 * Get subcategories by parent category ID
 */
export const getSubcategories = async (
  categoryId: string,
  params?: GetSubcategoriesParams
): Promise<ApiResponse<SubCategory[]>> => {
  const response = await api.get<ApiResponse<SubCategory[]>>(`/categories/${categoryId}/subcategories`, { params });
  return response.data;
};

/**
 * Get all subcategories (across all categories)
 */
export const getAllSubcategories = async (params?: GetSubcategoriesParams): Promise<ApiResponse<SubCategory[]>> => {
  const response = await api.get<ApiResponse<SubCategory[]>>('/categories/subcategories', { params });
  return response.data;
};

/**
 * Get all categories with nested subcategories
 */
export const getAllCategoriesWithSubcategories = async (): Promise<ApiResponse<CategoryWithSubcategories[]>> => {
  const response = await api.get<ApiResponse<CategoryWithSubcategories[]>>('/categories/all-with-subcategories');
  return response.data;
};

