import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useUpdateAreaZone() {
    const [loading, setLoading] = useState(false);

    const updateAreaZone = async (areaZoneId: string | number, data: { areaId: string | number; zoneId: string | number }) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.put(`/api/AreaZone/update-area-zone?areaZoneId=${areaZoneId}`, data);
            
            return response.status === 200 || response.status === 204;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Update failed";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, updateAreaZone };
}

export default useUpdateAreaZone;
