"use client";

import { useContext } from "react";
import { PermissionsContext } from "@/providers/permissions-provider";

export type PermissionLogicalOperator = "AND" | "OR";

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }

  const { permissions, loading, refetchPermissions } = context;

  /**
   * Helper function to check if the user has the required permission(s).
   *
   * @param requiredPermissions A single permission string or an array of permissions.
   * @param logical The logical operator to check multiple permissions ('AND' | 'OR'). Defaults to 'OR'.
   */
  const hasPermission = (
    requiredPermissions: string | string[],
    logical: PermissionLogicalOperator = "OR"
  ): boolean => {
    // If no permission is required, grant access
    if (!requiredPermissions || (Array.isArray(requiredPermissions) && requiredPermissions.length === 0)) {
      return true;
    }

    // Wildcard bypass for super admins/god mode
    if (permissions.includes("*") || permissions.includes("Permissions.All")) {
      return true;
    }

    const requiredList = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    if (logical === "AND") {
      return requiredList.every((perm) => permissions.includes(perm));
    } else {
      return requiredList.some((perm) => permissions.includes(perm));
    }
  };

  return {
    permissions,
    loading,
    hasPermission,
    refetchPermissions,
  };
};
export default usePermissions;
