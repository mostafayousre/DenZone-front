import {useState} from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useCreateDeliveryTimeSlot() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createDeliveryTimeSlot = async (data: { from: string; to: string }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.post(`/api/DeliveryTimeSlots`, data);
            if (response.status !== 200 && response.status !== 201) {
                throw new Error('Failed to create delivery time slot');
            }
            return response.data;
        } catch (error: any) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return { createDeliveryTimeSlot, loading, error };
}

export default useCreateDeliveryTimeSlot;
