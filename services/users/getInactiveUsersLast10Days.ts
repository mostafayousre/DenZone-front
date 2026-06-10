import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface InactiveUser {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  phoneNumber: string;
  createdAt: string;
}

function useGetInactiveUsersLast10Days() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inactiveUsers, setInactiveUsers] = useState<InactiveUser[]>([]);

  const getInactiveUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get("/api/Users/GetInActive-Users-Last10Days");
      if (response.status === 200) {
        setInactiveUsers(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error("Failed to fetch inactive users");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
      setInactiveUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, inactiveUsers, getInactiveUsers };
}

export default useGetInactiveUsersLast10Days;
