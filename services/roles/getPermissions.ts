import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface PermissionData {
  id: string;
  name: string;
  code: string;
  rolePermissions: any[];
}

function useGetPermissions() {
  const [data, setData] = useState<PermissionData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPermissions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await AxiosInstance.get("/api/Roles/get-permissions");
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch permissions");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, getPermissions };
}

export default useGetPermissions;
