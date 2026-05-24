import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export function normalizeRole(role: string | undefined | null): string | null {
    if (!role) return null;
    const lower = role.toLowerCase().replace(/[\s_-]/g, ""); // removes spaces, underscores, and dashes
    if (lower === 'admin') return 'Admin';
    if (lower === 'inventory') return 'Inventory';
    if (lower === 'sales') return 'sales'; 
    if (lower === 'representative' || lower === 'preparationrepresentative') return 'representative';
    return null;
}

export function getRoleFromToken(): string | null {
    const token = Cookies.get("authToken");
    if (!token) return null;

    try {
        const decoded = jwtDecode<{ role: string }>(token);
        return normalizeRole(decoded.role);
    } catch (err) {
        return null;
    }
}

export const roleRoutes: Record<string, string[]> = {
    Admin: ["*"],
    Inventory: [
        "/en/dashboard/product-list",
        "/ar/dashboard/product-list",
        "/en/dashboard/order-list",
        "/ar/dashboard/order-list",
        "/ar/dashboard/order-details",
        "/en/dashboard/order-details",
        "/ar/dashboard/return-list",
        "/en/dashboard/return-list",
        "/ar/dashboard/return-details",
        "/en/dashboard/return-details",
        "/ar/dashboard/add-product-price",
        "/en/dashboard/add-product-price",
        "/en/dashboard/inventory-management",
        "/ar/dashboard/inventory-management",
        "/en/dashboard/edit-product/:id",
        "/ar/dashboard/edit-product/:id",
        "/en/dashboard/edit-user/:id",
        "/ar/dashboard/edit-user/:id",
    ],
    // sales: ["/en/dashboard/sales", "/en/dashboard/register", "/ar/dashboard/sales", "/ar/dashboard/register"]
    representative: [
        "/en/dashboard/order-list",
        "/ar/dashboard/order-list",
        "/ar/dashboard/order-details",
        "/en/dashboard/order-details"
    ],
    Preparation_representative: [
        "/en/dashboard/order-list",
        "/ar/dashboard/order-list",
        "/ar/dashboard/order-details",
        "/en/dashboard/order-details"
    ]
};

export const defaultRouteByRole: Record<string, string> = {
    Admin: "/dashboard/analytics",
    Inventory: "/dashboard/order-list",
    // sales: "/dashboard/sales",
    representative: "/dashboard/order-list",
    PreparationRepresentative: "/dashboard/order-list",
};
