import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useDeleteUser from "@/services/users/DeleteUser";
import { Link } from "@/i18n/routing";

const AddressCell = ({ addresses, t }: { addresses: any; t?: (key: string) => string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const addressList = Array.isArray(addresses) 
    ? addresses.map((addr: any) => addr?.addressLine).filter(Boolean)
    : addresses?.addressLine ? [addresses.addressLine] : [];

  if (addressList.length === 0 || addressList[0] === "No address") {
    return <span className="text-default-400 text-sm">No address</span>;
  }

  const hasMultiple = addressList.length > 1;
  const visibleAddresses = isExpanded ? addressList : [addressList[0]];

  return (
    <div className="flex flex-col py-1 min-w-[200px] max-w-[350px] gap-1">
      {visibleAddresses.map((addr, index) => (
        <div 
          key={index} 
          dir="auto"
          className="text-[13px] text-default-600 leading-relaxed border-b border-dashed border-default-200 last:border-0 pb-1.5 mb-0.5 last:mb-0 last:pb-0 text-start"
        >
          {addr}
        </div>
      ))}
      
      {hasMultiple && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-[11px] font-bold text-blue-500 hover:text-blue-700 w-fit mt-1 underline-offset-4 hover:underline transition-all text-start"
        >
          {isExpanded 
            ? (t?.("showLess") || "Show Less") 
            : `+ ${addressList.length - 1} ${t?.("moreAddresses") || "More Addresses"}`}
        </button>
      )}
    </div>
  );
};

export type DataProps = {
  id: string | number;
  fullName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  isPharmacy: boolean;
  regionName: string;
  isActive: boolean;
  action: React.ReactNode;
  addresses?: any;
};

export const baseColumns = ({ refresh, t }: { refresh: () => void; t?: (key: string) => string }): ColumnDef<DataProps>[] => [
  {
    accessorKey: "fullName",
    header: t?.("fullName") || "Full Name",
    cell: ({ row }) => <div className="text-sm text-default-600">{row.original.fullName}</div>,
  },
  {
    accessorKey: "email",
    header: t?.("email") || "Email",
    cell: ({ row }) => <div className="text-sm text-default-600">{row.original.email}</div>,
  },
  {
    accessorKey: "phoneNumber",
    header: t?.("phoneNumber") || "Phone Number",
    cell: ({ row }) => <div className="text-sm text-default-600">{row.original.phoneNumber}</div>,
  },
  {
    accessorKey: "isActive",
    header: t?.("status") || "Active",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <div className={`text-sm ${isActive ? "text-success" : "text-destructive"}`}>
          {isActive ? (t?.("yes") || "Yes") : (t?.("no") || "No")}
        </div>
      );
    },
  },
  {
    accessorKey: "addresses",
    header: t?.("addresses") || "Address",
    cell: ({ row }) => {
      return <AddressCell addresses={row.original.addresses} t={t} />;
    },
  },
  {
    id: "actions",
    header: t?.("actions") || "Actions",
    cell: ({ row }) => {
      const id = row.original.id;
      const { deleteUser, loading } = useDeleteUser();

      const handleDelete = () => {
        const toastId = toast(t?.("deleteUser") || "Delete User", {
          description: t?.("deleteConfirmation") || "Are you sure you want to delete this user?",
          action: (
            <div className="flex justify-end items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.dismiss(toastId)}
              >
                {t?.("cancel") || "Cancel"}
              </Button>
              <Button
                size="sm"
                color="destructive"
                disabled={loading}
                className="text-white bg-destructive hover:bg-destructive/90"
                onClick={async () => {
                  const result = await deleteUser(id);
                  toast.dismiss(toastId);

                  if (result.success) {
                    toast.success(t?.("deleteSuccess") || "User deleted successfully");
                    if (refresh) refresh(); 
                  } else {
                    toast.error(result.error || "Error");
                  }
                }}
              >
                {loading ? (t?.("deleting") || "Deleting...") : (t?.("confirm") || "Confirm")}
              </Button>
            </div>
          ),
        });
      };

      return (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/edit-user/${id}`}
            className="p-2 text-info bg-info/20 hover:bg-info hover:text-white rounded-full transition-all"
          >
            <SquarePen className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 text-destructive bg-destructive/20 hover:bg-destructive hover:text-white rounded-full transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      );
    },
  },
];