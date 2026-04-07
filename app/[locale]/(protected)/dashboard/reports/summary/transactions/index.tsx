"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {useRouter} from "@/i18n/routing";
import {useEffect, useState} from "react";
import {Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {OrderStatus, OrderStatusLabel, PaymentMethod, PaymentMethodLabel} from "@/enum";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, DollarSign, ShoppingCart, FileText, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";
import useGettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import useGettingAllPharmacies from "@/services/users/gettingAllPharmacies";
import {UserType} from "@/types/users";
import {AreaType, MainArea} from "@/types/areas";
import useSummaryReports from "@/services/Reports/summary/summaryReports";

export default function TransactionsTable() {
    const router = useRouter();
    const {loading: loadingSummaryReports, summaryReports, fetchSummaryReports} = useSummaryReports();

    const {loading: loadingUsers, error: errorUsers, users, getUsersByRoleId} = useGetUsersByRoleId()

    const {loading: loadingMainAreas, error: errorMainAreas, mainAreas, getAllMainAreas} = useGettingAllMainAreas()

    const {loading: loadingPharmacies, error: errorPharmacies, pharmacies, gettingAllPharmacies} = useGettingAllPharmacies()

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [UserId, setPharmacyUserId] = useState<string>("");
    const [inventoryUserId, setInventoryUserId] = useState<string>("");
    const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(undefined);

    useEffect(() => {
        const fetchDataInitial = async () => {
            try {
                await getUsersByRoleId("1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D");
                await getAllMainAreas();
            } catch (error) {
                console.error("Error during fetch sequence:", error);
            }
        };

        fetchDataInitial();
        gettingAllPharmacies();
        fetchData(); 
    }, []);

    const fetchData = () => {
        const params = new URLSearchParams();

        if (dateRange?.from) {
            params.set('StartDate', dateRange.from.toISOString());
        }
        if (dateRange?.to) {
            params.set('EndDate', dateRange.to.toISOString());
        }
        if (UserId) {
            params.set('UserId', UserId);
        }
        if (inventoryUserId) {
            params.set('InventoryUserId', inventoryUserId);
        }
       
        if (status !== undefined) {
            params.set('Status', status.toString());
        }
        if (paymentMethod) {
            params.set('PaymentMethod', paymentMethod);
        }

        console.log(params.toString());

        fetchSummaryReports(params.toString());
    };

    const handleApplyFilters = () => {
        fetchData();
    };

    const handleResetFilters = () => {
        setDateRange({
            from: subDays(new Date(), 30),
            to: new Date(),
        });
        setPharmacyUserId("");
        setInventoryUserId("");
        setStatus(undefined);
        setPaymentMethod(undefined);

        setTimeout(() => {
            fetchData();
        }, 100);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD', 
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US').format(num);
    };

    if (loadingMainAreas || loadingUsers) {
        return (
            <div className="flex items-center justify-center h-full py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
          
            <Card>
                <CardHeader>
                    <CardTitle>Summary Reports Filters</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {/* Date Range Picker */}
                    <div className="grid gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !dateRange && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                                {format(dateRange.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
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

                    {/* Pharmacy User Select */}
                    <Select
                        value={UserId}
                        onValueChange={(value) => setPharmacyUserId(value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Doctor" />
                        </SelectTrigger>
                        <SelectGroup>
                            <SelectContent>
                                {pharmacies.map((user: UserType) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectGroup>
                    </Select>

                    {/* Inventory User Select */}
                    <Select
                        value={inventoryUserId}
                        onValueChange={(value) => setInventoryUserId(value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Provider" />
                        </SelectTrigger>
                        <SelectGroup>
                            <SelectContent>
                                {users.map((user: UserType) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectGroup>
                    </Select>

                   
                    {/* Status Filter */}
                    <Select
                        value={status === undefined ? "" : status.toString()}
                        onValueChange={(value) => {
                            if (value === "") {
                                setStatus(undefined);
                            } else {
                                const statusValue = parseInt(value);
                                if (Object.values(OrderStatus).includes(statusValue)) {
                                    setStatus(statusValue as OrderStatus);
                                }
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectGroup>
                            <SelectContent>
                                {Object.keys(OrderStatus)
                                    .filter(key => !isNaN(Number(key)))
                                    .map((key) => {
                                        const statusValue = Number(key) as OrderStatus;
                                        return (
                                            <SelectItem key={statusValue} value={statusValue.toString()}>
                                                {OrderStatusLabel[statusValue]}
                                            </SelectItem>
                                        );
                                    })}
                            </SelectContent>
                        </SelectGroup>
                    </Select>

                    {/* Payment Method Filter */}
                    <Select
                        value={paymentMethod === undefined ? "" : paymentMethod}
                        onValueChange={(value) => {
                            if (value === "") {
                                setPaymentMethod(undefined);
                            } else if (Object.values(PaymentMethod).includes(value as PaymentMethod)) {
                                setPaymentMethod(value as PaymentMethod);
                            }
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Payment Method" />
                        </SelectTrigger>
                        <SelectGroup>
                            <SelectContent>
                                {Object.values(PaymentMethod).map((method) => (
                                    <SelectItem key={method} value={method}>
                                        {PaymentMethodLabel[method]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectGroup>
                    </Select>

                    <div className="flex gap-2">
                        <Button onClick={handleApplyFilters} className="w-full">
                            Apply Filters
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleResetFilters}
                            className="w-full"
                        >
                            Reset Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {loadingSummaryReports ? (
                <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : summaryReports ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 px-6 mx-auto">
                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center space-x-4">
                                <DollarSign className="h-8 w-8 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                                    <p className="text-2xl font-bold">{formatCurrency(summaryReports.totalSales)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center space-x-4">
                                <DollarSign className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Cash</p>
                                    <p className="text-2xl font-bold">{formatCurrency(summaryReports.totalCash)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center space-x-4">
                                <CreditCard className="h-8 w-8 text-purple-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Credit</p>
                                    <p className="text-2xl font-bold">{formatCurrency(summaryReports.totalCredit)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center space-x-4">
                                <ShoppingCart className="h-8 w-8 text-orange-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                                    <p className="text-2xl font-bold">{formatNumber(summaryReports.totalOrders)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex items-center p-6">
                            <div className="flex items-center space-x-4">
                                <FileText className="h-8 w-8 text-red-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                                    <p className="text-2xl font-bold">{formatNumber(summaryReports.totalInvoices)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : null}

            {/* Summary Table */}
            {summaryReports && (
                <Card>
                    <CardHeader>
                        <CardTitle>Summary Report Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border border-solid border-default-200 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-default-200">
                                    <TableRow>
                                        <TableHead>Metric</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">Total Sales</TableCell>
                                        <TableCell className="font-bold text-green-600">
                                            {formatCurrency(summaryReports.totalSales)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            Total revenue from all sales
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Total Cash</TableCell>
                                        <TableCell className={`font-bold ${summaryReports.totalCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(summaryReports.totalCash)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            Total cash transactions
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Total Credit</TableCell>
                                        <TableCell className={`font-bold ${summaryReports.totalCredit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(summaryReports.totalCredit)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            Total credit transactions
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Total Orders</TableCell>
                                        <TableCell className="font-bold text-blue-600">
                                            {formatNumber(summaryReports.totalOrders)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            Number of orders processed
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">Total Invoices</TableCell>
                                        <TableCell className="font-bold text-purple-600">
                                            {formatNumber(summaryReports.totalInvoices)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            Number of invoices generated
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="bg-muted/50">
                                        <TableCell className="font-medium">Average Order Value</TableCell>
                                        <TableCell className="font-bold text-indigo-600">
                                            {summaryReports.totalOrders > 0
                                                ? formatCurrency(summaryReports.totalSales / summaryReports.totalOrders)
                                                : formatCurrency(0)
                                            }
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            Average value per order
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};