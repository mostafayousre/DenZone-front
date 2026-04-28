import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useAddCity() {
    const [loading, setLoading] = useState(false);

    const addCity = async (data: { name: string; countryId: string | number }) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.post("/api/Cities/add-city", data);
            
            return response.status === 200 || response.status === 201;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to add city";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, addCity };
}

export default useAddCity;
