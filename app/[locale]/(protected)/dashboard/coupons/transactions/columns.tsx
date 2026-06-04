import {ColumnDef} from "@tanstack/react-table";
import {toast} from "sonner";
import {Link} from "@/i18n/routing";
import {SquarePen, Trash2} from "lucide-react";
import {Coupon} from "@/types/coupons";
import {formatDateToDMY} from "@/utils";
import {Button} from "@/components/ui/button";
import useDeleteCoupon from "@/services/coupons/deleteCoupon";

export const baseColumns = ({refresh } : { refresh: () => void }): ColumnDef<Coupon>[] =>
    [
        {
            accessorKey: "code",
            header: "Code",
            cell: ({row}) => {
                const code = row.original.code;
                return (
                    <div className="font-medium text-card-foreground/80">
            <span className="text-sm text-default-600">
              {code ?? "N/A"}
            </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "discountType",
            header: "Type",
            cell: ({row}) => {
                const type = row.original.discountType;
                return (
                    <div className="font-medium text-card-foreground/80">
            <span className="text-sm text-default-600">
              {type ?? "N/A"}
            </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "discountValue",
            header: "Discount Value",
            cell: ({ row }) => {
            const discountValue = row.original.discountValue;
            return (
                <div className="font-medium text-card-foreground/80">
                    <span className="text-sm text-default-600">
                    {discountValue ?? "N/A"}
                    </span>
                </div>
            );
            },
        },
        {
            accessorKey: "usageLimit",
            header: "Number of Users",
            cell: ({row}) => <span>{row.original.usageLimit}</span>,
        },
        {
            accessorKey: "perUserLimit",
            header: "Per User Limit",
            cell: ({row}) => <span>{row.original.perUserLimit || "N/A"}</span>,
        },{
            accessorKey: "copunUsages",
            header: "Coupon Usages",
            cell: ({row}) => <span>{row.original.copunUsages}</span>,
        },
        {
            accessorKey: "startDate",
            header: "Start Date",
            cell: ({row}) => <span>{formatDateToDMY(row.getValue("startDate"))}</span>,
        },
        {
            accessorKey: "endDate",
            header: "End Date",
            cell: ({row}) => {
                return <span>{formatDateToDMY(row.getValue("endDate"))}</span>;
            },
        },
        {
            id: "actions",
            accessorKey: "action",
            header: "Actions",
            enableHiding: false,
            cell: ({row}) => {
                const {deleteCoupon, loading} = useDeleteCoupon()

                const getHref = () => {
                    const id = row.original.id;
                    return `/dashboard/edit-coupon/${id}`;
                };

                const handleDelete = (id: string | number | undefined) => {
                    const toastId = toast("Delete Coupon", {
                        description: "Are you sure you want to delete this Coupon?",
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
                                        const result = await deleteCoupon(id);
                                        toast.dismiss(toastId);

                                        if (result.success) {
                                            toast("Coupon deleted", {
                                                description: "The Coupon was deleted successfully.",
                                            });
                                            refresh();
                                        } else {
                                            toast("Error", {
                                                description: result.error ?? "There was an error deleting the Coupon.",
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
                            href={getHref()}
                            className="flex items-center p-2 border-b text-info hover:text-info-foreground bg-info/40 hover:bg-info duration-200 transition-all rounded-full"
                        >
                            <SquarePen className="w-4 h-4"/>
                        </Link>
                        <div
                            className="flex items-center p-2 text-destructive bg-destructive/40 duration-200 transition-all hover:bg-destructive/80 hover:text-destructive-foreground rounded-full cursor-pointer"
                            onClick={() => {
                                handleDelete(row.original.id);
                            }}
                        >
                            <Trash2 className="w-4 h-4"/>
                        </div>
                    </div>
                );
            },
        },
    ];