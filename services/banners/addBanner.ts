import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useAddBanner() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addBanner = async (bannerData: { imageFile: File; order: number }) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("imageFile", bannerData.imageFile);
            formData.append("order", bannerData.order.toString());

            const response = await AxiosInstance.post("/api/Banners", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response?.status === 200 || response?.status === 201) {
                return true;
            } else {
                throw new Error("Failed to add banner");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { addBanner, loading, error };
}

export default useAddBanner;
