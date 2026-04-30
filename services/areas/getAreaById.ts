import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { AreaType } from "@/types/area";

function useGetAreaById() {
    const [loading, setLoading] = useState(false);

    const getAreaById = async (id: string | number) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`/api/Area/${id}`);
            
            if (response?.status === 200) {
                return response.data as AreaType;
            } else {
                throw new Error("Failed to fetch area");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, getAreaById };
}

export default useGetAreaById;
