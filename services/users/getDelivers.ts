import {useState} from 'react';
import AxiosInstance from "@/lib/AxiosInstance";

function useGetDelivers() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [delivers, setDelivers] = useState<any[]>([]);

    const getDelivers = async () => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`/api/Users/get-delivers`);
            if (response.status === 200 || response.status === 201) {
                setDelivers(response.data);
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
        delivers,
        getDelivers
    }
}

export default useGetDelivers;
