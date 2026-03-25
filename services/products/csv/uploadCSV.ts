import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

interface UploadCSVResponse {
  success: boolean;
  data?: any;
  hasFailedEntries?: boolean;
  failedEntriesFile?: string | null;
  error?: string;
}

function useUploadCsv() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const uploadCSV = async (
    file: File,
    returnFile: boolean = false
  ): Promise<UploadCSVResponse> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await AxiosInstance.post(
        `/api/ProductPrices/ImportAddProductsFromExcel?returnFile=${returnFile}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        setSuccess(true);

        const contentType = response.headers["content-type"];
        const contentDisposition = response.headers["content-disposition"];

        let downloadedFile = null;

        if (
          contentType?.includes("spreadsheet") ||
          contentType?.includes("excel") ||
          contentDisposition?.includes("attachment")
        ) {
          console.log("File detected! Starting download...");

          let filename = "Failed_Prices.xlsx";
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
          const url = window.URL.createObjectURL(blob);

          try {
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            }, 100);

            downloadedFile = filename;
            console.log("Download completed:", filename);
          } catch (downloadError) {
            window.URL.revokeObjectURL(url);
            console.error(
              "Failed to download failed entries file:",
              downloadError
            );
          }
        } else {
          console.log("JSON response detected - no failed entries");
        }

        return {
          success: true,
          data: response.data,
          hasFailedEntries: !!downloadedFile,
          failedEntriesFile: downloadedFile,
        };
      }

      throw new Error("Upload failed");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to upload file";
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
        hasFailedEntries: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    uploadCSV,
  };
}

export default useUploadCsv;
