import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { BannerType } from "@/types/banner";

function useGetBannerById() {
    const [loading, setLoading] = useState(false);
    const [banner, setBanner] = useState<BannerType | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getBannerById = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get(`/api/Banners/${id}`);
            
            if (response?.status === 200) {
                setBanner(response.data);
                return response.data;
            } else {
                throw new Error("Banner not found");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, banner, error, getBannerById };
}

export default useGetBannerById;
