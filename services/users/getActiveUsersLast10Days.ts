import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface ActiveUser {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  phoneNumber: string;
  createdAt: string;
}

function useGetActiveUsersLast10Days() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  const getActiveUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get("/api/Users/GetActive-Users-Last10Days");
      if (response.status === 200) {
        setActiveUsers(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error("Failed to fetch active users");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
      setActiveUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, activeUsers, getActiveUsers };
}

export default useGetActiveUsersLast10Days;
