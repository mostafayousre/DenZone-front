"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, ShoppingCart, ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import useCreateOrder, { CreateOrderItem } from "@/services/Orders/createOrder";
import useGetAreas from "@/services/areas/getAllAreas";
import useGettingAllDeliveryTimeSlots from "@/services/deliveryTimeSlots/gettingAllDeliveryTimeSlots";
import useGettingAllCoupons from "@/services/coupons/gettingAllCoupons";
import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";
import AxiosInstance from "@/lib/AxiosInstance";
import { UserType } from "@/types/users";
import { useRouter } from "@/i18n/routing";

const DOCTOR_ROLE_ID    = "E48E5A9F-2074-4DE9-A849-5C69FDD45E4E";
const INVENTORY_ROLE_ID = "1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D";

const DELIVERY_OPTIONS = [
  { value: 1, label: "Today" },
  { value: 2, label: "Tomorrow" },
  { value: 3, label: "Day After Tomorrow" },
];

const PAYMENT_METHODS = [
  { value: 0, label: "Cash" },
  { value: 1, label: "Credit" },
  { value: 2, label: "Online" },
];

const makeEmptyItem = (): CreateOrderItem => ({
  id: "00000000-0000-0000-0000-000000000000",
  productId: "",
  productName: "",
  inventoryName: "",
  productPriceId: "00000000-0000-0000-0000-000000000000",
  quantity: 1,
  unitPrice: 0,
  inventoryUserId: "",
});

interface SearchableSelectProps {
  value: string;
  onValueChange: (val: string) => void;
  placeholder: string;
  loading?: boolean;
  options: { value: string; label: string }[];
  id?: string;
  disabled?: boolean;
}

