import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useToggleFlashSaleStatus() {
  const [loading, setLoading] = useState(false);

  const toggleFlashSaleStatus = async (
    flashId: string,
    isActive: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get(
        "/api/ProductPrices/Active-flash-sale",
        {
          params: {
            flashId,
            IsActive: isActive,
          },
        }
      );
      if (![200, 201, 204].includes(response.status)) {
        throw new Error("Failed to toggle status");
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    toggleFlashSaleStatus,
  };
}

export default useToggleFlashSaleStatus;
