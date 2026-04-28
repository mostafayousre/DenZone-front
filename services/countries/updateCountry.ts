import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useUpdateCountry() {
    const [loading, setLoading] = useState(false);

    const updateCountry = async (id: string | number, data: any) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.put(`/api/Countries/update-country?id=${id}`, data);
            return response.status === 200 || response.status === 204;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Update failed";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, updateCountry };
}

export default useUpdateCountry;
