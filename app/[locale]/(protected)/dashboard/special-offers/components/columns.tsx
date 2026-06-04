"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2 } from "lucide-react";
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SpecialOfferType } from "@/types/specialOffer";
import useDeleteSpecialOffer from "@/services/specialOffers/deleteSpecialOffer";
import Image from "next/image";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const ActionCell = ({ row, refresh, t }: { row: any; refresh: () => void; t: (key: string) => string }) => {
    const id = row.original.id;
    const { deleteSpecialOffer, loading } = useDeleteSpecialOffer();
    const [open, setOpen] = useState(false);

    const handleDelete = async () => {
        try {
            const result = await deleteSpecialOffer(id);
            if (result.success) {
                toast.success(t("successDelete"));
                refresh();
                setOpen(false);
            } else {
                throw new Error(result.error || "Failed to delete");
            }
        } catch (error: any) {
            toast.error(t("error") || "Error", {
                description: typeof error === 'string' ? error : error.message,
            });
        }
    };

    return (
        <div className="flex items-center gap-1">
            <Link
                href={`/dashboard/edit-special-offer/${id}`}
                className="flex items-center p-2 border-b text-info hover:text-info-foreground bg-info/40 hover:bg-info duration-200 transition-all rounded-full cursor-pointer"
            >
                <SquarePen className="w-4 h-4" />
            </Link>
            
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <div
                        className="flex items-center p-2 text-destructive bg-destructive/40 duration-200 transition-all hover:bg-destructive/80 hover:text-destructive-foreground rounded-full cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("deleteOffer")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("confirmDelete")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>{t("cancel") || "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={loading}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {loading ? "..." : (t("confirm") || "Confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export const baseColumns = ({ refresh, t }: { refresh: () => void; t: (key: string) => string }): ColumnDef<SpecialOfferType>[] => [
    {
        accessorKey: "imagePath",
        header: t("image"),
        cell: ({ row }) => {
            const imageUrl = row.getValue("imagePath") as string;
            return (
                <div className="relative w-20 h-12 overflow-hidden rounded-md border border-default-200">
                    <Image 
                        src={imageUrl} 
                        alt="Special Offer" 
                        fill 
                        className="object-cover"
                        unoptimized
                    />
                </div>
            );
        },
    },
    {
        accessorKey: "sectionNum",
        header: "Section Num",
        cell: ({ row }) => {
            const sectionNum = row.getValue("sectionNum") as number;
            return (
                <div className="text-sm font-medium text-default-600">
                    {sectionNum === 1 ? "specialOffer1": sectionNum === 2 ? "specialOffer2" : sectionNum}
                </div>
            );
        },
    },
    {
        accessorKey: "link", 
        header: t("link"),
        cell: ({ row }) => {
            const link = row.getValue("link") as string;
            return link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline max-w-[200px] truncate block">
                    {link}
                </a>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        },
    },
    {
        id: "actions",
        accessorKey: "action",
        header: t("actions"),
        enableHiding: false,
        cell: ({ row }) => <ActionCell row={row} refresh={refresh} t={t} />,
    },
];
