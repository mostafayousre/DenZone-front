import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useInsertRole() {
  const [loading, setLoading] = useState(false);

  const insertRole = async (data: { roleName: string }) => {
    setLoading(true);
    try {
      const response = await AxiosInstance.post("/api/Roles/insert-role", data);
      return response.status === 200 || response.status === 201;
    } catch (err: any) {
      throw err.response?.data?.message || err.message || "Failed to create role";
    } finally {
      setLoading(false);
    }
  };

  return { loading, insertRole };
}

export default useInsertRole;
