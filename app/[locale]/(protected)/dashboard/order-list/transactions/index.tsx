"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  PaginationState,
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
import { useEffect, useState, useMemo, useCallback } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import { Orders } from "@/types/orders";
import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";
import Cookies from "js-cookie";
import { normalizeRole } from "@/lib/roleRoutes";
import useGettingMyOrders from "@/services/Orders/gettingMyOrders";
import { Button } from "@/components/ui/button";
import { OrderStatus, OrderStatusLabel } from "@/enum";
import useVendorOrder from "@/services/Orders/vendor-order";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Save } from "lucide-react";
import useGettingUserOrders from "@/services/Orders/gettingUserOrders";
import useGettingDeliveryOrders from "@/services/Orders/gettingDeliveryOrders";
import { useDebounce } from "use-debounce";


const mapGroupedOrders = (rawGroups: any[]): Orders[] => {
  if (!rawGroups || !Array.isArray(rawGroups)) return [];
  return rawGroups.map((group: any) => {
    if (!group.orders) return group;
    
    const subOrders = group.orders || [];
    const firstOrder = subOrders[0] || {};
    // Merge items
    const mergedItems = subOrders.flatMap((o: any) => o.items || []);
    
    // Sum totalAmount
    const totalAmount = subOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    
    // Merge orderNotes
    const mergedNotes = subOrders.map((o: any) => o.orderNote).filter(Boolean).join(" | ");
    
    // Merge deliveryNames
    const deliveryNames = Array.from(
      new Set(subOrders.map((o: any) => o.deliveryName).filter((n: any) => n && n !== "there is no deleivry yet"))
    );
    const mergedDeliveryName = deliveryNames.length > 0 ? deliveryNames.join(", ") : "there is no delivery yet";
    return {
      ...firstOrder,
      id: firstOrder.id || group.orderNumber,
      orderNumber: group.orderNumber,
      status: group.status,
      isGrouped: true,
      orders: subOrders,
      items: mergedItems,
      totalAmount: totalAmount || group.totalAmountOrder || 0,
      orderNote: mergedNotes,
      deliveryName: mergedDeliveryName,
      totalAmountOrder: group.totalAmountOrder,
      totalAmountOrderAfter: group.totalAmountOrderAfter,
      phoneNumber: group.phoneNumber,
      doctorName: group.doctorName || firstOrder.doctorName,
      coupon: group.coupon,
      shippingFees: group.shippingFees,
    };
  });
};

