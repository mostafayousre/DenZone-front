import {useState} from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export interface GenerateOrderInvoiceResponse {
    success: boolean;
    error?: string;
}

function useGenerateOrderInvoice() {
    const [loading, setLoading] = useState(false);

    const generateOrderInvoice = async (orderNumber: string): Promise<GenerateOrderInvoiceResponse> => {
        setLoading(true);
        try {
            const response = await AxiosInstance.post(`/api/Invoices/generate/${orderNumber}`);
            if (response.status !== 201) {
                throw new Error('Failed to generate invoice for order or already has an invoice');
            }
            return {success: true};
        } catch (error) {
            return {success: false, error: error instanceof Error ? error.message : 'Failed to generate invoice'};
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        generateOrderInvoice
    }
}

export default useGenerateOrderInvoice;