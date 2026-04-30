import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { CountryType } from "@/types/country";

function useGetCountries() {
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState<CountryType[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getAllCountries = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get("/api/Countries/all-countries");
            
            if (response?.status === 200) {
                setCountries(response.data);
                return response.data;
            } else {
                throw new Error("Failed to fetch countries");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, countries, error, getAllCountries };
}

export default useGetCountries;
