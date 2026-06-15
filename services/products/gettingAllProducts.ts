import { useState, useRef } from "react";
import { ProductType } from "@/types/product";
import AxiosInstance from "@/lib/AxiosInstance";
import axios from "axios";

function useGettingAllProducts() {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [includeDeletedState, setIncludeDeletedState] = useState<string>("false");
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);
  // 

  const lastParamsRef = useRef({
    includeDeleted: "false",
    page: 1,
    size: 50,
    searchValue: "",
  });

  const getAllProducts = async (
    includeDeleted: string,
    page: number = 1,
    size: number = 50,
    searchValue: string = ""
  ) => {
    lastParamsRef.current = { includeDeleted, page, size, searchValue };

    // إلغاء أي طلب معلق سابق
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // 

    // إنشاء متحكم جديد للطلب الحالي
    const controller = new AbortController();
    abortControllerRef.current = controller;
    // 

    setLoading(true);
    setError(null);

    let isCanceled = false;
    // 

    try {
      const response = await AxiosInstance.get(`/api/Products/GetProducts`, {
        params: {
          includeDeleted,
          page,
          size,
          search: searchValue,
          _t: Date.now(), 
        },
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        signal: controller.signal, // تمرير الـ signal لإمكانية الإلغاء
      });

      if (response.status === 204) {
        setProducts([]);
        setTotalItems(0);
        setTotalPages(1);
        return;
      }

      if (response.status === 200 || response.status === 201) {
        if (!response.data || !response.data.data) {
          setProducts([]);
          setTotalItems(0);
          setTotalPages(1);
          return;
        }

        setProducts([...response.data.data]); 
        setTotalItems(response.data.totalItems || response.data.data.length);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(page);
        setIncludeDeletedState(includeDeleted);
        setSearch(searchValue);
      } else {
        if (response.data?.errors) {
          const firstKey = Object.keys(response.data.errors)[0];
          const firstMessage = response.data.errors[firstKey]?.[0] || "Unknown error";
          setError(`${firstKey}: ${firstMessage}`);
        } else {
          setError("An unexpected error occurred.");
        }
      }
    } catch (err: any) {
      if (axios.isCancel(err)) {
        isCanceled = true;
        console.log("Request canceled successfully:", searchValue);
        return;
      }
      // 

      console.error("Error fetching products:", err);

      if (err?.response?.status === 404) {
        setError("Products endpoint not found.");
      } else if (err?.response?.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else if (err?.response?.status === 403) {
        setError("Access forbidden.");
      } else if (err?.response?.data?.errors) {
        const apiErrors = err.response.data.errors;
        const firstKey = Object.keys(apiErrors)[0];
        const firstMessage = apiErrors[firstKey]?.[0] || "Unknown error";
        setError(`${firstKey}: ${firstMessage}`);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      if (!isCanceled) {
        setLoading(false);
      }
      // 
    }
  };

  const refreshProducts = (includeDeleted?: string) => {
    const { page, size, searchValue } = lastParamsRef.current;
    const resolvedIncludeDeleted = includeDeleted ?? lastParamsRef.current.includeDeleted;

    return new Promise<void>((resolve) => {
      setTimeout(async () => {
        await getAllProducts(resolvedIncludeDeleted, page, size, searchValue);
        resolve();
      }, 300); 
    });
  };

  return {
    getAllProducts,
    refreshProducts, 
    loading,
    error,
    products,
    includeDeleted: includeDeletedState,
    setIncludeDeletedState,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    search,
    setSearch,
  };
}

export default useGettingAllProducts;