import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useAddArea() {
    const [loading, setLoading] = useState(false);

    const addArea = async (data: { name: string; shippingCosts: number; cityId: string | number }) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.post("/api/Area/add-area", data);
            
            return response.status === 200 || response.status === 201;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to add area";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, addArea };
}

export default useAddArea;
