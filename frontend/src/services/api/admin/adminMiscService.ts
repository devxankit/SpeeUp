import api from "../config";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  registrationDate: string;
  status: "Active" | "Inactive" | "Suspended";
  refCode?: string;
  walletAmount: number;
  totalOrders: number;
  totalSpent: number;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReturnRequest {
  _id: string;
  orderId: string;
  orderItemId: string;
  userId: string;
  userName: string;
  sellerId: string;
  sellerName: string;
  productId: string;
  productName: string;
  variant?: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  total: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Refunded";
  requestedAt: string;
  processedAt?: string;
  refundAmount?: number;
  adminNotes?: string;
}

export interface HeaderCategory {
  _id: string;
  name: string;
  image?: string;
  order: number;
  isActive: boolean;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeSection {
  _id: string;
  title: string;
  type: "banner" | "featured_products" | "categories" | "deals";
  content: any; // Flexible content based on type
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopByStore {
  _id: string;
  storeId: string;
  storeName: string;
  logo?: string;
  banner?: string;
  description?: string;
  category: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReturnRequestData {
  orderId: string;
  orderItemId: string;
  userId: string;
  reason: string;
  status?: "Pending" | "Approved" | "Rejected" | "Refunded";
}

export interface UpdateReturnRequestData {
  status?: "Pending" | "Approved" | "Rejected" | "Refunded";
  refundAmount?: number;
  adminNotes?: string;
}

export interface CreateHeaderCategoryData {
  name: string;
  image?: string;
  order?: number;
  isActive?: boolean;
  categoryId: string;
}

export interface UpdateHeaderCategoryData {
  name?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
  categoryId?: string;
}

export interface CreateHomeSectionData {
  title: string;
  type: "banner" | "featured_products" | "categories" | "deals";
  content: any;
  order?: number;
  isActive?: boolean;
}

export interface UpdateHomeSectionData {
  title?: string;
  type?: "banner" | "featured_products" | "categories" | "deals";
  content?: any;
  order?: number;
  isActive?: boolean;
}

export interface GetMiscParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * User Management APIs
 */
export const getUsers = async (
  params?: GetMiscParams
): Promise<ApiResponse<User[]>> => {
  const response = await api.get<ApiResponse<User[]>>("/admin/customers", {
    params,
  });
  return response.data;
};

export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>(`/admin/customers/${id}`);
  return response.data;
};

export const updateUserStatus = async (
  id: string,
  status: "Active" | "Inactive" | "Suspended"
): Promise<ApiResponse<User>> => {
  const response = await api.patch<ApiResponse<User>>(
    `/admin/customers/${id}/status`,
    { status }
  );
  return response.data;
};

export const updateUser = async (
  id: string,
  data: Partial<User>
): Promise<ApiResponse<User>> => {
  const response = await api.put<ApiResponse<User>>(`/admin/customers/${id}`, data);
  return response.data;
};

/**
 * Return Request APIs
 */
export const getReturnRequests = async (
  params?: GetMiscParams
): Promise<ApiResponse<ReturnRequest[]>> => {
  const response = await api.get<ApiResponse<ReturnRequest[]>>(
    "/admin/return-requests",
    { params }
  );
  return response.data;
};

export const getReturnRequestById = async (
  id: string
): Promise<ApiResponse<ReturnRequest>> => {
  const response = await api.get<ApiResponse<ReturnRequest>>(
    `/admin/return-requests/${id}`
  );
  return response.data;
};

export const updateReturnRequest = async (
  id: string,
  data: UpdateReturnRequestData
): Promise<ApiResponse<ReturnRequest>> => {
  const response = await api.put<ApiResponse<ReturnRequest>>(
    `/admin/return-requests/${id}`,
    data
  );
  return response.data;
};

/**
 * Header Category APIs
 */
export const getHeaderCategories = async (
  params?: GetMiscParams
): Promise<ApiResponse<HeaderCategory[]>> => {
  const response = await api.get<ApiResponse<HeaderCategory[]>>(
    "/admin/header-categories",
    { params }
  );
  return response.data;
};

export const createHeaderCategory = async (
  data: CreateHeaderCategoryData
): Promise<ApiResponse<HeaderCategory>> => {
  const response = await api.post<ApiResponse<HeaderCategory>>(
    "/admin/header-categories",
    data
  );
  return response.data;
};

export const updateHeaderCategory = async (
  id: string,
  data: UpdateHeaderCategoryData
): Promise<ApiResponse<HeaderCategory>> => {
  const response = await api.put<ApiResponse<HeaderCategory>>(
    `/admin/header-categories/${id}`,
    data
  );
  return response.data;
};

export const deleteHeaderCategory = async (
  id: string
): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(
    `/admin/header-categories/${id}`
  );
  return response.data;
};

export const updateHeaderCategoryOrder = async (
  categories: Array<{ id: string; order: number }>
): Promise<ApiResponse<void>> => {
  const response = await api.put<ApiResponse<void>>(
    "/admin/header-categories/order",
    { categories }
  );
  return response.data;
};

/**
 * Home Section APIs
 */
export const getHomeSections = async (
  params?: GetMiscParams
): Promise<ApiResponse<HomeSection[]>> => {
  const response = await api.get<ApiResponse<HomeSection[]>>(
    "/admin/home-sections",
    { params }
  );
  return response.data;
};

export const createHomeSection = async (
  data: CreateHomeSectionData
): Promise<ApiResponse<HomeSection>> => {
  const response = await api.post<ApiResponse<HomeSection>>(
    "/admin/home-sections",
    data
  );
  return response.data;
};

export const updateHomeSection = async (
  id: string,
  data: UpdateHomeSectionData
): Promise<ApiResponse<HomeSection>> => {
  const response = await api.put<ApiResponse<HomeSection>>(
    `/admin/home-sections/${id}`,
    data
  );
  return response.data;
};

export const deleteHomeSection = async (
  id: string
): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(
    `/admin/home-sections/${id}`
  );
  return response.data;
};

export const updateHomeSectionOrder = async (
  sections: Array<{ id: string; order: number }>
): Promise<ApiResponse<void>> => {
  const response = await api.put<ApiResponse<void>>(
    "/admin/home-sections/order",
    { sections }
  );
  return response.data;
};

/**
 * Shop by Store APIs
 */
export const getShopByStores = async (
  params?: GetMiscParams
): Promise<ApiResponse<ShopByStore[]>> => {
  const response = await api.get<ApiResponse<ShopByStore[]>>(
    "/admin/shop-by-stores",
    { params }
  );
  return response.data;
};

export const createShopByStore = async (
  data: Partial<ShopByStore>
): Promise<ApiResponse<ShopByStore>> => {
  const response = await api.post<ApiResponse<ShopByStore>>(
    "/admin/shop-by-stores",
    data
  );
  return response.data;
};

export const updateShopByStore = async (
  id: string,
  data: Partial<ShopByStore>
): Promise<ApiResponse<ShopByStore>> => {
  const response = await api.put<ApiResponse<ShopByStore>>(
    `/admin/shop-by-stores/${id}`,
    data
  );
  return response.data;
};

export const deleteShopByStore = async (
  id: string
): Promise<ApiResponse<void>> => {
  const response = await api.delete<ApiResponse<void>>(
    `/admin/shop-by-stores/${id}`
  );
  return response.data;
};
