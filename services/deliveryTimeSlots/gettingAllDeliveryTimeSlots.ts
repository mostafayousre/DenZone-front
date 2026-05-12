import {useState} from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useGettingAllDeliveryTimeSlots() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deliveryTimeSlots, setDeliveryTimeSlots] = useState([]);

    const getAllDeliveryTimeSlots = async () => {
        setLoading(true);
        setError(null);
        await AxiosInstance.get(`/api/DeliveryTimeSlots`).then((response) => {
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
