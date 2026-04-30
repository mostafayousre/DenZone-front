import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useUpdateRole() {
  const [loading, setLoading] = useState(false);

  const updateRole = async (data: { id: string; name: string }) => {
    setLoading(true);
    try {
      const response = await AxiosInstance.put("/api/Roles/update-role", data);
      return response.status === 200 || response.status === 201 || response.status === 204;
    } catch (err: any) {
      throw err.response?.data?.message || err.message || "Failed to update role";
    } finally {
      setLoading(false);
    }
  };

  return { loading, updateRole };
}

export default useUpdateRole;
