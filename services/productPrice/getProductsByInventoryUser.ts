import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export interface InventoryProductPriceDto {
  id: string; // productPriceId
  productId?: string;
  productName?: string;
  title?: string;
  salesPrice?: number;
  price?: number;
  purchasePrice?: number;
  categoryName?: string;
  categoryId?: string;
  imageUrl?: string;
  image?: string;
  productImage?: string;
  images?: any;
  inStock?: boolean;
  stockQuantity?: number;
  discountRate?: number;
  rating?: number;
  reviewsCount?: number;
  inventoryUserId?: string;
  inventoryUserName?: string;
}

export function useGetProductsByInventoryUser() {
  const [products, setProducts] = useState<InventoryProductPriceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const getProductsByInventoryUser = async (
    inventoryId: string,
    page: number = 1,
    pageSize: number = 10,
    search: string = ""
  ) => {
    if (!inventoryId) return [];
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get(
        `/api/ProductPrices/by-inventory-user/${inventoryId}`,
        {
          params: {
            page,
            pageSize,
            ...(search ? { search } : {}),
          },
        }
      );

      const payload = response?.data?.data || response?.data?.items || response?.data || [];
      const itemsArray: InventoryProductPriceDto[] = Array.isArray(payload) ? payload : [];
      setProducts(itemsArray);

      if (response.data && typeof response.data === "object" && "totalPages" in response.data) {
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || response.data.totalItems || itemsArray.length);
      } else {
        setTotalPages(1);
        setTotalCount(itemsArray.length);
      }

      return itemsArray;
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Failed to fetch products";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    totalPages,
    totalCount,
    getProductsByInventoryUser,
  };
}

export default useGetProductsByInventoryUser;
