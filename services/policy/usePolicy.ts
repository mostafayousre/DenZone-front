import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

interface UsePolicyProps {
    getEndpoint: string;
    addEndpoint: string;
}

function usePolicy({ getEndpoint, addEndpoint }: UsePolicyProps) {
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getPolicy = async (lang: number) => {
        setFetchLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get(`${getEndpoint}?lang=${lang}`);
            
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
            setFetchLoading(false);
        }
    };

    const addPolicy = async (content: string, lang: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.post(addEndpoint, { content, lang });
            
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

    return { loading, fetchLoading, error, getPolicy, addPolicy };
}

export default usePolicy;
