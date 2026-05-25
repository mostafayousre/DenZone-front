"use client";

import React from "react";
import { usePermissions, PermissionLogicalOperator } from "@/hooks/use-permissions";

interface HasPermissionProps {
  permission: string | string[];
  logical?: PermissionLogicalOperator;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Declarative wrapper for conditional UI rendering based on permissions.
 * Useful for buttons, links, tabs, and action items.
 * 
 * @example
 * <HasPermission permission="Permissions.Product.Create" fallback={<Button disabled>Add Product</Button>}>
 *   <Button onClick={handleAdd}>Add Product</Button>
 * </HasPermission>
 */
export const HasPermission = ({
  permission,
  logical = "OR",
  fallback = null,
  children,
}: HasPermissionProps) => {
  const { hasPermission } = usePermissions();

  if (hasPermission(permission, logical)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default HasPermission;
