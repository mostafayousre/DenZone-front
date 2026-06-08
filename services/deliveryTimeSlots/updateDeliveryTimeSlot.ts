import {useState} from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useUpdateDeliveryTimeSlot() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateDeliveryTimeSlot = async (id: string | number, data: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.put(`/api/DeliveryTimeSlots/${id}`, data);
            if (response.status !== 200 && response.status !== 204) {
                throw new Error('Failed to update delivery time slot');
            }
            return response.data;
        } catch (error: any) {
            console.error("Update error:", error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return { updateDeliveryTimeSlot, loading, error };
}

export default useUpdateDeliveryTimeSlot;
