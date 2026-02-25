"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useConfig } from "@/hooks/use-config";
import { SidebarToggle } from "./sidebar-toggle"; 

const SidebarContent = ({ children }: { children: React.ReactNode }) => {
  const [config] = useConfig();

  if (config.menuHidden || config.layout === "horizontal") return null;

  return (
    <aside
      className={cn(
        "fixed z-50 bg-sidebar shadow-base lg:block hidden transition-all duration-300",
        {
          [`dark theme-${config.sidebarColor}`]: config.sidebarColor !== "light",
          "w-[248px]": !config.collapsed, // الحجم الطبيعي
          "w-[72px]": config.collapsed,   // الحجم المنكمش بالضغط فقط
          "h-full start-0": config.layout !== "semi-box",
        }
      )}
    >
      <div className="relative flex flex-col h-full">
        {/* منطقة الزرار العلوي داخل السايدبار */}
        <div className={cn("flex items-center px-4 py-4 mb-2", {
            "justify-center": config.collapsed,
            "justify-end": !config.collapsed
        })}>
             <SidebarToggle />
        </div>

        <div className="flex-1 overflow-y-auto">
            {children}
        </div>
      </div>
    </aside>
  );
};

export default SidebarContent;