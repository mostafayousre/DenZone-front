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
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useGetAreas from "@/services/areas/getAllAreas";
import useExportArea from "@/services/areas/exportArea";
import useImportArea from "@/services/areas/importArea";
import { Loader2, Download, Upload } from "lucide-react";
import { AreaType } from "@/types/area";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const AreasTable = () => {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const { areas: data, loading, getAllAreas } = useGetAreas();
    const { loading: exporting, exportArea } = useExportArea();
    const { loading: importing, importArea } = useImportArea();
    const t = useTranslations("areas");
    const columns = baseColumns({ refresh: getAllAreas, t });

    const [filteredAreas, setFilteredAreas] = useState<AreaType[]>([]);

    const handleExport = async () => {
        const toastId = toast.loading(t("exporting") || "Exporting...");
        const success = await exportArea();
        toast.dismiss(toastId);
        if (success) {
            toast.success(t("fileDownloaded") || "File downloaded successfully.");
        } else {
            toast.error(t("export_failed") || "Failed to export areas.");
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ];

        if (!validTypes.includes(file.type)) {
            toast.error("Invalid file type", {
                description: "Please upload an Excel file (.xlsx or .xls)",
            });
            return;
        }

        const toastId = toast.loading(t("importing") || "Importing...");
        const result = await importArea(file);
        toast.dismiss(toastId);

        if (result.success) {
            toast.success(t("import_success") || "Areas imported successfully.");
            getAllAreas();
        } else {
            toast.error(result.error || t("import_failed") || "Failed to import areas.");
        }
        
        // Reset file input value
        e.target.value = "";
    };

    const table = useReactTable({
        data: filteredAreas ?? [],
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
        getAllAreas();
    }, []);

    useEffect(() => {
        if (data) {
            setFilteredAreas(data);
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
            <div className="flex flex-wrap justify-end items-center py-4 px-6 border-b border-solid border-default-200 gap-4">
                <SearchInput data={data ?? []} setFilteredData={setFilteredAreas} filterKey={"name"} placeholder="Search areas..." />
                <div className="#flex-none">
                    <div className="flex items-center gap-4 flex-wrap">
                        <Button 
                            size={"md"} 
                            variant="outline" 
                            onClick={handleExport}
                            disabled={exporting}
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            {t("export_area")}
                        </Button>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleImport}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={importing}
                            />
                            <Button 
                                size={"md"} 
                                variant="outline" 
                                disabled={importing}
                                className="gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                {t("import_area")}
                            </Button>
                        </div>
                        <Link href="/dashboard/add-area">
                            <Button size={"md"} variant="outline">
                                {t("add_area")}
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

export default AreasTable;