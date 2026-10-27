"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Search,
  CheckCircle2,
  Users,
  Package,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import { HomeSection, SectionType, BannerItem, ProductItem } from "../types";
import { BannerLinkSelector } from "./BannerLinkSelector";
import { cn } from "@/lib/utils";
import useAddHomeSectionItems, {
  HomeSectionItemPayload,
} from "@/services/homeSections/addHomeSectionItems";
import useDeleteHomeSectionItem from "@/services/homeSections/deleteHomeSectionItem";
import useGetHomeSectionById from "@/services/homeSections/getHomeSectionById";
import useGetProviders from "@/services/users/getProviders";
import useGettingPricesByInventoryId from "@/services/productPrice/gettingPricesByInventoryId";
import { Price } from "@/types/price";

interface EditSectionModalProps {
  section: HomeSection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedSection: HomeSection) => void;
  availableSections?: HomeSection[];
}

export const EditSectionModal: React.FC<EditSectionModalProps> = ({
  section,
  open,
  onOpenChange,
  onSave,
  availableSections = [],
}) => {
  const t = useTranslations("MobileHome");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [formData, setFormData] = useState<HomeSection | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Home section items service
  const { addHomeSectionItems } = useAddHomeSectionItems();
  const { deleteHomeSectionItem } = useDeleteHomeSectionItem();
  const { getHomeSectionById, loading: isLoadingSectionDetails } = useGetHomeSectionById();

  // Featured Products - Providers & Products services
  const { providers, loading: loadingProviders, getProviders } = useGetProviders();
  const {
    prices: providerProducts,
    loading: loadingProducts,
    gettingPricesByInventoryId,
    totalPages,
    totalCount,
  } = useGettingPricesByInventoryId();

  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [productSearch, setProductSearch] = useState<string>("");
  const [productPage, setProductPage] = useState<number>(1);

  useEffect(() => {
    if (!section) return;

    // Set initial data immediately
    setFormData(JSON.parse(JSON.stringify(section)));

    // Fetch fresh section data and items from /api/HomeSections/{id}
    if (open && section.id && !section.isStatic) {
      getHomeSectionById(section.id)
        .then((apiSection) => {
          if (!apiSection) return;

          const secType: SectionType =
            (apiSection.typeKey as SectionType) ||
            (apiSection.type === 1 ? "hero_banner" : "featured_products");

          setFormData((prev) => {
            if (!prev) return prev;
            const currentConfig = prev.config || {};
            const nextConfig = { ...currentConfig };

            if (Array.isArray(apiSection.items)) {
              if (
                secType === "hero_banner" ||
                apiSection.type === 1 ||
                currentConfig.banners !== undefined
              ) {
                nextConfig.banners = apiSection.items.map((it: any) => ({
                  id: it.id || `b_${Date.now()}`,
                  kind: it.kind ?? 1,
                  title: it.title || "",
                  subtitle: it.subtitle || "",
                  price: it.price ?? 0,
                  imageUrl: it.imageUrl || it.imageName || it.imageFile || it.image || "",
                  linkUrl: it.linkUrl || it.link || "",
                  productPriceId: it.productPriceId || null,
                  linkSectionId: it.linkSectionId || null,
                  categoryId: it.categoryId || null,
                  brandId: it.brandId || null,
                }));
              } else if (
                secType === "featured_products" ||
                apiSection.type === 4 ||
                currentConfig.products !== undefined
              ) {
                nextConfig.products = apiSection.items.map((it: any) => {
                  let img = it.imageUrl || it.image || it.productImage || "";
                  if (!img && Array.isArray(it.images) && it.images.length > 0) {
                    const first = it.images[0];
                    img =
                      typeof first === "string"
                        ? first
                        : first?.url || first?.imageUrl || first?.imagePath || "";
                  }
                  return {
                    id: it.id || `p_${Date.now()}`,
                    kind: it.kind ?? 2,
                    productPriceId: it.productPriceId || it.id,
                    title: it.title || "Product",
                    subtitle: it.subtitle || "",
                    category: it.categoryName || it.category || "Supplies",
                    price: it.price ?? 0,
                    imageUrl: img,
                    linkUrl: it.linkUrl || "",
                    categoryId: it.categoryId || null,
                    brandId: it.brandId || null,
                    inStock: true,
                  };
                });
              }
            }

            return {
              ...prev,
              id: apiSection.id,
              title: apiSection.title,
              subtitle: apiSection.subtitle,
              enabled: apiSection.isVisible ?? prev.enabled ?? true,
              items: apiSection.items || [],
              config: nextConfig,
              startDate: apiSection.startDate || prev.startDate,
              endDate: apiSection.endDate || prev.endDate,
              lastUpdated: apiSection.createdAt || prev.lastUpdated,
            };
          });
        })
        .catch((err) => {
          console.error("Failed to fetch section details from /api/HomeSections/{id}:", err);
        });
    }
  }, [open, section?.id]);

  const isBannerSection =
    formData?.type === "hero_banner" ||
    formData?.typeNumber === 1 ||
    formData?.type === "promo_grid_2x" ||
    formData?.config.banners !== undefined;

  const isFeaturedProducts =
    formData?.type === "featured_products" ||
    formData?.typeNumber === 4;

  // Load providers when modal opens for Featured Products
  useEffect(() => {
    if (open && isFeaturedProducts) {
      getProviders().catch(() => {});
    }
  }, [open, isFeaturedProducts]);

  // Load products when provider, page, or search changes
  useEffect(() => {
    if (open && isFeaturedProducts && selectedProviderId) {
      const timer = setTimeout(() => {
        gettingPricesByInventoryId(
          selectedProviderId,
          productPage,
          10,
          undefined,
          productSearch
        ).catch(() => {});
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, isFeaturedProducts, selectedProviderId, productPage, productSearch]);

  if (!formData) return null;

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);

    try {
      // 1. If it's a banner section, POST /api/HomeSections/{id}/items (kind: 1)
      if (isBannerSection && formData.id) {
        const bannersList = formData.config.banners || [];

        // Client-side validation: Banner items require an image (upload ImageFile or provide ImageUrl)
        for (let i = 0; i < bannersList.length; i++) {
          const b = bannersList[i];
          const hasFile = Boolean(
            b.imageFile &&
              ((b.imageFile as any) instanceof File ||
                (b.imageFile as any) instanceof Blob)
          );
          const hasUrl =
            typeof b.imageUrl === "string" &&
            b.imageUrl.trim() !== "" &&
            !b.imageUrl.startsWith("blob:");
          if (!hasFile && !hasUrl) {
            toast.error(
              isAr
                ? `البانر رقم ${i + 1} يتطلب صورة (قم برفع ملف أو كتابة رابط الصورة)`
                : `Banner #${i + 1} requires an image (upload ImageFile or provide ImageUrl)`
            );
            setIsSaving(false);
            return;
          }
        }

        const payloadItems: HomeSectionItemPayload[] = bannersList.map((b) => ({
          kind: 1,
          title: b.title || "",
          subtitle: b.subtitle || "",
          imageUrl:
            typeof b.imageUrl === "string" && !b.imageUrl.startsWith("blob:")
              ? b.imageUrl.trim()
              : "",
          linkUrl: b.linkUrl || "",
          productPriceId: b.productPriceId || null,
          linkSectionId: b.linkSectionId || null,
          imageFile:
            (b.imageFile as any) instanceof File ||
            (b.imageFile as any) instanceof Blob
              ? b.imageFile
              : null,
        }));

        await addHomeSectionItems(formData.id, {
          items: payloadItems,
        });

        toast.success(
          isAr ? "تم حفظ بنود البانرات بنجاح" : "Banner items saved successfully"
        );
      }

      // 2. If it's a featured products section, POST /api/HomeSections/{id}/items (kind: 2)
      if (isFeaturedProducts && formData.id) {
        const productsList = formData.config.products || [];

        const payloadItems: HomeSectionItemPayload[] = productsList.map((p) => {
          const effectiveOldPrice =
            p.oldPrice !== undefined && p.oldPrice !== null
              ? p.oldPrice
              : p.salesPrice !== undefined && p.salesPrice !== null
              ? p.salesPrice
              : p.price ?? null;

          const effectiveDiscountRate =
            p.discountRate !== undefined &&
            p.discountRate !== null &&
            String(p.discountRate).trim() !== "" &&
            !isNaN(Number(p.discountRate))
              ? Number(p.discountRate)
              : null;

          return {
            kind: 2,
            title: p.title || "",
            oldPrice: effectiveOldPrice,
            discountRate: effectiveDiscountRate,
            imageUrl:
              p.imageUrl && !p.imageUrl.startsWith("blob:") ? p.imageUrl : "",
            productPriceId: p.productPriceId || p.id || null,
            imageFile: p.imageFile || null,
          };
        });

        await addHomeSectionItems(formData.id, {
          items: payloadItems,
        });

        toast.success(
          isAr ? "تم حفظ منتجات القسم بنجاح" : "Section products saved successfully"
        );
      }

      onSave({
        ...formData,
        lastUpdated: new Date().toISOString(),
      });
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        (isAr ? "حدث خطأ أثناء حفظ البنود" : "Failed to save items");
      toast.error(errorMessage);

      // Still persist local update
      onSave({
        ...formData,
        lastUpdated: new Date().toISOString(),
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to extract first image from product or item
  const extractProductImage = (item: any): string => {
    if (!item) return "";

    // 1. Array of images (e.g. images: ["https://dentzoneapi.runasp.net/..."])
    if (Array.isArray(item.images) && item.images.length > 0) {
      const first = item.images[0];
      if (typeof first === "string" && first.trim()) return first.trim();
      if (typeof first === "object" && first !== null) {
        const url =
          first.url ||
          first.imageUrl ||
          first.imagePath ||
          first.imageName ||
          first.image ||
          "";
        if (typeof url === "string" && url.trim()) return url.trim();
      }
    }

    // 2. If images is serialized JSON string
    if (typeof item.images === "string" && item.images.trim()) {
      try {
        const parsed = JSON.parse(item.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          if (typeof first === "string" && first.trim()) return first.trim();
          if (typeof first === "object" && first !== null) {
            const url =
              first.url ||
              first.imageUrl ||
              first.imagePath ||
              first.imageName ||
              first.image ||
              "";
            if (typeof url === "string" && url.trim()) return url.trim();
          }
        }
      } catch {
        if (item.images.startsWith("http")) {
          return item.images.split(",")[0].trim();
        }
      }
    }

    // 3. Fallback direct image properties
    return (
      item.imageUrl ||
      item.image ||
      item.productImage ||
      item.imagePath ||
      item.imageName ||
      ""
    );
  };

  // Add/Remove Banner Helpers
  const handleAddBanner = () => {
    const newBanner: BannerItem = {
      id: `b_${Date.now()}`,
      title: "",
      subtitle: "",
      imageUrl: "",
      imageFile: null,
      linkUrl: "",
    };
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        banners: [...(formData.config.banners || []), newBanner],
      },
    });
  };

  const handleRemoveBanner = async (index: number) => {
    const banner = formData.config.banners?.[index];
    if (!banner) return;

    // If item has a database id (not local temp b_), call DELETE /api/HomeSections/{id}/items/{itemId}
    if (formData.id && banner.id && !banner.id.startsWith("b_")) {
      setDeletingItemId(banner.id);
      try {
        await deleteHomeSectionItem(formData.id, banner.id);
        toast.success(
          isAr ? "تم حذف البانر بنجاح" : "Banner item deleted successfully"
        );
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          (isAr ? "فشل حذف البانر" : "Failed to delete banner item");
        toast.error(errorMsg);
        setDeletingItemId(null);
        return;
      } finally {
        setDeletingItemId(null);
      }
    }

    const updated = (formData.config.banners || []).filter((_, i) => i !== index);
    const updatedForm = {
      ...formData,
      config: { ...formData.config, banners: updated },
    };
    setFormData(updatedForm);
    onSave(updatedForm);
  };

  const handleUpdateBanner = (index: number, field: keyof BannerItem, val: any) => {
    const updated = [...(formData.config.banners || [])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({
      ...formData,
      config: { ...formData.config, banners: updated },
    });
  };

  const handleUpdateBannerUpdates = (index: number, updates: Partial<BannerItem>) => {
    const updated = [...(formData.config.banners || [])];
    updated[index] = { ...updated[index], ...updates };
    setFormData({
      ...formData,
      config: { ...formData.config, banners: updated },
    });
  };

  // Add product from provider inventory into section's products
  const handleAddProductFromProvider = (item: Price | any) => {
    const isAlreadyAdded = formData.config.products?.some(
      (p) => (p.productPriceId && p.productPriceId === item.id) || p.id === item.id
    );
    if (isAlreadyAdded) return;

    const firstImage = extractProductImage(item);

    const newProd: ProductItem = {
      id: item.id || `p_${Date.now()}`,
      productPriceId: item.id,
      title: item.productName || item.title || "Dental Product",
      category: item.categoryName || "Supplies",
      price: item.salesPrice ?? item.price ?? item.purchasePrice ?? 0,
      salesPrice: item.salesPrice ?? null,
      oldPrice: item.salesPrice ?? null,
      discountRate: item.discountRate ?? null,
      imageUrl: firstImage,
      inStock: item.inStock ?? true,
      rating: item.rating ?? 5.0,
      reviewsCount: item.reviewsCount ?? 0,
    };

    setFormData({
      ...formData,
      config: {
        ...formData.config,
        products: [...(formData.config.products || []), newProd],
      },
    });
  };

  const handleRemoveProduct = async (index: number) => {
    const product = formData.config.products?.[index];
    if (!product) return;

    // If item has a database id (not local temp p_), call DELETE /api/HomeSections/{id}/items/{itemId}
    if (formData.id && product.id && !product.id.startsWith("p_")) {
      setDeletingItemId(product.id);
      try {
        await deleteHomeSectionItem(formData.id, product.id);
        toast.success(
          isAr ? "تم حذف المنتج بنجاح" : "Product item deleted successfully"
        );
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          (isAr ? "فشل حذف المنتج" : "Failed to delete product item");
        toast.error(errorMsg);
        setDeletingItemId(null);
        return;
      } finally {
        setDeletingItemId(null);
      }
    }

    const updated = (formData.config.products || []).filter((_, i) => i !== index);
    const updatedForm = {
      ...formData,
      config: { ...formData.config, products: updated },
    };
    setFormData(updatedForm);
    onSave(updatedForm);
  };

  const handleUpdateProduct = (index: number, field: keyof ProductItem, val: any) => {
    const updated = [...(formData.config.products || [])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({
      ...formData,
      config: { ...formData.config, products: updated },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSaving && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[700px] max-h-[88vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold">
                {isAr ? "إضافة عناصر إلى القسم" : "Add Items to Section"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isAr
                  ? "إضافة بانرات أو منتجات إلى هذا القسم "
                  : "Add banners or products to this section"}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {isLoadingSectionDetails && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>{isAr ? "جاري جلب البيانات..." : "Loading..."}</span>
                </div>
              )}
              <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/20">
                {formData.type}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 overflow-y-auto max-h-[65vh] space-y-4">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{t("editModal.sectionTitleLabel")}</Label>
              <Input
                value={formData.title}
                disabled
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-xs h-8.5"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{t("editModal.sectionSubtitleLabel")}</Label>
              <Input
                value={formData.subtitle || ""}
                disabled
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="text-xs h-8.5"
              />
            </div>
          </div>

          {/* Visibility switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30">
            <div>
              <p className="text-xs font-semibold text-foreground">{t("editModal.statusLabel")}</p>
              <p className="text-[11px] text-muted-foreground">{t("editModal.statusDesc")}</p>
            </div>
            <Switch
              disabled
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            />
          </div>

          {/* Banners list if section is a banner */}
          {isBannerSection && (
            <div className="space-y-2.5 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">
                    {t("editModal.bannersLabel")} ({formData.config.banners?.length || 0})
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    {isAr
                      ? "البنود اللي هتاخدها هتحفظ"
                      : "items you add will be saved"}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleAddBanner} className="gap-1 h-7 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("editModal.addBanner")}</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {formData.config.banners?.map((b, idx) => (
                  <div key={b.id || idx} className="p-3.5 rounded-xl border bg-card space-y-2.5 text-xs shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {b.imageFile instanceof File || (b.imageUrl && !b.imageUrl.startsWith("blob:")) ? (
                          <img
                            src={
                              b.imageFile instanceof File
                                ? URL.createObjectURL(b.imageFile)
                                : b.imageUrl
                            }
                            alt=""
                            className="w-8 h-8 rounded object-cover border shrink-0 bg-white"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded border shrink-0 bg-secondary/30 flex items-center justify-center">
                            <Package className="w-4 h-4 text-muted-foreground/50" />
                          </div>
                        )}
                        <span className="font-bold text-primary truncate">
                          #{idx + 1} {b.title || (isAr ? "بانر" : "Banner")}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={deletingItemId === b.id}
                        className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => handleRemoveBanner(idx)}
                        title={isAr ? "حذف البانر" : "Delete Banner"}
                      >
                        {deletingItemId === b.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          {isAr ? "العنوان (Title)" : "Title"}
                        </Label>
                        <Input
                          placeholder={t("editModal.bannerTitle")}
                          value={b.title}
                          onChange={(e) => handleUpdateBanner(idx, "title", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          {isAr ? "الوصف الفرعي (Subtitle)" : "Subtitle"}
                        </Label>
                        <Input
                          placeholder={isAr ? "الوصف الفرعي" : "Banner subtitle"}
                          value={b.subtitle || ""}
                          onChange={(e) => handleUpdateBanner(idx, "subtitle", e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">
                          {isAr ? "صورة البانر (ملف أو رابط)" : "Banner Image (File or URL)"}
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder={t("editModal.bannerImageUrl")}
                            value={b.imageUrl || ""}
                            onChange={(e) => {
                              handleUpdateBanner(idx, "imageUrl", e.target.value);
                              if (b.imageFile) {
                                handleUpdateBanner(idx, "imageFile", null);
                              }
                            }}
                            className="h-8 text-xs font-mono flex-1"
                          />
                          <label className="cursor-pointer shrink-0">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleUpdateBanner(idx, "imageFile", file);
                                }
                              }}
                            />
                            <div className="h-8 px-2.5 rounded-md border bg-secondary/50 hover:bg-secondary flex items-center gap-1.5 text-xs text-foreground cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>{isAr ? "رفع" : "Upload"}</span>
                            </div>
                          </label>
                        </div>
                        {b.imageFile instanceof File && (
                          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit mt-1">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span className="font-medium truncate max-w-[200px]">{b.imageFile.name}</span>
                            <button
                              type="button"
                              className="ml-1 text-muted-foreground hover:text-destructive text-[11px]"
                              onClick={() => handleUpdateBanner(idx, "imageFile", null)}
                              title={isAr ? "حذف الملف" : "Remove file"}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Banner Link Selector: 3 options (External URL | Product | Section) */}
                      <BannerLinkSelector
                        banner={b}
                        onChange={(updates) => handleUpdateBannerUpdates(idx, updates)}
                        sections={availableSections}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Products Section: Provider selector & Product picker */}
          {isFeaturedProducts && (
            <div className="space-y-4 pt-2 border-t">
              {/* Provider Selection */}
              <div className="space-y-2 p-3.5 rounded-xl border bg-muted/20">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <Label className="text-xs font-bold text-foreground">
                    {isAr ? "اختيار المورد (Select Provider)" : "Select Provider"}
                  </Label>
                  {loadingProviders && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                </div>

                <Select
                  value={selectedProviderId}
                  onValueChange={(val) => {
                    setSelectedProviderId(val);
                    setProductPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs bg-card">
                    <SelectValue
                      placeholder={
                        loadingProviders
                          ? (isAr ? "جاري تحميل الموردين..." : "Loading providers...")
                          : (isAr ? "اختر مورد لعرض منتجاته..." : "Choose a provider...")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-[220px]">
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs cursor-pointer">
                        <div className="flex items-center gap-2">
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

              {/* Provider Products Browser */}
              {selectedProviderId && (
                <div className="space-y-2.5 p-3.5 rounded-xl border bg-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      <Label className="text-xs font-bold text-foreground">
                        {isAr ? "منتجات المورد" : "Provider Products"} ({totalCount})
                      </Label>
                      {loadingProducts && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                    </div>

                    {/* Search box for products */}
                    <div className="relative w-full sm:w-60">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder={isAr ? "بحث عن منتج..." : "Search products..."}
                        value={productSearch}
                        onChange={(e) => {
                          setProductSearch(e.target.value);
                          setProductPage(1);
                        }}
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                    {loadingProducts ? (
                      <div className="py-8 flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">
                          {isAr ? "جاري جلب المنتجات..." : "Loading products..."}
                        </span>
                      </div>
                    ) : providerProducts.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        {isAr ? "لا توجد منتجات لهذا المورد حالياً" : "No products found for this provider"}
                      </div>
                    ) : (
                      providerProducts.map((prod) => {
                        const isAdded = formData.config.products?.some(
                          (p) =>
                            (p.productPriceId && p.productPriceId === prod.id) ||
                            p.id === prod.id
                        );

                        const prodTitle = prod.productName || prod.title || "Product";
                        const prodPrice = prod.salesPrice ?? prod.price ?? 0;
                        const prodCategory = prod.categoryName || "";
                        const prodImage = extractProductImage(prod);
                        const prodQuantity = prod.stockQuantity;

                        return (
                          <div
                            key={prod.id}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-lg border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-10 rounded-md border shrink-0 bg-white flex items-center justify-center overflow-hidden">
                                {prodImage ? (
                                  <img
                                    src={prodImage}
                                    alt={prodTitle}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-muted-foreground/50" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs font-semibold text-foreground truncate">
                                  {prodTitle}
                                </h5>
<p className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
product Quantity : <span className="font-bold text-red-600 dark:text-emerald-400">{prodQuantity}</span>
</p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                  {prodCategory && <span>{prodCategory}</span>}
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    {prodPrice} EGP
                                  </span>
                                  {Boolean(prod.discountRate && prod.discountRate > 0) && (
                                    <span className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-1 rounded border border-rose-200 dark:border-rose-800">
                                      -{prod.discountRate}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant={isAdded ? "soft" : "outline"}
                              disabled={isAdded}
                              onClick={() => handleAddProductFromProvider(prod)}
                              className="h-7 text-xs gap-1 shrink-0 font-medium"
                            >
                              {isAdded ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{isAr ? "مضاف" : "Added"}</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{isAr ? "إضافة" : "Add"}</span>
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t text-xs">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={productPage <= 1 || loadingProducts}
                        onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                        className="h-7 text-xs gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>{isAr ? "السابق" : "Prev"}</span>
                      </Button>
                      <span className="text-[11px] text-muted-foreground">
                        {isAr ? `صفحة ${productPage} من ${totalPages}` : `Page ${productPage} of ${totalPages}`}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={productPage >= totalPages || loadingProducts}
                        onClick={() => setProductPage((p) => p + 1)}
                        className="h-7 text-xs gap-1"
                      >
                        <span>{isAr ? "التالي" : "Next"}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Selected Section Products List */}
              <div className="space-y-2.5 pt-2 border-t">
                <Label className="text-xs font-semibold">
                  {isAr
                    ? `المنتجات المضافة في القسم (${formData.config.products?.length || 0})`
                    : `Section Products (${formData.config.products?.length || 0})`}
                </Label>

                <div className="space-y-2">
                  {formData.config.products?.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="p-3 rounded-xl border bg-card space-y-2 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="w-7 h-7 rounded object-cover border shrink-0 bg-white"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-7 h-7 rounded border shrink-0 bg-secondary/30 flex items-center justify-center">
                              <Package className="w-3.5 h-3.5 text-muted-foreground/60" />
                            </div>
                          )}
                          <span className="font-bold text-primary truncate">#{idx + 1} {p.title}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={deletingItemId === p.id}
                          className="h-6 w-6 text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => handleRemoveProduct(idx)}
                          title={isAr ? "حذف المنتج" : "Delete Product"}
                        >
                          {deletingItemId === p.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="space-y-1 col-span-2 sm:col-span-1">
                          <Label className="text-[10px] text-muted-foreground">
                            {isAr ? "اسم المنتج" : "Title"}
                          </Label>
                          <Input
                            placeholder={t("editModal.productName")}
                            value={p.title}
                            onChange={(e) => handleUpdateProduct(idx, "title", e.target.value)}
                            disabled
                            className="h-8 text-xs bg-white/80 text-black"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">
                            {isAr ? "السعر (oldPrice) EGP" : "Price (oldPrice) EGP"}
                          </Label>
                          <Input
                            placeholder={isAr ? "السعر (oldPrice)" : "Old Price"}
                            type="number"
                            disabled
                            value={p.oldPrice ?? p.salesPrice ?? p.price ?? ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? null : Number(e.target.value);
                              handleUpdateProduct(idx, "oldPrice", val);
                              handleUpdateProduct(idx, "price", val ?? 0);
                            }}
                            className="h-8 text-xs bg-white/80 text-black"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground">
                            {isAr ? "نسبة الخصم % (discountRate)" : "Discount Rate %"}
                          </Label>
                          <Input
                            placeholder={isAr ? "نسبة الخصم %" : "Discount %"}
                            type="number"
                            min={0}
                            max={100}
                            value={p.discountRate ?? ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? null : Number(e.target.value);
                              handleUpdateProduct(idx, "discountRate", val);
                            }}
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="space-y-1 col-span-2 sm:col-span-1">
                          <Label className="text-[10px] text-muted-foreground">
                            {isAr ? "رابط الصورة أو رفع ملف" : "Image URL or Upload"}
                          </Label>
                          <div className="flex gap-1.5 items-center">
                            <Input
                              placeholder={t("editModal.productImage")}
                              value={p.imageUrl || ""}
                              disabled
                              onChange={(e) => {
                                handleUpdateProduct(idx, "imageUrl", e.target.value);
                                if (p.imageFile) {
                                  handleUpdateProduct(idx, "imageFile", null);
                                }
                              }}
                              className="h-8 text-xs font-mono flex-1 bg-white/80 text-black"
                            />
                            <label className="cursor-pointer shrink-0">
                              <input
                                type="file"
                                accept="image/*"
                                disabled
                                className="hidden disabled:opacity-80"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleUpdateProduct(idx, "imageFile", file);
                                  }
                                }}
                              />
                              <div className="h-8 px-2 rounded-md border bg-secondary/50 hover:bg-secondary flex items-center justify-center text-xs text-foreground cursor-pointer transition-colors">
                                <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                            </label>
                          </div>
                          {p.imageFile instanceof File && (
                            <div className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 w-fit mt-1">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span className="font-medium truncate max-w-[150px]">{p.imageFile.name}</span>
                              <button
                                type="button"
                                className="ml-1 text-muted-foreground hover:text-destructive text-[10px]"
                                onClick={() => handleUpdateProduct(idx, "imageFile", null)}
                                title={isAr ? "حذف الملف" : "Remove file"}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Fallback products list for flash_sale if not featured_products */}
          {!isFeaturedProducts && formData.config.products !== undefined && (
            <div className="space-y-2.5 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  {t("editModal.productsLabel")} ({formData.config.products?.length || 0})
                </Label>
              </div>

              <div className="space-y-2">
                {formData.config.products?.map((p, idx) => (
                  <div key={p.id || idx} className="p-3 rounded-xl border bg-card space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">#{idx + 1}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={deletingItemId === p.id}
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleRemoveProduct(idx)}
                        title={isAr ? "حذف المنتج" : "Delete Product"}
                      >
                        {deletingItemId === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder={t("editModal.productName")}
                        value={p.title}
                        onChange={(e) => handleUpdateProduct(idx, "title", e.target.value)}
                        className="h-8 text-xs col-span-2 sm:col-span-1"
                      />
                      <Input
                        placeholder={t("editModal.productPrice")}
                        type="number"
                        value={p.price}
                        onChange={(e) => handleUpdateProduct(idx, "price", Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder={t("editModal.productImage")}
                        value={p.imageUrl}
                        onChange={(e) => handleUpdateProduct(idx, "imageUrl", e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t bg-card flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-xs"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            {t("editModal.cancel")}
          </Button>
          <Button
            disabled={isSaving}
            onClick={handleSave}
            className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground min-w-[100px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isAr ? "جاري الحفظ..." : "Saving..."}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{t("editModal.save")}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
