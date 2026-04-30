import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { AreaZoneType } from "@/types/areaZone";

function useGetAreaZoneById() {
    const [loading, setLoading] = useState(false);

    const getAreaZoneById = async (id: string | number) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`/api/AreaZone/${id}`);
            
            if (response?.status === 200) {
                return response.data as AreaZoneType;
            } else {
                throw new Error("Failed to fetch area zone");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, getAreaZoneById };
}

export default useGetAreaZoneById;
