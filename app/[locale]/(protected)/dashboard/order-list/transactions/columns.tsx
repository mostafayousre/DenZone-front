import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  Trash2,
  Pencil,
  Truck,
  ArrowUpDown,
  Printer
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
import useAssignDelivery from "@/services/Orders/assignDelivery";
import useGetDelivers from "@/services/users/getDelivers";
import useGetPreparationDelivers from "@/services/users/getPreparationDelivers";
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
import { Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";


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
    7: "bg-default-200 text-default-700", // ReAssignTo
    8: "bg-orange-200 text-orange-700", // Refund
    9: "bg-rose-200 text-rose-700", // Cancel
  };

  const statusTranslationKeys: Record<number, string> = {
    0: "statusCode.pending",
    1: "statusCode.confirmed",
    2: "statusCode.rejected",
    3: "statusCode.prepared",
    4: "statusCode.shipped",
    5: "statusCode.delivered",
    6: "statusCode.completed",
    7: "statusCode.ReAssignTo",
    8: "statusCode.Refund",
    9: "statusCode.Cancel",
  };

  const status = row.original.status;
  const statusStyle = statusColors[status] || "bg-gray-200 text-gray-700";
  const statusLabel = t(statusTranslationKeys[status] ?? "status.unknown");

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Badge className={cn("rounded-full px-2.5 py-0.5 text-[11px] whitespace-nowrap", statusStyle)}>
        {statusLabel}
      </Badge>
    </div>
  );
};

const ProviderCell = ({ row, t }: { row: any; t: (key: string) => string }) => {
  const [expanded, setExpanded] = useState(false);

  const items = row.original.items || [];

  const names = Array.from(
    new Set(
      items
        .map((item: any) => item.inventoryName)
        .filter(Boolean)
    )
  );

  if (names.length === 0) {
    if (row.original.inventoryName) {
      return <span>{row.original.inventoryName}</span>;
    }
    return <span>N/A</span>;
  }

  if (expanded || names.length <= 2) {
    return (
      <div className="flex flex-col gap-3 ">
        {names.map((name: any, idx: number) => (
          <span key={idx}>{name}</span>
        ))}
        {expanded && names.length > 2 && (
          <span
            className="text-blue-600 cursor-pointer text-[11px] select-none hover:underline"
            onClick={() => setExpanded(false)}
          >
            {t("showLess") || "Show less"}
          </span>
        )}
      </div>
    );
  }

  const firstTwo = names.slice(0, 2);
  const remaining = names.slice(2);

  return (
    <div className="flex flex-col gap-3">
      {firstTwo.map((name: any, idx: number) => (
        <span key={idx}>{name}</span>
      ))}
      <span
        className="text-blue-600 cursor-pointer select-none hover:underline"
        onClick={() => setExpanded(true)}
        title={remaining.join(", ")}
      >
        +{remaining.length} {t("more") || "more"}
      </span>
    </div>
  );
};

