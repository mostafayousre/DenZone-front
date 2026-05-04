export type UserType = {
    id: string ;
    userName: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    businessName: string;
    minOrder: number;
    isActive: boolean;
    roleId: string;
    isPopular: boolean | null;
    isPharmacy: boolean;
    region: string;
    regionId?: string;
    accountid?: string;
    action: React.ReactNode;
};