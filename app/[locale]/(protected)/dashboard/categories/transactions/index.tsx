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
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import getCategories from "@/services/categories/getCategories";
import {Loader2} from "lucide-react";
import {CategoryType} from "@/types/category";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import { useTranslations } from "next-intl";

const TransactionsTable = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const {data, loading, gettingAllCategories} = getCategories()

  const t = useTranslations("categories");

  const columns = baseColumns({ refresh: gettingAllCategories, t });

  const [filteredCategories, setFilteredCategories] = useState<CategoryType[]>([]);

  const table = useReactTable({
    data: filteredCategories ?? [],
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
    gettingAllCategories()
  }, []);

    useEffect(() => {
        if (data) {
        setFilteredCategories(data);
        }
    }, [data]);


  if (loading === true) {
    return (
        <div className="flex mx-auto  justify-center items-center h-16 w-16">
            <Loader2 size={32} className="animate-spin" />
        </div>
    )
  }


  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center py-4 px-6 border-b border-solid border-default-200 gap-4">
        <div className="w-full sm:w-auto flex-1">
          <SearchInput placeholder="search categories..." data={data ?? []} setFilteredData={setFilteredCategories} filterKey={"name"}/>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/add-category">
            <Button size={"md"} variant="outline" >
              {t("add_category")}
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
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead className="last:text-start" key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="h-[75px]">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
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
export default TransactionsTable;
