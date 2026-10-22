"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import AxiosInstance from "@/lib/AxiosInstance";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Package,
  Layers,
  Search,
  Loader2,
  X,
  Check,
  Users,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BannerItem, HomeSection } from "../types";
import { HomeSectionApiItem } from "@/services/homeSections/getHomeSections";
import { ProviderDto } from "@/services/users/getProviders";
import { InventoryProductPriceDto } from "@/services/productPrice/getProductsByInventoryUser";

interface BannerLinkSelectorProps {
  banner: BannerItem;
  onChange: (updates: Partial<BannerItem>) => void;
  sections?: HomeSection[];
}

export const BannerLinkSelector: React.FC<BannerLinkSelectorProps> = ({
  banner,
  onChange,
}) => {
  const t = useTranslations("MobileHome.editModal");
  const locale = useLocale();
  const isAr = locale === "ar";

  // Sections fetched directly from /api/HomeSections
  const [apiSections, setApiSections] = useState<HomeSectionApiItem[]>([]);
  const [loadingSections, setLoadingSections] = useState<boolean>(false);

  // Providers / Inventories fetched from /api/Users/get-providers
  const [providers, setProviders] = useState<ProviderDto[]>([]);
  const [loadingProviders, setLoadingProviders] = useState<boolean>(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<string>("");

  // Products of selected inventory fetched from /api/ProductPrices/by-inventory-user/${inventoryId}
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProductPriceDto[]>([]);
  const [loadingInventoryProducts, setLoadingInventoryProducts] = useState<boolean>(false);
  const [productSearch, setProductSearch] = useState<string>("");
  const [isProductChangeOpen, setIsProductChangeOpen] = useState<boolean>(false);

  const productSearchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Helper to extract product image
  const extractProductImage = (item: any): string => {
    if (!item) return "";
    if (Array.isArray(item.images) && item.images.length > 0) {
      const first = item.images[0];
      if (typeof first === "string" && first.trim()) return first.trim();
      if (typeof first === "object" && first !== null) {
        return (
          first.url ||
          first.imageUrl ||
          first.imagePath ||
          first.imageName ||
          first.image ||
          ""
        );
      }
    }
    if (typeof item.images === "string" && item.images.trim()) {
      try {
        const parsed = JSON.parse(item.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          if (typeof first === "string" && first.trim()) return first.trim();
          if (typeof first === "object" && first !== null) {
            return (
              first.url ||
              first.imageUrl ||
              first.imagePath ||
              first.imageName ||
              first.image ||
              ""
            );
          }
        }
      } catch {
        if (item.images.startsWith("http")) return item.images.split(",")[0].trim();
      }
    }
    return (
      item.imageUrl ||
      item.image ||
      item.productImage ||
      item.imagePath ||
      item.imageName ||
      ""
    );
  };

  // 1. Fetch sections directly from /api/HomeSections
  const fetchSectionsFromApi = async () => {
    if (apiSections.length > 0) return;
    setLoadingSections(true);
    try {
      const res = await AxiosInstance.get<HomeSectionApiItem[]>("/api/HomeSections");
      if (res?.status === 200 && Array.isArray(res.data)) {
        setApiSections(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch sections from /api/HomeSections:", err);
    } finally {
      setLoadingSections(false);
    }
  };

  // 2. Fetch providers / inventories from /api/Users/get-providers
  const fetchProvidersFromApi = async () => {
    if (providers.length > 0) return;
    setLoadingProviders(true);
    try {
      const res = await AxiosInstance.get<ProviderDto[]>("/api/Users/get-providers");
      if (res?.status === 200 && Array.isArray(res.data)) {
        setProviders(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch providers:", err);
    } finally {
      setLoadingProviders(false);
    }
  };

  // 3. Fetch products of selected inventory from /api/ProductPrices/by-inventory-user/${inventoryId}
  const fetchProductsByInventory = async (invId: string, search: string = "") => {
    if (!invId) {
      setInventoryProducts([]);
      return;
    }
    setLoadingInventoryProducts(true);
    try {
      const res = await AxiosInstance.get(`/api/ProductPrices/by-inventory-user/${invId}`, {
        params: {
          page: 1,
          pageSize: 25,
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      });
      const items = res?.data?.data || res?.data?.items || res?.data || [];
      setInventoryProducts(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(`Failed to fetch products for inventory ${invId}:`, err);
      setInventoryProducts([]);
    } finally {
      setLoadingInventoryProducts(false);
    }
  };

  // Determine current active link type (external, product, or section)
  const currentType: "external" | "product" | "section" = React.useMemo(() => {
    if (banner.linkType === "product") return "product";
    if (banner.linkType === "section") return "section";
    if (banner.linkType === "external") return "external";

    if (banner.linkSectionId) return "section";
    if (banner.productPriceId) return "product";
    if (banner.targetId && apiSections.some((s) => s.id === banner.targetId)) return "section";
    if (banner.linkUrl && apiSections.some((s) => s.id === banner.linkUrl)) return "section";

    return "external";
  }, [banner.linkType, banner.linkSectionId, banner.productPriceId, banner.targetId, banner.linkUrl, apiSections]);

  // Load sections or providers on tab switch or mount
  useEffect(() => {
    if (currentType === "section") {
      fetchSectionsFromApi();
    } else if (currentType === "product") {
      fetchProvidersFromApi();
    }
  }, [currentType]);

  // Handle switching link type
  const handleTypeSelect = (type: "external" | "product" | "section") => {
    if (type === currentType) return;

    if (type === "external") {
      onChange({
        linkType: "external",
        productPriceId: null,
        linkSectionId: null,
        targetId: undefined,
        selectedProductName: undefined,
        selectedProductImage: undefined,
        selectedSectionTitle: undefined,
        linkUrl: banner.linkUrl?.startsWith("http") ? banner.linkUrl : "",
      });
    } else if (type === "product") {
      fetchProvidersFromApi();
      onChange({
        linkType: "product",
        linkSectionId: null,
        targetId: banner.productPriceId || undefined,
        linkUrl: banner.productPriceId || "",
        selectedSectionTitle: undefined,
      });
    } else if (type === "section") {
      fetchSectionsFromApi();
      onChange({
        linkType: "section",
        productPriceId: null,
        selectedProductName: undefined,
        selectedProductImage: undefined,
        linkSectionId: banner.linkSectionId || banner.targetId || null,
        linkUrl: banner.linkSectionId || banner.targetId || "",
        targetId: banner.linkSectionId || banner.targetId || undefined,
      });
    }
  };

  // Handle inventory selection
  const handleSelectInventory = (invId: string) => {
    setSelectedInventoryId(invId);
    setProductSearch("");
    fetchProductsByInventory(invId, "");
  };

  // Handle product search within selected inventory
  const handleProductSearchChange = (query: string) => {
    setProductSearch(query);
    if (productSearchTimeout.current) {
      clearTimeout(productSearchTimeout.current);
    }
    productSearchTimeout.current = setTimeout(() => {
      if (selectedInventoryId) {
        fetchProductsByInventory(selectedInventoryId, query);
      }
    }, 300);
  };

  // Handle selecting a product from inventory
  const handleSelectProduct = (prod: InventoryProductPriceDto) => {
    const prodTitle = prod.productName || prod.title || "Product";
    const prodImg = extractProductImage(prod);
    const chosenProvider = providers.find((p) => p.id === selectedInventoryId);

    onChange({
      linkType: "product",
      productPriceId: prod.id,
      linkSectionId: null,
      targetId: prod.id,
      linkUrl: prod.id,
      selectedProductName: prodTitle,
      selectedProductImage: prodImg,
    });
    setIsProductChangeOpen(false);
  };

  // Handle clearing product
  const handleClearProduct = () => {
    onChange({
      productPriceId: null,
      targetId: undefined,
      linkUrl: "",
      selectedProductName: undefined,
      selectedProductImage: undefined,
    });
  };

  // Handle section selection from /api/HomeSections
  const handleSelectSection = (sectionId: string) => {
    const matched = apiSections.find((s) => s.id === sectionId);
    onChange({
      linkType: "section",
      linkSectionId: sectionId, // Send "linkSectionId": "uuid"
      targetId: sectionId,
      linkUrl: sectionId,
      productPriceId: null,
      selectedSectionTitle: matched?.title,
    });
  };

  // Handle clearing section
  const handleClearSection = () => {
    onChange({
      linkSectionId: null,
      targetId: undefined,
      linkUrl: "",
      selectedSectionTitle: undefined,
    });
  };

  // Selected section resolution
  const activeSectionId = banner.linkSectionId || banner.targetId || banner.linkUrl || "";
  const currentSection = apiSections.find((s) => s.id === activeSectionId);

  return (
    <div className="space-y-2.5 col-span-1 sm:col-span-2 pt-2 border-t border-border/60">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
          <span>{t("linkActionType")}</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            ({isAr ? "وجهة النقر على البانر" : "Banner Click Destination"})
          </span>
        </Label>
      </div>

      {/* 3 Selectable Options */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-secondary/40 rounded-lg border border-border/60">
        {/* 1. External URL */}
        <button
          type="button"
          onClick={() => handleTypeSelect("external")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all select-none cursor-pointer",
            currentType === "external"
              ? "bg-background text-primary shadow-xs font-semibold border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t("linkTypeExternal")}</span>
        </button>

        {/* 2. Product */}
        <button
          type="button"
          onClick={() => handleTypeSelect("product")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all select-none cursor-pointer",
            currentType === "product"
              ? "bg-background text-primary shadow-xs font-semibold border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <Package className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t("linkTypeProduct")}</span>
        </button>

        {/* 3. Section */}
        <button
          type="button"
          onClick={() => handleTypeSelect("section")}
          className={cn(
            "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all select-none cursor-pointer",
            currentType === "section"
              ? "bg-background text-primary shadow-xs font-semibold border border-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t("linkTypeSection")}</span>
        </button>
      </div>

      {/* ---------------- Option 1: External URL ---------------- */}
      {currentType === "external" && (
        <div className="space-y-1 animate-in fade-in-50 duration-200">
          <div className="relative">
            <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t("externalUrlPlaceholder")}
              value={banner.linkUrl || ""}
              onChange={(e) =>
                onChange({
                  linkUrl: e.target.value,
                  linkType: "external",
                  productPriceId: null,
                  linkSectionId: null,
                  targetId: undefined,
                })
              }
              className="h-8.5 pl-8 text-xs font-mono bg-card"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isAr
              ? "سيتم فتح هذا الرابط الخارجي عند النقر على البانر"
              : "External web URL to open when banner is clicked"}
          </p>
        </div>
      )}

      {/* ---------------- Option 2: Product (Inventory -> Product) ---------------- */}
      {currentType === "product" && (
        <div className="space-y-2.5 animate-in fade-in-50 duration-200">
          {/* If a product is already selected and change mode is closed */}
          {banner.productPriceId && !isProductChangeOpen ? (
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg border bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2.5 min-w-0">
                {banner.selectedProductImage ? (
                  <img
                    src={banner.selectedProductImage}
                    alt=""
                    className="w-10 h-10 rounded-md object-cover border bg-white shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-md border bg-secondary/50 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {banner.selectedProductName || (isAr ? "منتج محدد" : "Selected Product")}
                    </span>
                    <Badge className="text-[9px] py-0 px-1 bg-primary/10 text-primary border border-primary/20">
                      Product
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[280px]">
                    ID: {banner.productPriceId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsProductChangeOpen(true)}
                  className="h-7 px-2.5 text-[11px] gap-1"
                >
                  <Search className="w-3 h-3" />
                  <span>{isAr ? "تغيير" : "Change"}</span>
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleClearProduct}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  title={isAr ? "إزالة المنتج" : "Remove product"}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 p-3 rounded-xl border bg-card shadow-2xs">
              {/* Step 1: Select Inventory / Provider */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span>{isAr ? "1. اختر المخزن / المورد (Inventory)" : "1. Select Inventory / Provider"}</span>
                  {loadingProviders && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                </Label>
                <Select
                  value={selectedInventoryId}
                  onValueChange={handleSelectInventory}
                >
                  <SelectTrigger className="h-8.5 text-xs bg-background">
                    <SelectValue
                      placeholder={
                        loadingProviders
                          ? (isAr ? "جاري تحميل المخازن..." : "Loading inventories...")
                          : (isAr ? "اختر المخزن لعرض منتجاته..." : "Select an inventory...")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[220px]">
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="font-semibold text-foreground">{p.fullName}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            (@{p.userName})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 2: Show and search products of chosen inventory */}
              {selectedInventoryId ? (
                <div className="space-y-2 pt-1 border-t border-border/50">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-primary" />
                      <span>{isAr ? "2. اختر المنتج من المخزن" : "2. Choose Product from Inventory"}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({inventoryProducts.length})
                      </span>
                    </Label>
                    {loadingInventoryProducts && (
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    )}
                  </div>

                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder={isAr ? "بحث في منتجات هذا المخزن..." : "Search products in this inventory..."}
                      value={productSearch}
                      onChange={(e) => handleProductSearchChange(e.target.value)}
                      className="h-8 pl-8 text-xs bg-background"
                    />
                  </div>

                  {/* Inventory Products List */}
                  <div className="max-h-[190px] overflow-y-auto space-y-1.5 divide-y divide-border/40 pr-1">
                    {loadingInventoryProducts ? (
                      <div className="py-6 flex flex-col items-center justify-center space-y-1.5">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-[11px] text-muted-foreground">
                          {isAr ? "جاري تحميل منتجات المخزن..." : "Loading inventory products..."}
                        </span>
                      </div>
                    ) : inventoryProducts.length === 0 ? (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        {isAr ? "لا توجد منتجات مطابقة لهذا المخزن" : "No products found for this inventory"}
                      </div>
                    ) : (
                      inventoryProducts.map((prod) => {
                        const isSelected = banner.productPriceId === prod.id;
                        const prodTitle = prod.productName || prod.title || "Product";
                        const prodPrice = prod.salesPrice ?? prod.price ?? 0;
                        const prodImg = extractProductImage(prod);

                        return (
                          <div
                            key={prod.id}
                            onClick={() => handleSelectProduct(prod)}
                            className={cn(
                              "flex items-center justify-between gap-2.5 p-2 rounded-md hover:bg-secondary/60 cursor-pointer transition-colors text-xs",
                              isSelected && "bg-primary/10 border border-primary/20"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {prodImg ? (
                                <img
                                  src={prodImg}
                                  alt=""
                                  className="w-8 h-8 rounded object-cover border bg-white shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded border bg-secondary/40 flex items-center justify-center shrink-0">
                                  <Package className="w-3.5 h-3.5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate max-w-[280px]">
                                  {prodTitle}
                                </p>
                                {prod.categoryName && (
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {prod.categoryName}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {prodPrice > 0 && (
                                <span className="font-semibold text-primary text-[11px]">
                                  {prodPrice} {isAr ? "ج.م" : "EGP"}
                                </span>
                              )}
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-primary" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-3 text-center text-[11px] text-muted-foreground border border-dashed rounded-lg bg-secondary/10">
                  {isAr ? "يرجى اختيار المخزن أولاً لعرض منتجاته" : "Please select an inventory first to load its products"}
                </div>
              )}

              {banner.productPriceId && isProductChangeOpen && (
                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsProductChangeOpen(false)}
                    className="h-7 text-xs text-muted-foreground"
                  >
                    {isAr ? "إلغاء التغيير" : "Cancel"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------------- Option 3: Section (from /api/HomeSections) ---------------- */}
      {currentType === "section" && (
        <div className="space-y-2 animate-in fade-in-50 duration-200">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <span>{isAr ? "اختر القسم من /api/HomeSections:" : "Select Section from /api/HomeSections:"}</span>
              </Label>
              {loadingSections && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span>{isAr ? "جاري جلب الأقسام..." : "Loading sections..."}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <Select
                value={activeSectionId}
                onValueChange={handleSelectSection}
              >
                <SelectTrigger className="h-8.5 text-xs bg-card flex-1">
                  <SelectValue
                    placeholder={
                      loadingSections
                        ? (isAr ? "جاري تحميل الأقسام..." : "Loading sections...")
                        : (isAr ? "اختر قسماً من القائمة..." : "Choose a section...")
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {apiSections.length === 0 && !loadingSections ? (
                    <div className="py-4 text-center text-xs text-muted-foreground">
                      {isAr ? "لا توجد أقسام متاحة حالياً" : "No sections found"}
                    </div>
                  ) : (
                    apiSections.map((sec) => (
                      <SelectItem
                        key={sec.id}
                        value={sec.id}
                        className="text-xs cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span className="font-semibold text-foreground truncate max-w-[280px]">
                            {sec.title || (isAr ? "قسم بدون عنوان" : "Untitled Section")}
                          </span>
                          <Badge className="text-[9px] py-0 px-1 bg-secondary text-muted-foreground font-mono shrink-0 border border-border">
                            {sec.typeKey || `Type ${sec.type}`}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {activeSectionId && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleClearSection}
                  className="h-8.5 w-8.5 text-muted-foreground hover:text-destructive shrink-0"
                  title={isAr ? "إلغاء التحديد" : "Clear selection"}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Details of selected section with linkSectionId */}
          {activeSectionId && (
            <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 space-y-1 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    {currentSection?.title || banner.selectedSectionTitle || (isAr ? "قسم محدد" : "Selected Section")}
                  </span>
                </div>
                {currentSection?.typeKey && (
                  <Badge className="text-[9px] py-0 px-1 bg-primary/10 text-primary border border-primary/20">
                    {currentSection.typeKey}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded border border-border/40">
                <span className="font-semibold text-primary">linkSectionId:</span>
                <span className="truncate">{activeSectionId}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BannerLinkSelector;