const StatusDialog = ({ row, refresh, t }: { row: any; refresh: () => void; t: (key: string) => string }) => {
  const { updateOrderStatus, loading } = useUpdateOrderStatus();
  const { assignDelivery, loading: assignLoading } = useAssignDelivery();
  const { getDelivers, delivers, loading: deliversLoading } = useGetDelivers();
  const { getPreparationDelivers, preparationDelivers, loading: preparationLoading } = useGetPreparationDelivers();
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(row.original.status.toString());
  const [selectedDelivery, setSelectedDelivery] = useState<string>("");
  const [selectedPreparation, setSelectedPreparation] = useState<string>("");

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      if (delivers.length === 0) getDelivers();
      if (preparationDelivers.length === 0) getPreparationDelivers();
    }
  };

  const handleUpdate = async () => {
    const numericValue = Number(selectedStatus) as OrderStatus;
    const currentStatus = row.original.status;

    if (numericValue === 3 && (!selectedDelivery || !selectedPreparation)) {
      toast.error(t("pleaseSelectPersonnel") || "Please select both delivery and preparation personnel");
      return;
    }

    let success = false;
    let errorMsg = "";

    // If the status is changing (or it's a new status that isn't already 'Prepared')
    if (numericValue !== 3 || currentStatus !== 3) {
      const result = await updateOrderStatus(row.original.orderNumber || row.original.id, numericValue);
      success = result.success;
      errorMsg = result.error || "";
    } else {
      // Already Prepared, just updating assignment
      success = true;
    }

    if (success) {
      if (numericValue === 3 && selectedDelivery && selectedPreparation) {
        const assignResult = await assignDelivery(row.original.orderNumber || row.original.id, selectedDelivery, selectedPreparation);
        if (!assignResult.success) {
          toast.error(assignResult.error || t("assignDeliveryError") || "Failed to assign delivery");
          return;
        }
      }
      toast.success(t("updateStatusSuccess") || "Status updated successfully");
      setOpen(false);
      refresh();
    } else {
      toast.error(errorMsg || t("updateStatusError") || "Failed to update status");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="flex items-center p-2 text-warning hover:text-warning-foreground bg-warning/20 hover:bg-warning duration-200 transition-all rounded-full cursor-pointer"
          title={t("updateStatus") || "Update Status"}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("updateStatus") || "Update Status"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t("orderStatus")}</label>
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectStatus") || "Select Status"} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus)
                  .filter((value) => typeof value === "number")
                  .map((s) => (
                    <SelectItem key={s} value={s.toString()} className="text-xs">
                      {t(`statusCode.${OrderStatus[s as number].toLowerCase()}`)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {Number(selectedStatus) === 3 && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">{t("selectDelivery") || "Select Delivery Person"}</label>
                <Select
                  value={selectedDelivery}
                  onValueChange={setSelectedDelivery}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectDeliveryPlaceholder") || "Select Delivery Person"} />
                  </SelectTrigger>
                  <SelectContent>
                    {deliversLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : delivers.length === 0 ? (
                      <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                        No delivery personnel found
                      </div>
                    ) : (
                      delivers.map((d: any) => (
                        <SelectItem key={d.id} value={d.id} className="text-xs">
                          {d.fullName || d.userName || "Unknown"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">{t("selectPreparation") || "Select Preparation Person"}</label>
                <Select
                  value={selectedPreparation}
                  onValueChange={setSelectedPreparation}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectPreparationPlaceholder") || "Select Preparation Person"} />
                  </SelectTrigger>
                  <SelectContent>
                    {preparationLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    ) : preparationDelivers.length === 0 ? (
                      <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                        No preparation personnel found
                      </div>
                    ) : (
                      preparationDelivers.map((d: any) => (
                        <SelectItem key={d.id} value={d.id} className="text-xs">
                          {d.fullName || d.userName || "Unknown"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading || assignLoading}>
            {t("cancel") || "Cancel"}
          </Button>
          <Button onClick={handleUpdate} disabled={loading || assignLoading}>
            {(loading || assignLoading) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t("save") || "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const baseColumns = ({ refresh, t, isRepresentative }: {
  refresh: () => void;
  t: (key: string) => string;
  isRepresentative?: boolean;
}): ColumnDef<Orders>[] => {
  const columns: ColumnDef<Orders>[] = [
    {
      accessorKey: "orderNumber",
      header: t("orderNumber"),
      cell: ({ row }) => <span><Link href={`/dashboard/order-details/${row.original.orderNumber}`} className="hover:text-default-900 cursor-pointer bg-transparent border-none p-0 outline-none font-semibold text-sm text-default-800 transition-colors" >{row.getValue("orderNumber") || "N/A"}</Link></span>,
    },
    {
      accessorKey: "doctorName",
      header: ({ column }) => {
        return (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 hover:text-default-900 cursor-pointer bg-transparent border-none p-0 outline-none font-semibold text-sm text-default-800 transition-colors"
          >
            {t("doctorName")}
            <ArrowUpDown className="h-3.5 w-3.5 text-default-500" />
          </button>
        );
      },
      cell: ({ row }) => <span>{row.getValue("doctorName") || "N/A"}</span>,
    },

    {
      accessorKey: "inventoryName",
      header: t("provider"),
      cell: ({ row }) => <ProviderCell row={row} t={t} />,
    },

    {
      accessorKey: "orderDate",
      header: t("date"),
      cell: ({ row }) => {
        return <span>{formatDateToDMY(row.original.orderDate)}</span>;
      },
    },
    // {
    //   accessorKey: "totalAmount",
    //   header: t("totalAmount"),
    //   cell: ({ row }) => {
    //     return <span>{row.getValue("totalAmount")}</span>;
    //   },
    // },
    
    {
      accessorKey: "totalAmountOrderAfter",
      header: "total Amount",
      cell: ({ row }) => <span>{row.getValue("totalAmountOrderAfter") || "N/A"}</span>,
    },
    {
      accessorKey: "orderNote",
      header: t("orderNote"),
      cell: ({ row }) => {
        const note = row.original.orderNote || "";
        return <span>{note.length > 10 ? note.slice(0, 10) + "..." : note || "-"}</span>;
      },
    },
    {
      accessorKey: "deliveryOptionName",
      header: t("deliveryDate") || "delivery Date",
      cell: ({ row }) => <span>{row.getValue("deliveryOptionName") || "there is no delivery date"}</span>,
    }, {
      accessorKey: "deliveryTimeName",
      header: t("deliveryTime") || "delivery Time",
      cell: ({ row }) => <span>{row.getValue("deliveryTimeName") || "-"}</span>,
    },{
      accessorKey: "latlong",
      header: t("latlong") || "latlong",
      cell: ({ row }) => <span>{row.getValue("latlong") || "-"}</span>,
    }
  ];

  if (!isRepresentative) {
    columns.push(
      {
        accessorKey: "couponCode",
        header: t("couponCode") || "Coupon Code",
        cell: ({ row }) => <span>{row.original.couponCode || "-"}</span>,
      },
      {
        accessorKey: "couponPercentage",
        header: t("couponPercentage") || "Coupon %",
        cell: ({ row }) => <span>{row.original.couponPercentage ?? row.original.couponPrecentage ?? "-"}</span>,
      }
    );
  }

  columns.push(
    {
      accessorKey: "deliveryName",
      header: t("deliveryName") || "Delivery",
      cell: ({ row }) => <span>{row.getValue("deliveryName") || "there is no delivery yet"}</span>,
    },
    {
      accessorKey: "status",
      header: t("orderStatus"),
      cell: ({ row }) => <StatusCell row={row} refresh={refresh} t={t} />,
    },

    {
      id: "actions",
      accessorKey: "action",
      header: t("actions"),
      enableHiding: false,
      cell: ({ row }) => {
        const userRole = Cookies.get("userRole");
        const isAdmin = userRole == "Admin";
        const rawRole = userRole?.toLowerCase();
        const isInventoryOrProvider = rawRole === "inventory" || rawRole === "provider";

        const order = row.original;
        const isReassigned = order.status === 7;

        const orderIdOrNum = isInventoryOrProvider ? order.id : (order.orderNumber || order.id);

        return (
          <div className="flex items-center gap-1.5 py-1 justify-center">
            {isReassigned ? (
              <div
                className="flex items-center p-1.5 text-destructive bg-destructive/20 opacity-50 rounded-full cursor-not-allowed"
                title="Action disabled for reassigned orders"
              >
                <Eye className="w-3.5 h-3.5" />
              </div>
            ) : (
              <>
                <Link
                  href={`/dashboard/order-details/${orderIdOrNum}`}
                  className="flex items-center p-1.5 border-b text-warning hover:text-warning-foreground bg-warning/20 hover:bg-warning duration-200 transition-all rounded-full cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/dashboard/order-details/${orderIdOrNum}?print=true`}
                  className="flex items-center p-1.5 border-b text-info hover:text-info-foreground bg-info/20 hover:bg-info duration-200 transition-all rounded-full cursor-pointer"
                  title="Print Order"
                >
                  <Printer className="w-3.5 h-3.5" />
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                {isReassigned ? (
                  <div
                    className="flex items-center p-1.5 text-destructive bg-destructive/20 opacity-50 rounded-full cursor-not-allowed"
                    title="Action disabled for reassigned orders"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <>
                    <StatusDialog row={{ original: order }} refresh={refresh} t={t} />
                    <Link
                      href={`/dashboard/edit-order/${order.orderNumber || order.id}`}
                      className="flex items-center p-1.5 text-primary bg-primary/20 duration-200 transition-all hover:bg-primary/80 hover:text-primary-foreground rounded-full cursor-pointer"
                      title="Edit Order"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/dashboard/remove-item/${order.orderNumber || order.id}`}
                      className="flex items-center p-1.5 text-destructive bg-destructive/40 duration-200 transition-all hover:bg-destructive/80 hover:text-destructive-foreground rounded-full cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Link>
                  </>
                )}

                {order.status === OrderStatus.Completed && (
                  <GenerateInvoiceButton isDisabled={false} orderNumber={order.orderNumber || order.id} />
                )}
              </>
            )}
          </div>
        );
      },
    },
  );

  return columns;
};
