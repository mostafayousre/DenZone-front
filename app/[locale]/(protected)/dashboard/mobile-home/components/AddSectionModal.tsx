"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Image as ImageIcon,
  ShoppingBag,
  Plus,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { HomeSection, SectionType, HomeSectionTypeDto } from "../types";
import useGetHomeSectionTypes from "@/services/homeSections/getHomeSectionTypes";
import useCreateHomeSection from "@/services/homeSections/createHomeSection";
import { cn } from "@/lib/utils";

interface AddSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSection: (newSection: HomeSection) => void;
}

interface SectionMetaConfig {
  type: SectionType;
  titleKey: string;
  descKey: string;
  defaultTitleEn: string;
  defaultTitleAr: string;
  defaultSubtitleEn: string;
  defaultSubtitleAr: string;
  icon: any;
  defaultConfig: any;
}

const SECTION_METADATA: Record<string, SectionMetaConfig> = {
  hero_banner: {
    type: "hero_banner",
    titleKey: "addModal.heroBannerTitle",
    descKey: "addModal.heroBannerDesc",
    defaultTitleEn: "Main Hero Banner Slider",
    defaultTitleAr: "سلايدر البانرات الرئيسي",
    defaultSubtitleEn: "Exclusive offers for dental clinics",
    defaultSubtitleAr: "عروض خاصة لعيادات ومراكز الأسنان",
    icon: ImageIcon,
    defaultConfig: {
      autoplay: true,
      layout: "carousel",
      banners: [],
    },
  },
  featured_products: {
    type: "featured_products",
    titleKey: "addModal.featuredTitle",
    descKey: "addModal.featuredDesc",
    defaultTitleEn: "Best Selling Dental Supplies",
    defaultTitleAr: "المنتجات الأكثر طلباً ومبيعاً",
    defaultSubtitleEn: "Top verified clinic essentials",
    defaultSubtitleAr: "أفضل المستلزمات الأساسية للعيادات",
    icon: ShoppingBag,
    defaultConfig: {
      layout: "grid_2",
      showViewAll: true,
      products: [],
    },
  },
};

// Fallback in case of network issue
const FALLBACK_TYPES: HomeSectionTypeDto[] = [
  {
    type: 1,
    key: "hero_banner",
    name: "Wide Hero Banner Slider",
    defaultTitle: "",
    defaultSubtitle: "",
    itemKind: 1,
  },
  {
    type: 4,
    key: "featured_products",
    name: "Featured & Best Selling Products",
    defaultTitle: "Best Selling Dental Supplies",
    defaultSubtitle: "Top verified clinic essentials",
    itemKind: 2,
  },
];

