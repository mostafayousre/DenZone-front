import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export function useUpdateLimitOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLimitOrder = async (orderLimit: number): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.post(`/api/Orders/update-limit-order?orderlimit=${orderLimit}`);
      
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(response.data?.message || "Failed to update limit");
      }
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err.message || "An unexpected error occurred.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateLimitOrder, loading, error };
}
