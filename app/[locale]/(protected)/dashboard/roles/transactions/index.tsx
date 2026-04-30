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
import TablePagination from "./table-pagination";
import { CardContent } from "@/components/ui/card";
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useGetAllRoles, { RoleData } from "@/services/roles/getAllRoles";
import { Loader2 } from "lucide-react";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import { useTranslations } from "next-intl";

const RolesTable = () => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const { data, loading, getAllRoles } = useGetAllRoles();
    const t = useTranslations("brands"); // Use translation for generic text if needed
    const columns = baseColumns({ refresh: getAllRoles, t });

    const [filteredRoles, setFilteredRoles] = useState<RoleData[]>([]);

    const table = useReactTable({
        data: filteredRoles ?? [],
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
        getAllRoles();
    }, []);

    useEffect(() => {
        if (data) {
            setFilteredRoles(data);
        }
    }, [data]);

    if (loading === true) {
        return (
            <div className="flex mx-auto justify-center items-center h-16 w-16">
                <Loader2 size={32} className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="flex flex-wrap justify-end items-center py-4 px-6 border-b border-solid border-default-200">
                <SearchInput data={data ?? []} setFilteredData={setFilteredRoles} filterKey={"name"} placeholder="Search roles..." />
                <div className="#flex-none">
                    <div className="flex items-center gap-4 flex-wrap">
                        <Link href="/dashboard/add-role">
                            <Button size={"md"} variant="outline">
                                Add Role
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <CardContent className="pt-6">
                <div className="border border-solid border-default-200 rounded-lg overflow-hidden border-t-0">
                    <Table>
                        <TableHeader className="bg-default-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead className="last:text-start" key={header.id}>
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
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="h-[75px]">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
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

export default RolesTable;
