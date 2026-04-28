import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { ZoneType } from "@/types/zone";

function useGetZoneById() {
    const [loading, setLoading] = useState(false);

    const getZoneById = async (id: string | number) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`/api/Zones/${id}`);
            
            if (response?.status === 200) {
                return response.data as ZoneType;
            } else {
                throw new Error("Failed to fetch zone");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, getZoneById };
}

export default useGetZoneById;
