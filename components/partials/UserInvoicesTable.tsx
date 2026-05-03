"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import useGettingInvoiceByUserId from "@/services/invoices/user/gettingInvoiceByUserId";
import { useEffect } from "react";
import { formatDateToDMY } from "@/utils";
import { cn } from "@/lib/utils";

interface UserInvoicesTableProps {
  userId: string;
}

export default function UserInvoicesTable({ userId }: UserInvoicesTableProps) {
  const { getInvoiceByUserId, invoice, loading } = useGettingInvoiceByUserId();
  const t = useTranslations("OrderList");

  useEffect(() => {
    if (userId) {
      getInvoiceByUserId(userId);
    }
  }, [userId]);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice Number",
      cell: ({ row }) => <span className="font-medium text-default-900">#{row.getValue("invoiceNumber")}</span>,
    },
    {
      accessorKey: "invoiceDate",
      header: "Date",
      cell: ({ row }) => <span className="text-default-600">{formatDateToDMY(row.original.invoiceDate)}</span>,
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => <span className="font-semibold text-primary">{row.getValue("totalAmount")}</span>,
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }) => (
        <span className={cn(
          "px-2 py-1 rounded-full text-[11px] font-bold uppercase",
          row.getValue("paymentMethod") === "Cash" ? "bg-success/20 text-success" : "bg-info/20 text-info"
        )}>
          {row.getValue("paymentMethod")}
        </span>
      ),
    },
    {
      accessorKey: "invoiceType",
      header: "Type",
      cell: ({ row }) => <span className="text-default-500 text-xs">{row.getValue("invoiceType")}</span>,
    }
  ];

  const table = useReactTable({
    data: invoice ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-24 bg-card rounded-xl border border-border/50">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="border-none shadow-none p-5">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              User Invoices
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              List of all invoices generated for this user.
            </p>
          </CardHeader>
          <CardContent className="px-0">
            <div className="border border-solid border-default-200 rounded-xl overflow-hidden bg-card">
              <Table>
                <TableHeader className="bg-default-100">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="text-default-800 font-bold h-12">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="hover:bg-default-50/50 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="h-16 py-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground font-medium">
                        No invoices found for this user.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
