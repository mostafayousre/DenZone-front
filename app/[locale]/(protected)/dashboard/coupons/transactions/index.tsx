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
import {useEffect, useState} from "react";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import {Button} from "@/components/ui/button";
import {useRouter} from "@/i18n/routing";
import useGettingAllCoupons from "@/services/coupons/gettingAllCoupons";
import {Loader2} from "lucide-react";
import {Coupon} from "@/types/coupons";

const TransactionsTable = ({ onAdd }: { onAdd: () => void }) => {
  const router = useRouter()
  const {loading: gettingAllCouponsLoading, error: gettingAllCouponsError, coupons, getAllCoupons} = useGettingAllCoupons()

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = baseColumns({refresh: getAllCoupons});
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);


  const table = useReactTable({
    data: filteredCoupons ?? [],
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
    getAllCoupons()
  }, [])


  return (
    <div className="w-full bg-white rounded-lg">
      <div className="flex flex-wrap justify-end items-center py-4 px-6 border-b border-solid border-default-200 ">
        <div className="#flex-none">
          <div className="flex items-center gap-4 flex-wrap">
            <SearchInput
              data={coupons ?? []}
              filterKey={"code"}
              setFilteredData={setFilteredCoupons}
            />
            <Button
              variant="outline"
              className="ml-2"
              onClick={onAdd}
            >
              Add Coupon
            </Button>
          </div>
        </div>
      </div>
      {gettingAllCouponsLoading ? (
        <div className="flex mx-auto items-center justify-center">
          <Loader2 className="text-blue-500" />
        </div>
      ): (
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
      )}
      <TablePagination table={table} />
    </div>
  );
};
export default TransactionsTable;
