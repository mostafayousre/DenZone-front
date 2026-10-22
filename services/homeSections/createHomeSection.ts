import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export interface CreateHomeSectionPayload {
  type: number;
  title?: string;
  subtitle?: string;
}

export interface CreatedHomeSectionDto {
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

export function useCreateHomeSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createHomeSection = async (payload: CreateHomeSectionPayload): Promise<CreatedHomeSectionDto> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.post<CreatedHomeSectionDto>("/api/HomeSections", payload);
      if (response?.status === 200 || response?.status === 201) {
        return response.data;
      } else {
        throw new Error("Failed to create home section");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to create home section";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createHomeSection, loading, error };
}

export default useCreateHomeSection;
