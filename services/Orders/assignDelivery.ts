import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useAssignDelivery() {
  const [loading, setLoading] = useState(false);

  const assignDelivery = async (
    orderId: string,
    deliveryUserId: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      const url = `/api/Orders/assign-delivery`;
      
      const payload = {
        orderId,
        deliveryUserId
      };

      const response = await AxiosInstance.post(url, payload);

      if (response.status < 200 || response.status >= 300) {
        throw new Error("Failed to assign delivery");
      }

      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || "Failed to assign delivery");
      }

      return { success: true };
    } catch (error: any) {
      console.error("ASSIGN ERROR:", error);
      return { success: false, error: error.message || "Unknown error" };
    } finally {
      setLoading(false);
    }
  };

  return { assignDelivery, loading };
}

export default useAssignDelivery;
