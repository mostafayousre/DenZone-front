import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useDeleteSpecialOffer() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteSpecialOffer = async (id: string | number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.delete(`/api/SpecialOffers/delete-offer/${id}`);
            
            if (response?.status === 200 || response?.status === 204) {
                return { success: true };
            } else {
                throw new Error("Failed to delete special offer");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, deleteSpecialOffer };
}

export default useDeleteSpecialOffer;
