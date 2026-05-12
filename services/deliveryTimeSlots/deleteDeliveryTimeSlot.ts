import {useState} from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useDeleteDeliveryTimeSlot() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const deleteDeliveryTimeSlot = async (id: string | number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.delete(`/api/DeliveryTimeSlots/${id}`);
            if (response.status !== 200 && response.status !== 204) {
                throw new Error('Failed to delete delivery time slot');
            }
            return response.data;
        } catch (error: any) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return { deleteDeliveryTimeSlot, loading, error };
}

export default useDeleteDeliveryTimeSlot;
