import AxiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";

export interface HomeProductBanner {
  id: string;
  imageName?: string;
  imageUrl?: string;
  link?: string;
  order?: number;
  imageFile?: string | null;
}

export interface HomeProductCategory {
  id: string;
  name: string;
  arabicName?: string;
  imageFile?: string;
}

export interface HomeProductItem {
  productId: string;
  productPriceId: string;
  productName: string;
  arabicProductName?: string;
  image?: string;
  description?: string;
  arabicDescription?: string;
  preef?: string;
  arabicPreef?: string;
  stockQuantity?: number;
  salesPrice?: number;
  discountRate?: number;
  inventoryUserId?: string;
  isFavorite?: boolean;
}

export interface HomeProductProvider {
  id: string;
  fullName: string;
  userName?: string;
  email?: string;
  isAvailableNow?: boolean;
  profileImage?: string;
}

export interface HomeProductBrand {
  id: number | string;
  name: string;
  arName?: string;
  imagePath?: string | null;
  isPopular?: boolean;
}

export interface HomeProductSpecialOffer {
  id: number | string;
  imagePath: string;
  sectionNum?: number | null;
  link?: string;
}

export interface HomeProductSectionItem {
  id: string;
  type: number;
  typeKey?: string;
  title: string;
  subtitle?: string;
  startDate?: string | null;
  endDate?: string | null;
  items?: any[];
}

export interface HomeProductResponse {
  banners: HomeProductBanner[];
  categories: HomeProductCategory[];
  products: HomeProductItem[];
  providers?: HomeProductProvider[];
  brands?: HomeProductBrand[];
  specialOffersone?: HomeProductSpecialOffer[];
  specialOfferstwo?: HomeProductSpecialOffer[];
  flashSales?: any[];
  sections?: HomeProductSectionItem[];
  fullName?: string;
}

export function useGetHomeProduct() {
  const [data, setData] = useState<HomeProductResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHomeProduct = async (): Promise<HomeProductResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AxiosInstance.get<HomeProductResponse>(
        "/api/Home/GetHomeProduct"
      );
      if (response?.status === 200 && response.data) {
        setData(response.data);
        return response.data;
      }
      return null;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load home product data";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, getHomeProduct };
}

export default useGetHomeProduct;
