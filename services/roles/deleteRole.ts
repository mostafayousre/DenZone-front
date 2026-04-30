import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useDeleteRole() {
  const [loading, setLoading] = useState(false);

  const deleteRole = async (roleId: string) => {
    setLoading(true);
    try {
      const response = await AxiosInstance.delete(`/api/Roles/delete-role/${roleId}`);
      return response.status === 200 || response.status === 204;
    } catch (err: any) {
      throw err.response?.data?.message || err.message || "Failed to delete role";
    } finally {
      setLoading(false);
    }
  };

  return { loading, deleteRole };
}

export default useDeleteRole;
