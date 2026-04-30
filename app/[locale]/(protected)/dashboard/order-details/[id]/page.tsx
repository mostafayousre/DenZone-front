"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import TotalTable from "./totaltable";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderData } from "@/types/order";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { OrderStatus } from "@/enum";
import useGettingOrderById from "@/services/Orders/gettingOrderById";
import useGettingInvoiceByOrderId from "@/services/invoices/order/gettingInvoiceByOrderId";
import { Orders } from "@/types/orders";
import BillSummary from "@/app/[locale]/(protected)/dashboard/remove-item/[id]/BillSummary";
import { Loader2 } from "lucide-react";
import useUpdateOrderStatus from "@/services/Orders/updateOrderStatus";
import Cookies from "js-cookie";
import { useTranslations } from "next-intl";

const OrderDetails = () => {
    const t = useTranslations("orderDetailsPage");

    const params = useParams();
    const router = useRouter();

    const userType = Cookies.get("userRole");

    const id: string | string[] | undefined = params?.id;
    const [order, setOrder] = useState<Orders | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);

    const { order: orderData, getOrderById, error, loading: orderLoading } = useGettingOrderById();

    const { loading: invoiceLoading, error: invoiceError, invoice, getInvoiceByOrderId } =
        useGettingInvoiceByOrderId();

    const { loading: updateLoading, updateOrderStatus } = useUpdateOrderStatus();

    useEffect(() => {
        if (id) {
            getOrderById(id as string);
            getInvoiceByOrderId(id as string);
        }
    }, [id]);

    useEffect(() => {
        if (orderData) {
            setOrder(orderData);

            if (orderData.status !== undefined) {
                setSelectedStatus(orderData.status as OrderStatus);
            }
        }
    }, [orderData]);

    useEffect(() => {
        if (id) {
            const refreshInterval = setInterval(() => {
                getOrderById(id as string);
            }, 30000); 

            return () => clearInterval(refreshInterval);
        }
    }, [id]);

    if (orderLoading || invoiceLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const currentOrder = order || orderData;

    if (!currentOrder) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>{t("noOrderFound")}</p>
            </div>
        );
    }

    const currentStatus = currentOrder.status as OrderStatus;
    const hasStatusChanged = selectedStatus !== null && selectedStatus !== currentStatus;

    return (
        <>
            {(userType === "Inventory" || userType === "Admin") && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t("orderStatus")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center flex-wrap gap-4">
                                <Label className="w-[150px] flex-none">{t("orderStatus")}: </Label>

                                <Select
                                    value={selectedStatus?.toString() ?? currentStatus?.toString()}
                                    onValueChange={(value: string) => {
                                        const numericValue = Number(value) as OrderStatus;
                                        setSelectedStatus(numericValue);
                                    }}
                                >
                                    <SelectTrigger className="flex-1 cursor-pointer">
                                        <SelectValue placeholder={t("updateStatus")} />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>{t("status")}</SelectLabel>

                                            {Object.values(OrderStatus)
                                                .filter((value) => typeof value === "number")
                                                .map((status) => (
                                                    <SelectItem
                                                        key={status}
                                                        value={status.toString()}

                                                    >
                                                        {t(`statusOptions.${OrderStatus[status]}`)}
                                                    </SelectItem>
                                                ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-center flex-wrap gap-4">
                                <Button
                                    size="md"
                                    variant="outline"
                                    className="w-[150px] flex-none"
                                    type="button"
                                    disabled={
                                        updateLoading ||
                                        !hasStatusChanged ||
                                        selectedStatus === OrderStatus.Pending ||
                                        selectedStatus === null
                                    }
                                    onClick={async () => {
                                        if (!id || selectedStatus === null || selectedStatus === OrderStatus.Pending) {
                                            toast.warning(t("invalidStatusSelected"));
                                            return;
                                        }

                                        const result = await updateOrderStatus(id as string, selectedStatus);

                                        if (result.success) {
                                            toast.success(t("updateStatusSuccess"));
                                            await getOrderById(id as string);
                                            setSelectedStatus(orderData.status as OrderStatus);
                                        } else {
                                            toast.error(result.error || t("updateStatusError"));
                                        }
                                    }}
                                >
                                    {updateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("updateStatus")}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="border-0">
                    <div className="flex justify-between flex-wrap gap-4 items-center">
                        <div>
                            <span className="block text-default-900 font-medium text-xl">
                                {t("orderDetails")}
                            </span>

                           
                                <div className="flex space-x-2 mt-2">
                                    <p>{t("providerName")}:</p>

                                    <span>
                                        {currentOrder.items?.length > 0
                                            ? Array.from(
                                                new Set(
                                                    currentOrder.items
                                                        .map((item: any) => item?.inventoryName)
                                                        .filter(Boolean)
                                                )
                                            ).join(", ")
                                            : "N/A"}
                                    </span>
                             
                            </div>
                        </div>

                        <div className="space-y-1 text-xs text-default-600 uppercase">
                            <h4>
                                {t("date")}:{" "}
                                {currentOrder.orderDate
                                    ? new Date(currentOrder.orderDate).toLocaleString()
                                    : "N/A"}
                            </h4>

                            <h4>
                                {t("status")}: {t(`statusOptions.${OrderStatus[currentOrder.status]}`)}
                            </h4>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <BillSummary
                        defaultItems={currentOrder.items || []}
                        items={currentOrder.items || []}
                        deletedItems={[]}
                    />
                </CardContent>
            </Card>
        </>
    );
};

export default OrderDetails;
