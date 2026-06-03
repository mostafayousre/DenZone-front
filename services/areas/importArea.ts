import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

function useImportArea() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const importArea = async (file: File): Promise<{ success: boolean; error?: string }> => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await AxiosInstance.post('/api/Area/import-excel', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200 || response.status === 201) {
                return { success: true };
            } else {
                throw new Error("Failed to import areas");
            }
        } catch (err: any) {
            console.error('Import areas failed:', err);
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, importArea };
}

export default useImportArea;
