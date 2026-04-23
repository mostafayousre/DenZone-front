import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useUpdateBanner() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateBanner = async (id: string, bannerData: { imageFile?: File | null; order: number }) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            if (bannerData.imageFile) {
                formData.append("imageFile", bannerData.imageFile);
            }
            formData.append("order", bannerData.order.toString());
            formData.append("id", id);

            const response = await AxiosInstance.put(`/api/Banners/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response?.status === 200 || response?.status === 204) {
                return true;
            } else {
                throw new Error("Failed to update banner");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { updateBanner, loading, error };
}

export default useUpdateBanner;
