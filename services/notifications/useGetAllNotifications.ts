import { useState, useCallback } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface NotificationItem {
  id: string;
  userId: string;
  message: string;
  title: string;
  createdAt: string;
  status: number;
  expired: string;
  userName: string;
}

function useGetAllNotifications() {
  const [data, setData] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get<NotificationItem[]>(`/api/Notifacations/Get-All-Notifications`);
      if (response.status === 200) {
        setData(response.data);
      } else {
        setData([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to fetch notifications");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, getAllNotifications, setData };
}

export default useGetAllNotifications;
