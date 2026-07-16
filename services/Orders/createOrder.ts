import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface CreateOrderItem {
  id: string;
  productId: string;
  productName: string;
  inventoryName: string;
  productPriceId: string;
  quantity: number;
  unitPrice: number;
  inventoryUserId: string;
}

export interface CreateOrderDto {
  couponId?: string | null;
  userId: string;
  totalAmount: number;
  items: CreateOrderItem[];
  paymentMethod: number;
  creditAmount?: number;
}

export interface CreateOrderParams {
  areaId?: number;
  deliveryDate?: number;
  orderNote?: string;
  deliveryTimeSlotId?: string;
}

function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (
    params: CreateOrderParams,
    body: CreateOrderDto
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const queryParams: Record<string, string> = {};
      if (params.areaId !== undefined) queryParams["AreaId"] = String(params.areaId);
      if (params.deliveryDate !== undefined) queryParams["deliveryDate"] = String(params.deliveryDate);
      if (params.orderNote) queryParams["orderNote"] = params.orderNote;
      if (params.deliveryTimeSlotId) queryParams["deliveryTimeSlotId"] = params.deliveryTimeSlotId;

      const response = await AxiosInstance.post(
        `/api/Orders/add-order-manual`,
        body,
        { params: queryParams }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data?.message || "Failed to create order");
      }

      return { success: true };
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      let errorMessage = "An unexpected error occurred.";

      if (apiErrors && typeof apiErrors === "object") {
        const firstKey = Object.keys(apiErrors)[0];
        const firstMessage = apiErrors[firstKey][0];
        errorMessage = `${firstKey}: ${firstMessage}`;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.response?.data) {
        errorMessage = typeof err.response.data === "string" ? err.response.data : JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
}

export default useCreateOrder;
