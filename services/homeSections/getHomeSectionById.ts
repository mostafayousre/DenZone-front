import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { HomeSectionApiItem } from "./getHomeSections";

export function useGetHomeSectionById() {
  const [data, setData] = useState<HomeSectionApiItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getHomeSectionById = async (id: string): Promise<HomeSectionApiItem> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get<HomeSectionApiItem>(`/api/HomeSections/${id}`);
      if (response?.status === 200 && response.data) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error("Failed to fetch home section details");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to fetch home section details";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, getHomeSectionById };
}

export default useGetHomeSectionById;
