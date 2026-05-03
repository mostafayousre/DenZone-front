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
          <div
              onClick={handleSignOut}
            className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer"
          >
            <button type="button" className=" w-full  flex  items-center gap-2 cursor-pointer" >
              <Icon icon="heroicons:power" className="w-4 h-4" />
              Log out
            </button>
          </div>

    </div>
  );
};
// @ts-ignore
export default ProfileInfo;
