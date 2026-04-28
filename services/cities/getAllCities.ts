import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { CityType } from "@/types/city";

function useGetCities() {
    const [loading, setLoading] = useState(false);
    const [cities, setCities] = useState<CityType[]>([]);
    const [error, setError] = useState<string | null>(null);

    const getAllCities = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await AxiosInstance.get("/api/Cities/all-city");
            
            if (response?.status === 200) {
                setCities(response.data);
                return response.data;
            } else {
                throw new Error("Failed to fetch cities");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMessage);
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, cities, error, getAllCities };
}

export default useGetCities;
