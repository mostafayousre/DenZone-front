import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

interface AssignPermissionsData {
  roleId: string;
  permissionIds: string[];
}

function useAssignPermissions() {
  const [loading, setLoading] = useState(false);

  const assignPermissions = async (data: AssignPermissionsData) => {
    setLoading(true);
    try {
      const response = await AxiosInstance.post("/api/Roles/assign-permissions", data);
      return response.status === 200 || response.status === 201;
    } catch (err: any) {
      throw err.response?.data?.message || err.message || "Failed to assign permissions";
    } finally {
      setLoading(false);
    }
  };

  return { loading, assignPermissions };
}

export default useAssignPermissions;
