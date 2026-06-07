"use client";

import React, { useEffect, useState } from 'react'
import { usePathname } from "@/components/navigation";
import { getMenuList, type Group, type Menu, type Submenu } from "@/lib/menus";

import IconNav from './icon-nav';
import SidebarNav from './sideabr-nav';
import { useTranslations } from 'next-intl';
import { useParams } from "next/navigation";
import { usePermissions } from '@/hooks/use-permissions';


export function MenuTwoColumn() {
    // translate
    const t = useTranslations("Menu")
    const params = useParams<{ locale: string; }>();
    const locale = params?.locale || "en";
    const pathname = usePathname();
    const { permissions, loading: permissionsLoading } = usePermissions();

    const [menuList, setMenuList] = useState<Group[]>([]);

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                if (!permissionsLoading) {
                    const menu = getMenuList(pathname, t, permissions, locale);
                    setMenuList(menu);
                }
            } catch (error) {
                console.error("Error generating menu:", error);
            }
        };

        fetchMenuData();
    }, [permissions, permissionsLoading, pathname, t, locale]);

    return (
        <>
            <IconNav menuList={menuList} />
            <SidebarNav menuList={menuList} />
        </>


    );
}
