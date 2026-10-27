import { useState } from "react";
import { Price } from "@/types/price";
import AxiosInstance from "@/lib/AxiosInstance";

function useGettingPricesByInventoryId() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);

  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  const gettingPricesByInventoryId = async (
    inventoryId: string | string[] | undefined,
    page: number = 1,
    pageSize: number = 10,
    catId?: string,
    search?: string
  ) => {
    if (!inventoryId) {
      setPrices([]);
      setTotalPages(0);
      setTotalItems(0);
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = {
        page: page,
        pageSize: pageSize,
      };
      if (catId) params.catId = catId;
      if (search && search.trim() !== "") params.search = search.trim();

      const response = await AxiosInstance.get(
        `/api/ProductPrices/by-inventory-user-Provider/${inventoryId}`,
        {
          params,
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch prices");
      }

      const payload = response.data?.data || response.data?.items || response.data;
      const itemsArray: Price[] = Array.isArray(payload) ? payload : [];
      setPrices(itemsArray);

      if (response.data && typeof response.data === "object" && "totalPages" in response.data) {
        setTotalPages(response.data.totalPages || 0);
        setTotalItems(response.data.totalCount || response.data.totalItems || itemsArray.length);
      } else if (Array.isArray(payload)) {
        // If it is a plain array, compute totalPages and totalItems dynamically based on current page and page size
        const hasNextPage = payload.length === pageSize;
        setTotalPages(hasNextPage ? page + 1 : page);
        setTotalItems(
          hasNextPage ? page * pageSize + 1 : (page - 1) * pageSize + payload.length
        );
      } else {
        setTotalPages(0);
        setTotalItems(0);
      }

      return itemsArray;
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || error?.message || "Failed to fetch prices";
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    prices,
    totalPages,
    totalItems,
    totalCount: totalItems,
    gettingPricesByInventoryId,
  };
}

export default useGettingPricesByInventoryId;
