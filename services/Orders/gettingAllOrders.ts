import { useState, useCallback, useRef } from "react";
import AxiosInstance from "@/lib/AxiosInstance";
import axios from "axios";

function useGettingAllOrders() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

    const abortControllerRef = useRef<AbortController | null>(null);
    const lastParamsRef = useRef({
        pageNumber: 1,
        pageSize: 20,
        search: "",
    });

    const gettingAllOrders = useCallback(
        async (
            pageNum?: number,
            pSize?: number,
            searchTerm?: string
        ) => {
            const targetPage = pageNum ?? lastParamsRef.current.pageNumber ?? 1;
            const targetSize = pSize ?? lastParamsRef.current.pageSize ?? 20;
            const targetSearch = searchTerm !== undefined ? searchTerm : lastParamsRef.current.search;

            lastParamsRef.current = {
                pageNumber: targetPage,
                pageSize: targetSize,
                search: targetSearch,
            };

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            setLoading(true);
            setError(null);

            let isCanceled = false;

            try {
                const params: Record<string, any> = {
                    pageNumber: targetPage,
                    pageSize: targetSize,
                    // t: Date.now(),
                };

                if (targetSearch && targetSearch.trim()) {
                    params.search = targetSearch.trim();
                }

                const res = await AxiosInstance.get(`/api/Orders/orders`, {
                    params,
                    signal: controller.signal,
                });

                if (res.status === 200 || res.status === 201 || !res.data?.errors) {
                    const data = res.data;
                    if (Array.isArray(data)) {
                        setOrders(data);
                        setTotalItems(data.length);
                        setTotalPages(1);
                        setPageNumber(1);
                        setPageSize(data.length);
                    } else if (data && Array.isArray(data.items)) {
                        setOrders(data.items);
                        setTotalItems(data.totalItems ?? data.items.length);
                        setTotalPages(data.totalPages ?? 1);
                        setPageNumber(data.pageNumber ?? targetPage);
                        setPageSize(data.pageSize ?? targetSize);
                    } else {
                        setOrders([]);
                        setTotalItems(0);
                        setTotalPages(1);
                    }
                } else {
                    const firstKey = Object.keys(res.data.errors)[0];
                    const firstMessage = res.data.errors[firstKey][0];
                    setError(`${firstKey}: ${firstMessage}`);
                }
            } catch (err: any) {
                if (axios.isCancel(err) || err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
                    isCanceled = true;
                    return;
                }

                const apiErrors = err?.response?.data?.errors;
                if (apiErrors && typeof apiErrors === "object") {
                    const firstKey = Object.keys(apiErrors)[0];
                    const firstMessage = apiErrors[firstKey][0];
                    setError(`${firstKey}: ${firstMessage}`);
                } else {
                    setError(err?.response?.data?.message || err?.message || "An unexpected error occurred.");
                }
            } finally {
                if (!isCanceled) {
                    setLoading(false);
                }
            }
        },
        []
    );

    return {
        loading,
        error,
        orders,
        totalItems,
        totalPages,
        pageNumber,
        pageSize,
        gettingAllOrders,
    };
}

export default useGettingAllOrders;