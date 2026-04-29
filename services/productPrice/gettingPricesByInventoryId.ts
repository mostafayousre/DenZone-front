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
    page: number = 1 ,
    pageSize: number = 10
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get(
        `/api/ProductPrices/by-inventory-user-Provider/${inventoryId}`,
        {
          params: {
            page: page,
            pageSize: pageSize,
          },
        }
      );
      
      if (response.status !== 200) {
        throw new Error("Failed to fetch prices");
      }
      
      const payload = response.data?.data || response.data;
      setPrices(Array.isArray(payload) ? payload : []);
      setTotalPages(response.data?.totalPages || 0);
      setTotalItems(response.data?.totalCount || 0);
    } catch (error: any) {
      setError(error.message);
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
    gettingPricesByInventoryId,
  };
}

export default useGettingPricesByInventoryId;
