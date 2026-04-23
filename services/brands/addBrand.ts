import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

function useAddBrand() {
    const [loading, setLoading] = useState(false);

    const addBrand = async (formData: FormData) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.post("/api/Brands/add-brand", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            return response.status === 200 || response.status === 201;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to add brand";
            throw errorMessage;
        } finally {
            setLoading(false);
        }
    };

    return { loading, addBrand };
}

export default useAddBrand;