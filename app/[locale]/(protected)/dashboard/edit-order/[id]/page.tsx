"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Save, Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
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
import AxiosInstance from "@/lib/AxiosInstance";
import { ProductType } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDebounce } from "use-debounce";

const EditOrder: React.FC = () => {
  const t = useTranslations("removeItem");
  const tCommon = useTranslations("common");

  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { order, loading, error: fetchError, getOrderById } = useGettingOrderById();
  const { editOrder } = useEditOrder();
  const { users: inventoryManagers, getUsersByRoleId } = useGetUsersByRoleId();

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openComboboxId, setOpenComboboxId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [debouncedProductSearch] = useDebounce(productSearch, 500);

  const [rowProducts, setRowProducts] = useState<Record<string, ProductType[]>>({});
  const [rowProductsLoading, setRowProductsLoading] = useState<Record<string, boolean>>({});

  const [subOrders, setSubOrders] = useState<{
    id: string;
    inventoryUserId: string;
    inventoryName: string;
    status: number;
    items: {
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      amount: number;
      providerId?: string;
      providerName?: string;
    }[];
  }[]>([]);

  const fetchProductsByProvider = async (rowId: string, providerId: string, searchVal: string) => {
    if (!providerId) return;
    setRowProductsLoading(prev => ({ ...prev, [rowId]: true }));
    try {
      const response = await AxiosInstance.get(`/api/Products/GetProducts-byProvider`, {
        params: {
          inventoryId: providerId,
          search: searchVal,
          _t: Date.now(),
        },
      });
      if (response.status === 200 || response.status === 201) {
        const data = response.data?.data || response.data || [];
        const fetchedList = Array.isArray(data) ? data : [];
        setRowProducts(prev => ({ ...prev, [rowId]: fetchedList }));
      } else {
        setRowProducts(prev => ({ ...prev, [rowId]: [] }));
      }
    } catch (err) {
      console.error("Error fetching products by provider:", err);
      setRowProducts(prev => ({ ...prev, [rowId]: [] }));
    } finally {
      setRowProductsLoading(prev => ({ ...prev, [rowId]: false }));
    }
  };

  useEffect(() => {
    if (id) {
      getOrderById(id).finally(() => setIsInitialLoad(false));
      getUsersByRoleId("1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D"); // Inventory Manager Role
    }
  }, [id]);

  useEffect(() => {
    if (openComboboxId) {
      const [subOrderIdxStr, itemIdxStr] = openComboboxId.split("-");
      const subOrderIdx = parseInt(subOrderIdxStr);
      const itemIdx = parseInt(itemIdxStr);
      const item = subOrders[subOrderIdx]?.items[itemIdx];
      const providerId = item?.providerId || subOrders[subOrderIdx]?.inventoryUserId;
      if (providerId) {
        fetchProductsByProvider(openComboboxId, providerId, debouncedProductSearch);
      }
    }
  }, [debouncedProductSearch, openComboboxId]);

  useEffect(() => {
    if (openComboboxId) {
      setProductSearch("");
    }
  }, [openComboboxId]);

  useEffect(() => {
    if (order) {
      const list = order.orders && order.orders.length > 0 ? order.orders : [order];
      const mappedSubOrders = list.map((so: any) => ({
        id: so.id || "",
        inventoryUserId: so.inventoryUserId || "",
        inventoryName: so.inventoryName || "Unnamed Provider",
        status: so.status ?? 0,
        items: (so.items || []).map((item: any) => ({
          id: item.id || "",
          productId: item.productId || "",
          productName: item.productName || item.arabicName || "Unnamed Product",
          quantity: item.quantity || 0,
          amount: item.unitPrice || item.amount || 0,
          providerId: so.inventoryUserId || "",
          providerName: so.inventoryName || "Unnamed Provider",
        }))
      }));
      setSubOrders(mappedSubOrders);
    }
  }, [order]);

  const handleItemChange = (subOrderIdx: number, itemIdx: number, field: string, value: string) => {
    const newSubOrders = [...subOrders];
    const itemsList = [...newSubOrders[subOrderIdx].items];
    itemsList[itemIdx] = {
      ...itemsList[itemIdx],
      [field]: parseFloat(value) || 0
    };
    newSubOrders[subOrderIdx].items = itemsList;
    setSubOrders(newSubOrders);
  };

  const handleAddProduct = (subOrderIdx: number) => {
    const newSubOrders = [...subOrders];
    const subOrder = newSubOrders[subOrderIdx];
    subOrder.items = [
      ...subOrder.items,
      {
        id: "00000000-0000-0000-0000-000000000000",
        productId: "",
        productName: "",
        quantity: 1,
        amount: 0,
        providerId: subOrder.inventoryUserId || "",
        providerName: subOrder.inventoryName || "Unnamed Provider",
      }
    ];
    setSubOrders(newSubOrders);

    if (subOrder.inventoryUserId) {
      const newRowIdx = subOrder.items.length - 1;
      const comboId = `${subOrderIdx}-${newRowIdx}`;
      fetchProductsByProvider(comboId, subOrder.inventoryUserId, "");
    }
  };

  const handleRemoveProduct = (subOrderIdx: number, itemIdx: number) => {
    const newSubOrders = [...subOrders];
    const itemsList = [...newSubOrders[subOrderIdx].items];
    itemsList.splice(itemIdx, 1);
    newSubOrders[subOrderIdx].items = itemsList;
    setSubOrders(newSubOrders);
  };

  const handleItemProviderChange = (subOrderIdx: number, itemIdx: number, newProviderId: string) => {
    const newSubOrders = [...subOrders];
    const manager = inventoryManagers.find((u: any) => u.id === newProviderId);
    const providerName = manager?.fullName || manager?.userName || "Unknown";

    newSubOrders[subOrderIdx].inventoryUserId = newProviderId;
    newSubOrders[subOrderIdx].inventoryName = providerName;

    const itemsList = [...newSubOrders[subOrderIdx].items];
    itemsList[itemIdx] = {
      ...itemsList[itemIdx],
      providerId: newProviderId,
      providerName: providerName,
      productId: "",
      productName: "",
      amount: 0
    };

    itemsList.forEach((it, idx) => {
      if (idx !== itemIdx && !it.providerId) {
        it.providerId = newProviderId;
        it.providerName = providerName;
      }
    });

    newSubOrders[subOrderIdx].items = itemsList;
    setSubOrders(newSubOrders);

    const comboId = `${subOrderIdx}-${itemIdx}`;
    fetchProductsByProvider(comboId, newProviderId, "");
  };

  const handleItemProductChange = (subOrderIdx: number, itemIdx: number, newProductId: string) => {
    const newSubOrders = [...subOrders];
    const itemsList = [...newSubOrders[subOrderIdx].items];
    const comboId = `${subOrderIdx}-${itemIdx}`;
    const currentProducts = rowProducts[comboId] || [];
    const selectedProduct = currentProducts.find(p => p.id === newProductId || p.productId === newProductId);

    if (selectedProduct) {
      const defaultPrice =
        (selectedProduct as any).salesPrice ??
        (selectedProduct as any).price ??
        (selectedProduct as any).unitPrice ??
        (selectedProduct.prices && selectedProduct.prices.length > 0 ? selectedProduct.prices[0].salesPrice : undefined) ??
        (selectedProduct.inventories && selectedProduct.inventories.length > 0 ? selectedProduct.inventories[0].salesPrice : undefined) ??
        0;

      itemsList[itemIdx] = {
        ...itemsList[itemIdx],
        productId: selectedProduct.productId || newProductId,
        productName: selectedProduct.name || selectedProduct.productName || selectedProduct.arabicName || "Unknown",
        amount: defaultPrice,
        providerId: selectedProduct.inventoryUserId || itemsList[itemIdx].providerId,
      };

      newSubOrders[subOrderIdx].items = itemsList;

      const providerId = selectedProduct.inventoryUserId || (selectedProduct.inventories?.[0]?.inventoryUserId) || (selectedProduct.inventories?.[0]?.userId);
      if (providerId) {
        newSubOrders[subOrderIdx].inventoryUserId = providerId;
        const manager = inventoryManagers.find((u: any) => u.id === providerId);
        if (manager) {
          newSubOrders[subOrderIdx].inventoryName = manager.fullName || manager.userName || "Unknown";
        }
      }

      setSubOrders(newSubOrders);
    }
  };

  // const handleInventoryUserChange = (subOrderIdx: number, newManagerId: string) => {
  //   const newSubOrders = [...subOrders];
  //   newSubOrders[subOrderIdx].inventoryUserId = newManagerId;
  //   const manager = inventoryManagers.find((u: any) => u.id === newManagerId);
  //   if (manager) {
  //     newSubOrders[subOrderIdx].inventoryName = manager.fullName || manager.userName || "Unknown";
  //   }
  //   setSubOrders(newSubOrders);
  // };

  const handleSave = async () => {
    // Validate: check if any item does not have a provider selected
    for (const subOrder of subOrders) {
      for (const item of subOrder.items) {
        if (!item.providerId && !subOrder.inventoryUserId) {
          toast.error(`Please select a provider for all items.`);
          return;
        }
      }
    }

    setSaving(true);

    // Collect all items from all sub-orders into a single flat array
    const allItems = subOrders.flatMap(subOrder =>
      subOrder.items.map(i => ({
        id: i.id,
        productId: i.productId,
        quantity: i.quantity,
        amount: i.amount,
        inventoryUserId: i.providerId || subOrder.inventoryUserId || "",
      }))
    );

    const payload = {
      orderId: order?.id || id,
      items: allItems,
    };

    const { success, error } = await editOrder(payload);

    setSaving(false);

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
      {/* General Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="block text-default-900 font-medium text-xl">{t("billTo")}:</span>
              <div className="text-default-500 font-normal mt-2 text-sm">
                <p><b>{t("pharmacyName")}:</b> {order.pharmacyName || 'N/A'}</p>
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
        </CardContent>
      </Card>

      {/* Provider Cards */}
      {subOrders.map((subOrder, subOrderIdx) => {
        const subOrderTotal = subOrder.items.reduce((sum, item) => sum + (item.quantity * item.amount), 0);
        return (
          <Card key={subOrder.id || subOrderIdx} className="mb-6">
            <CardHeader className="border-b border-default-200">
              <div className="flex justify-between flex-wrap gap-4 items-center">
                <div>
                  <span className="block text-default-900 font-semibold text-lg">
                    {subOrder.inventoryName || "Provider"}
                  </span>
                  {subOrder.id && (
                    <span className="text-xs text-default-500 font-mono block mt-1">
                      ID: {subOrder.id}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-default-900">Order Items</h3>
                <Button onClick={() => handleAddProduct(subOrderIdx)} type="button" size="sm" className="h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Product
                </Button>
              </div>

              <div className="border border-solid border-default-400 rounded-md overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:text-black">
                    <tr>
                      <th className="p-3 w-48">Provider</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 w-32">Quantity</th>
                      <th className="p-3 w-32">Amount</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 w-16 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subOrder.items.map((item, itemIdx) => {
                      const comboId = `${subOrderIdx}-${itemIdx}`;
                      return (
                        <tr key={itemIdx} className="border-t">
                          <td className="p-3">
                            <Select
                              value={item.providerId || ""}
                              onValueChange={(val) => {
                                handleItemProviderChange(subOrderIdx, itemIdx, val);
                              }}
                            >
                              <SelectTrigger className="w-full md:w-[180px] h-9">
                                <SelectValue placeholder="Select Provider" />
                              </SelectTrigger>
                              <SelectContent>
                                {inventoryManagers.map((user: UserType) => (
                                  <SelectItem key={user.id} value={user.id} className="text-xs">
                                    {user.fullName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Popover
                              open={openComboboxId === comboId}
                              onOpenChange={(open) => {
                                setOpenComboboxId(open ? comboId : null);
                                if (open) {
                                  const providerId = item.providerId || subOrder.inventoryUserId;
                                  if (providerId && (!rowProducts[comboId] || rowProducts[comboId].length === 0)) {
                                    fetchProductsByProvider(comboId, providerId, "");
                                  }
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  disabled={!item.providerId && !subOrder.inventoryUserId}
                                  aria-expanded={openComboboxId === comboId}
                                  className="w-full md:w-[250px] justify-between font-normal"
                                >
                                  <span className="truncate max-w-[200px]">
                                    {item.productId
                                      ? item.productName || "Unnamed Product"
                                      : "Select Product"}
                                  </span>
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[250px] p-0">
                                <Command shouldFilter={false}>
                                  <CommandInput
                                    placeholder="Search product..."
                                    value={productSearch}
                                    onValueChange={(val) => setProductSearch(val)}
                                  />
                                  <CommandList>
                                    {rowProductsLoading[comboId] ? (
                                      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading products...
                                      </div>
                                    ) : (
                                      <>
                                        <CommandEmpty>No product found.</CommandEmpty>
                                        <CommandGroup>
                                          {(rowProducts[comboId] || []).map((p) => (
                                            <CommandItem
                                              key={p.id || p.productId}
                                              value={p.name || p.productName || p.arabicName || "Unnamed Product"}
                                              onSelect={() => {
                                                handleItemProductChange(subOrderIdx, itemIdx, (p.id || p.productId) as string);
                                                setOpenComboboxId(null);
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4 flex-shrink-0",
                                                  item.productId === (p.id || p.productId) ? "opacity-100" : "opacity-0"
                                                )}
                                              />
                                              <span className="truncate">{p.name || p.productName || p.arabicName || "Unnamed Product"}</span>
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </>
                                    )}
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(subOrderIdx, itemIdx, 'quantity', e.target.value)}
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              readOnly
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.amount}
                              onChange={(e) => handleItemChange(subOrderIdx, itemIdx, 'amount', e.target.value)}
                            />
                          </td>
                          <td className="p-3 text-right">
                            {(item.quantity * item.amount).toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveProduct(subOrderIdx, itemIdx)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-100 h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {subOrder.items.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-500">No items in this order.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-4 pb-6 px-6 border-t border-default-100">
              <span className="text-sm font-semibold text-default-700">
                Total for {subOrder.inventoryName || "Provider"}: {subOrderTotal.toFixed(2)}
              </span>
            </CardFooter>
          </Card>
        );
      })}

      {/* Save Button Card */}
      <div className="flex justify-between items-center bg-card p-6 rounded-lg border border-default-200">
        <div>
          <span className="text-xs text-default-500 uppercase block">Overall Total</span>
          <span className="text-2xl font-bold text-default-900 dark:text-white">
            {subOrders.reduce((sum, so) => sum + so.items.reduce((s, i) => s + (i.quantity * i.amount), 0), 0).toFixed(2)}
          </span>
        </div>
        <Button onClick={handleSave} disabled={saving || subOrders.every(so => so.items.length === 0)}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditOrder;
