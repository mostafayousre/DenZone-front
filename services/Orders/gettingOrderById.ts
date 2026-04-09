import React from 'react';
import AxiosInstance from "@/lib/AxiosInstance";
import {Orders} from "@/types/orders";

function useGettingOrderById() {
    const [order, setOrder] = React.useState<Orders>({
        id: '',
       UserId: '',
        fullName: '',
        inventoryUserId: '',
        orderDate: '',
        status: 0,
        totalAmount: 0,
        deliverDate: '',
        items: []
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const getOrderById = async (id: string | string[] | undefined) => {
        setLoading(true);
        setError(null);
        await AxiosInstance.get(`/api/Orders/${id}`).then((response) => {
            if (response.status !== 200) {
                throw new Error('Failed to fetch order');
            }
            setOrder(response.data);
        }).catch((error) => {
            setError(error.message);
        }).finally(() => {
            setLoading(false);
        })
    }

    return { order, loading, error, getOrderById };

}

export default useGettingOrderById;