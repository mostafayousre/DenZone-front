export type BrandType = {
    id?: string | number;
    brandName: string;
    name?: string;
    data?: any;
    success?: any;
    error?: any;
    brands?: BrandType[];
    isPopular?: boolean;
};
