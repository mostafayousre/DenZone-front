import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { SpecialOfferType } from "@/types/specialOffer";

function useGetSpecialOffers() {
    const [loading, setLoading] = useState(false);
    const [offers, setOffers] = useState<SpecialOfferType[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getAllSpecialOffers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get("/api/SpecialOffers/get-offers");
            
            if (response?.status === 200) {
                setOffers(response.data);
                return response.data;
            } else {
                throw new Error("Failed to fetch special offers");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, offers, error, getAllSpecialOffers };
}

export default useGetSpecialOffers;
