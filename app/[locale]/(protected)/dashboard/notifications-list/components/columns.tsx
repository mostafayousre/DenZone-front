"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Users, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import useDeleteNotification from "@/services/notifications/useDeleteNotification";
import useResendNotification from "@/services/notifications/useResendNotification";
import { format } from "date-fns";
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
import { TransformedNotificationItem } from "./NotificationsTable";

// مكون فرعي لعرض قائمة اليوزرز داخل Modal نضيف ومصمم بالكامل بـ AlertDialog
const UsersListCell = ({ users, t }: { users: { userId: string; userName: string }[]; t: (key: string) => string }) => {
    const [open, setOpen] = useState(false);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button 
                    className="flex items-center p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-full duration-200 transition-all cursor-pointer"
                    title={t("viewUsers") || "View Users"}
                >
                    <Users className="w-4 h-4" />
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-right">{t("recipientsList") || "قائمة المستلمين"}</AlertDialogTitle>
                    <AlertDialogDescription className="text-right text-sm text-muted-foreground mb-2">
                        {t("recipientsCountDescription") || "المستخدمين الذين تلقوا هذا الإشعار:"}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                {/* قائمة منسدلة بـ Scroll داخلي ناصع النظافة لعرض اليوزرز */}
                <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1 dir-rtl" dir="rtl">
                    {users.map((user, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-default-100 dark:bg-default-800 rounded-lg border border-solid border-default-200">
                            <span className="text-sm font-medium text-default-800">{user.userName}</span>
                            <span className="text-xs text-muted-foreground font-mono">ID: {user.userId.slice(0, 8)}...</span>
                        </div>
                    ))}
                </div>

                <AlertDialogFooter className="mt-4 flex justify-end">
                    <AlertDialogCancel className="cursor-pointer">{t("close") || "إغلاق"}</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

const ActionCell = ({ row, refresh, t }: { row: any; refresh: () => void; t: (key: string) => string }) => {
    const ids = row.original.ids || [row.original.id];
    const users = row.original.users || [];
    const { deleteNotification, loading: deleting } = useDeleteNotification();
    const { resendNotification } = useResendNotification();
    const [resending, setResending] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [resendOpen, setResendOpen] = useState(false);

    const handleDelete = async () => {
        try {
            const result = await deleteNotification(ids);
            if (result.success) {
                toast.success(t("deleteSuccess"));
                refresh();
                setDeleteOpen(false);
            } else {
                throw new Error(result.error || "Failed to delete");
            }
        } catch (error: any) {
            toast.error(t("error") || "Error", {
                description: typeof error === 'string' ? error : error.message,
            });
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            const result = await resendNotification(ids);
            if (result.success) {
                toast.success(t("resendSuccess"));
                refresh();
                setResendOpen(false);
            } else {
                throw new Error(result.error || "Failed to resend");
            }
        } catch (error: any) {
            toast.error(t("resendError"), {
                description: error.message,
            });
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {/* If group is All Doctors (users.length > 1), show users popup button in Actions */}
            {users.length > 1 && (
                <UsersListCell users={users} t={t} />
            )}

            {/* Resend Button */}
            <AlertDialog open={resendOpen} onOpenChange={setResendOpen}>
                <AlertDialogTrigger asChild>
                    <button
                        disabled={resending}
                        className="flex items-center p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-full duration-200 transition-all cursor-pointer disabled:opacity-50"
                        title={t("resend")}
                    >
                        {resending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4" />
                        )}
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("resend")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("confirmResend")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={resending}>{t("cancel") || "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleResend();
                            }}
                            disabled={resending}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {resending ? "..." : (t("confirm") || "Confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Button */}
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogTrigger asChild>
                    <div
                        className="flex items-center p-2 text-destructive bg-destructive/10 hover:bg-destructive/20 duration-200 transition-all text-red-500 hover:text-red-700 rounded-full cursor-pointer"
                        title={t("delete")}
                    >
                        <Trash2 className="w-4 h-4" />
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("delete")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("confirmDelete")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>{t("cancel") || "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "..." : (t("confirm") || "Confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

const MessageCell = ({ message, t }: { message: string; t: (key: string) => string }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!message) return <span className="text-muted-foreground">—</span>;

    const shouldTruncate = message.length > 80 || message.split('\n').length > 2;

    return (
        <div className="text-sm text-default-500 max-w-[350px]">
            <div className={`whitespace-pre-line ${!isExpanded && shouldTruncate ? "line-clamp-2" : ""}`}>
                {message}
            </div>
            {shouldTruncate && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-primary text-xs font-semibold hover:underline mt-1 cursor-pointer block"
                >
                    {isExpanded ?  "See less" :  "See more"}
                </button>
            )}
        </div>
    );
};

export const baseColumns = ({ refresh, t }: { refresh: () => void; t: (key: string) => string }): ColumnDef<TransformedNotificationItem>[] => [
    {
        accessorKey: "groupName",
        header: "group",
        cell: ({ row }) => {
            const groupName = row.getValue("groupName") as string;
            const displayGroup = groupName === "Specific" ? (t("specific") || "Specific") : (t("allDoctors") || "All Doctors");
            const isSpecific = groupName === "Specific";
            return (
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isSpecific
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        : " bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                }`}>
                    {displayGroup}
                </div>
            );
        },
    },
    {
        accessorKey: "users",
        header: "recipients",
        cell: ({ row }) => {
            const users = row.original.users || [];
            if (users.length === 1) {
                return (
                    <div className="text-sm font-semibold text-default-700 dark:text-default-300">
                        {users[0].userName || "—"}
                    </div>
                );
            }
            return (
                <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {t("allDoctors") || "All Doctors"}
                </div>
            );
        },
    },
    {
        accessorKey: "title",
        header: t("notificationTitle"),
        cell: ({ row }) => {
            const title = row.getValue("title") as string;
            return (
                <div className="text-sm font-medium text-default-600 max-w-[200px] truncate" title={title}>
                    {title}
                </div>
            );
        },
    },
    {
        accessorKey: "message",
        header: t("message"),
        cell: ({ row }) => <MessageCell message={row.getValue("message") as string} t={t} />,
    },
    {
        accessorKey: "createdAt",
        header: t("createdAt"),
        cell: ({ row }) => {
            const createdAt = row.getValue("createdAt") as string;
            if (!createdAt) return <span className="text-muted-foreground">—</span>;
            try {
                return (
                    <div className="text-xs text-default-500 whitespace-nowrap">
                        {format(new Date(createdAt), "yyyy-MM-dd HH:mm")}
                    </div>
                );
            } catch {
                return <div className="text-xs text-default-500">{createdAt}</div>;
            }
        },
    },
    {
        accessorKey: "expired",
        header: t("expired"),
        cell: ({ row }) => {
            const expired = row.getValue("expired") as string;
            if (!expired) return <span className="text-muted-foreground">—</span>;
            try {
                return (
                    <div className="text-xs text-default-500 whitespace-nowrap">
                        {format(new Date(expired), "yyyy-MM-dd HH:mm")}
                    </div>
                );
            } catch {
                return <div className="text-xs text-default-500">{expired}</div>;
            }
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