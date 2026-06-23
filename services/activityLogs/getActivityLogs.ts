import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface ActivityLog {
  id: string;
  entityName: string;
  entityId: string;
  action: string;
  details: string;
  timestamp: string;
  userId: string;
  userName: string;
}

function useGetActivityLogs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const getActivityLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get("/api/ActivityLogs");
      if (response.status === 200) {
        setActivityLogs(Array.isArray(response.data?.logs) ? response.data.logs : []);
        setTotalCount(typeof response.data?.total === "number" ? response.data.total : 0);
      } else {
        throw new Error("Failed to fetch activity logs");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
      setActivityLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, activityLogs, totalCount, getActivityLogs };
}

export default useGetActivityLogs;

