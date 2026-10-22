import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export interface HomeSectionTypeDto {
  type: number;
  key: string;
  name: string;
  defaultTitle: string;
  defaultSubtitle: string;
  itemKind: number;
}

export function useGetHomeSectionTypes() {
  const [data, setData] = useState<HomeSectionTypeDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getSectionTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get<HomeSectionTypeDto[]>("/api/HomeSections/types");
      if (response?.status === 200 && Array.isArray(response.data)) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error("Failed to fetch section types");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to fetch section types";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, getSectionTypes };
}

export default useGetHomeSectionTypes;
