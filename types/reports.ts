// types/reports.ts
import {OrderStatus, PaymentMethod} from "@/enum";

export interface InvoiceReportItem {
    id: string;
    invoiceNumber: string;
    date: string;
    orderDate: string;
    pharmacyName?: string;
    fullName?: string;
    inventoryName?: string;
    regionName?: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    totalAmount: number;
}

export interface PaginatedInvoiceReports {
    items: InvoiceReportItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface SummaryReport {
    totalSales: number;
    totalCash: number;
    totalCredit: number;
    totalOrders: number;
    totalInvoices: number;
    activeUsers?: number;
    inactiveUsers?: number;
    totalActiveUser?: number;
    totalNonActiveUser?: number;
}

export interface AccountBalanceItem {
    id: string;
    userId: string;
    userName: string;
    accountType: string;
    balance: number;
    creditLimit: number;
    createdAt: string;
    transactionCount: number;
    totalDeposits: number;
    totalWithdrawals: number;
}

export interface PaginatedAccountBalances {
    items: AccountBalanceItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface TransactionReportItem {
    id: string;
    userId: string;
    userName: string;
    transactionType: string;
    transactionDate: string;
    amount: number;
    orderId: string;
    orderNumber: string;
    description?: string;
}

export interface PaginatedTransactionReports {
    items: TransactionReportItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface SummaryBalanceReport {
    totalBalance: number;
    totalCreditLimit: number;
    totalAccounts: number;
    totalTransactions: number;
    totalDeposits: number;
    totalWithdrawals: number;
}