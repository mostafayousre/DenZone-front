import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useAddZone() {
    const [loading, setLoading] = useState(false);

    const addZone = async (data: { name: string }) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.post("/api/Zones/add-zone", data);
            
            return response.status === 200 || response.status === 201;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to add zone";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, addZone };
}

export default useAddZone;
