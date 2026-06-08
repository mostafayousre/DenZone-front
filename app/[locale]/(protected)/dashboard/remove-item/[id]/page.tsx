"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Loader2 } from "lucide-react";
import ItemsTable from "@/components/ui/ItemsTable";
import BillSummary from "./BillSummary";
import { OrderItem } from "@/types/orders";
import useGettingOrderById from "@/services/Orders/gettingOrderById";
import AxiosInstance from "@/lib/AxiosInstance";
import { OrderStatus } from "@/enum";
import useRemoveItemsFromOrder from "@/services/Orders/removeItemsFromOrder";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import ChangeInventoryUserDialogBulk from "@/components/partials/ChangeInventoryUserDialog/ChangeInventoryUserDialog";
import { formatOrderDate } from "@/utils";
import { useTranslations } from "next-intl";

const RemoveItems: React.FC = () => {
  const t = useTranslations("removeItem");
  const { loading: removeLoading, error: removeError, removeItemsFromOrder } = useRemoveItemsFromOrder()

  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { order, loading, error, getOrderById } = useGettingOrderById();
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const [items, setItems] = useState<OrderItem[]>([]);
  const [originalItems, setOriginalItems] = useState<OrderItem[]>([]);
  const [deletedItems, setDeletedItems] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (id) {
      getOrderById(id).finally(() => setIsInitialLoad(false));
    }
  }, [id]);

  useEffect(() => {
    if (order) {
      setItems(order.items);
      setOriginalItems(order.items);

    }
  }, [order]);

  const handleDeleteItem = (itemId: string, productName: string) => {
    toast.custom(
      (toastId) => (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                {t("removeItem")}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t("confirmRemoveItem")}
              </p>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => {
                toast.dismiss(toastId);
                confirmDeleteItem(itemId);
              }}
              className="flex-1 bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {t("remove")}
            </button>
            <button
              onClick={() => toast.dismiss(toastId)}
              className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ),
      {
        duration: 0,
        position: 'top-center',
      }
    );
  };

  const confirmDeleteItem = async (itemId: string) => {
    try {
      const { success, error } = await removeItemsFromOrder({
        orderId: order?.id || id,
        itemId: itemId,
        orderNumber: order.orderNumber,
      });

      if (success) {

        setDeletedItems((prev) => [...prev, itemId]);
        setItems((prev) => prev.filter((item) => item.productId !== itemId));
        setHasChanges(true);

        toast.success(t("itemRemoved"));

        setTimeout(() => {
          getOrderById(id);
        }, 1000);
      } else {
        toast.error(`${t("errorRemovingItem")}`);
      }
    } catch (err) {
      toast.error(t("errorRemovingItem"));
    }
  };

  // const handleReset = () => {
  //   setItems(originalItems);
  //   setDeletedItems([]);
  //   setHasChanges(false);
  // };

  // const handleUpdate = async () => {
  //   const {success, error} = await removeItemsFromOrder({
  //     orderId: id,
  //     itemId: deletedItems,
  //   })
  //   if (success) {
  //     toast.success("Order updated successfully");
  //     setHasChanges(false);
  //     setTimeout(() => {
  //       router.push("/dashboard/order-list");
  //     }, 2000);
  //   } else {
  //     toast.error(`Failed to update order: ${error}`);
  //     setTimeout(() => {
  //       toast.dismiss();
  //     }, 2000);
  //   }
  // };

  if (isInitialLoad && loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;
  if (!order) return <div className="text-center py-8">{t("orderNotFound")}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("orderManagement")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <ChangeInventoryUserDialogBulk
                orderId={order?.id || id}
                itemIds={selectedItemIds}
                onSuccess={() => {
                  getOrderById(id);
                  setSelectedItemIds([]);
                }}
              />
            </div>

            <div className="border border-solid border-default-400 rounded-md overflow-hidden">
              <ItemsTable
                items={items}
                deletedItems={deletedItems}
                onDeleteItem={handleDeleteItem}
                onSelectionChange={setSelectedItemIds}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-0">
          <div className="flex justify-between flex-wrap gap-4 items-center">
            <div>
              <span className="block text-default-900 font-medium text-xl">{t("billTo")}:</span>
              <div className="text-default-500 font-normal mt-4 text-sm">
                {t("pharmacyName")}: {order.pharmacyName || 'N/A'}
                <div className="flex space-x-2 mt-2">
                  <p>{t("inventoryManager")}:</p>
                  <span>
                    {order.items?.length > 0
                      ? Array.from(
                        new Set(
                          order.items
                            .map((item: any) => item?.inventoryName)
                            .filter(Boolean)
                        )
                      ).join(', ')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1 text-xs text-default-600 uppercase">

              <h4>{t("deliverDate")}: {formatOrderDate(order.orderDate)}</h4>
              <h4>
                {t("status")}:{" "}
                {order.status !== undefined
                  ? t(`statusOptions.${OrderStatus[order.status as OrderStatus]}`)
                  : "N/A"}
              </h4>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <BillSummary
            defaultItems={order.items}
            items={items}
            deletedItems={deletedItems}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RemoveItems;