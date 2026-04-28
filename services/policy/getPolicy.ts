import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useGetPolicy() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getPolicy = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get("/api/Policy/get-policy");
            
            if (response?.status === 200) {
                // Return either content field or the whole data if it's a string
                return response.data?.content || response.data?.[0]?.content || response.data || "";
            } else {
                throw new Error("Failed to fetch policy");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, getPolicy };
}

export default useGetPolicy;
