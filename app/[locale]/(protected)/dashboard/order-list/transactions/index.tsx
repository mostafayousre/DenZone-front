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
      isGrouped: true,
      orders: subOrders,
      items: mergedItems,
      totalAmount,
      orderNote: mergedNotes,
      deliveryName: mergedDeliveryName,
      totalAmountOrder: group.totalAmountOrder,
      totalAmountOrderAfter: group.totalAmountOrderAfter,
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

  const { loading: myOrdersLoading, orders: myOrders, gettingVendorOrders, error: myOrdersError } = useVendorOrder()
  const { gettingAllOrders, orders, loading, error } = useGettingAllOrders();
  const { gettingUserOrders, orders: userOrders, loading: userOrdersLoading } = useGettingUserOrders();
  const { loading: usersLoading, users: inventoryManagers, getUsersByRoleId } = useGetUsersByRoleId();
  const { loading: deliveryOrdersLoading, orders: deliveryOrders, gettingDeliveryOrders } = useGettingDeliveryOrders();

  const isRepresentative = userRole === "representative";
  const isDelivery = userRole?.toLowerCase() === "delivery";


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
    let rawData;
    if (isAdmin) {
      rawData = mapGroupedOrders(orders);
    } else if (isRepresentative || isDelivery) {
      rawData = mapGroupedOrders(deliveryOrders);
    } else {
      rawData = myOrders;
    }
    return rawData?.filter(order => order.totalAmount !== 0) || [];
  }, [isAdmin, isRepresentative, isDelivery, orders, myOrders, deliveryOrders, userOrders, filterUserId]);

  const isLoadingData = (isAdmin && !filterUserId) ? loading : (filterUserId ? userOrdersLoading : (isRepresentative || isDelivery ? deliveryOrdersLoading : myOrdersLoading));

  const t = useTranslations("OrderList")

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
      const filtered = allOrdersData.filter(order => {
        if (order.isGrouped) {
          return order.orders?.some((o: any) => o.status === status);
        }
        return order.status === status;
      });
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
    } else if (isRepresentative || isDelivery) {
      gettingDeliveryOrders();
    } else {
      if (userId) {
        gettingVendorOrders(userId);
      }
    }
  }, [isAdmin, isRepresentative, isDelivery, userId, filterUserId, gettingAllOrders, gettingVendorOrders, gettingUserOrders, gettingDeliveryOrders, selectedStatus]);



  useEffect(() => {
    if (allOrdersData) {
      filterOrdersByStatus(selectedStatus);
    }
  }, [allOrdersData, selectedStatus]);

  return (
    <Card className="w-full">
      <div className="px-5 py-4 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-auto flex-1">
          <SearchInput
            data={allOrdersData ?? []}
            setFilteredData={setFilteredOrders}
            filterKey="doctorName"
            placeholder={t("searchPlaceholder") || "Search by doctor name..."}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-center md:justify-end">
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