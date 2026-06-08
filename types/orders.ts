import {ProductType} from "@/types/product";

export type Orders = {
    id: string;
    UserId: string;
    fullName: string;
    pharmacyName?: string;
    inventoryUserName?: string;
    inventoryUserId: string;
    inventoryName?: string;
    orderDate: string;
    status: number
    totalAmount: number
    deliverDate: string
    deliveryTimeName: string

    items: OrderItem[]
    orderNumber?: string;
    deliveryName?: string;
    couponCode?: string;
    couponPercentage?: number;
    couponPrecentage?: number;
    coupon?: number;
    shippingFees?: number;
    totalAmountOrder?: number;
    totalAmountOrderAfter?: number;
    orderNote?: string;
    isGrouped?: boolean;
    orders?: Orders[];
}

export interface OrderItem {
    id?: string;
    productId: string;
    productName: string;
    productPriceId: string;
    inventoryUserId?: string;
    inventoryName: string;
    quantity?: number;
    unitPrice?: number;
    total?: number;
    status?: number;
}

export interface ItemsTableProps {
    items: OrderItem[];
    deletedItems: string[];
    onDeleteItem: (itemId: string, productName: string) => void;
}

export interface BillSummaryProps {
    items: OrderItem[];
    deletedItems: string[];
    defaultItems?: OrderItem[];
    totalAmount?: number;
}