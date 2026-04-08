import {useState} from "react";
import {CategoryType} from "@/types/category";
import AxiosInstance from "@/lib/AxiosInstance";

function useGetCategoryById() {
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState<CategoryType>({
        description: "",
        name: "",
        pref: "",
        companyPercentage: "",
        })

    const gettingCategoryById = async (id: string | string[] | undefined) => {
       await AxiosInstance.get(`/api/Categories/${id}?lang=3`).then((response) => {
           if (response.status === 200 || response.data !== null) {
               setCategory(response.data)
           }
           if (response.status !== 200 || response.data.errors || response.data.title == "One or more validation errors occurred.") {
               throw new Error(response.data.title || "Something went wrong")
           }
       }).catch((err) => {
           return err.response?.data?.message || err.message
       }).finally(() => {
           setLoading(false)
       })
    }

    return {category, loading, gettingCategoryById}
}

export default useGetCategoryById;