function SearchableSelect({ value, onValueChange, placeholder, loading, options, id, disabled }: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" role="combobox" aria-expanded={open} disabled={disabled || loading} className="w-full justify-between font-normal h-9 px-3 text-sm">
          <span className="truncate text-left flex-1">
            {loading ? "Loading..." : selectedLabel ? selectedLabel : <span className="text-muted-foreground">{placeholder}</span>}
          </span>
          {loading ? <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search..." value={search} onValueChange={setSearch} className="h-9" />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...
              </div>
            ) : filtered.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((opt) => (
                  <CommandItem key={opt.value} value={opt.value} onSelect={() => { onValueChange(opt.value === value ? "" : opt.value); setOpen(false); setSearch(""); }}>
                    <Check className={cn("mr-2 h-4 w-4 flex-shrink-0", value === opt.value ? "opacity-100" : "opacity-0")} />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function CreateOrderPage() {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId]                         = useState("");
  const [selectedAreaId, setSelectedAreaId]                         = useState("");
  const [selectedDeliveryDate, setSelectedDeliveryDate]             = useState("");
  const [selectedDeliveryTimeSlotId, setSelectedDeliveryTimeSlotId] = useState("");
  const [selectedCouponId, setSelectedCouponId]                     = useState("");
  const [orderNote, setOrderNote]                                   = useState("");
  const [paymentMethod, setPaymentMethod]                           = useState("0");
  const [creditAmount, setCreditAmount]                             = useState("0");
  const [items, setItems]                                           = useState<CreateOrderItem[]>([makeEmptyItem()]);
  const [productSearches, setProductSearches]                       = useState<string[]>([""]);
  const [productResults, setProductResults]                         = useState<Record<number, any[]>>({});
  const [productLoading, setProductLoading]                         = useState<Record<number, boolean>>({});
  const debounceRefs = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const { createOrder, loading: creating }                                    = useCreateOrder();
  const { areas, getAllAreas, loading: areasLoading }                         = useGetAreas();
  const { deliveryTimeSlots, getAllDeliveryTimeSlots, loading: slotsLoading } = useGettingAllDeliveryTimeSlots();
  const { coupons, getAllCoupons, loading: couponsLoading }                   = useGettingAllCoupons();
  const { users: doctors,     getUsersByRoleId: getDoctors,     loading: doctorsLoading }     = useGetUsersByRoleId();
  const { users: inventories, getUsersByRoleId: getInventories, loading: inventoriesLoading } = useGetUsersByRoleId();

  useEffect(() => { getAllAreas(); getAllDeliveryTimeSlots(); getAllCoupons(); getDoctors(DOCTOR_ROLE_ID); getInventories(INVENTORY_ROLE_ID); }, []);
  useEffect(() => { if (selectedDeliveryDate) getAllDeliveryTimeSlots(Number(selectedDeliveryDate)); }, [selectedDeliveryDate]);

  const fetchProducts = useCallback(async (idx: number, inventoryId: string, query: string) => {
    if (!inventoryId) { setProductResults((prev) => ({ ...prev, [idx]: [] })); return; }
    setProductLoading((prev) => ({ ...prev, [idx]: true }));
    try {
      const params: Record<string, string> = { inventoryId };
      if (query) params.search = query;
      const response = await AxiosInstance.get("/api/Products/GetProducts-byProvider", { params });
      const data = response.data?.data || response.data || [];
      setProductResults((prev) => ({ ...prev, [idx]: Array.isArray(data) ? data : [] }));
    } catch { setProductResults((prev) => ({ ...prev, [idx]: [] })); }
    finally { setProductLoading((prev) => ({ ...prev, [idx]: false })); }
  }, []);

  const handleInventoryChange = (idx: number, inventoryUserId: string) => {
    const inv = inventories.find((u: UserType) => u.id === inventoryUserId);
    setItems((prev) => { const next = [...prev]; next[idx] = { ...next[idx], inventoryUserId, inventoryName: inv?.fullName || inv?.userName || "", productId: "", productName: "", productPriceId: "00000000-0000-0000-0000-000000000000", unitPrice: 0 }; return next; });
    setProductSearches((prev) => { const n = [...prev]; n[idx] = ""; return n; });
    setProductResults((prev) => ({ ...prev, [idx]: [] }));
    fetchProducts(idx, inventoryUserId, "");
  };

  const handleProductSearch = (idx: number, val: string) => {
    setProductSearches((prev) => { const n = [...prev]; n[idx] = val; return n; });
    if (debounceRefs.current[idx]) clearTimeout(debounceRefs.current[idx]);
    debounceRefs.current[idx] = setTimeout(() => { const id = items[idx]?.inventoryUserId || ""; if (!id) return; fetchProducts(idx, id, val); }, 400);
  };

  const handleSelectProduct = (idx: number, product: any) => {
    const productName = product.name || product.productName || product.arabicName || "";
    const unitPrice = product.salesPrice ?? product.price ?? product.unitPrice ?? product.prices?.[0]?.salesPrice ?? product.inventories?.[0]?.salesPrice ?? 0;
    setItems((prev) => { const next = [...prev]; next[idx] = { ...next[idx], productId: product.productId || product.id || "", productName, productPriceId: product.productPriceId || "00000000-0000-0000-0000-000000000000", unitPrice }; return next; });
    setProductSearches((prev) => { const n = [...prev]; n[idx] = productName; return n; });
    setProductResults((prev) => ({ ...prev, [idx]: [] }));
  };

  const addItem = () => { setItems((prev) => [...prev, makeEmptyItem()]); setProductSearches((prev) => [...prev, ""]); };

  const removeItem = (idx: number) => {
    if (debounceRefs.current[idx]) clearTimeout(debounceRefs.current[idx]);
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setProductSearches((prev) => prev.filter((_, i) => i !== idx));
    setProductResults((prev) => { const next = { ...prev }; delete next[idx]; return next; });
  };

  const handleItemFieldChange = (idx: number, field: keyof CreateOrderItem, value: any) => {
    setItems((prev) => { const next = [...prev]; (next[idx] as any)[field] = value; return next; });
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleReset = () => {
    Object.values(debounceRefs.current).forEach(clearTimeout);
    debounceRefs.current = {};
    setSelectedUserId(""); setSelectedAreaId(""); setSelectedDeliveryDate(""); setSelectedDeliveryTimeSlotId("");
    setSelectedCouponId(""); setOrderNote(""); setPaymentMethod("0"); setCreditAmount("0");
    setItems([makeEmptyItem()]); setProductSearches([""]); setProductResults({}); setProductLoading({});
  };

  const handleSubmit = async () => {
    if (!selectedUserId) { toast.error("Please select a doctor"); return; }
    if (items.some((item) => !item.inventoryUserId)) { toast.error("Please select an inventory for all items"); return; }
    if (items.some((item) => !item.productId)) { toast.error("Please select a product for all items"); return; }
    const params = { areaId: selectedAreaId ? Number(selectedAreaId) : undefined, deliveryDate: selectedDeliveryDate ? Number(selectedDeliveryDate) : undefined, orderNote: orderNote || undefined, deliveryTimeSlotId: selectedDeliveryTimeSlotId || undefined };
    const body = { couponId: (selectedCouponId && selectedCouponId !== "none") ? selectedCouponId : null, userId: selectedUserId, totalAmount, items, paymentMethod: Number(paymentMethod), creditAmount: Number(creditAmount) || 0 };
    const { success, error } = await createOrder(params, body);
    if (success) { toast.success("Order created successfully!"); router.push("/dashboard/order-list"); }
    else { toast.error(error || "Failed to create order"); }
  };

  const doctorOptions    = (doctors as UserType[]).map((d) => ({ value: d.id, label: d.fullName || d.userName || d.id }));
  const areaOptions      = (areas as any[]).map((a) => ({ value: String(a.id), label: a.name || a.areaName || String(a.id) }));
  const deliveryDateOpts = DELIVERY_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }));
  const timeSlotOptions  = (deliveryTimeSlots as any[]).map((s) => ({ value: s.id, label: s.name || s.slotName || `${s.startTime} - ${s.endTime}` }));
  const couponOptions    = [{ value: "none", label: "No Coupon" }, ...(coupons as any[]).map((c) => ({ value: c.id, label: `${c.code || c.couponCode} (${c.percentage ?? c.precentage ?? 0}%)` }))];
  const paymentOptions   = PAYMENT_METHODS.map((pm) => ({ value: String(pm.value), label: pm.label }));
  const inventoryOptions = (inventories as UserType[]).map((inv) => ({ value: inv.id, label: inv.fullName || inv.userName || inv.id }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/order-list")} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />Create New Order
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fill in the details below to create a new order</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">Order Information</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Doctor <span className="text-destructive">*</span></label>
              <SearchableSelect id="create-order-doctor" value={selectedUserId} onValueChange={setSelectedUserId} placeholder="Select doctor" loading={doctorsLoading} options={doctorOptions} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Area</label>
              <SearchableSelect id="create-order-area" value={selectedAreaId} onValueChange={setSelectedAreaId} placeholder="Select area" loading={areasLoading} options={areaOptions} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Delivery Date</label>
              <SearchableSelect id="create-order-delivery-date" value={selectedDeliveryDate} onValueChange={setSelectedDeliveryDate} placeholder="Select delivery date" options={deliveryDateOpts} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Delivery Time Slot</label>
              <SearchableSelect id="create-order-timeslot" value={selectedDeliveryTimeSlotId} onValueChange={setSelectedDeliveryTimeSlotId} placeholder="Select time slot" loading={slotsLoading} options={timeSlotOptions} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Coupon</label>
              <SearchableSelect id="create-order-coupon" value={selectedCouponId} onValueChange={setSelectedCouponId} placeholder="Select coupon (optional)" loading={couponsLoading} options={couponOptions} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Payment Method</label>
              <SearchableSelect id="create-order-payment" value={paymentMethod} onValueChange={setPaymentMethod} placeholder="Select payment method" options={paymentOptions} />
            </div>
            {paymentMethod === "1" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Credit Amount</label>
                <Input id="create-order-credit" type="number" min="0" step="0.01" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} />
              </div>
            )}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium">Order Note</label>
              <Input id="create-order-note" placeholder="Add a note (optional)..." value={orderNote} onChange={(e) => setOrderNote(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Order Items <span className="text-destructive">*</span></CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={addItem} className="flex items-center gap-1 h-8">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border border-default-200 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-default-100 dark:bg-default-200/20">
                <tr>
                  <th className="p-2.5 text-left font-medium text-xs w-52">Inventory <span className="text-destructive">*</span></th>
                  <th className="p-2.5 text-left font-medium text-xs">Product <span className="text-destructive">*</span></th>
                  <th className="p-2.5 text-left font-medium text-xs w-24">Qty</th>
                  <th className="p-2.5 text-left font-medium text-xs w-28">Unit Price</th>
                  <th className="p-2.5 text-right font-medium text-xs w-24">Total</th>
                  <th className="p-2.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-t border-default-100">
                    <td className="p-2 align-top">
                      <SearchableSelect
                        id={`create-order-inventory-${idx}`}
                        value={item.inventoryUserId || ""}
                        onValueChange={(val) => handleInventoryChange(idx, val)}
                        placeholder={inventoriesLoading ? "Loading..." : "Select inventory"}
                        loading={inventoriesLoading}
                        options={inventoryOptions}
                      />
                    </td>
                    <td className="p-2 align-top">
                      <div className="relative">
                        <Input
                          id={`create-order-product-${idx}`}
                          placeholder={!item.inventoryUserId ? "Select inventory first..." : "Search product..."}
                          disabled={!item.inventoryUserId}
                          value={productSearches[idx] || ""}
                          onChange={(e) => handleProductSearch(idx, e.target.value)}
                          className="h-9 text-xs"
                        />
                        {productLoading[idx] && <Loader2 className="absolute right-2 top-2.5 w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                        {(productResults[idx] || []).length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-default-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {(productResults[idx] || []).map((p: any, pidx: number) => (
                              <button key={pidx} type="button" className="w-full text-left px-3 py-2 text-xs hover:bg-accent hover:text-accent-foreground transition-colors border-b border-default-100 last:border-0" onClick={() => handleSelectProduct(idx, p)}>
                                <span className="font-medium">{p.name || p.productName || p.arabicName}</span>
                                {(p.salesPrice ?? p.price ?? p.unitPrice) !== undefined && <span className="text-muted-foreground ml-2">— {p.salesPrice ?? p.price ?? p.unitPrice}</span>}
                              </button>
                            ))}
                          </div>
                        )}
                        {item.productId && !productResults[idx]?.length && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">✓ {item.productName}</p>}
                      </div>
                    </td>
                    <td className="p-2 align-top">
                      <Input id={`create-order-qty-${idx}`} type="number" min="1" value={item.quantity} onChange={(e) => handleItemFieldChange(idx, "quantity", Number(e.target.value))} className="h-9 text-xs" />
                    </td>
                    <td className="p-2 align-top">
                      <Input id={`create-order-price-${idx}`} type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => handleItemFieldChange(idx, "unitPrice", Number(e.target.value))} className="h-9 text-xs" />
                    </td>
                    <td className="p-2 text-right text-xs font-medium align-top pt-3.5">{(item.quantity * item.unitPrice).toFixed(2)}</td>
                    <td className="p-2 align-top">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} className="flex items-center justify-center w-8 h-8 text-destructive hover:bg-destructive/10 rounded-full transition-colors mt-0.5">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-default-50 dark:bg-default-200/10 border-t border-default-200">
                <tr>
                  <td colSpan={4} className="p-2.5 text-xs font-semibold text-right">Total Amount:</td>
                  <td className="p-2.5 text-xs font-bold text-right">{totalAmount.toFixed(2)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 p-5 bg-card border border-default-200 rounded-lg">
        <div>
          <span className="text-xs text-muted-foreground uppercase block">Total Amount</span>
          <span className="text-2xl font-bold">{totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { handleReset(); router.push("/dashboard/order-list"); }} disabled={creating}>Cancel</Button>
          <Button variant="outline" onClick={handleReset} disabled={creating}>Reset</Button>
          <Button onClick={handleSubmit} disabled={creating} className="min-w-[140px]">
            {creating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : <><ShoppingCart className="w-4 h-4 mr-2" />Create Order</>}
          </Button>
        </div>
      </div>
    </div>
  );
}