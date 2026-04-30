import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface RoleData {
  id: string;
  name: string;
  userRoles: any[];
}

function useGetAllRoles() {
  const [data, setData] = useState<RoleData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllRoles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await AxiosInstance.get("/api/Roles/get-roles");
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, getAllRoles };
}

export default useGetAllRoles;
