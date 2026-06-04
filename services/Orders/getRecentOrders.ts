import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface RecentOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  doctorName: string;
  inventoryUserName: string;
  status: string;
}

function useGetRecentOrders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  const getRecentOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get("/api/Orders/recent-orders");
      if (response.status === 200) {
        setRecentOrders(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error("Failed to fetch recent orders");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
      recentOrders && setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, recentOrders, getRecentOrders };
}

export default useGetRecentOrders;
