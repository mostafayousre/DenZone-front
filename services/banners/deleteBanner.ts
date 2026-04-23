import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useDeleteBanner() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteBanner = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.delete(`/api/Banners/${id}`);
            
            if (response?.status === 200 || response?.status === 204) {
                return true;
            } else {
                throw new Error("Failed to delete banner");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { deleteBanner, loading, error };
}

export default useDeleteBanner;
