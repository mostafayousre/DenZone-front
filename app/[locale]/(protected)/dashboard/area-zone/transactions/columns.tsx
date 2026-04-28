"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AreaZoneType } from "@/types/areaZone";
import useDeleteAreaZone from "@/services/areaZones/deleteAreaZone";

export const baseColumns = ({ refresh, t }: { refresh: () => void; t: (key: string) => string }): ColumnDef<AreaZoneType>[] => [
    {
        accessorKey: "areaName",
        header: t("area_name"),
        cell: ({ row }) => <span className="font-medium text-default-900">{row.getValue("areaName") || t("unknown")}</span>,
    },
    {
        accessorKey: "zoneName",
        header: t("zone_name"),
        cell: ({ row }) => <span className="font-medium text-default-900">{row.getValue("zoneName") || t("unknown")}</span>,
    },
    {
        id: "actions",
        accessorKey: "action",
        header: t("actions"),
        enableHiding: false,
        cell: ({ row }) => {
            const areaZoneId = row.original.areaZoneId;
            const { deleteAreaZone, loading } = useDeleteAreaZone();

            const handleDelete = () => {
                const toastId = toast(t("delete_area_zone"), {
                    description: t("delete_area_zone_confirm"),
                    action: (
                        <div className="flex justify-end mx-auto items-center my-auto gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.dismiss(toastId)}
                                className="px-3 py-1 rounded-md"
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={loading}
                                className="px-3 py-1 rounded-md text-white bg-red-600 border-red-600 hover:bg-red-700"
                                onClick={async () => {
                                    try {
                                        const isSuccess = await deleteAreaZone(areaZoneId as string);
                                        
                                        toast.dismiss(toastId);

                                        if (isSuccess) {
                                            toast.success(t("area_zone_deleted"), {
                                                description: t("area_zone_deleted_success"),
                                            });
                                            refresh(); 
                                        } else {
                                            throw new Error("Failed to delete");
                                        }
                                    } catch (error: any) {
                                        toast.dismiss(toastId);
                                        toast.error(t("error"), {
                                            description: typeof error === 'string' ? error : error.message,
                                        });
                                    }
                                }}
                            >
                                {t("confirm")}
                            </Button>
                        </div>
                    ),
                });
            };

            return (
                <div className="flex items-center gap-1">
                    <Link
                        href={`/dashboard/edit-area-zone/${areaZoneId}`}
                        className="flex items-center p-2 text-info hover:text-info-foreground bg-info/10 hover:bg-info duration-200 transition-all rounded-full cursor-pointer"
                        title={t("edit_area_zone")}
                    >
                        <SquarePen className="w-4 h-4" />
                    </Link>
                    <div
                        onClick={handleDelete}
                        className="flex items-center p-2 text-destructive bg-destructive/10 duration-200 transition-all hover:bg-destructive hover:text-white rounded-full cursor-pointer"
                        title={t("delete_area_zone")}
                    >
                        <Trash2 className="w-4 h-4" />
                    </div>
                </div>
            );
        },
    },
];
