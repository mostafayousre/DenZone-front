"use client";

import { useEffect } from "react";
import {usePathname, useRouter} from "@/i18n/routing";
import { getRoleFromToken, roleRoutes, defaultRouteByRole } from "@/lib/roleRoutes";

const RoleGuard = () => {
    const router = useRouter();
    const pathname = usePathname()

    useEffect(() => {
        const role = getRoleFromToken();
        const allowedRoutes = roleRoutes[role || ""] || [];

        if (!role) return; 
        if (!allowedRoutes.includes("*") && !allowedRoutes.includes(pathname)) {
            const defaultRoute = defaultRouteByRole[role || ""];
            if (pathname !== defaultRoute) {
                router.push(defaultRoute);
            }
        }
    }, [pathname]);


    return null;
};

export default RoleGuard;

