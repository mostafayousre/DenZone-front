import { useState } from "react";
import GetUsers from "@/services/users/GetAllUsers";
import AxiosInstance from "@/lib/AxiosInstance";

function useDeleteUser() {
    const { gettingAllUsers } = GetUsers(); 
    const [loading, setLoading] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteUser = async (userId: string | number): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        setIsDeleted(false);
        setError(null);

        try {
            const response = await AxiosInstance.delete(`/api/Users/delete-user/${userId}`);

            if (response.status === 200) { 
                if (typeof gettingAllUsers === "function") {
                    gettingAllUsers();
                }
                setIsDeleted(true);
                return { success: true };
            } else {
                throw new Error("فشل حذف المستخدم");
            }
        } catch (err: any) {
            const message = err.response?.data?.message || err.response?.data || err.message || "فشل حذف المستخدم";
            setError(message);
            setIsDeleted(false);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    return {
        deleteUser,
        isDeleted,
        loading,
        error,
    };
}

export default useDeleteUser;