import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useResendNotification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resendNotification = async (ids: string[]): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.post(`/api/Notifacations/resend-notifcation`, ids);
      if (response.status !== 200 && response.status !== 204 && response.status !== 201) {
        throw new Error(response.data?.message || "Failed to resend notification");
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

  return { resendNotification, loading, error };
}

export default useResendNotification;
