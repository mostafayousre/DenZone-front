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

import { CardContent } from "@/components/ui/card";
import {useEffect, useState} from "react";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import {Button} from "@/components/ui/button";
import {Loader2, Plus} from "lucide-react";
import {DeliveryTimeSlot} from "@/types/deliveryTimeSlot";

interface DeliveryTimesTableProps {
    data: DeliveryTimeSlot[];
    loading: boolean;
    onAdd: () => void;
    onEdit: (slot: DeliveryTimeSlot) => void;
    refresh: () => void;
}

const DeliveryTimesTable = ({ data, loading, onAdd, onEdit, refresh }: DeliveryTimesTableProps) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = baseColumns({ refresh, onEdit });
  const [filteredSlots, setFilteredSlots] = useState<DeliveryTimeSlot[]>([]);

  const table = useReactTable({
    data: filteredSlots ?? [],
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
    setFilteredSlots(data)
  }, [data])


  return (
    <div className="w-full rounded-lg bg-white dark:bg-transparent shadow-sm border border-default-200">
      <div className="flex flex-wrap justify-between items-center py-4 px-6 border-b border-solid border-default-200 ">
        <h3 className="text-xl font-semibold text-default-900">Delivery Times</h3>
        <div className="flex items-center gap-4 flex-wrap">

          <Button
            variant="outline"
            className="ml-2"
            onClick={onAdd}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Delivery Time
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="flex py-20 items-center justify-center">
          <Loader2 className="animate-spin text-purple-500" size={40} />
        </div>
      ): (
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-default-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="h-12 text-default-600 font-semibold">
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
                    className="hover:bg-default-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
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
                    className="h-24 text-center text-default-500"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      )}
    </div>
  );
};

export default DeliveryTimesTable;
