import { roleRoutes, defaultRouteByRole } from "@/lib/roleRoutes";
import Cookies from "js-cookie";

export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

function getLocalizedRoute(route: string, locale: string): string {
  if (route === "*") return route;
  if (route.startsWith(`/${locale}/`)) return route;
  if (/^\/[a-z]{2}\//.test(route)) {
    return route.replace(/^\/[a-z]{2}\//, `/${locale}/`);
  }
  return `/${locale}${route}`;
}

export function getMenuList(pathname: string, t: any, role: string, locale: string = 'en'): Group[] {
  const id = Cookies.get("userId")
  const rawAllowedRoutes = roleRoutes[role] || [];
  const allowedRoutes = new Set(
      rawAllowedRoutes.includes("*")
          ? ["*"]
          : rawAllowedRoutes.map(route => route.replace(/^\/[a-z]{2}\//, '/'))
  );

  const isAllowed = (href: string) => {
    if (allowedRoutes.has("*")) return true;

    const normalizedHref = href.replace(/^\/[a-z]{2}\//, '/');

    for (const route of Array.from(allowedRoutes)) {
      if (route === normalizedHref) return true;

      if (route.includes(":")) {
        const pattern = "^" + route
            .replace(/:[^/]+/g, "[^/]+") 
            .replace(/\//g, "\\/") + "$";
        if (new RegExp(pattern).test(normalizedHref)) {
          return true;
        }
      }
    }
    return false;
  };

  const localizeHref = (href: string): string => {
    if (!href.startsWith('/')) return href;
    if (/^\/[a-z]{2}\//.test(href)) return href;
    return `/${locale}${href}`;
  };

  const allMenus: Group[] = [
    {
      groupLabel: t("dashboard"),
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard/analytics",
          label: t("dashboard"),
          active: pathname.includes("/dashboard"),
          icon: "heroicons-outline:home",
          submenus: [
            {
              href: "/dashboard/analytics",
              label: t("analytics"),
              active: pathname === "/dashboard/analytics",
              icon: "",
              children: [],
            },
            
            {
              href: "/dashboard/order-list",
              label: t("orders"),
              active: pathname === "/dashboard/order-list",
              children: [],
              icon: "",
            },
            {
              href: "/dashboard/return-list",
              label: t("returns"),
              active: pathname === "/dashboard/return-list",
              children: [],
              icon: "",
            },
            {
              href: "/dashboard/categories",
              label: t("categories"),
              active: pathname === "/dashboard/categories",
              children: [],
              icon: "",
            },
            {
              href: "/dashboard/brand",
              label: t("brands"),
              active: pathname === "/dashboard/brand",
              children: [],
              icon: "",
            },
            {
                href: "/dashboard/banners",
                label: t("banners"),
                active: pathname === "/dashboard/banners",
                children: [],
                icon: "",
            },
            {
              href: "/dashboard/product-list",
              label: t("products"),
              active: pathname === "/dashboard/product-list",
              children: [],
              icon: "",
            },
            {
              href: "/dashboard/favorites",
              label: t("favorites"),
              active: pathname === "/dashboard/favorites",
              children: [],
              icon: "heroicons-outline:heart",
            },
             {
              href: "/dashboard/inventory-management",
              label: t("price-management"),
              active: pathname === "/dashboard/inventory-management",
              children: [],
              icon: "",
            },
            {
              href: `/dashboard/edit-user/${id}`,
              label: t("edit-user"),
              active: pathname.startsWith(`/dashboard/edit-user/`),
              children: [],
              icon: "",
            },
             {
              href: "/dashboard/register",
              label: t("register"),
              active: pathname === "/dashboard/register",
              icon: "",
              children: [],
            },
            
            {
              href: "/dashboard/user-rules",
              label: t("User Management"),
              active: pathname === "/dashboard/user-rules",
              children: [],
              icon: "",
            },
            // {
            //   href: "/dashboard/pharmacy-list",
            //   label: t("Doctors details"),
            //   active: pathname === "/dashboard/pharmacy-list",
            //   children: [],
            //   icon: "",
            // },
            // {
            //   href: "/dashboard/inventory-managers",
            //   label: t("Providers details"),
            //   active: pathname === "/dashboard/inventory-managers",
            //   children: [],
            //   icon: "",
            // },
           
            {
              href: "/dashboard/reports",
              label: t("Reports"),
              active: pathname === "/dashboard/reports",
              children: [],
              icon: "",
            },
            {
              href: "/dashboard/sales",
              label: t("sales"),
              active: pathname === "/dashboard/sales",
              children: [],
              icon: "",
            },
           
          ],
        },
      ],
    },
     {
      groupLabel: t("Upcoming Features"),
      id: "app",
      menus: [
        {
          id: "chat",
          href: "/app/chat",
          label: t("chat"),
          active: pathname.includes("/app/chat"),
          icon: "heroicons-outline:chat",
          submenus: [],
        },
        {
          id: "email",
          href: "/app/email",
          label: t("email"),
          active: pathname.includes("/app/email"),
          icon: "heroicons-outline:mail",
          submenus: [],
        },
        {
          id: "kanban",
          href: "/app/kanban",
          label: t("kanban"),
          active: pathname.includes("/app/kanban"),
          icon: "heroicons-outline:view-boards",
          submenus: [],
        },
        {
          id: "calendar",
          href: "/app/calendar",
          label: t("calendar"),
          active:pathname.includes("/app/calendar"),
          icon: "heroicons-outline:calendar",
          submenus: [],
        },
        {
          id: "todo",
          href: "/app/todo",
          label: t("todo"),
          active:pathname.includes("/app/todo"),
          icon: "heroicons-outline:clipboard-check",
          submenus: [],
        },
      ],
    },
  ];
  const filteredGroups: Group[] = [];

  for (const group of allMenus) {
    const filteredMenus: Menu[] = [];

    for (const menu of group.menus) {
      const filteredSubmenus: Submenu[] = menu.submenus?.filter((sub) => {
        if (role === "Inventory" && sub.href === "/dashboard/inventory-management") {
          return true;
        }
        return isAllowed(sub.href);
      }) ?? [];

      const includeMenu: boolean =
          isAllowed(menu.href) || filteredSubmenus.length > 0;

      if (includeMenu) {
        filteredMenus.push({
          ...menu,
          active: Boolean(menu.href && pathname.startsWith(menu.href)),
          submenus: filteredSubmenus.map((sub) => ({
            ...sub,
            active: pathname === sub.href,
          })),
        });
      }
    }

    if (filteredMenus.length > 0) {
      filteredGroups.push({
        ...group,
        menus: filteredMenus,
      });
    }
  }

  return filteredGroups;
}

export function getHorizontalMenuList(pathname: string, t: any, role: string, locale: string = 'en'): Group[] {
  const rawAllowedRoutes = roleRoutes[role] || [];

  const normalizedRoutes = rawAllowedRoutes.map(route =>
      route === "*" ? route : route.replace(/^\/[a-z]{2}\//, '/')
  );

  const localizeHref = (href: string): string => {
    if (!href.startsWith('/')) return href;
    if (/^\/[a-z]{2}\//.test(href)) return href;
    return `/${locale}${href}`;
  };

  const isAllowed = (href: string) => {
    if (normalizedRoutes.includes("*")) return true;
    const normalizedHref = href.replace(/^\/[a-z]{2}\//, '/');
    return normalizedRoutes.includes(normalizedHref);
  };

  const filterSubmenus = (submenus: Submenu[]): Submenu[] => {
    return submenus
        .map((submenu) => {
          const localizedHref = localizeHref(submenu.href);
          return {
            ...submenu,
            href: localizedHref,
            children: submenu.children || [],
            active: pathname === localizedHref,
          };
        })
        .filter((submenu) => isAllowed(submenu.href));
  };

  const groups: Group[] = [
    {
      groupLabel: t("dashboard"),
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: localizeHref("/dashboard/analytics"),
          label: t("dashboard"),
          active: pathname.includes(localizeHref("/dashboard")),
          icon: "heroicons-outline:home",
          submenus: filterSubmenus([
            {
              href: "/dashboard/analytics",
              label: t("analytics"),
              active: false,
              icon: "heroicons:arrow-trending-up",
              children: [],
            },
            {
              href: "/dashboard/dash-ecom",
              label: t("ecommerce"),
              active: false,
              icon: "heroicons:shopping-cart",
              children: [],
            },
            {
              href: "/dashboard/project",
              label: t("project"),
              active: false,
              icon: "heroicons:document",
              children: [],
            },
            {
              href: "/dashboard/crm",
              label: t("crm"),
              active: false,
              icon: "heroicons:share",
              children: [],
            },
            {
              href: "/dashboard/register",
              label: t("register"),
              active: false,
              icon: "heroicons:credit-card",
              children: [],
            },
          ]),
        },
      ],
    },
    {
      groupLabel: t("apps"),
      id: "app",
      menus: [
        {
          id: "app",
          href: localizeHref("/app/chat"),
          label: t("apps"),
          active: pathname.includes(localizeHref("/app")),
          icon: "heroicons-outline:chat",
          submenus: filterSubmenus([
            {
              href: "/app/chat",
              label: t("chat"),
              active: false,
              icon: "heroicons-outline:chat",
              children: [],
            },
            {
              href: "/app/email",
              label: t("email"),
              active: false,
              icon: "heroicons-outline:mail",
              children: [],
            },
            {
              href: "/app/kanban",
              label: t("kanban"),
              active: false,
              icon: "heroicons-outline:view-boards",
              children: [],
            },
            {
              href: "/app/calendar",
              label: t("calendar"),
              active: false,
              icon: "heroicons-outline:calendar",
              children: [],
            },
            {
              href: "/app/todo",
              label: t("todo"),
              active: false,
              icon: "heroicons-outline:clipboard-check",
              children: [],
            },
          ]),
        },
      ],
    },
  ];

  return groups
      .map((group) => ({
        ...group,
        menus: group.menus.filter((menu) => menu.submenus.length > 0),
      }))
      .filter((group) => group.menus.length > 0);
}

export function getLocalizedDefaultRoute(role: string, locale: string = 'en'): string {
  const route = defaultRouteByRole[role] || "/dashboard/analytics";
  return `/${locale}${route}`;
}