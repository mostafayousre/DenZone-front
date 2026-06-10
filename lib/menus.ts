import Cookies from "js-cookie";

export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
  permission?: string;
};

export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
  permission?: string;
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
  permission?: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(pathname: string, t: any, permissions: string[] = [], locale: string = 'en'): Group[] {
  const id = Cookies.get("userId");
  const isSuperAdmin = permissions.includes("*") || permissions.includes("Permissions.All");

  const hasPerm = (perm?: string) => {
    if (!perm) return true; // Default to accessible if no permission defined
    return isSuperAdmin || permissions.includes(perm);
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
          permission: "",
          submenus: [
            {
              href: "/dashboard/analytics",
              label: t("analytics"),
              active: pathname === "/dashboard/analytics",
              icon: "",
              children: [],
              permission: "Permissions.Report.View", 
            },
            {
              href: "/dashboard/order-list",
              label: t("orders"),
              active: pathname === "/dashboard/order-list",
              children: [],
              icon: "",
              permission: "Permissions.Order.View",
            },
            {
              href: "/dashboard/return-list",
              label: t("returns"),
              active: pathname === "/dashboard/return-list",
              children: [],
              icon: "",
              permission: "Permissions.ReturnOrder.View",
            },
            {
              href: "/dashboard/categories",
              label: t("categories"),
              active: pathname === "/dashboard/categories",
              children: [],
              icon: "",
              permission: "Permissions.Category.View",
            },
            {
              href: "/dashboard/brand",
              label: t("brands"),
              active: pathname === "/dashboard/brand",
              children: [],
              icon: "",
              permission: "Permissions.Brand.View",
            },
            {
                href: "/dashboard/banners",
                label: t("ads"),
                active: pathname.includes("/dashboard/banners") || pathname.includes("/dashboard/special-offers"),
                icon: "heroicons-outline:megaphone",
                permission: "Permissions.Banner.View",
                children: [
                    {
                        href: "/dashboard/banners",
                        label: t("banners"),
                        active: pathname === "/dashboard/banners",
                        permission: "Permissions.Banner.View",
                    },
                    {
                        href: "/dashboard/special-offers",
                        label: t("specialOffers"),
                        active: pathname === "/dashboard/special-offers",
                        permission: "Permissions.SpecialOffer.View",
                    }
                ],
            },
            {
                href: "/dashboard/coupons",
                label: t("coupons"),
                active: pathname === "/dashboard/coupons",
                children: [],
                icon: "",
                permission: "Permissions.Coupon.View",
            },
            {
                href: "/dashboard/delivery-times",
                label: t("delivery-times"),
                active: pathname === "/dashboard/delivery-times",
                children: [],
                icon: "",
                permission: "Permissions.DeliveryTimeSlot.View",
            },
            {
              href: "/dashboard/product-list",
              label: t("products"),
              active: pathname === "/dashboard/product-list",
              children: [],
              icon: "",
              permission: "Permissions.Product.View",
            },
             {
              href: "/dashboard/inventory-management",
              label: t("price-management"),
              active: pathname === "/dashboard/inventory-management",
              children: [],
              icon: "",
              permission: "Permissions.ProductPrice.View",
            },
            {
              href: `/dashboard/edit-user/${id}`,
              label: t("edit-user"),
              active: pathname.startsWith(`/dashboard/edit-user/`),
              children: [],
              icon: "",
              permission: "Permissions.User.Edit",
            },
             {
              href: "/dashboard/register",
              label: t("register"),
              active: pathname === "/dashboard/register",
              icon: "",
              children: [],
              permission: "Permissions.User.Create",
            },
            {
              href: "/dashboard/user-rules",
              label: t("User Management"),
              active: pathname === "/dashboard/user-rules",
              children: [],
              icon: "",
              permission: "Permissions.User.View",
            },
            {
              href: "/dashboard/doctors",
              label: t("Doctors"),
              active: pathname === "/dashboard/doctors",
              children: [],
              icon: "",
              permission: "Permissions.User.View",
            },
            {
              href: "/dashboard/roles",
              label: t("Roles"), 
              active: pathname === "/dashboard/roles" || pathname.startsWith("/dashboard/edit-role") || pathname === "/dashboard/add-role",
              children: [],
              icon: "",
              permission: "Permissions.Role.View",
            },
            {
              href: "/dashboard/reports",
              label: t("Reports"),
              active: pathname === "/dashboard/reports" || pathname.startsWith("/dashboard/reports/"),
              icon: "",
              permission: "Permissions.Order.View",
              children: [
                {
                  href: "/dashboard/reports/orders",
                  label: t("orders"),
                  active: pathname === "/dashboard/reports/orders",
                  permission: "Permissions.Order.Vieww",
                },
                {
                  href: "/dashboard/reports/invoices",
                  label: t("invoices"),
                  active: pathname === "/dashboard/reports/invoices",
                  permission: "Permissions.Invoice.View",
                },
                {
                  href: "/dashboard/reports/balance",
                  label: t("balance"),
                  active: pathname === "/dashboard/reports/balance",
                  permission: "Permissions.BalanceReport.View",
                },
                {
                  href: "/dashboard/reports/summary",
                  label: t("summary"),
                  active: pathname === "/dashboard/reports/summary",
                  permission: "Permissions.Report.View",
                }
              ],
            },
            {
              href: "/dashboard/send-notification",
              label: t("notifications"),
              active: pathname.includes("/dashboard/send-notification") || pathname.includes("/dashboard/notifications-list"),
              icon: "heroicons-outline:bell",
              permission: "Permissions.Notification.View",
              children: [
                {
                  href: "/dashboard/send-notification",
                  label: t("send-notification"),
                  active: pathname === "/dashboard/send-notification",
                  permission: "Permissions.Notification.View",
                },
                {
                  href: "/dashboard/notifications-list",
                  label: t("view-notifications"),
                  active: pathname === "/dashboard/notifications-list",
                  permission: "Permissions.Notification.View",
                },
              ],
            },
            {
              href: "/dashboard/location",
              label: t("location"),
              active: pathname.startsWith("/dashboard/country") || 
                      pathname.startsWith("/dashboard/city") || 
                      pathname.startsWith("/dashboard/area") || 
                      pathname.startsWith("/dashboard/zone") || 
                      pathname.startsWith("/dashboard/area-zone"),
              icon: "",
              permission: "",
              children: [
                {
                  href: "/dashboard/country",
                  label: t("country"),
                  active: pathname === "/dashboard/country",
                  permission: "Permissions.Country.View",
                },
                {
                  href: "/dashboard/city",
                  label: t("city"),
                  active: pathname === "/dashboard/city",
                  permission: "Permissions.City.View",
                },
                {
                  href: "/dashboard/area",
                  label: t("area"),
                  active: pathname === "/dashboard/area",
                  permission: "Permissions.Area.View",
                },
                {
                  href: "/dashboard/zone",
                  label: t("zone"),
                  active: pathname === "/dashboard/zone",
                  permission: "Permissions.Zone.View",
                },
                {
                  href: "/dashboard/area-zone",
                  label: t("areaZone"),
                  active: pathname === "/dashboard/area-zone",
                  permission: "Permissions.AreaZone.View",
                },
              ],
            },
            {
              href: "/dashboard/policy",
              label: t("policy"),
              active: pathname.startsWith("/dashboard/policy"),
              icon: "",
              permission: "",
              children: [
                {
                  href: "/dashboard/policy",
                  label: t("policy"),
                  active: pathname === "/dashboard/policy",
                  permission: "Permissions.Policy.View",
                },
                {
                  href: "/dashboard/policy/refund-policy",
                  label: t("refund_policy"),
                  active: pathname === "/dashboard/policy/refund-policy",
                  permission: "Permissions.RefundPolicy.View",
                },
                {
                  href: "/dashboard/policy/terms-and-conditions",
                  label: t("terms_and_conditions"),
                  active: pathname === "/dashboard/policy/terms-and-conditions",
                  permission: "Permissions.TermsAndConditions.View",
                },
              ],
            },
            {
              href: "/dashboard/settings",
              label: t("settings"),
              active: pathname === "/dashboard/settings",
              children: [],
              icon: "",
              permission: "Permissions.User.View",
            },
          ],
        },
      ],
    },
  ];

  // Helper function to recursively filter sub-children levels
  const filterSubChildren = (children?: SubChildren[]): SubChildren[] => {
    if (!children) return [];
    return children
      .filter((child) => hasPerm(child.permission))
      .map((child) => ({
        ...child,
        href: child.href,
        active: pathname === child.href,
        children: child.children ? filterSubChildren(child.children) : (child.children ? [] : undefined),
      }));
  };

  // Helper function to recursively filter submenu levels
  const filterSubmenus = (submenus?: Submenu[]): Submenu[] => {
    if (!submenus) return [];
    const mapped: (Submenu | null)[] = submenus
      .filter((sub) => hasPerm(sub.permission))
      .map((sub): Submenu | null => {
        const filteredChildren = filterSubChildren(sub.children);
        const filteredSubs = filterSubmenus(sub.submenus);

        const originallyHadChildren = sub.children !== undefined && sub.children.length > 0;
        const originallyHadSubs = sub.submenus !== undefined && sub.submenus.length > 0;

        // If it originally had sub-items but all of them are now filtered out, prune this folder
        if (originallyHadChildren && filteredChildren.length === 0) {
          return null;
        }
        if (originallyHadSubs && filteredSubs.length === 0) {
          return null;
        }

        return {
          ...sub,
          href: sub.href,
          active: pathname === sub.href,
          children: sub.children ? filteredChildren : undefined,
          submenus: sub.submenus ? filteredSubs : undefined,
        };
      });

    return mapped.filter((sub): sub is Submenu => sub !== null);
  };

  const filteredGroups: Group[] = [];

  for (const group of allMenus) {
    const filteredMenus: Menu[] = [];

    for (const menu of group.menus) {
      if (!hasPerm(menu.permission)) continue;

      const filteredSubmenus = filterSubmenus(menu.submenus);

      // If the parent menu originally had submenus, but they are all filtered out, hide the parent
      if (menu.submenus && menu.submenus.length > 0 && filteredSubmenus.length === 0) {
        continue;
      }

      filteredMenus.push({
        ...menu,
        href: menu.href,
        active: Boolean(menu.href && pathname.startsWith(menu.href)),
        submenus: filteredSubmenus,
      });
    }

    if (filteredMenus.length > 0) {
      filteredGroups.push({
        ...group,
        id: group.id,
        groupLabel: group.groupLabel,
        menus: filteredMenus,
      });
    }
  }

  return filteredGroups;
}

