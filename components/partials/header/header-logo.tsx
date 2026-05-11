'use client'
import React from 'react'
import { Link } from '@/components/navigation'
import DashCodeLogo from "@/components/dascode-logo"

const HeaderLogo = () => {
    return (
        <Link href="/dashboard/analytics" className="flex items-center overflow-visible select-none relative z-[70]">
            <DashCodeLogo className="max-w-[160px] min-w-[61px]" />
        </Link>
    )
}

export default HeaderLogo