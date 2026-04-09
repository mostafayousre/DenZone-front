import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {formatDateToDMY} from "@/utils";

export const baseColumns = ({refresh} : {refresh: () => void}) : ColumnDef<any>[] => [
  {
    accessorKey: "id",
    header: "Order",
    cell: ({ row }) => <span>{row.getValue("id")}</span>,
  },
  {
    accessorKey: "fullName",
    header: "Doctor Name",
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
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => {
      // Map status numbers to class names
      const statusColors: Record<string, string> = {
        "Pending": "bg-yellow-200 text-yellow-700",
        "Approved": "bg-blue-200 text-blue-700",
        "Rejected": "bg-red-200 text-red-700",
        "Prepared": "bg-purple-200 text-purple-700",
        "Shipped": "bg-indigo-200 text-indigo-700",
        "Delivered": "bg-green-200 text-green-700",
        "Completed": "bg-emerald-200 text-emerald-700",
      };

      // Map status numbers to display names
      const statusLabels: Record<string, string> = {
        "Pending": "Pending",
        "Approved": "Approved",
        "Rejected": "Rejected",
        "Prepared": "Prepared",
        "Shipped": "Shipped",
        "Delivered": "Delivered",
        "Completed": "Completed",
      };

      const status = row.getValue<number>("status");
      const statusStyle = statusColors[status] || "bg-gray-200 text-gray-700";
      const statusLabel = statusLabels[status] || "Unknown";

      return (
          <Badge className={cn("rounded-full px-5 py-1 text-sm", statusStyle)}>
            {statusLabel}
          </Badge>
      );
    },
  },
 
  {
    accessorKey: "orderDate",
    header: "Order Date",
    cell: ({ row }) => {
      return <span>{formatDateToDMY(row.original.orderDate)}</span>;
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
