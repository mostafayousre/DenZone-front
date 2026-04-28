import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useAddCountry() {
    const [loading, setLoading] = useState(false);

    const addCountry = async (data: any) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.post("/api/Countries/add-country", data);
            
            return response.status === 200 || response.status === 201;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to add country";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, addCountry };
}

export default useAddCountry;
