import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export interface ProviderDto {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  isAvailableNow?: boolean;
  profileImage?: string;
}

export function useGetProviders() {
  const [providers, setProviders] = useState<ProviderDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get<ProviderDto[]>("/api/Users/get-providers");
      if (response?.status === 200 && Array.isArray(response.data)) {
        setProviders(response.data);
        return response.data;
      }
      return [];
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch providers";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { providers, loading, error, getProviders };
}

export default useGetProviders;
