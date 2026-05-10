import { useState, useCallback } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface InventoryNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  status: number;
  expired: string;
  createdAt: string;
}

function useGetInventoryNotifications() {
  const [data, setData] = useState<InventoryNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNotifications = useCallback(async (userId: string) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get<InventoryNotification[]>(`/api/Notifacations/${userId}`);
      if (response.status === 200) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Something went wrong!");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, getNotifications };
}

export default useGetInventoryNotifications;