export default function TransactionsTable() {
  const rawUserRole = Cookies.get("userRole");
  const userRole = normalizeRole(rawUserRole) || rawUserRole;
  const isAdmin = userRole == "Admin";
  const userId = Cookies.get("userId");

  const { loading: myOrdersLoading, orders: myOrders, gettingVendorOrders, error: myOrdersError } = useVendorOrder();
  const {
    gettingAllOrders,
    orders,
    loading,
    error,
    totalPages,
    totalItems,
    pageNumber: apiPageNumber,
  } = useGettingAllOrders();
  const { gettingUserOrders, orders: userOrders, loading: userOrdersLoading } = useGettingUserOrders();
  const { loading: usersLoading, users: inventoryManagers, getUsersByRoleId } = useGetUsersByRoleId();
  const { loading: deliveryOrdersLoading, orders: deliveryOrders, gettingDeliveryOrders } = useGettingDeliveryOrders();

  const isRepresentative = userRole === "representative";
  const isDelivery = userRole?.toLowerCase() === "delivery";

  const searchParams = useSearchParams();
  const filterUserId = searchParams ? searchParams.get("userId") : null;
  const isServerPaginated = isAdmin && !filterUserId;

  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [filteredOrders, setFilteredOrders] = useState<Orders[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");

  const allOrdersData = React.useMemo(() => {
    if (filterUserId && isAdmin) {
      return userOrders || [];
    }
    let rawData;
    if (isAdmin) {
      rawData = mapGroupedOrders(orders);
    } else if (isRepresentative || isDelivery) {
      rawData = mapGroupedOrders(deliveryOrders);
    } else {
      rawData = myOrders;
    }
    return rawData || [];
  }, [isAdmin, isRepresentative, isDelivery, orders, myOrders, deliveryOrders, userOrders, filterUserId]);

  const isLoadingData = (isAdmin && !filterUserId)
    ? loading
    : (filterUserId ? userOrdersLoading : (isRepresentative || isDelivery ? deliveryOrdersLoading : myOrdersLoading));

  const t = useTranslations("OrderList");

  const columns = baseColumns({
    refresh: () => {
      if (isAdmin) {
        if (filterUserId) {
          gettingUserOrders(filterUserId, selectedStatus === "all" ? null : selectedStatus);
        } else {
          gettingAllOrders();
        }
      } else if (isRepresentative || isDelivery) {
        gettingDeliveryOrders();
      } else {
        gettingVendorOrders(userId);
      }
    },
    t,
    isRepresentative
  });

  const table = useReactTable({
    data: filteredOrders ?? [],
    columns,
    manualPagination: isServerPaginated,
    pageCount: isServerPaginated ? Math.max(1, totalPages || 1) : undefined,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      setPagination(next);
      if (isServerPaginated) {
        gettingAllOrders(next.pageIndex + 1, next.pageSize, debouncedSearchTerm);
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(!isServerPaginated ? { getPaginationRowModel: getPaginationRowModel() } : {}),
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

  const filterOrdersByStatus = (status: OrderStatus | "all") => {
    setSelectedStatus(status);
  };

  // Sync pageIndex if apiPageNumber changes externally
  useEffect(() => {
    if (isServerPaginated && apiPageNumber && apiPageNumber - 1 !== pagination.pageIndex) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: apiPageNumber - 1,
      }));
    }
  }, [isServerPaginated, apiPageNumber]);

  // Fetch when debouncedSearchTerm changes or initial load for server-paginated
  useEffect(() => {
    if (isServerPaginated) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      gettingAllOrders(1, pagination.pageSize, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, isServerPaginated]);

  // Fetch for non-server paginated roles or filterUserId
  useEffect(() => {
    if (!isServerPaginated) {
      if (isAdmin && filterUserId) {
        gettingUserOrders(filterUserId, selectedStatus === "all" ? null : selectedStatus);
      } else if (isRepresentative || isDelivery) {
        gettingDeliveryOrders();
      } else if (userId) {
        gettingVendorOrders(userId);
      }
    }
  }, [
    isServerPaginated,
    isAdmin,
    filterUserId,
    isRepresentative,
    isDelivery,
    userId,
    gettingUserOrders,
    gettingDeliveryOrders,
    gettingVendorOrders,
    selectedStatus,
  ]);

  // Filter orders for server paginated
  useEffect(() => {
    if (isServerPaginated) {
      if (!allOrdersData) {
        setFilteredOrders([]);
        return;
      }
      if (selectedStatus === "all") {
        setFilteredOrders(allOrdersData);
      } else {
        const filtered = allOrdersData.filter((order) => order.status === selectedStatus);
        setFilteredOrders(filtered);
      }
    }
  }, [isServerPaginated, allOrdersData, selectedStatus]);

  // Filter orders for non-server paginated roles
  useEffect(() => {
    if (!isServerPaginated) {
      let data = allOrdersData || [];
      if (selectedStatus !== "all") {
        data = data.filter((order) => order.status === selectedStatus);
      }
      if (debouncedSearchTerm) {
        const lower = debouncedSearchTerm.toLowerCase();
        data = data.filter(
          (order) =>
            order.doctorName?.toLowerCase().includes(lower) ||
            order.orderNumber?.toLowerCase().includes(lower) ||
            order.phoneNumber?.toLowerCase().includes(lower)
        );
      }
      setFilteredOrders(data);
    }
  }, [isServerPaginated, allOrdersData, selectedStatus, debouncedSearchTerm]);

  return (
    <Card className="w-full">
      <div className="px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-between flex-1 gap-4 w-full">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder") || "Search by doctor name, phone, order number..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-9 pe-9 w-full"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {isAdmin && (
            <Button
              id="create-order-btn"
              size="md"
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 transition-all rounded-md w-full sm:w-auto"
              onClick={() => router.push("/dashboard/create-order")}
            >
              <Plus className="w-4 h-4" />
              Create Order
            </Button>
          )}
        </div>
      </div>
        <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start px-5">
          <Button
            size="md"
            variant={selectedStatus === "all" ? "default" : "outline"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-md cursor-pointer"
            onClick={() => filterOrdersByStatus("all")}
          >
            {t("All")}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Pending ? "default" : "outline"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-md cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Pending)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Pending].toLowerCase()}`)}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Confirmed ? "default" : "outline"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-md cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Confirmed)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Confirmed].toLowerCase()}`)}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Rejected ? "default" : "outline"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-md cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Rejected)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Rejected].toLowerCase()}`)}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Prepared ? "default" : "outline"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-md cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Prepared)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Prepared].toLowerCase()}`)}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Shipped ? "default" : "outline"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-md cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Shipped)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Shipped].toLowerCase()}`)}
          </Button>

          <Button
            size="md"
            variant={selectedStatus === OrderStatus?.Delivered ? "default" : "outline"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-md cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Delivered)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Delivered].toLowerCase()}`)}
          </Button>
          <Button
            size="md"
            variant={selectedStatus === OrderStatus?.Cancel ? "default" : "outline"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-md cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Cancel)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Cancel].toLowerCase()}`)}
          </Button>
          <Button
            size="md"
            variant={selectedStatus === OrderStatus.Completed ? "default" : "outline"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-md cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.Completed)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.Completed].toLowerCase()}`)}
          </Button>
          {/* HIDDEN - ReAssign filter
          <Button
            size="md"
            variant={selectedStatus === OrderStatus.ReAssignTo ? "default" : "ghost"}
            color="default"
            className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
            onClick={() => filterOrdersByStatus(OrderStatus.ReAssignTo)}
          >
            {t(`statusCode.${OrderStatusLabel[OrderStatus.ReAssignTo].toLocaleLowerCase()}`)}
          </Button> */}
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
      <TablePagination
        table={table}
        totalItems={isServerPaginated ? totalItems : (filteredOrders?.length ?? 0)}
      />
    </Card>
  );
};