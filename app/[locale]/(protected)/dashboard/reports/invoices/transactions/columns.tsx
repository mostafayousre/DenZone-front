import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {Orders} from "@/types/orders";
import {formatDateToDMY} from "@/utils";

export const baseColumns = ({refresh} : {refresh: () => void}) : ColumnDef<any>[] => [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice Number",
    cell: ({ row }) => <span>{row.getValue("invoiceNumber")}</span>,
  },
  {
    accessorKey: "fullName",
    header: "Doctor",
    cell: ({ row }) => {
      const name = row.original.fullName;
      return (
        <div className="font-medium text-card-foreground/80">
          <span className="text-sm text-default-600 whitespace-nowrap">
            {name ?? "Unknown User"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "cashPaid",
    header: "Cash Paid",
    cell: ({ row }) => {
      return <span>{row.getValue("cashPaid")}</span>;
    },
  },
  {
    accessorKey: "creditUsed",
    header: "Credit Used",
    cell: ({ row }) => {
      return <span>{row.getValue("creditUsed")}</span>;
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      return <span>{row.getValue("totalAmount")}</span>;
    },
  },
  {
    accessorKey: "invoiceDate",
    header: "Invoice Date",
    cell: ({ row }) => {
      return <span>{formatDateToDMY(row.original.invoiceDate)}</span>;
    },
  },
  // {
  //   id: "actions",
  //   accessorKey: "action",
  //   header: "Actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const userRole = Cookies.get("userRole");
  //     const isAdmin = userRole == "Admin";
  //     return (
  //       <div className="flex items-center gap-1">
  //         <Link
  //           href={`/dashboard/order-details/${row.original.id}`}
  //           className="flex items-center p-2 border-b text-warning hover:text-warning-foreground bg-warning/20 hover:bg-warning duration-200 transition-all rounded-full cursor-pointer"
  //         >
  //           <Eye className="w-4 h-4" />
  //         </Link>
  //         {isAdmin && (
  //             <>
  //               <Link
  //                   href={`/dashboard/remove-item/${row.original.id}`}
  //                   className="flex items-center p-2 text-destructive bg-destructive/40 duration-200 transition-all hover:bg-destructive/80 hover:text-destructive-foreground rounded-full cursor-pointer"
  //               >
  //                 <Trash2 className="w-4 h-4" />
  //               </Link>
  //               <ChangeInventoryUserDialog
  //                 orderId={row.original.id}
  //                 inventoryUserId={row.original.inventoryUserId}
  //                 onSuccess={() => refresh()}
  //               />
  //
  //               <GenerateInvoiceButton orderId={row.original.id}/>
  //
  //             </>
  //         )}
  //       </div>
  //     );
  //   },
  // },
];
