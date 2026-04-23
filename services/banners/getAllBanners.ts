import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { BannerType } from "@/types/banner";

function useGetBanners() {
    const [loading, setLoading] = useState(false);
    const [banners, setBanners] = useState<BannerType[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getAllBanners = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get("/api/Banners");
            
            if (response?.status === 200) {
                setBanners(response.data);
                return response.data;
            } else {
                throw new Error("Failed to fetch banners");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, banners, error, getAllBanners };
}

export default useGetBanners;
