"use client"; 

import React from 'react'
import HeaderContent from './header-content'
import ProfileInfo from './profile-info'
import ThemeSwitcher from './theme-switcher'
import { SheetMenu } from '@/components/partials/sidebar/menu/sheet-menu'
import HorizontalMenu from "./horizontal-menu"
import LocalSwitcher from './locale-switcher'
import HeaderLogo from "./header-logo"
import InventoryNotifications from './inventory-notifications'

const DashCodeHeader = () => {
    return (
        <>
            <HeaderContent>
                <div className="flex w-full items-center justify-between h-full overflow-visible">
                    <div className="flex-none flex items-center justify-start overflow-visible">
                        <HeaderLogo />
                    </div>

                    <div className="nav-tools flex items-center md:gap-4 gap-1.5 sm:gap-3 flex-none overflow-visible">
                        <InventoryNotifications />
                        <LocalSwitcher />
                        <ThemeSwitcher />
                        <ProfileInfo />
                        <div className="lg:hidden">
                            <SheetMenu />
                        </div>
                    </div>
                </div>
            </HeaderContent>
            <HorizontalMenu />
        </>
    )
}

export default DashCodeHeader;