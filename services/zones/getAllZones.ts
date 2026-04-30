import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { ZoneType } from "@/types/zone";

function useGetZones() {
    const [loading, setLoading] = useState(false);
    const [zones, setZones] = useState<ZoneType[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getAllZones = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get("/api/Zones/all-zones");
            
            if (response?.status === 200) {
                setZones(response.data);
                return response.data;
            } else {
                throw new Error("Failed to fetch zones");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, zones, error, getAllZones };
}

export default useGetZones;
