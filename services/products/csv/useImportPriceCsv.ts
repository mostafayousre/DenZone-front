import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";
import Cookies from "js-cookie";

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
      
      const userRole = Cookies.get("userRole");
      const userId = Cookies.get("userId");
      const isInventory = userRole === "Inventory" || userRole === "inventory";

      let url = `/api/ProductPrices/ImportAddProductsFromExcel-ToInventory`;
      
      if (providerId) {
        url += `?inventoryId=${providerId}`;
      } else if (isInventory && userId) {
        url += `?inventoryId=${userId}`;
      }

      const response = await AxiosInstance.post(
        url,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);

        const contentType = response.headers["content-type"];
        const contentDisposition = response.headers["content-disposition"];

        if (
          contentType?.includes("spreadsheet") ||
          contentType?.includes("excel") ||
          contentDisposition?.includes("attachment")
        ) {
          let filename = "Import_Result.xlsx";
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(
              /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
            );
            if (filenameMatch?.[1]) {
              filename = filenameMatch[1].replace(/['"]/g, "");
            }
          }

          const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
        }

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
