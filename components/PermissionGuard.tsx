"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "@/components/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { matchRoutePermission } from "@/config/route-permissions";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

interface PermissionGuardProps {
  children: React.ReactNode;
}

export const PermissionGuard = ({ children }: PermissionGuardProps) => {
  const pathname = usePathname();
  const { permissions, hasPermission, loading } = usePermissions();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;

    const requiredPermission = matchRoutePermission(pathname);
    const hasPerm = !requiredPermission || hasPermission(requiredPermission);
    

    if (hasPerm) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
    }
  }, [pathname, loading, hasPermission, permissions]);

  if (loading || authorized === null) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking page access permissions...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex h-[75vh] w-full flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive animate-pulse">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Access Denied
        </h1>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          You do not have the required permissions to view this resource. 
          Please contact your administrator if you need access.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/analytics">Return to Home</Link>
          </Button>
          <Button onClick={() => window.history.back()} variant="default" size="sm">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
