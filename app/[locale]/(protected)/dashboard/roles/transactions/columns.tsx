"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2, ShieldCheck } from "lucide-react";
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useDeleteRole from "@/services/roles/deleteRole";

export const baseColumns = ({ refresh, t, onAssignPermissions }: { 
    refresh: () => void; 
    t: (key: string) => string;
    onAssignPermissions: (role: any) => void;
}): ColumnDef<any>[] => [
    {
        accessorKey: "name",
        header: "Role Name",
        cell: ({ row }) => <span>{row.getValue("name") || "Unknown"}</span>,
    },
    {
        id: "actions",
        accessorKey: "action",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
            const id = row.original.id;
            const { deleteRole, loading } = useDeleteRole();

            const handleDelete = () => {
                const toastId = toast("Delete Role", {
                    description: "Are you sure you want to delete this role?",
                    action: (
                        <div className="flex justify-end mx-auto items-center my-auto gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.dismiss(toastId)}
                                className="px-3 py-1 rounded-md"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={loading}
                                className="px-3 py-1 rounded-md text-white bg-red-600 border-red-600 hover:bg-red-700"
                                onClick={async () => {
                                    try {
                                        const isSuccess = await deleteRole(id as string);
                                        
                                        toast.dismiss(toastId);

                                        if (isSuccess) {
                                            toast.success("Role deleted successfully");
                                            refresh(); 
                                        } else {
                                            throw new Error("Failed to delete");
                                        }
                                    } catch (error: any) {
                                        toast.dismiss(toastId);
                                        toast.error("Error", {
                                            description: typeof error === 'string' ? error : error.message,
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
                    <div
                        onClick={() => onAssignPermissions(row.original)}
                        className="flex items-center p-2 text-warning bg-warning/40 duration-200 transition-all hover:bg-warning/80 hover:text-warning-foreground rounded-full cursor-pointer"
                        title="Assign Permissions"
                    >
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <Link
                        href={`/dashboard/edit-role/${id}`}
                        className="flex items-center p-2 border-b text-info hover:text-info-foreground bg-info/40 hover:bg-info duration-200 transition-all rounded-full cursor-pointer"
                    >
                        <SquarePen className="w-4 h-4" />
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
