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
import { Input } from "@/components/ui/input";

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
import { useRouter } from "@/i18n/routing";
import useGettingAllOrders from "@/services/Orders/gettingAllOrders";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Orders } from "@/types/orders";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";
import Cookies from "js-cookie";
import useGettingMyOrders from "@/services/Orders/gettingMyOrders";
import { Button } from "@/components/ui/button";
import { OrderStatus, OrderStatusLabel } from "@/enum";
import useVendorOrder from "@/services/Orders/vendor-order";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Save } from "lucide-react";
import useGettingUserOrders from "@/services/Orders/gettingUserOrders";
import { useGetLimitOrder } from "@/services/Orders/getLimitOrder";
import { useUpdateLimitOrder } from "@/services/Orders/updateLimitOrder";

export default function TransactionsTable() {
  const userRole = Cookies.get("userRole");
  const isAdmin = userRole == "Admin";
  const userId = Cookies.get("userId");

  const { loading: myOrdersLoading, orders: myOrders, gettingVendorOrders, error: myOrdersError } = useVendorOrder()
  const { gettingAllOrders, orders, loading, error } = useGettingAllOrders();
  const { gettingUserOrders, orders: userOrders, loading: userOrdersLoading } = useGettingUserOrders();
  const { loading: usersLoading, users: inventoryManagers, getUsersByRoleId } = useGetUsersByRoleId();

  
  const searchParams = useSearchParams();
  const filterUserId = searchParams ? searchParams.get("userId") : null;

  const router = useRouter();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [filteredOrders, setFilteredOrders] = useState<Orders[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");


  const allOrdersData = React.useMemo(() => {
    if (filterUserId && isAdmin) {
        return userOrders?.filter(order => order.totalAmount !== 0) || [];
    }
    const rawData = isAdmin ? orders : myOrders;
    return rawData?.filter(order => order.totalAmount !== 0) || [];
  }, [isAdmin, orders, myOrders, userOrders, filterUserId]);

  const isLoadingData = (isAdmin && !filterUserId) ? loading : (filterUserId ? userOrdersLoading : myOrdersLoading);

  const t = useTranslations("OrderList")

  const columns = baseColumns({
    refresh: () => {
      if (isAdmin) {
        if (filterUserId) {
          gettingUserOrders(filterUserId, selectedStatus === "all" ? null : selectedStatus);
        } else {
          gettingAllOrders();
        }
      } else {
        gettingVendorOrders(userId);
      }
    },
    t
  });

  const table = useReactTable({
    data: filteredOrders ?? [],
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

  const filterOrdersByStatus = (status: OrderStatus | "all") => {
    setSelectedStatus(status);
    if (!allOrdersData) return;

    if (status === "all") {
      setFilteredOrders(allOrdersData);
    } else {
      const filtered = allOrdersData.filter(order => order.status === status);
      setFilteredOrders(filtered);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (filterUserId) {
        gettingUserOrders(filterUserId, selectedStatus === "all" ? null : selectedStatus);
      } else {
        gettingAllOrders();
      }
    } else {
      if (userId) {
        gettingVendorOrders(userId);
      }
    }
  }, [isAdmin, userId, filterUserId, gettingAllOrders, gettingVendorOrders, gettingUserOrders, selectedStatus]);



  useEffect(() => {
    if (allOrdersData) {
      filterOrdersByStatus(selectedStatus);
    }
  }, [allOrdersData, selectedStatus]);

  return (
    <Card className="w-full">
      <div className="px-5 py-4 flex flex-col 2xl:flex-row items-center gap-4">
        <SearchInput
          data={allOrdersData ?? []}
          setFilteredData={setFilteredOrders}
          filterKey="orderNumber"
        />

        <div className="inline-flex flex-wrap items-center border border-solid divide-x divide-default-200 divide-solid rounded-md overflow-hidden ml-auto">
          <Button
            size="md"
            variant={selectedStatus === "all" ? "default" : "ghost"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
            onClick={() => filterOrdersByStatus("all")}
          >
            {t("All")}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Pending ? "default" : "ghost"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Pending)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Pending].toLowerCase()}`)}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Approved ? "default" : "ghost"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Approved)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Approved].toLowerCase()}`)}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Rejected ? "default" : "ghost"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Rejected)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Rejected].toLowerCase()}`)}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Prepared ? "default" : "ghost"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Prepared)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Prepared].toLowerCase()}`)}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Shipped ? "default" : "ghost"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Shipped)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Shipped].toLowerCase()}`)}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus?.Delivered ? "default" : "ghost"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Delivered)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Delivered].toLowerCase()}`)}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Completed ? "default" : "ghost"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Completed)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Completed].toLowerCase()}`)}
          </Button>
          {/* <Button
            size="md"
            variant={selectedStatus === OrderStatus.ReAssignTo ? "default" : "ghost"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.ReAssignTo)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.ReAssignTo].toLocaleLowerCase()}`)}
          </Button> */}
        </div>
      </div>

      {(isLoadingData || usersLoading) ? (
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
                      <TableHead className="last:text-start" key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        row.original.status === 7 && "line-through opacity-60 text-muted-foreground"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="h-[75px]">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center font-medium"
                    >
                      {filterUserId ? "No orders found for this user." : t("noOrdersFound") || "No orders found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
      <TablePagination table={table} />
    </Card>
  );
};