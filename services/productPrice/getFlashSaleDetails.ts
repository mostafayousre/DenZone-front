import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export type FlashSaleDetails = {
  flashId: string;
  flashSaleName: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  items: {
    productPriceId: string;
    productId: string;
    productName: string;
    productImage: string | null;
    flashSalePrice: number;
    discountPercentage: number;
    stockQuantity: number;
    beforeSalePrice: number;
  }[];
};

function useGetFlashSaleDetails() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<FlashSaleDetails | null>(null);

  const fetchDetails = async (flashId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get("/api/ProductPrices/flash-sale-Details", {
        params: { flashId },
      });
      if (response.status !== 200) {
        throw new Error("Failed to fetch flash sale details");
      }
      setDetails(response.data || null);
    } catch (err: any) {
      setError(err?.message || "An error occurred while fetching flash sale details");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    details,
    fetchDetails,
  };
}

export default useGetFlashSaleDetails;