// Only allow type 1 and type 4
const ALLOWED_SECTION_TYPES = [1, 4];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  open,
  onOpenChange,
  onAddSection,
}) => {
  const t = useTranslations("MobileHome");
  const locale = useLocale();
  const isAr = locale === "ar";

  const { data, loading, error, getSectionTypes } = useGetHomeSectionTypes();
  const { createHomeSection } = useCreateHomeSection();

  const [selectedType, setSelectedType] = useState<number>(1);
  const [customTitle, setCustomTitle] = useState<string>("");
  const [customSubtitle, setCustomSubtitle] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter only type 1 and type 4
  const availableTypes: HomeSectionTypeDto[] = useMemo(() => {
    if (data && data.length > 0) {
      const filtered = data.filter((item) => ALLOWED_SECTION_TYPES.includes(item.type));
      if (filtered.length > 0) {
        return filtered;
      }
    }
    return FALLBACK_TYPES;
  }, [data]);

  const selectTypeOption = (item: HomeSectionTypeDto) => {
    setSelectedType(item.type);
    const meta =
      SECTION_METADATA[item.key] ||
      (item.type === 1 ? SECTION_METADATA.hero_banner : SECTION_METADATA.featured_products);
    const defaultT = isAr
      ? meta?.defaultTitleAr || item.defaultTitle
      : item.defaultTitle || meta?.defaultTitleEn || item.name;
    const defaultS = isAr
      ? meta?.defaultSubtitleAr || item.defaultSubtitle
      : item.defaultSubtitle || meta?.defaultSubtitleEn;
    setCustomTitle(defaultT);
    setCustomSubtitle(defaultS);
  };

  useEffect(() => {
    if (open) {
      getSectionTypes().catch(() => {});
      const firstItem = availableTypes.find((item) => item.type === 1) || availableTypes[0];
      if (firstItem) {
        selectTypeOption(firstItem);
      }
    }
  }, [open]);

  const handleSubmit = async () => {
    const chosenItem = availableTypes.find((item) => item.type === selectedType) || availableTypes[0];
    if (!chosenItem) return;

    setIsSubmitting(true);
    try {
      const payloadTitle = customTitle.trim() || chosenItem.defaultTitle;
      const payloadSubtitle = customSubtitle.trim() || chosenItem.defaultSubtitle;

      // POST to /api/HomeSections with { "type": chosenItem.type, "title": ..., "subtitle": ... }
      const created = await createHomeSection({
        type: chosenItem.type,
        title: payloadTitle,
        subtitle: payloadSubtitle,
      });

      const metaKey = created?.typeKey || chosenItem.key;
      const meta =
        SECTION_METADATA[metaKey] ||
        (chosenItem.type === 1 ? SECTION_METADATA.hero_banner : SECTION_METADATA.featured_products);

      const sectionType: SectionType =
        (created?.typeKey as SectionType) ||
        (chosenItem.key as SectionType) ||
        (chosenItem.type === 1 ? "hero_banner" : "featured_products");

      const newSection: HomeSection = {
        id: created?.id || `sec_${sectionType}_${Date.now()}`,
        type: sectionType,
        typeNumber: created?.type ?? chosenItem.type,
        itemKind: chosenItem.itemKind,
        title: created?.title || payloadTitle,
        subtitle: created?.subtitle || payloadSubtitle,
        enabled: created?.isVisible ?? true,
        order: 999,
        config: JSON.parse(JSON.stringify(meta?.defaultConfig || {})),
        lastUpdated: created?.createdAt || new Date().toISOString(),
      };

      onAddSection(newSection);
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        (isAr ? "فشل إضافة القسم" : "Failed to add section");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSubmitting && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b">
          <DialogTitle className="text-lg font-bold">{t("addModal.title")}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            {t("addModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 overflow-y-auto max-h-[62vh] space-y-4">
          {loading && (!data || data.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                {isAr ? "جاري تحميل أنواع الأقسام..." : "Loading section types..."}
              </p>
            </div>
          ) : (
            <>
              {error && (!data || data.length === 0) && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => getSectionTypes()}
                    className="h-7 text-xs gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isAr ? "إعادة المحاولة" : "Retry"}</span>
                  </Button>
                </div>
              )}

              {/* Step 1: Choose Section Type */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">
                  {isAr ? "اختر نوع القسم" : "Select Section Type"}
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableTypes.map((item) => {
                    const meta =
                      SECTION_METADATA[item.key] ||
                      (item.type === 1 ? SECTION_METADATA.hero_banner : SECTION_METADATA.featured_products);
                    const Icon = meta?.icon || (item.type === 1 ? ImageIcon : ShoppingBag);
                    const isSelected = selectedType === item.type;

                    const title = isAr
                      ? meta?.defaultTitleAr || item.defaultTitle
                      : (meta?.titleKey ? t(meta.titleKey as any) : item.name || item.defaultTitle);

                    return (
                      <div
                        key={item.key || item.type}
                        onClick={() => selectTypeOption(item)}
                        className={cn(
                          "relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
                            : "border-border bg-card hover:border-primary/50 hover:bg-muted/40"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-2xs"
                              : "bg-secondary text-primary"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-foreground truncate">
                              {title}
                            </h4>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                            )}
                          </div>
                          <Badge
                            color="secondary"
                            className="text-[9px] font-mono py-0 px-1 h-3.5 bg-muted/50 text-muted-foreground mt-0.5"
                          >
                            Type {item.type}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Customize Section Title & Subtitle */}
              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor="section-title" className="text-xs font-semibold text-foreground">
                    {isAr ? "عنوان القسم (Title)" : "Section Title"}
                  </Label>
                  <Input
                    id="section-title"
                    type="text"
                    placeholder={isAr ? "مثال: ahmedalaa" : "e.g. ahmedalaa"}
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="section-subtitle" className="text-xs font-semibold text-foreground">
                    {isAr ? "الوصف الفرعي (Subtitle)" : "Section Subtitle"}
                  </Label>
                  <Input
                    id="section-subtitle"
                    type="text"
                    placeholder={isAr ? "مثال: ahmedalaaaa" : "e.g. ahmedalaaaa"}
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t flex items-center justify-end gap-2.5 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-9 text-xs font-medium"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            className="h-9 px-5 gap-1.5 text-xs font-bold bg-primary text-primary-foreground min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isAr ? "جاري الإضافة..." : "Adding..."}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{isAr ? "إضافة القسم" : "Add Section"}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
