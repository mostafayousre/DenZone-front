import { useState } from 'react';
import AxiosInstance from "@/lib/AxiosInstance";

function useGetPreparationDelivers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [preparationDelivers, setPreparationDelivers] = useState<any[]>([]);

    const getPreparationDelivers = async () => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`/api/Users/get-Preparation-delivers`);
            if (response.status === 200 || response.status === 201) {
                setPreparationDelivers(response.data);
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error: any) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        preparationDelivers,
        getPreparationDelivers
    }
}

export default useGetPreparationDelivers;
