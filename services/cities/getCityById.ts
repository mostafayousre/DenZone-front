import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { CityType } from "@/types/city";

function useGetCityById() {
    const [loading, setLoading] = useState(false);

    const getCityById = async (id: string | number) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`/api/Cities/${id}`);
            
            if (response?.status === 200) {
                return response.data as CityType;
            } else {
                throw new Error("Failed to fetch city");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Something went wrong";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, getCityById };
}

export default useGetCityById;
