export type Price = {
    id?: string;
    productId: string;
    productName: string;
    categoryId: string;
    categoryName: string;
    purchasePrice: number;
    salesPrice: number;
    creationDate: string;
    inventoryUserId: string;
    inventoryUserName: string;
    stockQuantity?: string| number;
    maxQuantity?: string | number;
    discountRate?: number;
}