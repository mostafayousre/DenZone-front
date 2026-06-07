import React from 'react';
import AxiosInstance from "@/lib/AxiosInstance";
import { Orders } from "@/types/orders";
import Cookies from "js-cookie";

function useGettingOrderById() {
    const [order, setOrder] = React.useState<Orders>({
        id: '',
        UserId: '',
        fullName: '',
        inventoryUserId: '',
        orderDate: '',
        status: 0,
        couponCode: '',
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

        const rawRole = Cookies.get("userRole")?.toLowerCase();
        const isInventoryOrProvider = rawRole === "inventory";
        const requestPromise = isInventoryOrProvider
            ? AxiosInstance.get(`/api/Orders/orders/${orderNum}`)
            : AxiosInstance.get(`/api/Orders`, { params: { orderNum } });

        await requestPromise.then((response) => {
            if (response.status !== 200) {
                throw new Error('Failed to fetch order');
            }
            
            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            if (!data) {
                throw new Error('Order not found');
            }
            
            const subOrders = data.orders || [];
            
            if (isInventoryOrProvider || subOrders.length === 0) {
                // If it's a single order response, or there are no sub-orders
                const mappedOrder: Orders = {
                    ...data,
                    id: data.id || data.orderNumber || (orderNum as string),
                    orderNumber: data.orderNumber,
                    isGrouped: Array.isArray(data.orders) && data.orders.length > 0,
                    orders: subOrders,
                    items: data.items || [],
                    totalAmount: data.totalAmount !== undefined ? data.totalAmount : 0,
                    orderNote: data.orderNote || '',
                    deliveryName: data.deliveryName || "there is no delivery yet",
                    status: data.status,
                };
                setOrder(mappedOrder);
            } else {
                const firstOrder = subOrders[0] || {};
                
                // Merge items
                const mergedItems = subOrders.flatMap((o: any) => o.items || []);
                
                // Sum totalAmount
                const totalAmount = data.totalAmountOrder !== undefined 
                    ? data.totalAmountOrder 
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
                    id: firstOrder.id || data.orderNumber,
                    orderNumber: data.orderNumber,
                    isGrouped: true,
                    orders: subOrders,
                    items: mergedItems,
                    totalAmount: totalAmount,
                    orderNote: mergedNotes || firstOrder.orderNote || '',
                    deliveryName: mergedDeliveryName,
                    status: data.status !== undefined ? data.status : firstOrder.status,
                    coupon: data.coupon,
                    shippingFees: data.shippingFees,
                    totalAmountOrder: data.totalAmountOrder,
                };

                setOrder(mappedOrder);
            }
        }).catch((error) => {
            setError(error.message);
        }).finally(() => {
            setLoading(false);
        })
    }

    return { order, loading, error, getOrderById };
}

export default useGettingOrderById;