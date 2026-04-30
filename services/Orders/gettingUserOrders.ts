import {useState, useCallback} from "react";
import AxiosInstance from "@/lib/AxiosInstance";
import {Orders} from "@/types/orders";

function useGettingUserOrders() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useState<Orders[]>([]);

    const gettingUserOrders = useCallback(async (userId: string, status?: number | null) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { userId };
            if (status !== undefined && status !== null) {
                params.status = status;
            }

            const response = await AxiosInstance.get(`/api/Orders/orders-user`, { params });
            if (response.status === 200 || response.status === 201) {
                setOrders(response.data || []);
            } else {
                setError("Failed to fetch orders for this user.");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    }, []);

    return {loading, error, orders, gettingUserOrders};
}

export default useGettingUserOrders;
