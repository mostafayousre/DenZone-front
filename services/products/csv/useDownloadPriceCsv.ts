import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";
import Cookies from "js-cookie";

interface DownloadPriceCsvHook {
  loading: boolean;
  latestLoading: boolean;
  error: string | null;
  downloadCSV: (providerId?: string) => Promise<void>;
  downloadLatestCSV: (providerId?: string) => Promise<void>;
}

function useDownloadPriceCsv(): DownloadPriceCsvHook {
  const [loading, setLoading] = useState(false);
  const [latestLoading, setLatestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadCSV = async (providerId?: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const userRole = Cookies.get("userRole");
      const isInventoryOrProvider = userRole === "Inventory" || userRole === "inventory" || userRole === "Provider" || userRole === "provider";
      const endpoint = isInventoryOrProvider 
        ? '/api/ProductPrices/export-excel-first' 
        : '/api/ProductPrices/export-excel-toinventory';

      const response = await AxiosInstance.get(endpoint, {
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

  const downloadLatestCSV = async (providerId?: string): Promise<void> => {
    setLatestLoading(true);
    setError(null);

    try {
      const response = await AxiosInstance.get('/api/ProductPrices/export-excel-latest-product', {
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
      a.download = 'latest_prices.xlsx';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLatestLoading(false);
    }
  };

  return { loading, latestLoading, error, downloadCSV, downloadLatestCSV };
}

export default useDownloadPriceCsv;