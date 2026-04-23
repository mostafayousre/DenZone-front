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
import TablePagination from "../../brand/transactions/table-pagination"; // Reusing pagination
import { CardContent } from "@/components/ui/card";
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useGetBanners from "@/services/banners/getAllBanners";
import { Loader2, Plus } from "lucide-react";
import { BannerType } from "@/types/banner";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import { useTranslations } from "next-intl";

const BannersTable = () => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const { banners: data, loading, getAllBanners } = useGetBanners();
    const t = useTranslations("banners");
    const columns = baseColumns({ refresh: getAllBanners, t });

    const [filteredBanners, setFilteredBanners] = useState<BannerType[]>([]);

    const table = useReactTable({
        data: filteredBanners ?? [],
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
        getAllBanners();
    }, []);

    useEffect(() => {
        if (data) {
            setFilteredBanners(data);
        }
    }, [data]);

    if (loading) {
        return (
            <div className="flex mx-auto justify-center items-center h-16 w-16">
                <Loader2 size={32} className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex flex-wrap justify-between items-center py-4 px-6 border-b border-solid border-default-200">
                <div className="flex-1 max-w-sm">
                    {/* Note: Banners don't usually have names, maybe filter by ID or just hide search */}
                    <SearchInput data={data ?? []} setFilteredData={setFilteredBanners} filterKey={"id"} placeholder={t("search_placeholder")} />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    <Link href="/dashboard/add-banner">
                        <Button size="md" variant="outline" className="gap-2">
                            <Plus className="w-4 h-4" />
                            {t("add_banner")}
                        </Button>
                    </Link>
                </div>
            </div>

            <CardContent className="pt-6">
                <div className="border border-solid border-default-200 rounded-lg overflow-hidden border-t-0">
                    <Table>
                        <TableHeader className="bg-default-200">
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
                                            <TableCell key={cell.id} className="h-[75px]">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground text-sm font-medium">
                                        {t("no_results")}
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

export default BannersTable;
