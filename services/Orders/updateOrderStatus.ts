import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";
import { OrderStatus, StatusPathMap } from "@/enum";

function useUpdateOrderStatus() {
  const [loading, setLoading] = useState(false);

  const updateOrderStatus = async (
    orderNumber: string,
    status: OrderStatus
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      const statusPath = StatusPathMap[status];

      if (!statusPath) {
        throw new Error("Unsupported status");
      }

      const url = `/api/Orders/${statusPath}/${orderNumber}`;

      const response = await AxiosInstance.put(url);

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Failed to update order status");
      }

      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || "Failed to update order status");
      }

      return { success: true };
    } catch (error: any) {
      console.error("UPDATE ERROR:", error);
      return { success: false, error: error.message || "Unknown error" };
    } finally {
      setLoading(false);
    }
  };

  return { updateOrderStatus, loading };
}

export default useUpdateOrderStatus;
