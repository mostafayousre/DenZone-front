import axiosInstance from "@/lib/AxiosInstance";

/**
 * Fetches the allowed permission strings for the currently logged-in user.
 * GET /api/Roles/get-permissions-forUser
 */
export const fetchUserPermissions = async (): Promise<string[]> => {
    try {
        const response = await axiosInstance.get<string[]>("/api/Roles/get-permissions-forUser");
        return response.data || [];
    } catch (error: any) {
        console.error("Error fetching permissions:", error);
        throw new Error(error.response?.data?.message || error.message || "Failed to fetch permissions");
    }
};
