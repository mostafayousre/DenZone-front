import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export type FlashSaleItem = {
  productPriceId: string;
  flashSalePrice: number;
  beforeSalePrice: number;
};

export type FlashSalePayload = {
  flashSaleName: string;
  startDate: string;
  endDate: string;
  items: FlashSaleItem[];
};

function useCreateFlashSale() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFlashSale = async (payload: FlashSalePayload): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await AxiosInstance.post(
        "/api/ProductPrices/product-prices/flash-sale",
        payload
      );

      if (![200, 201, 204].includes(response.status)) {
        throw new Error("Failed to create flash sale");
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

  return {
    loading,
    error,
    createFlashSale,
  };
}

export default useCreateFlashSale;
