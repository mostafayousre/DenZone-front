export enum UserRole {
    Admin = "8C2F4F3A-7F6D-4DB8-8B02-4A04D31F35D6",
    Inventory = "1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D",
    User = "E48E5A9F-2074-4DE9-A849-5C69FDD45E4E",
    Deliver = "e3c4b8fc-afc9-4716-b067-c9ec509d1195",
}

export const UserRoleLabel: Record<UserRole, string> = {
    [UserRole.Admin]: "Admin",
    [UserRole.Inventory]: "Provider",
    [UserRole.User]: "Doctor",
    [UserRole.Deliver]: "Deliver",
};

export enum OrderStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Prepared = 3,
    Shipped = 4,
    Delivered = 5,
    Completed = 6,
    ReAssignTo= 7,
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
    [OrderStatus.Pending]: "Pending",
    [OrderStatus.Approved]: "Approved",
    [OrderStatus.Rejected]: "Rejected",
    [OrderStatus.Prepared]: "Prepared",
    [OrderStatus.Shipped]: "Shipped",
    [OrderStatus.Delivered]: "Delivered",
    [OrderStatus.Completed]: "Completed",
    [OrderStatus.ReAssignTo]: "Reassigned",
};

export const StatusPathMap: Record<OrderStatus, string> = {
    [OrderStatus.Pending]: "pending",
    [OrderStatus.Approved]: "approve",
    [OrderStatus.Rejected]: "reject",
    [OrderStatus.Prepared]: "prepare",
    [OrderStatus.Shipped]: "ship",
    [OrderStatus.Delivered]: "deliver",
    [OrderStatus.Completed]: "complete",
    [OrderStatus.ReAssignTo]: "reassign",
};

export enum ReturnStatus {
    Requested = 0,
    Approved = 1,
    Rejected = 2,
    Processing = 3,
    Completed = 4
}

export const ReturnStatusLabel: Record<ReturnStatus, string> = {
    [ReturnStatus.Requested]: "Requested",
    [ReturnStatus.Approved]: "Approved",
    [ReturnStatus.Rejected]: "Rejected",
    [ReturnStatus.Processing]: "Processing",
    [ReturnStatus.Completed]: "Completed"
};

export enum PaymentMethod {
    Cash = "Cash",
    Credit = "Credit",
    Mixed = "Mixed",
}

export const PaymentMethodLabel: Record<PaymentMethod, string> = {
    [PaymentMethod.Cash]: "Cash",
    [PaymentMethod.Credit]: "Credit",
    [PaymentMethod.Mixed]: "Mixed",
};

export enum BalanceAccountType {
    Cash = "Cash",
    Credit = "Credit",
}

export const BalanceAccountTypeLabel: Record<BalanceAccountType, string> = {
    [BalanceAccountType.Cash]: "Cash",
    [BalanceAccountType.Credit]: "Credit",
};

export enum TransactionType {
    Deposit = "Deposit",
    Withdrawal = "Withdrawal",
    Payment = "Payment",
    Refund = "Refund",
    Adjustment = "Adjustment",
}

export const TransactionTypeLabel: Record<TransactionType, string> = {
    [TransactionType.Deposit]: "Deposit",
    [TransactionType.Withdrawal]: "Withdrawal",
    [TransactionType.Payment]: "Payment",
    [TransactionType.Refund]: "Refund",
    [TransactionType.Adjustment]: "Adjustment",
};

