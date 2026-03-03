import { ColumnDef } from "@tanstack/react-table";
import {
    Eye,
    Trash2,
} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import useDeleteUser from "@/services/users/DeleteUser";
import {Link} from "@/i18n/routing";
import { useTranslations } from "next-intl";

export type DataProps = {
  id: string | number;
  userName: string;
  email: string;
  phoneNumber: string;
  businessName: string;
  isPharmacy: boolean;
  regionName: string;
  action: React.ReactNode;
  addresses: string;
  fullName: string;
};
export const baseColumns = ({ refresh }: { refresh: () => void }): ColumnDef<DataProps>[] => {
  const t = useTranslations();
  return [
  {
    accessorKey: "fullName",
    header: "Full Name",
    cell: ({ row }) => {
      const user = row.original.fullName;
      return (
          <div className="text-sm text-default-600">{user}</div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.original.email;
      return (
          <div className="text-sm text-default-600">{email}</div>
      );
    },
  },
  // {
  //   accessorKey: "businessName",
  //   header: "Business Name",
  //   cell: ({ row }) => {
  //     const businessName = row.original.businessName;
  //     return (
  //         <div className="text-sm text-default-600">{businessName}</div>
  //     );
  //   },
  // },
  // {
  //   accessorKey: "phoneNumber",
  //   header: "Phone Number",
  //   cell: ({ row }) => {
  //     const phone = row.original.phoneNumber;
  //     return <div className="text-sm text-default-600">{phone}</div>;
  //   },
  // },
  // {
  //   accessorKey: "isPharmacy",
  //   header: "Is Pharmacy?",
  //   cell: ({ row }) => {
  //     const isPharmacy = row.original.isPharmacy;
  //     return <div className="text-sm text-default-600">{isPharmacy === true ? "Yes" : "No"}</div>;
  //   },
  // },
  {
    accessorKey: "phoneNumber",
    header: t("phoneNumber"),
    cell: ({ row }) => {
      return <span> {row.original.phoneNumber || "N/A"}</span>;
    },
  },
  {
    accessorKey: "addresses",
    header: "Addresses",
    cell: ({ row }) => {
      const addresses = row.original.addresses;
      return <div className="text-sm text-default-600">{addresses || "N/A"}</div>;
    },
  },
  {
    id: "actions",
    accessorKey: "action",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      // getting the selected user Id
      const id: string | number = row.original.id;
      const { deleteUser, loading, isDeleted, error } = useDeleteUser();

      const handleDelete = () => {
        const toastId = toast("Delete User", {
          description: "Are you sure you want to delete this user?",
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
                      const result = await deleteUser(id);
                      toast.dismiss(toastId);

                      if (result.success) {
                        toast("User deleted", {
                          description: "The user was deleted successfully.",
                        });
                        refresh();
                      } else {
                        toast("Error", {
                          description: result.error ?? "There was an error deleting the user.",
                        });
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
          <div className="flex items-center gap-1">
            <Link
                href={`/dashboard/inventory-managers/details/${id}`}
                className="flex items-center p-2 text-blue-100 bg-blue-300 duration-200 transition-all hover:bg-blue-100 hover:text-blue-300 rounded-full cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <div
                onClick={handleDelete}
                className="flex items-center p-2 text-destructive bg-destructive/40 duration-200 transition-all hover:bg-destructive/80 hover:text-destructive-foreground rounded-full cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
      );
    },
  },
];
};
