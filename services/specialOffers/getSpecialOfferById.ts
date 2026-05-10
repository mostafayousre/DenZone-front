import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { SpecialOfferType } from "@/types/specialOffer";

function useGetSpecialOfferById() {
    const [loading, setLoading] = useState(false);
    const [offer, setOffer] = useState<SpecialOfferType | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getSpecialOfferById = async (id: string | number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get(`/api/SpecialOffers/get-offerbyId/${id}`);
            
            if (response?.status === 200) {
                setOffer(response.data);
                return response.data;
            } else {
                throw new Error("Failed to fetch special offer");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, offer, error, getSpecialOfferById };
}

export default useGetSpecialOfferById;
