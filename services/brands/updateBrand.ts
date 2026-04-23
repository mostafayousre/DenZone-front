import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useUpdateBrand() {
    const [loading, setLoading] = useState(false);

    const updateBrand = async (id: string, formData: FormData) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.put(`/api/Brands/update-brand?id=${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            return response.status === 200 || response.status === 204;
        } catch (err: any) {
            throw err.response?.data?.message || err.message || "Update failed";
        } finally {
            setLoading(false);
        }
    };

    return { updateBrand, loading };
}

export default useUpdateBrand;