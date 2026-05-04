"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import useGettingPricesForInventoryManager from "@/services/productPrice/gettingPricesForInventoryManager";
import useGettingPricesByInventoryId from "@/services/productPrice/gettingPricesByInventoryId";
import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";
import useDownloadPriceCsv from "@/services/products/csv/useDownloadPriceCsv";
import { CSVUploadModal } from "@/components/partials/ImportCsv/ImportCsv";
import useUploadCsv from "@/services/products/csv/uploadCSV";
import useImportPriceCsv from "@/services/products/csv/useImportPriceCsv";

import Cookies from "js-cookie";
import { useTranslations } from "next-intl";

const TransactionsTable = () => {
  const userRole = Cookies.get("userRole");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    loading: managerLoading,
    prices: managerPrices,
    totalPages: managerTotalPages,
    gettingPricesForInventoryManager,
  } = useGettingPricesForInventoryManager();

  const {
    loading: inventoryIdLoading,
    prices: adminPrices,
    totalPages: adminTotalPages,
    gettingPricesByInventoryId,
  } = useGettingPricesByInventoryId();

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const {
    loading: usersLoading,
    users,
    getUsersByRoleId,
  } = useGetUsersByRoleId();

  const { loading: downloadLoading, latestLoading: downloadLatestLoading, downloadCSV: downloadPriceCSV, downloadLatestCSV } = useDownloadPriceCsv();
  const { uploadCSV } = useUploadCsv();
  const { importPriceCsv, loading: importLoading } = useImportPriceCsv();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const isAdmin = userRole === "Admin";
  const tableData = isAdmin ? adminPrices : managerPrices;
  const isLoading = isAdmin ? inventoryIdLoading : managerLoading;

  const t = useTranslations("inventoryManagement");

  const handleRefresh = useCallback(() => {
    if (isAdmin) {
      if (selectedUserId) {
        gettingPricesByInventoryId(selectedUserId, currentPage, PAGE_SIZE);
      }
    } else {
      gettingPricesForInventoryManager(undefined, currentPage, PAGE_SIZE);
    }
  }, [isAdmin, selectedUserId, currentPage, PAGE_SIZE, gettingPricesByInventoryId, gettingPricesForInventoryManager]);

  const columns = baseColumns({ t, refresh: handleRefresh });

  const table = useReactTable({
    data: tableData ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: isAdmin ? adminTotalPages : managerTotalPages,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: PAGE_SIZE,
      },
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex: currentPage - 1, pageSize: PAGE_SIZE })
          : updater;
      
      const newPage = newPagination.pageIndex + 1;
      setCurrentPage(newPage);
      
      if (isAdmin && selectedUserId) {
        gettingPricesByInventoryId(selectedUserId, newPage, PAGE_SIZE);
      } else if (!isAdmin) {
        gettingPricesForInventoryManager(undefined, newPage, PAGE_SIZE);
      }
    },
  });

  useEffect(() => {
    if (isAdmin) {
      getUsersByRoleId("1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D");
    } else {
      gettingPricesForInventoryManager(undefined, 1, PAGE_SIZE);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      gettingPricesByInventoryId(selectedUserId, 1, PAGE_SIZE);
      setCurrentPage(1);
    }
  }, [selectedUserId]);

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <div className="flex flex-wrap gap-4 items-center py-4 px-5">
        {isAdmin ? (
          <div className="flex-1 flex justify-between items-center gap-4">
            <Select onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[200px] cursor-pointer">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select provider</SelectLabel>
                  {users?.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => downloadPriceCSV(selectedUserId ?? undefined)} 
                disabled={downloadLoading}
                className="gap-2"
              >
                {downloadLoading ? <Loader2 className="h-8 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Export Prices
              </Button>
              <CSVUploadModal
                label="Import Prices"
                onUpload={async (file: File) => {
                  await importPriceCsv(file, selectedUserId ?? undefined);
                  handleRefresh();
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-row justify-between w-full items-center">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => downloadPriceCSV(selectedUserId ?? undefined)} 
                disabled={downloadLoading}
                className="gap-2"
              >
                {downloadLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Export Prices
              </Button>
              <Button 
                variant="outline" 
                onClick={() => downloadLatestCSV(selectedUserId ?? undefined)} 
                disabled={downloadLatestLoading}
                className="gap-2"
              >
                {downloadLatestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Export Latest Prices
              </Button>
              <CSVUploadModal
                label="Import Prices"
                onUpload={async (file: File) => {
                  await importPriceCsv(file);
                  handleRefresh();
                }}
              />
            </div>
            
            <CSVUploadModal
              label="Import Add Products"
              onUpload={async (file: File) => {
                await uploadCSV(file);
                handleRefresh();
              }}
            />
          </div>
        )}
      </div>

      {isAdmin && !selectedUserId ? (
        <div className="text-center text-gray-500 py-10">Please select a provider to view their prices.</div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-48">
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
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
      {!isAdmin || selectedUserId ? <TablePagination table={table} /> : null}
    </Card>
  );
};

export default TransactionsTable;