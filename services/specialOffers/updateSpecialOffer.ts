import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useUpdateSpecialOffer() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateSpecialOffer = async (id: string | number, formData: FormData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.put(`/api/SpecialOffers/update-offer/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            if (response?.status === 200) {
                return { success: true, data: response.data };
            } else {
                throw new Error("Failed to update special offer");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, updateSpecialOffer };
}

export default useUpdateSpecialOffer;
