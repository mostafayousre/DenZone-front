import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export function useDeleteHomeSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteHomeSection = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.delete(`/api/HomeSections/${id}`);
      if (response?.status === 200 || response?.status === 204) {
        return true;
      }
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to delete home section";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteHomeSection, loading, error };
}

export default useDeleteHomeSection;
