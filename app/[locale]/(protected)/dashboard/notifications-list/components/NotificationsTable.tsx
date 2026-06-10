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
import TablePagination from "../../brand/transactions/table-pagination"; 
import { CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import useGetAllNotifications, { NotificationItem } from "@/services/notifications/useGetAllNotifications";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";

// تعريف الـ Interface الجديد للداتا المدمجة
export interface TransformedNotificationItem {
    id: string;
    ids: string[];
    title: string;
    message: string;
    createdAt: string;
    expired: string;
    groupName: string;
    users: { userId: string; userName: string }[];
}

// دالة تجميع الإشعارات بناءً على العنوان ونص الرسالة
const transformNotifications = (rawData: NotificationItem[]): TransformedNotificationItem[] => {
    const grouped: { [key: string]: TransformedNotificationItem } = {};

    rawData.forEach((item) => {
        // مفتاح الدمج هو العنوان والرسالة معاً لضمان التطابق
        const key = `${item.title || ""}_${item.message || ""}`;

        if (!grouped[key]) {
            grouped[key] = {
                id: item.id,
                ids: [item.id],
                title: item.title,
                message: item.message,
                createdAt: item.createdAt,
                expired: item.expired,
                groupName: "All Doctors", 
                users: [],
            };
        } else {
            grouped[key].ids.push(item.id);
        }

        // إضافة المستخدم الحالي لقائمة مستلمي هذا الإشعار
        if (item.userId) {
            grouped[key].users.push({
                userId: item.userId,
                userName: item.userName || "—",
            });
        }
    });

    const result = Object.values(grouped);
    result.forEach((item) => {
        if (item.users.length === 1) {
            item.groupName = "Specific";
        } else {
            item.groupName = "All Doctors";
        }
    });

    return result;
};

const NotificationsTable = () => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const { data, loading, getAllNotifications } = useGetAllNotifications();
    const t = useTranslations("NotificationsList");
    
    // تمرير دالة التحديث والترجمة للأعمدة
    const columns = baseColumns({ refresh: getAllNotifications, t });

    const [filteredNotifications, setFilteredNotifications] = useState<TransformedNotificationItem[]>([]);
    const [searchValue, setSearchValue] = useState("");

    const table = useReactTable({
        data: filteredNotifications ?? [],
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
        getAllNotifications();
    }, [getAllNotifications]);

    // تحويل البيانات عند وصولها من السيرفر لأول مرة
    useEffect(() => {
        if (data) {
            setFilteredNotifications(transformNotifications(data));
        }
    }, [data]);

    // تعديل الفلترة والبحث لتتوافق مع البيانات المدمجة والجروب واليوزرز
    useEffect(() => {
        if (!data) return;
        
        const transformed = transformNotifications(data);

        if (!searchValue) {
            setFilteredNotifications(transformed);
        } else {
            const query = searchValue.toLowerCase();
            const filtered = transformed.filter((item) =>
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.message && item.message.toLowerCase().includes(query)) ||
                (item.groupName && item.groupName.toLowerCase().includes(query)) ||
                item.users.some(u => u.userName && u.userName.toLowerCase().includes(query))
            );
            setFilteredNotifications(filtered);
        }
    }, [searchValue, data]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 size={36} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex flex-wrap justify-between items-center py-4 px-6 border-b border-solid border-default-200">
                <div className="flex-1 max-w-sm">
                    <Input
                        type="text"
                        placeholder={t("searchPlaceholder") || "Search by title, group, or user..."}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full max-w-xl"
                    />
                </div>
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
                            {table.getRowModel().rows?.length ? (
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