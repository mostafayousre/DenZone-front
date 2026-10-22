import { useState, useCallback, useRef } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface NotificationUser {
  id: string;
  userName: string;
}

export interface NotificationItem {
  id: string;
  group?: string;
  recipients?: string;
  recipientsCount?: number;
  users?: NotificationUser[];
  notificationIds?: string[];
  title: string;
  message: string;
  link?: string | null;
  status: number;
  createdAt: string;
  expiredAt?: string;
  // Fallbacks for backwards compatibility if needed
  userId?: string;
  userName?: string;
  expired?: string;
}

export interface PaginatedNotificationsResponse {
  items: NotificationItem[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

function useGetAllNotifications() {
  const [data, setData] = useState<NotificationItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const getAllNotifications = useCallback(
    async (pageNum: number = 1, pSize: number = 10, search?: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const params: Record<string, any> = {
          pageNumber: pageNum,
          pageSize: pSize,
        };

        if (search && search.trim()) {
          params.search = search.trim();
        }

        const response = await AxiosInstance.get<PaginatedNotificationsResponse | NotificationItem[]>(
          `/api/Notifacations/Get-All-Notifications`,
          {
            params,
            signal: controller.signal,
          }
        );

        if (response.status === 200 && response.data) {
          const res = response.data;
          if (Array.isArray(res)) {
            setData(res);
            setTotalItems(res.length);
            setTotalPages(1);
            setPageNumber(1);
            setPageSize(res.length || pSize);
          } else {
            setData(res.items || []);
            setTotalItems(res.totalItems ?? (res.items?.length || 0));
            setTotalPages(res.totalPages ?? 1);
            setPageNumber(res.pageNumber ?? pageNum);
            setPageSize(res.pageSize ?? pSize);
          }
        } else {
          setData([]);
        }
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
          return;
        }
        setError(err.response?.data?.message || err.message || "Failed to fetch notifications");
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    totalItems,
    totalPages,
    pageNumber,
    pageSize,
    loading,
    error,
    getAllNotifications,
    setData,
  };
}

export default useGetAllNotifications;
