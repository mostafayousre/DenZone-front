import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useUpdateArea() {
    const [loading, setLoading] = useState(false);

    const updateArea = async (id: string | number, data: { name: string; shippingCosts: number; cityId: string | number }) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.put(`/api/Area/update-area?id=${id}`, data);
            
            return response.status === 200 || response.status === 204;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Update failed";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, updateArea };
}

export default useUpdateArea;
