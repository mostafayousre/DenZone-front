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
    isPharmacy: boolean;
    region: string;
    regionId?: string;
    accountid?: string;
    action: React.ReactNode;
};