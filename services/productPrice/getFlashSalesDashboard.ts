import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export type FlashSaleDashboardItem = {
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

function useGetFlashSalesDashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashSales, setFlashSales] = useState<FlashSaleDashboardItem[]>([]);

  const fetchFlashSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get("/api/ProductPrices/flash-sale-dashbourd");
      if (response.status !== 200) {
        throw new Error("Failed to fetch flash sales dashboard");
      }
      setFlashSales(response.data || []);
    } catch (err: any) {
      setError(err?.message || "An error occurred while fetching flash sales");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    flashSales,
    fetchFlashSales,
  };
}

export default useGetFlashSalesDashboard;
