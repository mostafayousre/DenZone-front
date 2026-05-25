"use client";

import React, { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { fetchUserPermissions } from "@/services/roles/permissions";
import { Loader2 } from "lucide-react";

interface PermissionsContextType {
  permissions: string[];
  loading: boolean;
  refetchPermissions: () => Promise<void>;
}

export const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// In-memory flag to force a fresh fetch from the server on hard refreshes/page loads
let isFirstLoad = true;

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const token = Cookies.get("authToken");

  const loadPermissions = async (forceRefetch = false) => {
    if (!token) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    // Scope cache key to the active token to prevent cross-session cache leakage
    const cacheKey = `user_permissions_${token.slice(-15)}`;

    // Bypass cache on the very first mount of the provider after a page refresh
    const shouldBypassCache = forceRefetch || isFirstLoad;
    if (isFirstLoad) {
      isFirstLoad = false;
    }

    if (!shouldBypassCache) {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setPermissions(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached permissions", e);
        }
      }
    }

    try {
      setLoading(true);
      const data = await fetchUserPermissions();
      setPermissions(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to fetch permissions in provider:", error);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  // React to token changes (login/logout events)
  useEffect(() => {
    if (!token) {
      setPermissions([]);
      setLoading(false);
    } else {
      loadPermissions();
    }
  }, [token]);

  const refetchPermissions = async () => {
    await loadPermissions(true);
  };

  // Display a professional loading indicator during initial permission retrieval inside protected views
  if (loading && token) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm font-medium tracking-wide text-muted-foreground animate-pulse">
            Loading permissions system...
          </p>
        </div>
      </div>
    );
  }

  return (
    <PermissionsContext.Provider value={{ permissions, loading, refetchPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};
