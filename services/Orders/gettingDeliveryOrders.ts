import {useState, useCallback} from "react";
import {Orders} from "@/types/orders";
import AxiosInstance from "@/lib/AxiosInstance";
import Cookies from "js-cookie";

function useGettingDeliveryOrders() {
    const [orders, setOrders] = useState<Orders[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const gettingDeliveryOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const rawRole = Cookies.get("userRole");
            const endpoint = rawRole?.toLowerCase() === "preparation representative"
                ? "/api/Orders/get-Preparation-orders"
                : "/api/Orders/get-delivery-orders";

            const res = await AxiosInstance.get(endpoint);
            if (res.status === 200 || res.status === 201) {
                setOrders(res.data);
            } else {
                setError("Failed to fetch delivery orders");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }, []);

    return {orders, loading, error, gettingDeliveryOrders};
}

export default useGettingDeliveryOrders;
