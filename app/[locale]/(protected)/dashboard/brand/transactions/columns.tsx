"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { Link } from '@/i18n/routing';
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BrandType } from "@/types/brand";
import useDeleteBrand from "@/services/brands/deleteBrand";
import Image from "next/image";

export const baseColumns = ({ refresh, t }: { refresh: () => void; t: (key: string) => string }): ColumnDef<BrandType>[] => [
    {
        accessorKey: "imagePath",
        header: t("brand_image") || "Image",
        cell: ({ row }) => {
            const imageUrl = row.getValue("imagePath") as string;
            return (
                <div className="relative w-12 h-12 overflow-hidden rounded-md border border-default-200">
                    {imageUrl ? (
                        <Image 
                            src={imageUrl} 
                            alt="Brand" 
                            fill 
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full bg-default-100 flex items-center justify-center text-[10px] text-default-400">
                            No Img
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        header: t("brand name"),
        cell: ({ row }) => <span>{row.getValue("name") || t("unknown")}</span>,
    },
  {
        accessorKey: "arName", 
        header: t("brand arabic name"),
        cell: ({ row }) => {
            const value = row.getValue("arName") as string;
            return <span>{value || t("unknown")}</span>;
        },
    },
    {
        accessorKey: "isPopular",
        header: t("popular") || "Popular",
        cell: ({ row }) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.original.isPopular ? "bg-success/20 text-success" : "bg-red-500 text-white"}`}>
                {row.original.isPopular ? "yes" : "No"}
            </span>
        ),
    },
    {
        id: "actions",
        accessorKey: "action",
        header: t("actions"),
        enableHiding: false,
        cell: ({ row }) => {
            const id = row.original.id;
            const { deleteBrand, loading } = useDeleteBrand();

            const handleDelete = () => {
                const toastId = toast(t("delete_brand"), {
                    description: t("delete_brand_confirm"),
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
                                        const isSuccess = await deleteBrand(id as string);
                                        
                                        toast.dismiss(toastId);

                                        if (isSuccess) {
                                            toast.success(t("brand_deleted"), {
                                                description: t("brand_deleted_success"),
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
                        href={`/dashboard/edit-brand/${id}`}
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