import {useState} from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useGettingAllDeliveryTimeSlots() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deliveryTimeSlots, setDeliveryTimeSlots] = useState([]);

    const getAllDeliveryTimeSlots = async (day?: number) => {
        setLoading(true);
        setError(null);
        const params: Record<string, any> = {};
        if (day !== undefined) params.day = day;
        await AxiosInstance.get(`/api/DeliveryTimeSlots`, { params }).then((response) => {
            if (response.status !== 200) {
                throw new Error('Failed to fetch delivery time slots');
            }
            setDeliveryTimeSlots(response.data);
        }).catch((error) => {
            setError(error.message);
        }).finally(() => {
            setLoading(false);
        })
    }

    return { deliveryTimeSlots, loading, error, getAllDeliveryTimeSlots };
}

export default useGettingAllDeliveryTimeSlots;
