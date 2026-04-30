import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { AreaType } from "@/types/area";

function useGetAreas() {
    const [loading, setLoading] = useState(false);
    const [areas, setAreas] = useState<AreaType[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getAllAreas = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get("/api/Area/all-areies");
            
            if (response?.status === 200) {
                setAreas(response.data);
                return response.data;
            } else {
                throw new Error("Failed to fetch areas");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, areas, error, getAllAreas };
}

export default useGetAreas;
