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
import { OrderStatus, OrderStatusLabel, PaymentMethod, PaymentMethodLabel } from "@/enum";
import useOrderReports from "@/services/Reports/Orders/orderReports";
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
import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";
import useGettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import useGettingAllPharmacies from "@/services/users/gettingAllPharmacies";
import { UserType } from "@/types/users";
import { Label } from "@/components/ui/label";

export default function TransactionsTable() {
    const router = useRouter();
    const { loading: loadingOrderReports, orderReports, fetchOrderReports } = useOrderReports();
    const { loading: loadingUsers, users, getUsersByRoleId } = useGetUsersByRoleId();
    const { loading: loadingMainAreas, getAllMainAreas } = useGettingAllMainAreas();
    const { pharmacies, gettingAllPharmacies } = useGettingAllPharmacies();

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [userId, setUserId] = useState<string>("");
    const [inventoryUserId, setInventoryUserId] = useState<string>("");
    const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>(undefined);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(20);

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const columns = baseColumns({ refresh: () => fetchData() });

    const table = useReactTable({
        data: orderReports?.items ?? [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    useEffect(() => {
        const fetchDataInitail = async () => {
            try {
                await getUsersByRoleId("1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D");
                await getAllMainAreas();
            } catch (error) {
                console.error(error);
            }
        };
        fetchDataInitail();
        gettingAllPharmacies();
    }, []);

    useEffect(() => {
        fetchData();
    }, [pageNumber, pageSize]);

    const fetchData = () => {
        const params = new URLSearchParams();

        if (dateRange?.from) params.set('StartDate', dateRange.from.toISOString());
        if (dateRange?.to) params.set('EndDate', dateRange.to.toISOString());
        if (userId) params.set('UserId', userId);
        if (inventoryUserId) params.set('InventoryUserId', inventoryUserId);
        if (status !== undefined) params.set('Status', status.toString());
        if (paymentMethod) params.set('PaymentMethod', paymentMethod);

        params.set('PageNumber', pageNumber.toString());
        params.set('PageSize', pageSize.toString());

        fetchOrderReports(params.toString());
    };

    const handleApplyFilters = () => {
        setPageNumber(1);
        fetchData();
    };

    const handleResetFilters = () => {
        setDateRange({
            from: subDays(new Date(), 30),
            to: new Date(),
        });
        setUserId("");
        setInventoryUserId("");
        setStatus(undefined);
        setPaymentMethod(undefined);
        setPageNumber(1);
        setPageSize(20);
        fetchData();
    };

    const handlePageChange = (newPage: number) => {
        setPageNumber(newPage);
    };

    if (loadingMainAreas || loadingUsers) {
        return (
            <div className="flex items-center justify-center h-full py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <Card className="w-full">
            <div className="px-5 py-4 flex flex-col gap-4">
                <Label>Filters</Label>
                <hr className="border-default-200" />
                <div className="flex flex-row items-center justify-center gap-2">
                    <Label htmlFor="date">Date Range</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal flex-1",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
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

                <div className="flex items-center gap-2">
                    <Label htmlFor="userId">Doctor</Label>
                    <Select
                        value={userId}
                        disabled={inventoryUserId !== ""}
                        onValueChange={(value) => setUserId(value)}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select Doctor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {pharmacies.map((user: UserType) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.fullName}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Label htmlFor="inventoryUser">Provider</Label>
                    <Select
                        value={inventoryUserId}
                        onValueChange={(value) => setInventoryUserId(value)}
                        disabled={userId !== ""}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select Provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {users.map((user: UserType) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.fullName}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                        value={paymentMethod === undefined ? "all" : paymentMethod}
                        onValueChange={(value) => {
                            if (value === "all") setPaymentMethod(undefined);
                            else setPaymentMethod(value as PaymentMethod);
                        }}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Filter by Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Payment Methods</SelectItem>
                            {Object.values(PaymentMethod).map((method) => (
                                <SelectItem key={method} value={method}>
                                    {PaymentMethodLabel[method]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={status === undefined ? "all" : status.toString()}
                        onValueChange={(value) => {
                            if (value === "all") setStatus(undefined);
                            else setStatus(parseInt(value) as OrderStatus);
                        }}
                    >
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {Object.keys(OrderStatus)
                                .filter(key => !isNaN(Number(key)))
                                .map((key) => {
                                    const statusVal = Number(key) as OrderStatus;
                                    return (
                                        <SelectItem key={statusVal} value={statusVal.toString()}>
                                            {OrderStatusLabel[statusVal]}
                                        </SelectItem>
                                    );
                                })}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    <Button onClick={handleApplyFilters} className="w-full">
                        Apply Filters
                    </Button>
                    <Button variant="outline" onClick={handleResetFilters} className="w-full">
                        Reset Filters
                    </Button>
                </div>
            </div>

            {loadingOrderReports ? (
                <div className="flex items-center justify-center h-full py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
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

            {orderReports && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">Page {pageNumber} of {orderReports.totalPages}</p>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => {
                                setPageSize(Number(value));
                                setPageNumber(1);
                            }}
                        >
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
                    <div className="flex items-center justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber <= 1}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => handlePageChange(pageNumber + 1)} disabled={pageNumber >= orderReports.totalPages}>Next</Button>
                    </div>
                </div>
            )}
        </Card>
    );
}