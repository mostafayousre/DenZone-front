export type Coupon = {
    id?: string;
    code?: string;
    description: string;
    discountType: "percentage" | "fixed_amount";
    discountValue: number;
    minimumOrderAmount: number;
    maximumDiscountAmount: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
    perUserLimit: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    applicabilities?: any | null;
    copunUsages?: number;
};
