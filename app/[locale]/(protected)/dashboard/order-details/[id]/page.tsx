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

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const resolvedOrder = order || orderData;
        if (searchParams.get("print") === "true" && !orderLoading && !invoiceLoading && resolvedOrder) {
            const timer = setTimeout(() => {
                window.print();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [orderLoading, invoiceLoading, order, orderData]);

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
        <div id="printable-order">
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-order,
                    #printable-order * {
                        visibility: visible;
                    }
                    #printable-order {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background: white !important;
                        color: black !important;
                    }
                    .no-print,
                    .no-print * {
                        visibility: hidden !important;
                        display: none !important;
                    }
                }
            `}} />

            {/* {(userType === "Inventory" || userType === "Admin") && (
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

                                        const result = await updateOrderStatus((currentOrder?.orderNumber || id) as string, selectedStatus);

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
            )} */}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-default-900 dark:text-white">
                        {t("orderDetails")} #{currentOrder.orderNumber || id}
                    </h2>
                    <p className="text-sm text-default-500 mt-1">
                        {t("date")}: {currentOrder.orderDate ? new Date(currentOrder.orderDate).toLocaleString() : "N/A"}
                    </p>
                </div>
                {/* {currentOrder.totalAmount !== undefined && (
                    <div className="text-right">
                        <span className="text-xs text-default-500 uppercase block">{t("totalAmount")}</span>
                        <span className="text-2xl font-bold text-default-900 dark:text-white">
                            {totalAmountOrder}
                        </span>
                    </div>
                )} */}
            </div>

            {(() => {
                const subOrdersList = currentOrder.orders && currentOrder.orders.length > 0 
                    ? currentOrder.orders 
                    : [currentOrder];

                return subOrdersList.map((subOrder: any, index: number) => {
                    const subStatus = subOrder.status as OrderStatus;
                    
                    return (
                        <Card key={subOrder.id || index} className="mb-6">
                            <CardHeader className="border-b border-default-200">
                                <div className="flex justify-between flex-wrap gap-4 items-center">
                                    <div>
                                        <span className="block text-default-900 font-semibold text-lg">
                                            {subOrder.inventoryName || t("providerName")}
                                        </span>
                                        {subOrder.id && (
                                            <span className="text-xs text-default-500 font-mono block mt-1">
                                                ID: {subOrder.id}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-xs text-default-600 uppercase text-right">
                                            <h4>
                                                {t("status")}: <span className="font-semibold">{t(`statusOptions.${OrderStatus[subStatus]}`)}</span>
                                            </h4>
                                        </div>
                                    </div>
                                    
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6">
                                {subOrder.orderNote && (
                                    <div className="mb-6 bg-default-50 dark:bg-default-900/50 p-4 rounded-lg border border-default-200">
                                        <Label className="dark:text-white mb-1 block text-default-900 font-medium">{t("orderNote")}</Label>
                                        <p className="text-default-600 text-sm">{subOrder.orderNote}</p>
                                    </div>
                                )}

                                <BillSummary
                                    defaultItems={subOrder.items || []}
                                    items={subOrder.items || []}
                                    deletedItems={[]}
                                    totalAmount={subOrder?.totalAmount}
                                />
                            </CardContent>
                        </Card>
                    );
                });
            })()}

            {/* Payment Summary */}
            {(() => {
                const shipping = currentOrder.shippingFees ?? 0;
                const couponVal = currentOrder.coupon ?? 0;
                const total = currentOrder.totalAmountOrder ?? currentOrder.totalAmount ?? 0;
                const totalAmountOrder = total - couponVal + shipping;

                return (
                    <div className="flex flex-col sm:flex-row sm:justify-end mt-6">
                        <Card className="w-full sm:w-96 border border-default-200">
                            <CardHeader className="border-b border-default-200 py-4">
                                <CardTitle className="text-base font-semibold text-default-800 dark:text-white">
                                    {t("paymentSummary") || "ملخص الدفع"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t("subtotal") || "المجموع الفرعي"}:</span>
                                    <span className="font-semibold text-default-800 dark:text-white">
                                        {total.toFixed(2)} EGP
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t("shippingFees") || "مصاريف الشحن"}:</span>
                                    <span className="font-semibold text-green-600 dark:text-white">
                                        +{shipping.toFixed(2)} EGP
                                    </span>
                                </div>

                                {currentOrder.couponCode && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{t("couponCode") || "كود الكوبون"}:</span>
                                        <span className="font-semibold text-default-800 dark:text-white">
                                            {currentOrder.couponCode}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t("couponDiscount") || "خصم الكوبون"}:</span>
                                    <span className="font-semibold text-destructive">
                                        -{couponVal.toFixed(2)} EGP
                                    </span>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-default-200">
                                    <span className="font-bold text-default-900 dark:text-white text-base">
                                        {t("totalAmount") || "المبلغ الإجمالي"}:
                                    </span>
                                    <span className="text-xl font-extrabold text-default-900 dark:text-white">
                                        {totalAmountOrder.toFixed(2)} EGP
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            })()}
        </div>
    );
};

export default OrderDetails;
