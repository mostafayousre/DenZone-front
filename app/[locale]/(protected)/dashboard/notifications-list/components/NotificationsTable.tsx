"use client";

import * as React from "react";
import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
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
import TablePagination from "../../brand/transactions/table-pagination"; 
import { CardContent } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import useGetAllNotifications, { NotificationItem } from "@/services/notifications/useGetAllNotifications";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { useDebounce } from "use-debounce";

// تصدير للنوع لضمان التوافق مع أي استيرادات أخرى
export type TransformedNotificationItem = NotificationItem;

const NotificationsTable = () => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

    const {
        data,
        totalItems,
        totalPages,
        pageNumber,
        loading,
        getAllNotifications,
    } = useGetAllNotifications();

    const t = useTranslations("NotificationsList");

    const handleRefresh = useCallback(() => {
        getAllNotifications(pagination.pageIndex + 1, pagination.pageSize, debouncedSearchTerm);
    }, [getAllNotifications, pagination.pageIndex, pagination.pageSize, debouncedSearchTerm]);

    // تمرير دالة التحديث والترجمة للأعمدة
    const columns = baseColumns({ refresh: handleRefresh, t });

    const table = useReactTable({
        data: data ?? [],
        columns,
        manualPagination: true,
        pageCount: Math.max(1, totalPages || 1),
        onPaginationChange: (updater) => {
            const next = typeof updater === "function" ? updater(pagination) : updater;
            setPagination(next);
            getAllNotifications(next.pageIndex + 1, next.pageSize, debouncedSearchTerm);
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });

    // جلب البيانات عند البحث أو التحميل الأولي
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        getAllNotifications(1, pagination.pageSize, debouncedSearchTerm);
    }, [debouncedSearchTerm, getAllNotifications]);

    // مزامنة pageIndex إذا تغير pageNumber من السيرفر
    useEffect(() => {
        if (pageNumber && pageNumber - 1 !== pagination.pageIndex) {
            setPagination((prev) => ({
                ...prev,
                pageIndex: pageNumber - 1,
            }));
        }
    }, [pageNumber]);

    return (
        <div className="w-full">
            <div className="flex flex-wrap justify-between items-center py-4 px-6 border-b border-solid border-default-200 gap-4">
                <div className="flex-1 max-w-sm">
                    <Input
                        type="text"
                        placeholder={t("searchPlaceholder") || "Search by title, group, or user..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-xl"
                    />
                </div>
                {totalItems > 0 && (
                    <div className="text-xs text-muted-foreground font-medium">
                        {totalItems.toLocaleString()} {t("title") || "Notifications"}
                    </div>
                )}
            </div>

            <CardContent className="pt-6">
                <div className="border border-solid border-default-200 rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-default-200 text-black">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin text-primary" size={20} />
                                            <span>{t("loading") || "Loading notifications..."}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="h-[75px] bg-white dark:bg-transparent">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm font-medium">
                                        {t("noNotifications") || "No notifications found."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <TablePagination table={table} />
        </div>
    );
};

export default NotificationsTable;