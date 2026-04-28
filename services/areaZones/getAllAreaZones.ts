import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { AreaZoneType } from "@/types/areaZone";

function useGetAreaZones() {
    const [loading, setLoading] = useState(false);
    const [areaZones, setAreaZones] = useState<AreaZoneType[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getAllAreaZones = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get("/api/AreaZone/all-area-zone");
            
            if (response?.status === 200) {
                setAreaZones(response.data);
                return response.data;
            } else {
                throw new Error("Failed to fetch area zones");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, areaZones, error, getAllAreaZones };
}

export default useGetAreaZones;
