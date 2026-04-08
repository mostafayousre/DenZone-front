import { Price } from "@/types/price";
import { CategoryType } from "@/types/category";

export type ProductType = {
    id?: string,
     productCode: string;
    productName: string;
    productId?: string;
     productArabicName?: string;
    name: string,
    arabicName?: string,
    preef: string,
    arabicPreef?: string,
    description: string,
    arabicDescription?: string,
    category: CategoryType,
    categoryId: string,
    images: any,
    prices?: Price[]
    inventories?: any[]
    inventoryUserId?: string;
    createdAt: string;
    updatedAt: string;
}