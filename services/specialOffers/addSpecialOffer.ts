import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useAddSpecialOffer() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addSpecialOffer = async (formData: FormData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.post("/api/SpecialOffers/add-offer", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            if (response?.status === 200 || response?.status === 201) {
                return { success: true, data: response.data };
            } else {
                throw new Error("Failed to add special offer");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, addSpecialOffer };
}

export default useAddSpecialOffer;
