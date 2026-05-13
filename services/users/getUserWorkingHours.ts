import { useState, useCallback } from "react";
import AxiosInstance from "@/lib/AxiosInstance";
import { WorkingHour } from "./updateWorkingHours";

function useGetUserWorkingHours() {
    const [loading, setLoading] = useState(false);
    const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);

    const getWorkingHours = useCallback(async (userId: string) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`/api/Users/get-user-WorkingHours/${userId}`);
            
            let data = response.data;
            let extractedHours = [];
            
            if (data && Array.isArray(data.workingHours)) {
                extractedHours = data.workingHours;
            } else if (data && data.data && Array.isArray(data.data.workingHours)) {
                extractedHours = data.data.workingHours;
            } else if (Array.isArray(data)) {
                extractedHours = data;
            }
            
            setWorkingHours(extractedHours);
            return { success: true, data: extractedHours };
        } catch (error: any) {
            setWorkingHours([]);
            return { success: false, error: error.response?.data?.message || error.message || "Something went wrong" };
        } finally {
            setLoading(false);
        }
    }, []);

    return { getWorkingHours, workingHours, loading };
}

export default useGetUserWorkingHours;
