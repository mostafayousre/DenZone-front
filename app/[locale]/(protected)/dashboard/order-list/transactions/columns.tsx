import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  Trash2,
  Pencil
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from '@/i18n/routing';
import { Orders } from "@/types/orders";
import { formatDateToDMY } from "@/utils";
import Cookies from "js-cookie";

import GenerateInvoiceButton from "@/components/partials/GenerateInvoiceButton/GenerateInvoiceButton";
import { OrderStatus } from "@/enum";
import useUpdateOrderStatus from "@/services/Orders/updateOrderStatus";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";


const StatusCell = ({ row, refresh, t }: { row: any; refresh: () => void; t: (key: string) => string }) => {
    const userRole = Cookies.get("userRole");
    const isAdmin = userRole === "Admin";
    const { updateOrderStatus, loading } = useUpdateOrderStatus();

    const statusColors: Record<number, string> = {
        0: "bg-yellow-200 text-yellow-700", // Pending
        1: "bg-blue-200 text-blue-700",     // Approved
        2: "bg-red-200 text-red-700",       // Rejected
        3: "bg-purple-200 text-purple-700", // Prepared
        4: "bg-indigo-200 text-indigo-700", // Shipped
        5: "bg-green-200 text-green-700",   // Delivered
        6: "bg-emerald-200 text-emerald-700", // Completed
    };

    const status = row.original.status;
    const statusStyle = statusColors[status] || "bg-gray-200 text-gray-700";

    const statusTranslationKeys: Record<number, string> = {
        0: "statusCode.pending",
        1: "statusCode.approved",
        2: "statusCode.rejected",
        3: "statusCode.prepared",
        4: "statusCode.shipped",
        5: "statusCode.delivered",
        6: "statusCode.completed",
    };

    const statusLabel = t(statusTranslationKeys[status] ?? "status.unknown");

    if (!isAdmin) {
        return (
            <Badge className={cn("rounded-full px-5 py-1 text-sm", statusStyle)}>
                {statusLabel}
            </Badge>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Select
                value={status.toString()}
                onValueChange={async (value: string) => {
                    const numericValue = Number(value) as OrderStatus;
                    const result = await updateOrderStatus(row.original.id, numericValue);
                    if (result.success) {
                        toast.success(t("updateStatusSuccess") || "Status updated successfully");
                        refresh();
                    } else {
                        toast.error(result.error || t("updateStatusError") || "Failed to update status");
                    }
                }}
                disabled={loading}
            >
                <SelectTrigger className={cn("h-8 px-3 text-xs font-medium rounded-full border-none w-fit min-w-[120px]", statusStyle)}>
                    <SelectValue placeholder={statusLabel}>
                        {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        {statusLabel}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>{t("orderStatus")}</SelectLabel>
                        {Object.values(OrderStatus)
                            .filter((value) => typeof value === "number" && value !== 7)
                            .map((s) => (
                                <SelectItem key={s} value={s.toString()} className="text-xs">
                                    {t(`statusCode.${OrderStatus[s as number].toLowerCase()}`)}
                                </SelectItem>
                            ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export const baseColumns = ({ refresh, t }: {
  refresh: () => void;
  t: (key: string) => string;
}): ColumnDef<Orders>[] => [
    {
      accessorKey: "orderNumber",
      header: t("orderNumber"),
      cell: ({ row }) => <span>{row.getValue("orderNumber") || "N/A"}</span>,
    },

    {
      accessorKey: "inventoryName",
      header: t("provider"),
      cell: ({ row }) => {
        const items = row.original.items || [];

        const names = Array.from(
          new Set(
            items
              .map((item: any) => item.inventoryName)
              .filter(Boolean) 
          )
        );

        if (names.length === 0) {
          return <span>N/A</span>;
        }

        const firstTwo = names.slice(0, 2);
        const remaining = names.slice(2);

        return (
          <div className="flex flex-col gap-1">
            {firstTwo.map((name, idx) => (
              <span key={idx}>{name}</span>
            ))}
            {remaining.length > 0 && (
              <span
                className="text-blue-600 cursor-pointer"
                title={remaining.join(", ")}
              >
                +{remaining.length} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "orderDate",
      header: t("date"),
      cell: ({ row }) => {
        return <span>{formatDateToDMY(row.original.orderDate)}</span>;
      },
    },
    {
      accessorKey: "totalAmount",
      header: t("totalAmount"),
      cell: ({ row }) => {
        return <span>{row.getValue("totalAmount")}</span>;
      },
    },
    {
        accessorKey: "status",
        header: t("orderStatus"),
        cell: ({ row }) => <StatusCell row={row} refresh={refresh} t={t} />,
    },

    {
      id: "actions",
      accessorKey: "action",
      header: t("Actions"),
      enableHiding: false,
      cell: ({ row }) => {
        const userRole = Cookies.get("userRole");
        const isAdmin = userRole == "Admin";
        return (
          <div className="flex items-center gap-1">
            {row.original.status === 7 ? (
              <div
                className="flex items-center p-2 text-destructive bg-destructive/20 opacity-50 rounded-full cursor-not-allowed"
                title="Action disabled for reassigned orders"
              >
                <Eye className="w-4 h-4" />
              </div>
            ) : (
              <Link
                href={`/dashboard/order-details/${row.original.id}`}
                className="flex items-center p-2 border-b text-warning hover:text-warning-foreground bg-warning/20 hover:bg-warning duration-200 transition-all rounded-full cursor-pointer"
              >
                <Eye className="w-4 h-4" />
              </Link>
            )}
            {isAdmin && (
              <>
                {row.original.status === 7 ? (
                  <div
                    className="flex items-center p-2 text-destructive bg-destructive/20 opacity-50 rounded-full cursor-not-allowed"
                    title="Action disabled for reassigned orders"
                  >
                    <Trash2 className="w-4 h-4" />
                  </div>
                ) : (
                  <>
                    <Link
                      href={`/dashboard/edit-order/${row.original.id}`}
                      className="flex items-center p-2 text-primary bg-primary/20 duration-200 transition-all hover:bg-primary/80 hover:text-primary-foreground rounded-full cursor-pointer"
                      title="Edit Order"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/dashboard/remove-item/${row.original.id}`}
                      className="flex items-center p-2 text-destructive bg-destructive/40 duration-200 transition-all hover:bg-destructive/80 hover:text-destructive-foreground rounded-full cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Link>
                  </>
                )}

                {/*<ChangeInventoryUserDialog*/}
                {/*  orderId={row.original.id}*/}
                {/*  inventoryUserId={row.original.items[0]?.inventoryUserId}*/}
                {/*  onSuccess={() => refresh()}*/}
                {/*/>*/}

                <GenerateInvoiceButton isDisabled={row.original.status == 7} orderId={row.original.id} />

              </>
            )}
          </div>
        );
      },
    },
  ];
