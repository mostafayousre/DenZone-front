import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useUpdateCity() {
    const [loading, setLoading] = useState(false);

    const updateCity = async (id: string | number, data: { name: string; countryId: string | number }) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.put(`/api/Cities/update-city?id=${id}`, data);
            
            return response.status === 200 || response.status === 204;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Update failed";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, updateCity };
}

export default useUpdateCity;
