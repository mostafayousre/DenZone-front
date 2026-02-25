"use client";

import React, {useEffect, useRef, useState} from 'react'
import {Ellipsis, Loader2} from "lucide-react";
import { usePathname } from "@/components/navigation";
import { cn } from "@/lib/utils";
import {getMenuList, Group} from "@/lib/menus";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip";
import { useConfig } from "@/hooks/use-config";
import MenuLabel from "../common/menu-label";
import MenuItem from "../common/menu-item";
import { CollapseMenuButton } from "../common/collapse-menu-button";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation'
import { getLangDir } from 'rtl-detect';
import { useMediaQuery } from '@/hooks/use-media-query';
import Cookies from "js-cookie";

export function MenuClassic({ }) {
    const t = useTranslations("Menu");
    const pathname = usePathname();
    const params = useParams<{ locale: string; }>();
    const direction = getLangDir(params?.locale ?? '');
    const isDesktop = useMediaQuery('(min-width: 1280px)');
    const locale = params?.locale || "en";

    const [config] = useConfig();
    const collapsed = config.collapsed;

    const scrollableNodeRef = useRef<HTMLDivElement>(null);
    const [menuList, setMenuList] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const roleFromCookie = Cookies.get('userRole');

    useEffect(() => {
        if (!roleFromCookie) return;
        setLoading(true);
        const menu = getMenuList(pathname, t, roleFromCookie, locale);
        setMenuList(menu);
        setLoading(false);
    }, [pathname, t, locale, roleFromCookie]);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="text-blue-500 animate-spin w-6 h-6" />
            </div>
        );
    }

    return (
        <ScrollArea className="h-full [&>div>div[style]]:block!" dir={direction} ref={scrollableNodeRef}>
          <nav className="mt-4 w-full">
    <ul className={cn("flex flex-col gap-2 w-full transition-all duration-300", {
        "px-4 items-start": !collapsed,
        "px-0 items-center": collapsed 
    })}>
        {menuList?.map(({ groupLabel, menus }, index) => (
            <li className="w-full flex flex-col items-center" key={index}>
                {groupLabel && !collapsed && (
                    <div className="w-full flex transition-all duration-200 justify-start mb-2">
                        <MenuLabel label={groupLabel} />
                    </div>
                )}

                <div className="flex flex-col gap-1 w-full items-center">
                    {menus.map((item, menuIndex) => (
                        <div key={menuIndex} className="w-full flex justify-center">
                            {item.submenus.length === 0 ? (
                                <TooltipProvider disableHoverableContent>
                                    <Tooltip delayDuration={100}>
                                        <TooltipTrigger asChild>
                                            <div className="w-full flex justify-center">
                                                <MenuItem 
                                                    {...item}
                                                    collapsed={collapsed} 
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        {collapsed && (
                                            <TooltipContent side="right">
                                                {item.label}
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            ) : (
                                <div className="w-full flex justify-center">
                                    <CollapseMenuButton
                                        {...item}
                                        collapsed={collapsed}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </li>
        ))}
    </ul>
</nav>
        </ScrollArea>
    );
}