export function getHorizontalMenuList(pathname: string, t: any, permissions: string[] = [], locale: string = 'en'): Group[] {
  const isSuperAdmin = permissions.includes("*") || permissions.includes("Permissions.All");

  const hasPerm = (perm?: string) => {
    if (!perm) return true;
    return isSuperAdmin || permissions.includes(perm);
  };

  const filterSubmenus = (submenus: Submenu[]): Submenu[] => {
    return submenus
      .map((submenu) => {
        return {
          ...submenu,
          href: submenu.href,
          children: submenu.children || [],
          active: pathname === submenu.href,
        };
      })
      .filter((submenu) => hasPerm(submenu.permission));
  };

  const groups: Group[] = [
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
          permission: "",
          submenus: filterSubmenus([
            {
              href: "/dashboard/analytics",
              label: t("analytics"),
              active: false,
              icon: "heroicons:arrow-trending-up",
              children: [],
              permission: "",
            },
            {
              href: "/dashboard/delivery-times",
              label: t("delivery-times"),
              active: false,
              icon: "heroicons:clock",
              children: [],
              permission: "Permissions.DeliveryTimeSlot.View",
            },
          ]),
        },
      ],
    },
  ];

  return groups
    .map((group) => ({
      ...group,
      menus: group.menus
        .filter((menu) => hasPerm(menu.permission) && menu.submenus.length > 0)
        .map((menu) => ({
          ...menu,
          submenus: filterSubmenus(menu.submenus),
        })),
    }))
    .filter((group) => group.menus.length > 0);
}

export function getLocalizedDefaultRoute(role: string, locale: string = 'en'): string {
  // Keeping this for backwards compatibility, but in the new system we route dynamically
  return `/${locale}/dashboard/analytics`;
}