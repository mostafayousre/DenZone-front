import { useState } from "react";
import AxiosInstance from "@/lib/AxiosInstance";

export type FavoriteProduct = {
  id: string;
  name: string;
  preef: string;
  description: string;
  categoryId: string;
  categoryName: string;
  arabicName: string;
};

export type UserFavorite = {
  userId: string;
  fullName: string;
  favorites: FavoriteProduct[];
};

function useGetUsersWithFavorites() {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<UserFavorite[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getUsersWithFavorites = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await AxiosInstance.get(`/api/Products/GetUsersWithFavorites`);

      if (response.status === 204) {
        setData([]);
        return;
      }

      if (response.status === 200 || response.status === 201) {
        setData(response.data || []);
      } else {
        setError("An unexpected error occurred.");
      }
    } catch (err: any) {
      console.error("Error fetching user favorites:", err);
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return {
    getUsersWithFavorites,
    loading,
    error,
    data,
  };
}

export default useGetUsersWithFavorites;
