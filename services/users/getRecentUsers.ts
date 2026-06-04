import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  phoneNumber: string;
  createdAt: string;
}

function useGetRecentUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  const getRecentUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get("/api/Users/get-recent-users");
      if (response.status === 200) {
        setRecentUsers(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error("Failed to fetch recent users");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
      setRecentUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, recentUsers, getRecentUsers };
}

export default useGetRecentUsers;
