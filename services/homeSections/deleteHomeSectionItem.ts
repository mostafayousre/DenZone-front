import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export function useDeleteHomeSectionItem() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteHomeSectionItem = async (
    sectionId: string,
    itemId: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.delete(
        `/api/HomeSections/${sectionId}/items/${itemId}`
      );
      if (response?.status === 200 || response?.status === 204) {
        return true;
      }
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete section item";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteHomeSectionItem, loading, error };
}

export default useDeleteHomeSectionItem;
