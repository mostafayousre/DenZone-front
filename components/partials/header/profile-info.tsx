"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon"
import { signOut, auth } from "@/lib/auth";
import Image from "next/image";
import { Link } from '@/i18n/routing';
import Cookies from "js-cookie";

const ProfileInfo = () => {

  const handleSignOut = () => {
    Cookies.remove('authToken');
    Cookies.remove('userRole');
    Cookies.remove('userId');
    window.location.href = '/en';
  }

  return (
    <div className="block">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className=" cursor-pointer">
          <div className=" flex items-center gap-3  text-default-800 ">
            <span className="text-base  me-2.5 inline-block">
              <Icon icon="heroicons-outline:chevron-down"></Icon>
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="end">
          <DropdownMenuGroup>
            {[
              {
                name: "Settings",
                icon: "heroicons:paper-airplane",
                href: "/dashboard/settings"
              },
            ].map((item, index) => (
              <Link
                href={item.href}
                key={`info-menu-${index}`}
                className="cursor-pointer"
              >
                <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 cursor-pointer">
                  <Icon icon={item.icon} className="w-4 h-4" />
                  {item.name}
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSeparator className="mb-0 dark:bg-background" />
          <DropdownMenuItem
              onClick={handleSignOut}
            className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer"
          >
            <button type="button" className=" w-full  flex  items-center gap-2" >
              <Icon icon="heroicons:power" className="w-4 h-4" />
              Log out
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
// @ts-ignore
export default ProfileInfo;
