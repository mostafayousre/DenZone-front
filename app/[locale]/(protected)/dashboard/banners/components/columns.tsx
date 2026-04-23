"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BannerType } from "@/types/banner";
import useDeleteBanner from "@/services/banners/deleteBanner";
import Image from "next/image";

export const baseColumns = ({ refresh, t }: { refresh: () => void; t: (key: string) => string }): ColumnDef<BannerType>[] => [
    {
        accessorKey: "imageName",
        header: t("image"),
        cell: ({ row }) => {
            const imageUrl = row.getValue("imageName") as string;
            return (
                <div className="relative w-20 h-12 overflow-hidden rounded-md border border-default-200">
                    <Image 
                        src={imageUrl} 
                        alt="Banner" 
                        fill 
                        className="object-cover"
                        unoptimized
                    />
                </div>
            );
        },
    },
    {
        accessorKey: "order", 
        header: t("order"),
        cell: ({ row }) => <span>{row.getValue("order")}</span>,
    },
    {
        id: "actions",
        accessorKey: "action",
        header: t("actions"),
        enableHiding: false,
        cell: ({ row }) => {
            const id = row.original.id;
            const { deleteBanner, loading } = useDeleteBanner();

            const handleDelete = () => {
                const toastId = toast(t("delete_banner"), {
                    description: t("delete_banner_confirm"),
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
                                        const isSuccess = await deleteBanner(id);
                                        
                                        toast.dismiss(toastId);

                                        if (isSuccess) {
                                            toast.success(t("banner_deleted_success"));
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
                        href={`/dashboard/edit-banner/${id}`}
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
