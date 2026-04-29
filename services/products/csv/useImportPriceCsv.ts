import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

interface ImportPriceCsvResponse {
  success: boolean;
  data?: any;
  error?: string;
}

function useImportPriceCsv() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const importPriceCsv = async (
    file: File,
    providerId?: string
  ): Promise<ImportPriceCsvResponse> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const url = providerId 
        ? `/api/ProductPrices/ImportAddProductsFromExcel-ToInventory?inventoryId=${providerId}`
        : `/api/ProductPrices/ImportAddProductsFromExcel-ToInventory`;

      const response = await AxiosInstance.post(
        url,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        return {
          success: true,
          data: response.data,
        };
      }

      throw new Error("Import failed");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to import file";
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    importPriceCsv,
  };
}

export default useImportPriceCsv;
