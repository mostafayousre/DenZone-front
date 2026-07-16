"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import useCreateOrder, { CreateOrderItem } from "@/services/Orders/createOrder";
import useGetAreas from "@/services/areas/getAllAreas";
import useGettingAllDeliveryTimeSlots from "@/services/deliveryTimeSlots/gettingAllDeliveryTimeSlots";
import useGettingAllCoupons from "@/services/coupons/gettingAllCoupons";
import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";
import AxiosInstance from "@/lib/AxiosInstance";
import { UserType } from "@/types/users";

// ─── Role IDs ───────────────────────────────────────────────────────────────
const DOCTOR_ROLE_ID    = "E48E5A9F-2074-4DE9-A849-5C69FDD45E4E";
const INVENTORY_ROLE_ID = "1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D";

// ─── Static enums ───────────────────────────────────────────────────────────
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

// ─── Empty item factory ──────────────────────────────────────────────────────
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

// ─── Types ───────────────────────────────────────────────────────────────────
interface CreateOrderDialogProps {
  onSuccess?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function CreateOrderDialog({ onSuccess }: CreateOrderDialogProps) {
  const [open, setOpen] = useState(false);

  // Header fields
  const [selectedUserId, setSelectedUserId]                     = useState("");
  const [selectedAreaId, setSelectedAreaId]                     = useState("");
  const [selectedDeliveryDate, setSelectedDeliveryDate]         = useState("");
  const [selectedDeliveryTimeSlotId, setSelectedDeliveryTimeSlotId] = useState("");
  const [selectedCouponId, setSelectedCouponId]                 = useState("");
  const [orderNote, setOrderNote]                               = useState("");
  const [paymentMethod, setPaymentMethod]                       = useState("0");
  const [creditAmount, setCreditAmount]                         = useState("0");

  // Items
  const [items, setItems] = useState<CreateOrderItem[]>([makeEmptyItem()]);

  // Per-row: product search text, results, loading
  const [productSearches, setProductSearches] = useState<string[]>([""]);
  const [productResults, setProductResults]   = useState<Record<number, any[]>>({});
  const [productLoading, setProductLoading]   = useState<Record<number, boolean>>({});

  // Debounce timers
  const debounceRefs = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // ── Services ──────────────────────────────────────────────────────────────
  const { createOrder, loading: creating }                                    = useCreateOrder();
  const { areas, getAllAreas, loading: areasLoading }                         = useGetAreas();
  const { deliveryTimeSlots, getAllDeliveryTimeSlots, loading: slotsLoading } = useGettingAllDeliveryTimeSlots();
  const { coupons, getAllCoupons, loading: couponsLoading }                   = useGettingAllCoupons();

  // Two separate hook instances — one for doctors, one for inventories
  const { users: doctors,     getUsersByRoleId: getDoctors,    loading: doctorsLoading }     = useGetUsersByRoleId();
  const { users: inventories, getUsersByRoleId: getInventories, loading: inventoriesLoading } = useGetUsersByRoleId();

  // ── Load reference data when dialog opens ─────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (areas.length === 0)               getAllAreas();
    if ((deliveryTimeSlots as any[]).length === 0) getAllDeliveryTimeSlots();
    if ((coupons as any[]).length === 0)  getAllCoupons();
    if (doctors.length === 0)             getDoctors(DOCTOR_ROLE_ID);
    if (inventories.length === 0)         getInventories(INVENTORY_ROLE_ID);
  }, [open]);

  // Re-fetch time slots when delivery date changes
  useEffect(() => {
    if (selectedDeliveryDate) getAllDeliveryTimeSlots(Number(selectedDeliveryDate));
  }, [selectedDeliveryDate]);

  // ── Product fetch ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (idx: number, inventoryId: string, query: string) => {
    if (!inventoryId) {
      setProductResults((prev) => ({ ...prev, [idx]: [] }));
      return;
    }
    setProductLoading((prev) => ({ ...prev, [idx]: true }));
    try {
      const params: Record<string, string> = { inventoryId };
      if (query) params.search = query;
      const response = await AxiosInstance.get("/api/Products/GetProducts-byProvider", { params });
      const data = response.data?.data || response.data || [];
      setProductResults((prev) => ({ ...prev, [idx]: Array.isArray(data) ? data : [] }));
    } catch {
      setProductResults((prev) => ({ ...prev, [idx]: [] }));
    } finally {
      setProductLoading((prev) => ({ ...prev, [idx]: false }));
    }
  }, []);

  // ── Inventory change per row ───────────────────────────────────────────────
  const handleInventoryChange = (idx: number, inventoryUserId: string) => {
    const inv = inventories.find((u: UserType) => u.id === inventoryUserId);

    setItems((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        inventoryUserId,
        inventoryName: inv?.fullName || inv?.userName || "",
        // reset product fields
        productId: "",
        productName: "",
        productPriceId: "00000000-0000-0000-0000-000000000000",
        unitPrice: 0,
      };
      return next;
    });

    // Clear search text & results for this row
    setProductSearches((prev) => { const n = [...prev]; n[idx] = ""; return n; });
    setProductResults((prev) => ({ ...prev, [idx]: [] }));

    // Pre-fetch products for the newly selected inventory (no search query)
    fetchProducts(idx, inventoryUserId, "");
  };

  // ── Product search input (debounced 400ms) ────────────────────────────────
  const handleProductSearch = (idx: number, val: string) => {
    setProductSearches((prev) => { const n = [...prev]; n[idx] = val; return n; });

    if (debounceRefs.current[idx]) clearTimeout(debounceRefs.current[idx]);
    debounceRefs.current[idx] = setTimeout(() => {
      const inventoryId = items[idx]?.inventoryUserId || "";
      if (!inventoryId) return;
      fetchProducts(idx, inventoryId, val);
    }, 400);
  };

  // ── Select a product from the dropdown ───────────────────────────────────
  const handleSelectProduct = (idx: number, product: any) => {
    const productName =
      product.name || product.productName || product.arabicName || "";
    const unitPrice =
      product.salesPrice ??
      product.price ??
      product.unitPrice ??
      product.prices?.[0]?.salesPrice ??
      product.inventories?.[0]?.salesPrice ??
      0;

    setItems((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        productId:      product.productId || product.id || "",
        productName,
        productPriceId: product.productPriceId || "00000000-0000-0000-0000-000000000000",
        unitPrice,
      };
      return next;
    });

    setProductSearches((prev) => { const n = [...prev]; n[idx] = productName; return n; });
    setProductResults((prev) => ({ ...prev, [idx]: [] }));
  };

  // ── Item CRUD ─────────────────────────────────────────────────────────────
  const addItem = () => {
    setItems((prev) => [...prev, makeEmptyItem()]);
    setProductSearches((prev) => [...prev, ""]);
  };

  const removeItem = (idx: number) => {
    if (debounceRefs.current[idx]) clearTimeout(debounceRefs.current[idx]);
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setProductSearches((prev) => prev.filter((_, i) => i !== idx));
    setProductResults((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const handleItemFieldChange = (idx: number, field: keyof CreateOrderItem, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      (next[idx] as any)[field] = value;
      return next;
    });
  };

  // ── Computed total ────────────────────────────────────────────────────────
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    Object.values(debounceRefs.current).forEach(clearTimeout);
    debounceRefs.current = {};
    setSelectedUserId("");
    setSelectedAreaId("");
    setSelectedDeliveryDate("");
    setSelectedDeliveryTimeSlotId("");
    setSelectedCouponId("");
    setOrderNote("");
    setPaymentMethod("0");
    setCreditAmount("0");
    setItems([makeEmptyItem()]);
    setProductSearches([""]);
    setProductResults({});
    setProductLoading({});
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Please select a doctor");
      return;
    }
    if (items.some((item) => !item.inventoryUserId)) {
      toast.error("Please select an inventory for all items");
      return;
    }
    if (items.some((item) => !item.productId)) {
      toast.error("Please select a product for all items");
      return;
    }

    const params = {
      areaId:               selectedAreaId ? Number(selectedAreaId) : undefined,
      deliveryDate:         selectedDeliveryDate ? Number(selectedDeliveryDate) : undefined,
      orderNote:            orderNote || undefined,
      deliveryTimeSlotId:   selectedDeliveryTimeSlotId || undefined,
    };

    const body = {
      couponId:      (selectedCouponId && selectedCouponId !== "none") ? selectedCouponId : null,
      userId:        selectedUserId,
      totalAmount,
      items,
      paymentMethod: Number(paymentMethod),
      creditAmount:  Number(creditAmount) || 0,
    };

    const { success, error } = await createOrder(params, body);

    if (success) {
      toast.success("Order created successfully!");
      setOpen(false);
      handleReset();
      onSuccess?.();
    } else {
      toast.error(error || "Failed to create order");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) handleReset(); }}>
      <DialogTrigger asChild>
        <Button
          id="create-order-btn"
          size="md"
          className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 transition-all rounded-md"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Create New Order
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2">

          {/* ── Header fields ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Doctor */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Doctor <span className="text-destructive">*</span>
              </label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="create-order-doctor">
                  <SelectValue placeholder={doctorsLoading ? "Loading..." : "Select doctor"} />
                </SelectTrigger>
                <SelectContent>
                  {doctorsLoading ? (
                    <div className="flex items-center justify-center p-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : doctors.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">No doctors found</div>
                  ) : (
                    doctors.map((doc: UserType) => (
                      <SelectItem key={doc.id} value={doc.id} className="text-xs">
                        {doc.fullName || doc.userName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Area */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Area</label>
              <Select value={selectedAreaId} onValueChange={setSelectedAreaId}>
                <SelectTrigger id="create-order-area">
                  <SelectValue placeholder={areasLoading ? "Loading..." : "Select area"} />
                </SelectTrigger>
                <SelectContent>
                  {areasLoading ? (
                    <div className="flex items-center justify-center p-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    (areas as any[]).map((area: any) => (
                      <SelectItem key={area.id} value={String(area.id)} className="text-xs">
                        {area.name || area.areaName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Delivery Date</label>
              <Select value={selectedDeliveryDate} onValueChange={setSelectedDeliveryDate}>
                <SelectTrigger id="create-order-delivery-date">
                  <SelectValue placeholder="Select delivery date" />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Delivery Time Slot */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Delivery Time Slot</label>
              <Select value={selectedDeliveryTimeSlotId} onValueChange={setSelectedDeliveryTimeSlotId}>
                <SelectTrigger id="create-order-timeslot">
                  <SelectValue placeholder={slotsLoading ? "Loading..." : "Select time slot"} />
                </SelectTrigger>
                <SelectContent>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center p-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (deliveryTimeSlots as any[]).length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">No time slots found</div>
                  ) : (
                    (deliveryTimeSlots as any[]).map((slot: any) => (
                      <SelectItem key={slot.id} value={slot.id} className="text-xs">
                        {slot.name || slot.slotName || `${slot.startTime} - ${slot.endTime}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Coupon */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Coupon</label>
              <Select value={selectedCouponId} onValueChange={setSelectedCouponId}>
                <SelectTrigger id="create-order-coupon">
                  <SelectValue placeholder={couponsLoading ? "Loading..." : "Select coupon (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs text-muted-foreground">
                    No Coupon
                  </SelectItem>
                  {couponsLoading ? (
                    <div className="flex items-center justify-center p-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    (coupons as any[]).map((coupon: any) => (
                      <SelectItem key={coupon.id} value={coupon.id} className="text-xs">
                        {coupon.code || coupon.couponCode} ({coupon.percentage ?? coupon.precentage ?? 0}%)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="create-order-payment">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((pm) => (
                    <SelectItem key={pm.value} value={String(pm.value)} className="text-xs">
                      {pm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Order Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Order Note</label>
            <Input
              id="create-order-note"
              placeholder="Add a note (optional)..."
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
            />
          </div>

          {/* ── Items table ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">
                Order Items <span className="text-destructive">*</span>
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addItem}
                className="flex items-center gap-1 h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </Button>
            </div>

            <div className="border border-default-200 rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-default-100 dark:bg-default-200/20">
                  <tr>
                    <th className="p-2.5 text-left font-medium text-xs w-44">
                      Inventory <span className="text-destructive">*</span>
                    </th>
                    <th className="p-2.5 text-left font-medium text-xs">
                      Product <span className="text-destructive">*</span>
                    </th>
                    <th className="p-2.5 text-left font-medium text-xs w-20">Qty</th>
                    <th className="p-2.5 text-left font-medium text-xs w-28">Unit Price</th>
                    <th className="p-2.5 text-right font-medium text-xs w-24">Total</th>
                    <th className="p-2.5 w-10" />
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-t border-default-100">

                      {/* ── Inventory select ── */}
                      <td className="p-2 align-top">
                        <Select
                          value={item.inventoryUserId || ""}
                          onValueChange={(val) => handleInventoryChange(idx, val)}
                        >
                          <SelectTrigger
                            id={`create-order-inventory-${idx}`}
                            className="h-8 text-xs"
                          >
                            <SelectValue
                              placeholder={
                                inventoriesLoading ? "Loading..." : "Select inventory"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {inventoriesLoading ? (
                              <div className="flex items-center justify-center p-3">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            ) : inventories.length === 0 ? (
                              <div className="p-3 text-xs text-muted-foreground text-center">
                                No inventories found
                              </div>
                            ) : (
                              inventories.map((inv: UserType) => (
                                <SelectItem key={inv.id} value={inv.id} className="text-xs">
                                  {inv.fullName || inv.userName}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* ── Product search ── */}
                      <td className="p-2 align-top">
                        <div className="relative">
                          <Input
                            id={`create-order-product-${idx}`}
                            placeholder={
                              !item.inventoryUserId
                                ? "Select inventory first..."
                                : "Search product..."
                            }
                            disabled={!item.inventoryUserId}
                            value={productSearches[idx] || ""}
                            onChange={(e) => handleProductSearch(idx, e.target.value)}
                            className="h-8 text-xs"
                          />

                          {/* Spinner */}
                          {productLoading[idx] && (
                            <Loader2 className="absolute right-2 top-2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
                          )}

                          {/* Dropdown results */}
                          {(productResults[idx] || []).length > 0 && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-default-200 rounded-md shadow-lg max-h-44 overflow-y-auto">
                              {(productResults[idx] || []).map((p: any, pidx: number) => (
                                <button
                                  key={pidx}
                                  type="button"
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors border-b border-default-100 last:border-0"
                                  onClick={() => handleSelectProduct(idx, p)}
                                >
                                  <span className="font-medium">
                                    {p.name || p.productName || p.arabicName}
                                  </span>
                                  {(p.salesPrice ?? p.price ?? p.unitPrice) !== undefined && (
                                    <span className="text-muted-foreground ml-2">
                                      — {p.salesPrice ?? p.price ?? p.unitPrice}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Selected product label */}
                          {item.productId && !productResults[idx]?.length && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                              ✓ {item.productName}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* ── Quantity ── */}
                      <td className="p-2 align-top">
                        <Input
                          id={`create-order-qty-${idx}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemFieldChange(idx, "quantity", Number(e.target.value))
                          }
                          className="h-8 text-xs"
                        />
                      </td>

                      {/* ── Unit Price ── */}
                      <td className="p-2 align-top">
                        <Input
                          id={`create-order-price-${idx}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemFieldChange(idx, "unitPrice", Number(e.target.value))
                          }
                          className="h-8 text-xs"
                        />
                      </td>

                      {/* ── Row total ── */}
                      <td className="p-2 text-right text-xs font-medium align-top pt-3.5">
                        {(item.quantity * item.unitPrice).toFixed(2)}
                      </td>

                      {/* ── Delete ── */}
                      <td className="p-2 align-top">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="flex items-center justify-center w-7 h-7 text-destructive hover:bg-destructive/10 rounded-full transition-colors mt-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="bg-default-50 dark:bg-default-200/10 border-t border-default-200">
                  <tr>
                    <td colSpan={4} className="p-2.5 text-xs font-semibold text-right">
                      Total Amount:
                    </td>
                    <td className="p-2.5 text-xs font-bold text-right">
                      {totalAmount.toFixed(2)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => { setOpen(false); handleReset(); }}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={creating}
            className="min-w-[130px]"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Create Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
