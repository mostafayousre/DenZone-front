import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useDeleteAreaZone() {
    const [loading, setLoading] = useState(false);

    const deleteAreaZone = async (areaZoneId: string) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.delete(`/api/AreaZone/delete-area-zone`, {
                params: { areaZoneId }
            });
            
            return response.status === 200 || response.status === 204;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Delete failed";
            throw errorMessage; 
        } finally {
            setLoading(false);
        }
    };

    return { loading, deleteAreaZone };
}

export default useDeleteAreaZone;
