import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

interface UpdateProductPriceData {
  priceId: string; // The ProductPrice ID
  purchasePrice: number;
  salesPrice: number;
  stockQuantity: number;
  maxQuantity: number;
  discountRate: number;
}

function useUpdateProductPrices() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProductPrices = async (data: UpdateProductPriceData): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { priceId, ...body } = data;
      const response = await AxiosInstance.put(`/api/ProductPrices/update-prices`, body, {
        params: {
          priceId: priceId
        }
      });
      
      if (response.status !== 200 && response.status !== 204) {
        throw new Error(response.data?.message || "Failed to update prices");
      }
      
      return { success: true };
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      let errorMessage = "An unexpected error occurred.";
      
      if (apiErrors && typeof apiErrors === "object") {
        const firstKey = Object.keys(apiErrors)[0];
        const firstMessage = apiErrors[firstKey][0];
        errorMessage = `${firstKey}: ${firstMessage}`;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateProductPrices, loading, error };
}

export default useUpdateProductPrices;
