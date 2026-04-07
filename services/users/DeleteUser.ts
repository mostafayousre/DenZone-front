import { useState } from "react";
import GetUsers from "@/services/users/GetAllUsers";

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
            const response = await fetch(`https://dentzoneapi.runasp.net/api/Users/delete-user/${userId}`, {
                method: "DELETE",
                headers: {
                    "Accept": "*/*",
                },
            });

            if (response.ok) { 
                if (typeof gettingAllUsers === "function") {
                    gettingAllUsers();
                }
                setIsDeleted(true);
                return { success: true };
            } else {
                const message = await response.text();
                throw new Error(message || "فشل حذف المستخدم");
            }
        } catch (err: any) {
            setError(err.message);
            setIsDeleted(false);
            return { success: false, error: err.message };
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