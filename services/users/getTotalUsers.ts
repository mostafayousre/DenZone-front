import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface TotalUser {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  phoneNumber: string;
  createdAt: string;
  roleName?: string;
}

function useGetTotalUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState<TotalUser[]>([]);

  const getTotalUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get("/api/Users/get-total-users");
      if (response.status === 200) {
        setTotalUsers(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error("Failed to fetch total users");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
      setTotalUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, totalUsers, getTotalUsers };
}

export default useGetTotalUsers;
