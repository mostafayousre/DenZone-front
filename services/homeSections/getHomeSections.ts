import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export interface HomeSectionApiItem {
  id: string;
  type: number;
  typeKey: string;
  title: string;
  subtitle: string;
  isVisible: boolean;
  orderNum: number;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  items?: any[];
}

export function useGetHomeSections() {
  const [data, setData] = useState<HomeSectionApiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getHomeSections = async (): Promise<HomeSectionApiItem[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get<HomeSectionApiItem[]>("/api/HomeSections");
      if (response?.status === 200 && Array.isArray(response.data)) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error("Failed to fetch home sections");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to fetch home sections";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, getHomeSections };
}

export default useGetHomeSections;
