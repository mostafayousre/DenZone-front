import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useDeleteCity() {
    const [loading, setLoading] = useState(false);

    const deleteCity = async (id: number | string) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.delete(`/api/Cities/delete-city`, {
                params: { id }
            });
            
            return response.status === 200 || response.status === 204;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Delete failed";
            throw errorMessage; 
        } finally {
            setLoading(false);
        }
    };

    return { loading, deleteCity };
}

export default useDeleteCity;
