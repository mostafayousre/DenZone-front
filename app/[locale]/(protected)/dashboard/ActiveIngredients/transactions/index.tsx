// "use client";

// import * as React from "react";
// import {
//   ColumnFiltersState,
//   SortingState,
//   VisibilityState,
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { baseColumns } from "./columns";
// import { Input } from "@/components/ui/input";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import TablePagination from "./table-pagination";

// import { CardContent } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Link } from '@/i18n/routing';
// import {Button} from "@/components/ui/button";
// import useGettingAllProducts from "@/services/products/gettingAllProducts";
// import {useEffect, useState} from "react";
// import {Loader2} from "lucide-react";
// import {toast} from "sonner";
// import GetCategories from "@/services/categories/getCategories";
// import Cookies from "js-cookie";
// import {ProductType} from "@/types/product";
// import product from "@/app/[locale]/(protected)/dashboard/dash-ecom/components/product";
// import SearchInput from "@/app/[locale]/(protected)/components/SearchInput/SearchInput";
// import {ExportCSVButton} from "@/components/partials/export-csv/ExportCSVButton";
// import {CSVUploadModal} from "@/components/partials/ImportCsv/ImportCsv";
// // import ActiveIngredients from "@/app/[locale]/(protected)/dashboard/ActiveIngredients/page";
// import useGettingAllActiveIngredient from "@/services/ActiveIngerients/gettingAllActiveIngerients";
// import {ActiveIngredient} from "@/types/activeIngredient";
// import { useTranslations } from "next-intl";

// const TransactionsTable = () => {
//   const t = useTranslations("activeIngredients")

//   const userRole = Cookies.get("userRole");
//   const userId = Cookies.get("userId");

//   const {loading: gettingAllProductsLoading, gettingAllActiveIngredients, activeIngredients, error} = useGettingAllActiveIngredient()

//   const [sorting, setSorting] = React.useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
//     []
//   );
//   const [columnVisibility, setColumnVisibility] =
//     React.useState<VisibilityState>({});
//   const [rowSelection, setRowSelection] = React.useState({});

//   const columns = baseColumns({ refresh: () => gettingAllActiveIngredients(), t });

//   const [filteredProducts, setFilteredProducts] = useState<ActiveIngredient[]>([])

//   const table = useReactTable({
//     data: filteredProducts ?? [],
//     columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//     },
//   });

//   // mounted data
//   useEffect(() => {
//     gettingAllActiveIngredients()
//   }, []);

//   if (error) {
//       toast.error("Something went wrong", {
//           description: error
//       });
//   }


//   return (
//     <div className="w-full">
//       <div className="flex justify-between flex-row items-center py-4 px-6 border-b border-solid border-default-200">
//         <div className="flex flex-row items-center w-full gap-4 justify-between">
//           <div className="flex items-center gap-4 w-full flex-wrap">
//             <SearchInput
//               data={activeIngredients ?? []}
//               filterKey={"name"}
//               setFilteredData={setFilteredProducts}
//             />
//             <Link href="/dashboard/add-ActiveIngredient">
//               <Button size={"md"} variant="outline" color="secondary">
//                 {t("addIngredient")}
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>

//       {gettingAllProductsLoading == true ? (
//           <div className="flex items-center justify-center h-full">
//             <Loader2 className="w-6 h-6 animate-spin" />
//           </div>
//       ) : (
//           <>
//             <CardContent className="pt-6">
//               <div className="border border-solid border-default-200 rounded-lg overflow-hidden border-t-0">
//                 <Table>
//                   <TableHeader className="bg-default-200">
//                     {table.getHeaderGroups().map((headerGroup) => (
//                       <TableRow key={headerGroup.id}>
//                         {headerGroup.headers.map((header) => {
//                           return (
//                             <TableHead className="last:text-start" key={header.id}>
//                               {header.isPlaceholder
//                                 ? null
//                                 : flexRender(
//                                     header.column.columnDef.header,
//                                     header.getContext()
//                                   )}
//                             </TableHead>
//                           );
//                         })}
//                       </TableRow>
//                     ))}
//                   </TableHeader>
//                   <TableBody>
//                     {table.getRowModel().rows?.length ? (
//                       table.getRowModel().rows.map((row) => (
//                         <TableRow
//                           key={row.id}
//                           data-state={row.getIsSelected() && "selected"}
//                         >
//                           {row.getVisibleCells().map((cell) => (
//                             <TableCell key={cell.id} className="h-[75px]">
//                               {flexRender(
//                                 cell.column.columnDef.cell,
//                                 cell.getContext()
//                               )}
//                             </TableCell>
//                           ))}
//                         </TableRow>
//                       ))
//                     ) : (
//                       <TableRow>
//                         <TableCell
//                           colSpan={columns.length}
//                           className="h-24 text-center"
//                         >
//                           No results.
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//             <TablePagination table={table} />
//           </>
//       )}
//     </div>
//   );
// };
// export default TransactionsTable;
