"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import useGettingOrderById from "@/services/Orders/gettingOrderById";
import { OrderStatus } from "@/enum";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { formatOrderDate } from "@/utils";
import { useTranslations } from "next-intl";
import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserType } from "@/types/users";
import useEditOrder from "@/services/Orders/editOrder";
import useGettingAllProducts from "@/services/products/gettingAllProducts";
import { Input } from "@/components/ui/input";

const EditOrder: React.FC = () => {
  const t = useTranslations("removeItem");
  const tCommon = useTranslations("common"); // Fallback for common words if needed
  
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const { order, loading, error: fetchError, getOrderById } = useGettingOrderById();
  const { editOrder, loading: isSaving } = useEditOrder();
  const { users: inventoryManagers, getUsersByRoleId } = useGetUsersByRoleId();
  const { products, getAllProducts } = useGettingAllProducts();

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedInventoryUserId, setSelectedInventoryUserId] = useState<string>("");
  
  // State for the editable items
  const [items, setItems] = useState<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    amount: number;
    inventoryName?: string;
  }[]>([]);

  useEffect(() => {
    if (id) {
      getOrderById(id).finally(() => setIsInitialLoad(false));
      getUsersByRoleId("1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D"); // Inventory Manager Role
      getAllProducts("false", 1, 1000, ""); // Fetch products
    }
  }, [id]);

  useEffect(() => {
    if (order) {
      const mappedItems = order.items.map((item: any) => ({
        id: item.id || "",
        productId: item.productId || "",
        productName: item.productName || "",
        quantity: item.quantity || 0,
        amount: item.unitPrice || 0, // Using unitPrice for amount
        inventoryName: item.inventoryName || ""
      }));
      setItems(mappedItems);
      
      // Auto-select the first item's inventory user id if available
      if (order.items.length > 0 && order.items[0].inventoryUserId) {
        setSelectedInventoryUserId(order.items[0].inventoryUserId);
      } else if (order.inventoryUserId) {
        setSelectedInventoryUserId(order.inventoryUserId);
      }
    }
  }, [order]);

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: parseFloat(value) || 0
    };
    setItems(newItems);
  };

  const handleItemProductChange = (index: number, newProductId: string) => {
    const newItems = [...items];
    const selectedProduct = products.find(p => p.id === newProductId || p.productId === newProductId);
    
    if (selectedProduct) {
      newItems[index] = {
        ...newItems[index],
        productId: selectedProduct.id || selectedProduct.productId || newProductId,
        productName: selectedProduct.name || selectedProduct.productName || "Unknown"
      };
      
      setItems(newItems);

      // Auto-update provider (inventory manager) if the product has one
      const providerId = selectedProduct.inventoryUserId || (selectedProduct.inventories?.[0]?.inventoryUserId) || (selectedProduct.inventories?.[0]?.userId);
      if (providerId) {
        setSelectedInventoryUserId(providerId);
        toast.success(`Inventory Manager automatically changed to the new product's provider.`);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedInventoryUserId) {
      toast.error("Please select an inventory manager.");
      return;
    }

    const payload = {
      orderId: id,
      inventoryUserId: selectedInventoryUserId,
      items: items.map(i => ({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        amount: i.amount
      }))
    };

    const { success, error } = await editOrder(payload);

    if (success) {
      toast.success("Order updated successfully!");
      router.refresh();
      setTimeout(() => {
        router.push("/dashboard/order-list");
      }, 1000);
    } else {
      toast.error(error || "Failed to update order");
    }
  };

  if (isInitialLoad && loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (fetchError) return <div className="text-red-600 text-center py-8">{fetchError}</div>;
  if (!order) return <div className="text-center py-8">{t("orderNotFound")}</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <span className="block text-default-900 font-medium text-xl">{t("billTo")}:</span>
              <div className="text-default-500 font-normal mt-2 text-sm">
                <p><b>{t("pharmacyName")}:</b> {order.pharmacyName || 'N/A'}</p>
                <div className="mt-4 max-w-sm">
                  <label className="block text-sm font-medium mb-1">Select Inventory Manager</label>
                  <Select value={selectedInventoryUserId} onValueChange={setSelectedInventoryUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Inventory Manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryManagers.map((user: UserType) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.userName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-1 text-sm text-default-600">
              <p><b>Order Number:</b> {order.orderNumber || 'N/A'}</p>
              <p><b>{t("deliverDate")}:</b> {formatOrderDate(order.orderDate)}</p>
              <p>
                <b>{t("status")}:</b>{" "}
                {order.status !== undefined
                  ? t(`statusOptions.${OrderStatus[order.status as OrderStatus]}`)
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="border border-solid border-default-400 rounded-md overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3 w-32">Quantity</th>
                  <th className="p-3 w-32">Amount</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3">
                      <Select 
                        value={item.productId} 
                        onValueChange={(val) => handleItemProductChange(idx, val)}
                      >
                        <SelectTrigger className="w-full md:w-[250px]">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id || p.productId} value={(p.id || p.productId) as string}>
                              {p.name || p.productName || p.arabicName || "Unnamed Product"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Input 
                        type="number" 
                        min="0"
                        value={item.quantity} 
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={item.amount} 
                        onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                      />
                    </td>
                    <td className="p-3 text-right">
                      {(item.quantity * item.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">No items in this order.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-4 pb-6 px-6">
          <Button onClick={handleSave} disabled={isSaving || items.length === 0}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditOrder;
