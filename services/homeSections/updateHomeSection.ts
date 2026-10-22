import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export interface UpdateHomeSectionPayload {
  title?: string;
  subtitle?: string;
  isVisible: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export function useUpdateHomeSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateHomeSection = async (
    id: string,
    payload: UpdateHomeSectionPayload
  ): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.put(`/api/HomeSections/${id}`, payload);
      if (response?.status === 200 || response?.status === 204) {
        return response.data;
      }
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to update home section";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateHomeSection, loading, error };
}

export default useUpdateHomeSection;
