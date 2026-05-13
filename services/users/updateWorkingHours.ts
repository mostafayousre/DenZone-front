import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export type WorkingHour = {
    day: number | string;
    startTime?: string;
    endTime?: string;
    from?: string;
    to?: string;
};

function useUpdateWorkingHours() {
    const [loading, setLoading] = useState(false);

    const updateWorkingHours = async (id: string, workingHours: WorkingHour[]): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        try {
            const response = await AxiosInstance.put(`/api/Users/AddOrUpdateWorkingHours/${id}`, workingHours);
            if (response.status !== 200 && response.status !== 204) {
                throw new Error('Failed to update working hours');
            }
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.response?.data?.message || error.message || "Something went wrong" };
        } finally {
            setLoading(false);
        }
    };

    return { updateWorkingHours, loading };
}

export default useUpdateWorkingHours;
