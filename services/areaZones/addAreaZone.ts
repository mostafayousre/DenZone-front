import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useAddAreaZone() {
    const [loading, setLoading] = useState(false);

    const addAreaZone = async (data: { areaIds: number[]; zoneId: number }) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.post("/api/AreaZone/add-area-zone", data);
            
            return response.status === 200 || response.status === 201;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to add area zone";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, addAreaZone };
}

export default useAddAreaZone;
