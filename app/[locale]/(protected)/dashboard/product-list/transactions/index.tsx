"use client";

import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
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
import { useParams } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

import useGettingAllProducts from "@/services/products/gettingAllProducts";
import GetCategories from "@/services/categories/getCategories";
import { ExportCSVButton } from "@/components/partials/export-csv/ExportCSVButton";
import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
import ExcelUploadButton from "@/app/[locale]/(protected)/dashboard/add-product-byExcel/ExcelUploadButton";
import { useTranslations } from "next-intl";
import { ProductType } from "@/types/product";

const TransactionsTable = () => {
  const t = useTranslations("productList");
  const params = useParams();
  const locale = params?.locale as string;
  const userRole = Cookies.get("userRole");
  const isAdmin = userRole === "Admin";

  const {
    loading,
    getAllProducts,
    refreshProducts,
    products: data,
    totalItems,
    totalPages: apiTotalPages,
  } = useGettingAllProducts();

  const { loading: categoriesLoading, gettingAllCategories } = GetCategories();

  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);

  const handleRefresh = useCallback(() => {
    refreshProducts("false");
  }, [refreshProducts]);

  const columns = baseColumns({
    refresh: handleRefresh,
    t,
    locale,
  });

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  });

  useEffect(() => {
    gettingAllCategories();
    getAllProducts("false");
  }, []);

  useEffect(() => {
    if (data) {
      setFilteredProducts([...data]);
    }
  }, [data]);

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center py-4 px-6 gap-4 border-b">
        <div className="flex-1 w-full max-w-sm">
          <SearchInput
            data={data ?? []}
            filterKey={locale === "ar" ? "productArabicName" : "productName"}
            setFilteredData={setFilteredProducts}
          />
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            {/* All three buttons use size="md" → h-9, same padding, same font */}

            <Link href="/dashboard/add-product">
              <Button size="md" variant="outline" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                {t("addProduct")}
              </Button>
            </Link>

            {/* ExportCSVButton internally uses size="md" variant="outline" */}
            <ExportCSVButton />

            {/* ExcelUploadButton internally uses size="md" color="success" */}
            <ExcelUploadButton
              onSuccess={() => {
                refreshProducts("false");
                toast.success(t("dataRefreshed"));
              }}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          <CardContent className="pt-6">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-default-200">
                  {table.getHeaderGroups().map((group) => (
                    <TableRow key={group.id}>
                      {group.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(
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
                      <TableRow key={row.id}>
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
                        className="text-center h-24"
                      >
                        {t("noProductsFound")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          <TablePagination table={table} />

          <div className="text-center text-sm text-muted-foreground pb-4">
            {t("totalProducts")}: {totalItems} | {t("totalPages")}:{" "}
            {apiTotalPages}
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionsTable;