import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export interface MoveHomeSectionPayload {
  direction: "up" | "down" | "Up" | "Down" | string;
}

export function useMoveHomeSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moveHomeSection = async (
    id: string,
    direction: "up" | "down" | string
  ): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.put(`/api/HomeSections/${id}/move`, {
        direction,
      });
      if (response?.status === 200 || response?.status === 204) {
        return response.data;
      }
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to move home section";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { moveHomeSection, loading, error };
}

export default useMoveHomeSection;
