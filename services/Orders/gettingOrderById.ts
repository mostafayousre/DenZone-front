import React from 'react';
import AxiosInstance from "@/lib/AxiosInstance";
import { Orders } from "@/types/orders";

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
        deliveryTimeName: '',
        items: []
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const getOrderById = async (orderNum: string | string[] | undefined) => {
        setLoading(true);
        setError(null);
        await AxiosInstance.get(`/api/Orders`, { params: { orderNum } }).then((response) => {
            if (response.status !== 200) {
                throw new Error('Failed to fetch order');
            }
            
            const group = Array.isArray(response.data) ? response.data[0] : response.data;
            if (!group) {
                throw new Error('Order not found');
            }
            
            const subOrders = group.orders || [];
            const firstOrder = subOrders[0] || {};
            
            // Merge items
            const mergedItems = subOrders.flatMap((o: any) => o.items || []);
            
            // Sum totalAmount
            const totalAmount = group.totalAmountOrder !== undefined 
                ? group.totalAmountOrder 
                : subOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
            
            // Merge orderNotes
            const mergedNotes = subOrders.map((o: any) => o.orderNote).filter(Boolean).join(" | ");
            
            // Merge deliveryNames
            const deliveryNames = Array.from(
              new Set(subOrders.map((o: any) => o.deliveryName).filter((n: any) => n && n !== "there is no deleivry yet"))
            );
            const mergedDeliveryName = deliveryNames.length > 0 ? deliveryNames.join(", ") : "there is no delivery yet";

            const mappedOrder: Orders = {
                ...firstOrder,
                id: firstOrder.id || group.orderNumber,
                orderNumber: group.orderNumber,
                isGrouped: true,
                orders: subOrders,
                items: mergedItems,
                totalAmount: totalAmount,
                orderNote: mergedNotes || firstOrder.orderNote || '',
                deliveryName: mergedDeliveryName,
                status: group.status !== undefined ? group.status : firstOrder.status,
            };

            setOrder(mappedOrder);
        }).catch((error) => {
            setError(error.message);
        }).finally(() => {
            setLoading(false);
        })
    }

    return { order, loading, error, getOrderById };

}

export default useGettingOrderById;