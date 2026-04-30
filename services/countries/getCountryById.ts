import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { CountryType } from "@/types/country";

function useGetCountryById() {
    const [loading, setLoading] = useState(false);

    const getCountryById = async (id: string | number) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`/api/Countries/${id}`);
            
            if (response?.status === 200) {
                return response.data as CountryType;
            } else {
                throw new Error("Failed to fetch country");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, getCountryById };
}

export default useGetCountryById;
