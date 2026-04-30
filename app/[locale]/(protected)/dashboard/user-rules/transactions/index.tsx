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
import {baseColumns} from "./columns";

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
import GetUsers from "@/services/users/GetAllUsers";
import {useEffect, useState} from "react";
import {Loader2} from "lucide-react";
import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {SelectItemText, SelectViewport} from "@radix-ui/react-select";
import {UserRoles} from "@/lib/data";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import {Button} from "@/components/ui/button";
import {OrderStatus, OrderStatusLabel, UserRole, UserRoleLabel} from "@/enum";
import { useSearchParams } from "next/navigation";

const TransactionsTable = () => {
  
  const {data, loading, gettingAllUsers} = GetUsers()

  
  const {users: usersByRole, loading: loadingByRole, getUsersByRoleId} = useGetUsersByRoleId()

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [selectedRole, setSelectedRole] = useState<"all" | UserRole>("all");

  
  useEffect(() => {
    if (selectedRole === "all" && data) {
      setFilteredUsers(data);
    } else if (selectedRole !== "all" && usersByRole) {
      setFilteredUsers(usersByRole);
    }
  }, [data, usersByRole, selectedRole]);


  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = baseColumns({ refresh: () => gettingAllUsers() });

  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  const handleRoleFilter = (role: "all" | UserRole) => {
    setSelectedRole(role);
    if (role === "all") {
      gettingAllUsers();
    } else {
      getUsersByRoleId(role);
    }
  };

  const searchParams = useSearchParams();
  const filterUserId = searchParams ? searchParams.get("userId") : null;

  const table = useReactTable({
    data: filteredUsers ?? [],
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
    gettingAllUsers()
  }, []);

  // Remove redundant useEffect that sets filteredUsers only once


  return (
      <div className={"flex flex-col"}>
        <div className="px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <SearchInput
            data={data ?? []}
            filterKey={"userName"}
            setFilteredData={setFilteredUsers}
          />

          <div className="inline-flex flex-wrap items-center border border-solid divide-x divide-default-200 divide-solid rounded-md overflow-hidden">
            <Button
                size="md"
                variant={selectedRole === "all" ? "default" : "ghost"}
                color="default"
                className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
                onClick={() => handleRoleFilter("all")}
            >
              All
            </Button>

            {Object.values(UserRole).map((roleId) => (
                <Button
                    key={roleId}
                    size="md"
                    variant={selectedRole === roleId ? "default" : "ghost"}
                    color="default"
                    className="ring-0 outline-0 hover:ring-0 hover:ring-offset-0 font-normal border-default-200 rounded-none cursor-pointer"
                    onClick={() => handleRoleFilter(roleId)}
                >
                  {UserRoleLabel[roleId]}
                </Button>
            ))}
          </div>
        </div>
        {loading == true || loadingByRole == true ? (
            <div className="flex justify-center items-center">
              <Loader2 size={24} className="animate-spin" />
            </div>
        ) : (
          <Card className="w-full">
            <CardContent>
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
          </Card>
        )}
      </div>
  );
};
export default TransactionsTable;
