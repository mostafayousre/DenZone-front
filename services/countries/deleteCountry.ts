import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useDeleteCountry() {
    const [loading, setLoading] = useState(false);

    const deleteCountry = async (id: number | string) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.delete(`/api/Countries/delete-country`, {
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

    return { loading, deleteCountry };
}

export default useDeleteCountry;
