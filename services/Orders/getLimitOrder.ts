import { useState, useCallback } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface OrderLimit {
  id: number;
  minimumOrder: number;
}

export function useGetLimitOrder() {
  const [limit, setLimit] = useState<OrderLimit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLimitOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get<OrderLimit[]>("/api/Orders/get-limits-order");
      if (response.data && response.data.length > 0) {
        setLimit(response.data[0]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to fetch limit");
    } finally {
      setLoading(false);
    }
  }, []);

  return { limit, loading, error, getLimitOrder };
}
