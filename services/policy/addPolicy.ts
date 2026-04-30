import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useAddPolicy() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addPolicy = async (content: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.post(`/api/Policy/add-policy`, { content });
            
            if (response?.status === 200 || response?.status === 201) {
                return true;
            } else {
                return false;
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to add policy";
            setError(errorMessage);
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, addPolicy };
}

export default useAddPolicy;
