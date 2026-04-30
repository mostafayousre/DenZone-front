import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useChangePasswordFromAdmin() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const changePassword = async (userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        setError(null);

        try {
            const response = await AxiosInstance.post(
                "/api/Users/ChangePassword-fromAdmin",
                { userId, newPassword }
            );

            if (response.status === 200 || response.status === 204) {
                return { success: true };
            } else {
                throw new Error("Failed to change password");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data || err.message || "Failed to change password";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return {
        changePassword,
        loading,
        error,
    };
}

export default useChangePasswordFromAdmin;

