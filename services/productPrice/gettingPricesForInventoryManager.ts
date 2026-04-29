import { useState } from "react";
import { Price } from "@/types/price";
import AxiosInstance from "@/lib/AxiosInstance";
import Cookies from "js-cookie";

/**
 * Hook to fetch prices for the current inventory manager.
 *
 * Usage:
 * - If you pass a userId to gettingPricesForInventoryManager, it will use that.
 * - Otherwise it will try to read the userId from a cookie named "userId".
 *
 * The hook also returns the userId that was used to fetch the prices so you can
 * inspect it in the component using this hook.
 */
function useGettingPricesForInventoryManager() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [prices, setPrices] = useState<Price[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
        return Cookies.get("userId") ?? null;
    });

    const gettingPricesForInventoryManager = async (userId?: string, page: number = 1, pageSize: number = 10) => {
        setLoading(true);
        setError(null);

        const idToUse = userId ?? Cookies.get("userId") ?? currentUserId;

        if (!idToUse) {
            setError("No userId provided or stored in cookies");
            setLoading(false);
            return;
        }

        setCurrentUserId(idToUse);

        try {
            const response = await AxiosInstance.get(`/api/ProductPrices/my-prices/${encodeURIComponent(idToUse)}`, {
                params: {
                    page: page,
                    pageSize: pageSize
                }
            });

            if (response.status !== 200) {
                throw new Error(`Failed to fetch prices (status ${response.status})`);
            }

            const payload = (response.data && (response.data.data ?? response.data)) as Price[];

            setPrices(Array.isArray(payload) ? payload : []);
            setTotalPages(response.data?.totalPages || 0);
            setTotalItems(response.data?.totalCount || 0);

        } catch (err: any) {
            setError(err?.message ?? "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        prices,
        totalPages,
        totalItems,
        gettingPricesForInventoryManager,
        userId: currentUserId,
    };
}

export default useGettingPricesForInventoryManager;