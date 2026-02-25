import { usePathname } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2, TriangleAlert } from "lucide-react";
import { Link } from '@/i18n/routing';
import { formatDateToDMY } from "@/utils";
import { Price } from "@/types/price";

export const baseColumns = ({ t }: {
  t: (key: string) => string;
}): ColumnDef<Price>[] => [
  {
    accessorKey: "productArabicName",
    header: t("productName"),
    cell: ({ row }) => {
      return (
        <div className="font-medium text-card-foreground/80">
          <div className="flex gap-3 items-center">
            <span className="text-sm text-default-600 whitespace-nowrap">
              {row.getValue("productArabicName")}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "categoryName",
    header: t("category"),
    cell: ({ row }) => <span>{row.getValue("categoryName")}</span>,
  },
  {
    accessorKey: "purchasePrice",
    header: t("purchasePrice"),
    cell: ({ row }) => <span>{row.getValue("purchasePrice")}</span>,
  },
  {
    accessorKey: "salesPrice",
    header: t("salesPrice"),
    cell: ({ row }) => <span>{row.getValue("salesPrice")}</span>,
  },{
  accessorKey: "discountRate",
  header: t("discount"),
  cell: ({ row }) => <span>{row.getValue("discountRate")}%</span>,
  },
  {
    accessorKey: "stockQuantity",
    header: t("stockQuantity"),
    cell: ({ row }) => {
      return <span>{row.original?.stockQuantity}</span>;
    },
  },
  {
    accessorKey: "maxQuantity",
    header: t("maxQuantity"),
    cell: ({ row }) => {
      return <span>{row.original?.maxQuantity}</span>;
    },
  },
  {
    accessorKey: "creationDate",
    header: t("createdAt"),
    cell: ({ row }) => {
      return <span>{formatDateToDMY(row.original.creationDate)}</span>;
    },
  },

  
  // {
  //   id: "actions",
  //   accessorKey: "action",
  //   header: "Actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const pathname = usePathname();
  //     const getHref = () => {
  //       if (pathname?.includes('/sellers')) {
  //         return '/dashboard/edit-product';
  //       } else if (pathname?.includes('/admin')) {
  //         return '/admin/invoice/preview/1';
  //       } else {
  //         return '/utility/invoice/preview/1';
  //       }
  //     };
  //     return (
  //       <div className="flex items-center gap-1">
  //         <Link
  //           href={getHref()}
  //           className="flex items-center p-2 border-b text-info hover:text-info-foreground bg-info/40 hover:bg-info duration-200 transition-all rounded-full"
  //         >
  //           <SquarePen className="w-4 h-4" />
  //         </Link>
  //         <Link
  //           href="#"
  //           className="flex items-center p-2 border-b text-warning hover:text-warning-foreground bg-warning/40 hover:bg-warning duration-200 transition-all rounded-full"
  //         >
  //           <TriangleAlert className="w-4 h-4" />
  //         </Link>
  //         <Link
  //           href="#"
  //           className="flex items-center p-2 text-destructive bg-destructive/40 duration-200 transition-all hover:bg-destructive/80 hover:text-destructive-foreground rounded-full"
  //         >
  //           <Trash2 className="w-4 h-4" />
  //         </Link>
  //       </div>
  //     );
  //   },
  // },
];
