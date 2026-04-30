import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export enum RecipientType {
  AllDoctors = 0,
  AllProviders = 1,
  Specific = 2,
}

export interface NotificationPayload {
  recipientType: number;
  userIds?: string[];
  message: string;
  title: string;
  expired: string;
}

function useSendNotification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendNotification = async (payload: NotificationPayload): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await AxiosInstance.post(`/api/Notifacations/send-notifcation`, payload);
      
      if (response.status !== 200 && response.status !== 201 && response.status !== 204) {
        throw new Error(response.data?.message || "Failed to send notification");
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
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { sendNotification, loading, error };
}

export default useSendNotification;
