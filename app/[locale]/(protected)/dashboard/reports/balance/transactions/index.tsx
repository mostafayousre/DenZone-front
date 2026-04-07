"use client";

import * as React from "react";
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { baseColumns } from "./columns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useTransactionBalance from "@/services/Reports/balance/transactionBalance";
import useAccountBalance from "@/services/Reports/balance/accountBalance";
import useBalanceSummary from "@/services/Reports/balance/balanceSummary";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { UserType } from "@/types/users";
import { Label } from "@/components/ui/label";
import GetUsers from "@/services/users/GetAllUsers";
import { BalanceAccountType, BalanceAccountTypeLabel, TransactionType, TransactionTypeLabel } from "@/enum";

interface BalanceTableTypes {
    type: "account" | "transaction" | "summary";
}

export default function TransactionsTable({ type = "account" }: BalanceTableTypes) {
    const router = useRouter();

    const { transactions, fetchTransactions, loading: loadingTransactions } = useTransactionBalance()
    const { loading: loadingBalances, balances, gettingAccountBalances } = useAccountBalance()
    const { loading: loadingSummary, summary, fetchBalanceSummary } = useBalanceSummary()
    const { loading: loadingGettingAllUsers, gettingAllUsers, data } = GetUsers()

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    
    const [userId, setUserId] = useState<string>("");
    // تعديل الـ types لتقبل number (0, 1, 2...)
    const [accountType, setAccountType] = useState<number | undefined>(undefined);
    const [transactionType, setTransactionType] = useState<number | undefined>(undefined);
    
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const getCurrentData = () => {
        switch (type) {
            case "transaction": return transactions;
            case "account": return balances;
            case "summary": return null;
            default: return balances;
        }
    };

    const getCurrentLoading = () => {
        switch (type) {
            case "transaction": return loadingTransactions;
            case "account": return loadingBalances;
            case "summary": return loadingSummary;
            default: return loadingBalances;
        }
    };

    const currentData = getCurrentData();
    const currentLoading = getCurrentLoading();

    const fetchData = () => {
        const params = new URLSearchParams();

        if (dateRange?.from) params.set('StartDate', dateRange.from.toISOString());
        if (dateRange?.to) params.set('EndDate', dateRange.to.toISOString());
        if (userId) params.set('UserId', userId);
        
        if (accountType !== undefined) params.set('AccountType', accountType.toString());
        if (transactionType !== undefined) params.set('TransactionType', transactionType.toString());

        params.set('PageNumber', pageNumber.toString());
        params.set('PageSize', pageSize.toString());

        console.log(`${type} params:`, params.toString());

        switch (type) {
            case "transaction": fetchTransactions(params.toString()); break;
            case "account": gettingAccountBalances(params.toString()); break;
            case "summary": fetchBalanceSummary(params.toString()); break;
        }
    };

    const columns = baseColumns({ refresh: fetchData, type });

    const table = useReactTable({
        data: type === "summary" ? [] : (currentData?.items ?? []),
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
    });

    useEffect(() => { gettingAllUsers(); }, []);

    useEffect(() => { fetchData(); }, [pageNumber, pageSize, type]);

    const handleApplyFilters = () => {
        setPageNumber(1);
        fetchData();
    };

    const handleResetFilters = () => {
        setDateRange({ from: subDays(new Date(), 30), to: new Date() });
        setUserId("");
        setAccountType(undefined);
        setTransactionType(undefined);
        setPageNumber(1);
        setPageSize(20);
        fetchData();
    };

    const handlePageChange = (newPage: number) => setPageNumber(newPage);

    if (loadingGettingAllUsers) {
        return (
            <div className="flex items-center justify-center h-full py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    const getTableTitle = () => {
        switch (type) {
            case "transaction": return "Transaction Balance Report";
            case "account": return "Account Balance Report";
            case "summary": return "Balance Summary Report";
            default: return "Balance Report";
        }
    };

    return (
        <Card className="w-full">
            <div className="px-5 py-4 flex flex-col gap-4">
                <Label className="text-lg font-bold">{getTableTitle()} - Filters</Label>
                <hr className="border-default-200" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="date">Date Range</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                                        ) : (format(dateRange.from, "LLL dd, y"))
                                    ) : (<span>Pick a date range</span>)}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="user">User</Label>
                        <Select value={userId} onValueChange={(value) => setUserId(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select User" />
                            </SelectTrigger>
                            <SelectContent>
                                {data?.map((user: UserType) => (
                                    <SelectItem key={user.id} value={user.id}>{user.fullName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Account Type Filter - Modified to send Index (0,1,2...) */}
                    {(type === "account" || type === "summary") && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="accountType">Account Type</Label>
                            <Select
                                value={accountType === undefined ? "all" : accountType.toString()}
                                onValueChange={(value) => setAccountType(value === "all" ? undefined : Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Filter by Account Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Account Types</SelectItem>
                                    {Object.values(BalanceAccountType).map((val, index) => (
                                        <SelectItem key={val} value={index.toString()}>
                                            {BalanceAccountTypeLabel[val as keyof typeof BalanceAccountTypeLabel]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Transaction Type Filter - Modified to send Index (0,1,2...) */}
                    {(type === "transaction" || type === "summary") && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="transactionType">Transaction Type</Label>
                            <Select
                                value={transactionType === undefined ? "all" : transactionType.toString()}
                                onValueChange={(value) => setTransactionType(value === "all" ? undefined : Number(value))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Filter by Transaction Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Transaction Types</SelectItem>
                                    {Object.values(TransactionType).map((val, index) => (
                                        <SelectItem key={val} value={index.toString()}>
                                            {TransactionTypeLabel[val as keyof typeof TransactionTypeLabel]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-2">
                    <Button onClick={handleApplyFilters} className="flex-1">Apply Filters</Button>
                    <Button variant="outline" onClick={handleResetFilters} className="flex-1">Reset Filters</Button>
                </div>
            </div>

            {currentLoading ? (
                <div className="flex items-center justify-center h-full py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : type === "summary" ? (
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-blue-600">Total Balance</h3>
                            <p className="text-2xl font-bold text-blue-900">${summary?.totalBalance?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-green-600">Total Credit Limit</h3>
                            <p className="text-2xl font-bold text-green-900">${summary?.totalCreditLimit?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-purple-600">Total Accounts</h3>
                            <p className="text-2xl font-bold text-purple-900">{summary?.totalAccounts?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-orange-600">Total Transactions</h3>
                            <p className="text-2xl font-bold text-orange-900">{summary?.totalTransactions?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-emerald-600">Total Deposits</h3>
                            <p className="text-2xl font-bold text-emerald-900">${summary?.totalDeposits?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border">
                            <h3 className="text-sm font-medium text-red-600">Total Withdrawals</h3>
                            <p className="text-2xl font-bold text-red-900">${summary?.totalWithdrawals?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </CardContent>
            ) : (
                <CardContent>
                    <div className="border border-solid border-default-200 rounded-lg overflow-hidden border-t-0">
                        <Table>
                            <TableHeader className="bg-default-200">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="h-[75px]">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            )}

            {type !== "summary" && currentData && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">Page {pageNumber} of {currentData.totalPages}</p>
                        <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPageNumber(1); }}>
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber <= 1}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(pageNumber + 1)} disabled={pageNumber >= currentData.totalPages}>Next</Button>
                    </div>
                </div>
            )}
        </Card>
    );
}