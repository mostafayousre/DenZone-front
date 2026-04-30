import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2, Heart, ListOrdered, FileText, Loader2, Key } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import useDeleteUser from "@/services/users/DeleteUser";
import useUpdateUser from "@/services/users/updateUser";
import useChangePasswordFromAdmin from "@/services/users/ChangePasswordFromAdmin";
import { Switch } from "@/components/ui/switch";
import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

const StatusCell = ({ row, refresh, t }: { row: any; refresh: () => void; t?: (key: string) => string }) => {
  const { updateUser, loading } = useUpdateUser();
  const [localActive, setLocalActive] = useState(row.original.isActive);
  const id = row.original.id;

  // Sync local state with row data if it changes
  useEffect(() => {
    setLocalActive(row.original.isActive);
  }, [row.original.isActive]);

  const handleToggle = async () => {
    const previousState = localActive;
    const newState = !previousState;
    setLocalActive(newState); // Optimistic update

    const formData = new FormData();
    formData.append("IsActive", newState.toString());
    
    // Some APIs require more fields even for simple updates
    // We include existing fields to be safer
    if (row.original.fullName) formData.append("FullName", row.original.fullName);
    if (row.original.email) formData.append("Email", row.original.email);
    if (row.original.phoneNumber) formData.append("PhoneNumber", row.original.phoneNumber);

    const result = await updateUser(formData, id);
    if (result.success) {
      toast.success(t?.("statusUpdated") || "Status updated successfully");
      refresh();
    } else {
      setLocalActive(previousState); // Revert on failure
      toast.error(result.error || "Error updating status");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-default-400" />
      ) : (
        <Switch
          checked={localActive}
          onCheckedChange={handleToggle}
          color="success"
        />
      )}
      <span className={`text-[12px] font-medium ${localActive ? "text-success" : "text-destructive"}`}>
        {localActive ? (t?.("yes") || "Yes") : (t?.("no") || "No")}
      </span>
    </div>
  );
};

const ActionCell = ({ row, refresh, t }: { row: any; refresh: () => void; t?: (key: string) => string }) => {
  const searchParams = useSearchParams();
  const filterUserId = searchParams ? searchParams.get("userId") : null;
  const id = row.original.id;
  const { deleteUser, loading: deleting } = useDeleteUser();
  const { changePassword, loading: changingPassword } = useChangePasswordFromAdmin();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const result = await changePassword(id as string, newPassword, confirmPassword);
    if (result.success) {
      toast.success("Password changed successfully");
      setNewPassword("");
      setConfirmPassword("");
      setIsDialogOpen(false);
    } else {
      toast.error(result.error || "Failed to change password");
    }
  };

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
            disabled={deleting}
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
            {deleting ? (t?.("deleting") || "Deleting...") : (t?.("confirm") || "Confirm")}
          </Button>
        </div>
      ),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/order-list?userId=${id}`}
        title={t?.("orders") || "Orders"}
        className="p-2 text-primary bg-primary/20 hover:bg-primary hover:text-white rounded-full transition-all"
      >
        <ListOrdered className="w-4 h-4" />
      </Link>
      <Link
        href={`/dashboard/favorites?userId=${id}`}
        title={t?.("favorites") || "Favorites"}
        className="p-2 text-destructive bg-destructive/20 hover:bg-destructive hover:text-white rounded-full transition-all"
      >
        <Heart className="w-4 h-4" />
      </Link>
      <Link
        href={`/dashboard/invoice?userId=${id}`}
        title={t?.("invoices") || "Invoices"}
        className="p-2 text-warning bg-warning/20 hover:bg-warning hover:text-white rounded-full transition-all"
      >
        <FileText className="w-4 h-4" />
      </Link>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button
            title={t?.("changePassword") || "Change Password"}
            className="p-2 text-warning bg-warning/20 hover:bg-warning hover:text-white rounded-full transition-all cursor-pointer"
          >
            <Key className="w-4 h-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t?.("changePassword") || "Change Password"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">{t?.("newPassword") || "New Password"}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">{t?.("confirmPassword") || "Confirm Password"}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              {t?.("cancel") || "Cancel"}
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={changingPassword}
            >
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : (t?.("save") || "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    cell: ({ row }) => <StatusCell row={row} refresh={refresh} t={t} />,
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
    cell: ({ row }) => <ActionCell row={row} refresh={refresh} t={t} />,
  },
];