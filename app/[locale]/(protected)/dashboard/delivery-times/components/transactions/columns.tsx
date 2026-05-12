"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DeliveryTimeSlot } from "@/types/deliveryTimeSlot";
import { Button } from "@/components/ui/button";
import { SquarePen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import useDeleteDeliveryTimeSlot from "@/services/deliveryTimeSlots/deleteDeliveryTimeSlot";

export const baseColumns = ({ refresh, onEdit }: { refresh: () => void, onEdit: (slot: DeliveryTimeSlot) => void }): ColumnDef<DeliveryTimeSlot>[] => [
  {
    accessorKey: "from",
    header: "From",
    cell: ({ row }) => <div className="font-medium text-default-600">{row.getValue("from")}</div>,
  },
  {
    accessorKey: "to",
    header: "To",
    cell: ({ row }) => <div className="font-medium text-default-600">{row.getValue("to")}</div>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const slot = row.original;
      const { deleteDeliveryTimeSlot, loading } = useDeleteDeliveryTimeSlot();

      const handleDelete = () => {
        const toastId = toast("Delete Delivery Time", {
          description: "Are you sure you want to delete this time slot?",
          action: (
            <div className="flex justify-end mx-auto items-center my-auto gap-2">
              <Button
                size="sm"
                onClick={() => toast.dismiss(toastId)}
                className="text-white px-3 py-1 rounded-md"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="shadow"
                disabled={loading}
                className="text-white px-3 py-1 rounded-md"
                onClick={async () => {
                  try {
                    await deleteDeliveryTimeSlot(slot.id);
                    toast.dismiss(toastId);
                    toast.success("Time slot deleted successfully");
                    refresh();
                  } catch (error) {
                    toast.error("Failed to delete time slot");
                  }
                }}
              >
                Confirm
              </Button>
            </div>
          ),
        });
      };

      return (
        <div className="flex items-center gap-2">
          <div
            onClick={() => onEdit(slot)}
            className="flex items-center p-2 text-info bg-info/10 hover:bg-info hover:text-white duration-200 transition-all rounded-full cursor-pointer"
          >
            <SquarePen className="w-4 h-4" />
          </div>
          <div
            className="flex items-center p-2 text-destructive bg-destructive/10 duration-200 transition-all hover:bg-destructive hover:text-white rounded-full cursor-pointer"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </div>
        </div>
      );
    },
  },
];
