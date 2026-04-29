import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

interface DownloadPriceCsvHook {
  loading: boolean;
  error: string | null;
  downloadCSV: (providerId?: string) => Promise<void>;
}

function useDownloadPriceCsv(): DownloadPriceCsvHook {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadCSV = async (providerId?: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const response = await AxiosInstance.get('/api/ProductPrices/export-excel-toinventory', {
        params: providerId ? { inventoryId: providerId } : {},
        responseType: 'blob',
      });

      if (response.status !== 200) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'prices.xlsx';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, downloadCSV };
}

export default useDownloadPriceCsv;