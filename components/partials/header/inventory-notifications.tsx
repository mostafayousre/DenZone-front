"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icon } from "@/components/ui/icon";
import { useSession } from "next-auth/react";
import useGetInventoryNotifications, { InventoryNotification } from "@/services/notifications/useGetInventoryNotifications";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

import Cookies from "js-cookie";

const InventoryNotifications = () => {
    const { data: session } = useSession();
    const locale = useLocale();
    const { data: notifications, loading, getNotifications } = useGetInventoryNotifications();

    const [selectedNotification, setSelectedNotification] = useState<InventoryNotification | null>(null);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const userId = session?.user?.id || Cookies.get("userId");
    const userRole = (session?.user?.role || Cookies.get("userRole"))?.toLowerCase();

    useEffect(() => {
        if (userId && userRole === "inventory") {
            getNotifications(userId);
            // Optional: Set up polling
            const interval = setInterval(() => getNotifications(userId), 60000); // every minute
            return () => clearInterval(interval);
        }
    }, [userId, userRole, getNotifications]);

    if (userRole !== "inventory") return null;

    const unreadCount = notifications.filter(n => n.status === 0).length;

    const dateLocale = locale === "ar" ? ar : enUS;

    return (
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
                <button type="button" className="relative focus:outline-hidden h-9 w-9 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border border-transparent hover:border-primary/20 shadow-sm">
                    <Icon icon="heroicons-outline:chat-bubble-left-right" className={unreadCount > 0 ? "animate-bounce h-5 w-5" : "h-5 w-5"} />
                    {/* <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute -top-1 -right-1"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-destructive/40 rounded-full animate-ping blur-[2px]" />
                                    <Badge className="w-5 h-5 p-0 text-[10px] rounded-full font-bold flex items-center justify-center border-2 border-background shadow-lg relative z-10" color="destructive">
                                        {unreadCount > 9 ? "+9" : unreadCount}
                                    </Badge>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence> */}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="z-[999] w-[320px] p-0 shadow-2xl border-primary/10 overflow-hidden rounded-xl bg-card"
            >
                <DropdownMenuLabel className="p-0">
                    <div className="flex justify-between items-center px-4 py-4 border-b border-default-100 bg-secondary/10">
                        <div className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Icon icon="heroicons:envelope-open" className="w-4 h-4 text-primary" />
                            {locale === "ar" ? "الرسائل" : "Messages"}
                        </div>
                        {unreadCount > 0 && (
                            <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                {unreadCount} {locale === "ar" ? "جديدة" : "new"}
                            </div>
                        )}
                    </div>
                </DropdownMenuLabel>
                <ScrollArea className="h-[350px]">
                    <div className="flex flex-col">
                        {loading && notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3">
                                <Icon icon="eos-icons:loading" className="w-8 h-8 text-primary animate-spin" />
                                <span className="text-xs text-muted-foreground">{locale === "ar" ? "جاري التحميل..." : "Loading..."}</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3 opacity-50">
                                <Icon icon="heroicons:chat-bubble-left-ellipsis" className="w-10 h-10" />
                                <span className="text-xs font-medium">{locale === "ar" ? "لا توجد رسائل" : "No messages found"}</span>
                            </div>
                        ) : (
                            notifications.map((item: InventoryNotification) => (
                                <DropdownMenuItem
                                    key={item.id}
                                    className="flex flex-col items-start gap-1 py-4 px-4 cursor-pointer hover:bg-secondary/20 transition-colors border-b border-default-50 last:border-0"
                                    onClick={() => setSelectedNotification(item)}
                                >
                                    <div className="flex justify-between w-full items-start gap-2">
                                        <div className="text-sm font-bold text-foreground line-clamp-1 flex-1">
                                            {item.title}
                                        </div>
                                        {item.status === 0 && (
                                            <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-none animate-pulse" />
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                        {item.message}
                                    </div>
                                    <div className="text-[10px] text-default-400 mt-1 flex items-center gap-1">
                                        <Icon icon="heroicons:clock" className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(item.createdAt), {
                                            addSuffix: true,
                                            locale: dateLocale,
                                        })}
                                    </div>
                                </DropdownMenuItem>
                            ))
                        )}
                    </div>
                </ScrollArea>
                <DropdownMenuSeparator className="m-0" />
                <div className="p-3 bg-secondary/5 text-center">
                    <button 
                        onClick={() => {
                            setIsDropdownOpen(false);
                            setShowAllNotifications(true);
                        }}
                        className="text-xs font-bold text-primary hover:underline transition-all"
                    >
                        {locale === "ar" ? "عرض جميع الرسائل" : "View all messages"}
                    </button>
                </div>
            </DropdownMenuContent>

            {/* Detail Dialog */}
            <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-primary/10 shadow-2xl">
                    <DialogHeader className="p-6 bg-secondary/10 border-b border-default-100">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5 text-primary" />
                            </div>
                            {selectedNotification?.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-default-400 mt-1 flex items-center gap-1">
                            <Icon icon="heroicons:clock" className="w-3 h-3" />
                            {selectedNotification && formatDistanceToNow(new Date(selectedNotification.createdAt), {
                                addSuffix: true,
                                locale: dateLocale,
                            })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="px-6 py-8">
                        <ScrollArea className="max-h-[50vh]">
                            <div className="bg-secondary/5 p-6 rounded-xl border border-default-100 text-foreground leading-relaxed whitespace-pre-wrap break-words">
                                {selectedNotification?.message}
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="p-4 bg-secondary/5 flex justify-end">
                        <button 
                            onClick={() => setSelectedNotification(null)}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:opacity-90 transition-all shadow-md active:scale-95"
                        >
                            {locale === "ar" ? "إغلاق" : "Close"}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* All Notifications Dialog */}
            <Dialog open={showAllNotifications} onOpenChange={setShowAllNotifications}>
                <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden border-primary/10 shadow-2xl rounded-2xl">
                    <DialogHeader className="p-6 bg-secondary/10 border-b border-default-100 flex-none">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl">
                                <Icon icon="heroicons:envelope-open" className="w-6 h-6 text-primary" />
                            </div>
                            {locale === "ar" ? "جميع الرسائل" : "All Messages"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden p-2">
                        <ScrollArea className="h-full px-4">
                            <div className="flex flex-col gap-4 py-4">
                                {notifications.map((item) => (
                                    <div 
                                        key={item.id}
                                        onClick={() => {
                                            setShowAllNotifications(false);
                                            setTimeout(() => setSelectedNotification(item), 100);
                                        }}
                                        className="p-5 rounded-2xl border border-default-100 hover:border-primary/20 hover:bg-primary/5 cursor-pointer transition-all duration-200 group relative overflow-hidden"
                                    >
                                        {item.status === 0 && (
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                        )}
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{item.title}</h4>
                                            <span className="text-[10px] bg-secondary/50 px-2 py-1 rounded-full text-default-500 font-medium whitespace-nowrap">
                                                {formatDistanceToNow(new Date(item.createdAt), {
                                                    addSuffix: true,
                                                    locale: dateLocale,
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                                            {item.message}
                                        </p>
                                        <div className="flex justify-end">
                                            <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                {locale === "ar" ? "اقرأ المزيد" : "Read more"}
                                                <Icon icon="heroicons:arrow-right" className="w-3 h-3 rtl:rotate-180" />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </DropdownMenu>
    );
};

export default InventoryNotifications;
