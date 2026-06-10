export const routePermissions: Record<string, string | string[]> = {
  "/dashboard/analytics": "Permissions.Report.View",
  "/dashboard/order-list": "Permissions.Order.View",
  "/dashboard/order-details": "Permissions.Order.View",
  "/dashboard/edit-order": "Permissions.Order.Edit",
  "/dashboard/return-list": "Permissions.ReturnOrder.View",
  "/dashboard/return-details": "Permissions.ReturnOrder.View",
  "/dashboard/categories": "Permissions.Category.View",
  "/dashboard/add-category": "Permissions.Category.Create",
  "/dashboard/edit-category/:id": "Permissions.Category.Edit",
  "/dashboard/brand": "Permissions.Brand.View",
  "/dashboard/add-brand": "Permissions.Brand.Create",
  "/dashboard/edit-brand/:id": "Permissions.Brand.Edit",
  "/dashboard/banners": "Permissions.Banner.View",
  "/dashboard/add-banner": "Permissions.Banner.Create",
  "/dashboard/edit-banner/:id": "Permissions.Banner.Edit",
  "/dashboard/special-offers": "Permissions.SpecialOffer.View",
  "/dashboard/add-special-offer": "Permissions.SpecialOffer.Create",
  "/dashboard/edit-special-offer/:id": "Permissions.SpecialOffer.Edit",
  "/dashboard/coupons": "Permissions.Coupon.View",
  "/dashboard/add-coupon": "Permissions.Coupon.Create",
  "/dashboard/edit-coupon/:id": "Permissions.Coupon.Edit",
  "/dashboard/delivery-times": "Permissions.DeliveryTimeSlot.View",
  "/dashboard/product-list": "Permissions.Product.View",
  "/dashboard/add-product": "Permissions.Product.Create",
  "/dashboard/add-product-byExcel": "Permissions.Product.Create",
  "/dashboard/edit-product/:id": "Permissions.Product.Edit",
  "/dashboard/inventory-management": "Permissions.ProductPrice.View",
  "/dashboard/add-product-price": "Permissions.ProductPrice.Create",
  "/dashboard/edit-user/:id": "Permissions.User.Edit",
  "/dashboard/register": "Permissions.User.Create",
  "/dashboard/user-rules": "Permissions.User.View",
  "/dashboard/roles": "Permissions.Role.View",
  "/dashboard/add-role": "Permissions.Role.Create",
  "/dashboard/edit-role/:id": "Permissions.Role.Edit",
  
  // Reports
  "/dashboard/reports": "Permissions.Report.View",
  "/dashboard/reports/orders": "Permissions.Order.View",
  "/dashboard/reports/invoices": "Permissions.Invoice.View",
  "/dashboard/reports/invoices/details": "Permissions.Invoice.View",
  "/dashboard/reports/balance": "Permissions.BalanceReport.View",
  "/dashboard/reports/summary": "Permissions.Report.View",
  
  // Notifications
  "/dashboard/send-notification": "Permissions.Notification.Send",
  "/dashboard/notifications-list": "Permissions.Notification.View",
  
  // Locations
  "/dashboard/country": "Permissions.Country.View",
  "/dashboard/city": "Permissions.City.View",
  "/dashboard/area": "Permissions.Area.View",
  "/dashboard/zone": "Permissions.Zone.View",
  "/dashboard/area-zone": "Permissions.AreaZone.View",
  
  // Policies
  "/dashboard/policy": "Permissions.Policy.View",
  "/dashboard/policy/refund-policy": "Permissions.RefundPolicy.View",
  "/dashboard/policy/terms-and-conditions": "Permissions.TermsAndConditions.View",
  
  // Settings
  "/dashboard/settings": "Permissions.User.View",
};

/**
 * Normalizes a localized pathname and matches it against routePermissions mapping.
 * Handles dynamic routing patterns like /:id
 * 
 * @param pathname The raw window/router pathname (e.g., '/en/dashboard/edit-product/5')
 */
export const matchRoutePermission = (pathname: string): string | string[] | null => {
  if (!pathname) return null;

  // Normalize pathname: Strip the leading locale segment (e.g. /en/dashboard -> /dashboard)
  const cleanPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, "/").replace(/\/$/, ""); // also strip trailing slash

  // 1. Try direct exact match
  if (routePermissions[cleanPath] !== undefined) {
    return routePermissions[cleanPath];
  }

  // 2. Try pattern matching for dynamic paths containing parameters (e.g., :id)
  for (const [routePattern, permission] of Object.entries(routePermissions)) {
    if (routePattern.includes("/:")) {
      // Convert /dashboard/edit-product/:id to regex pattern ^/dashboard/edit-product/[^/]+$
      const regexPattern = "^" + routePattern
        .replace(/:[^/]+/g, "[^/]+")
        .replace(/\//g, "\\/") + "$";
      
      if (new RegExp(regexPattern).test(cleanPath)) {
        return permission;
      }
    }
  }

  // 3. Fallback: Prefix matching for nested child routes that might not be explicitly mapped
  const pathSegments = cleanPath.split("/").filter(Boolean);
  if (pathSegments.length > 2) {
    const parentPath = "/" + pathSegments.slice(0, 2).join("/");
    if (routePermissions[parentPath] !== undefined) {
      return routePermissions[parentPath];
    }
  }

  return null;
};
