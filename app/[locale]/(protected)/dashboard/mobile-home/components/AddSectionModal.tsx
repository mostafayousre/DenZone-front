"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Flame,
  LayoutGrid,
  ShoppingBag,
  Sparkles,
  Award,
  Video,
  MessageSquare,
  Plus,
} from "lucide-react";
import { HomeSection, SectionType } from "../types";

interface AddSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSection: (newSection: HomeSection) => void;
}

interface SectionOption {
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

const SECTION_OPTIONS: SectionOption[] = [
  {
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
      banners: [
        {
          id: `b_${Date.now()}_1`,
          title: "Dental Equipment Season 2026",
          subtitle: "Up to 35% OFF on Scalers & Handpieces",
          imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
          buttonText: "Shop Now",
        },
      ],
    },
  },
  {
    type: "flash_sale",
    titleKey: "addModal.flashSaleTitle",
    descKey: "addModal.flashSaleDesc",
    defaultTitleEn: "Flash Deals • Limited Time",
    defaultTitleAr: "عروض فلاش سيل لفترة محدودة",
    defaultSubtitleEn: "Discounts ending soon with live timer",
    defaultSubtitleAr: "خصومات مميزة مع عداد تنازلي",
    icon: Flame,
    defaultConfig: {
      countdownEndHours: 6,
      products: [
        {
          id: `p_${Date.now()}_1`,
          title: "Woodpecker LED Curing Light i-LED",
          category: "Equipment",
          price: 2450,
          originalPrice: 3500,
          discountPercentage: 30,
          rating: 4.9,
          reviewsCount: 120,
          imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&auto=format&fit=crop&q=80",
          inStock: true,
        },
      ],
    },
  },
  {
    type: "categories_circle",
    titleKey: "addModal.categoriesTitle",
    descKey: "addModal.categoriesDesc",
    defaultTitleEn: "Shop By Category",
    defaultTitleAr: "تسوق حسب القسم",
    defaultSubtitleEn: "Explore dental supplies catalog",
    defaultSubtitleAr: "تصفح مستلزمات الأسنان حسب التخصص",
    icon: LayoutGrid,
    defaultConfig: {
      layout: "circle",
      showViewAll: true,
      categories: [
        { id: "c1", name: "Dental Handpieces", imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=200&auto=format&fit=crop&q=80", itemCount: 120 },
        { id: "c2", name: "Endodontics", imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=200&auto=format&fit=crop&q=80", itemCount: 310 },
        { id: "c3", name: "Implants & Surgery", imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=200&auto=format&fit=crop&q=80", itemCount: 85 },
      ],
    },
  },
  {
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
      products: [
        {
          id: `fp_${Date.now()}_1`,
          title: "Kerr OptiBond Universal Adhesive 5ml",
          category: "Adhesives",
          price: 890,
          originalPrice: 1050,
          discountPercentage: 15,
          rating: 4.9,
          reviewsCount: 180,
          imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&auto=format&fit=crop&q=80",
          inStock: true,
        },
      ],
    },
  },
  {
    type: "promo_grid_2x",
    titleKey: "addModal.promoGridTitle",
    descKey: "addModal.promoGridDesc",
    defaultTitleEn: "Promotional Highlights",
    defaultTitleAr: "عروض ترويجية مميزة",
    defaultSubtitleEn: "Special dental bundles and warranty",
    defaultSubtitleAr: "باقات وضمان خاص للأجهزة",
    icon: Sparkles,
    defaultConfig: {
      layout: "dual_half",
      banners: [
        {
          id: `pb_${Date.now()}_1`,
          title: "Autoclaves & Sterilizers",
          subtitle: "Class B Vacuum • 2 Years Warranty",
          imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
        },
        {
          id: `pb_${Date.now()}_2`,
          title: "Orthodontic Kits",
          subtitle: "Self-Ligating Systems with 20% Off",
          imageUrl: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=600&auto=format&fit=crop&q=80",
        },
      ],
    },
  },
  {
    type: "brand_slider",
    titleKey: "addModal.brandsTitle",
    descKey: "addModal.brandsDesc",
    defaultTitleEn: "Official Brand Partners",
    defaultTitleAr: "الماركات والشركات العالمية المعتمدة",
    defaultSubtitleEn: "100% Genuine certified dental brands",
    defaultSubtitleAr: "منتجات معتمدة ومضمونة من الوكيل",
    icon: Award,
    defaultConfig: {
      brands: [
        { id: "b1", name: "3M Dental", logoUrl: "" },
        { id: "b2", name: "Dentsply Sirona", logoUrl: "" },
        { id: "b3", name: "Kerr Dental", logoUrl: "" },
      ],
    },
  },
  {
    type: "video_stories",
    titleKey: "addModal.storiesTitle",
    descKey: "addModal.storiesDesc",
    defaultTitleEn: "Doctor Video Stories & Tips",
    defaultTitleAr: "فيديوهات وتجارب الأطباء",
    defaultSubtitleEn: "Quick demos and doctor unboxing",
    defaultSubtitleAr: "شرح عملي ومراجعات للأجهزة",
    icon: Video,
    defaultConfig: {
      stories: [
        {
          id: `st_${Date.now()}_1`,
          title: "LED Curing Light Demo",
          doctorName: "Dr. Karim Adel",
          thumbnailUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
        },
      ],
    },
  },
  {
    type: "doctor_reviews",
    titleKey: "addModal.reviewsTitle",
    descKey: "addModal.reviewsDesc",
    defaultTitleEn: "Doctor Reviews & Feedback",
    defaultTitleAr: "آراء وتقييمات أطباء الأسنان",
    defaultSubtitleEn: "Feedback from verified practitioners",
    defaultSubtitleAr: "تقييمات موثقة من أطباء وعيادات الأسنان",
    icon: MessageSquare,
    defaultConfig: {
      reviews: [
        {
          id: `r_${Date.now()}_1`,
          doctorName: "Dr. Mostafa Hassan",
          clinicName: "Hassan Dental Studio, Cairo",
          avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80",
          rating: 5,
          comment: "Fast delivery within 24 hours. Excellent authentic dental equipment with agency warranty.",
        },
      ],
    },
  },
];

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  open,
  onOpenChange,
  onAddSection,
}) => {
  const t = useTranslations("MobileHome");
  const locale = useLocale();
  const isAr = locale === "ar";

  const handleSelect = (option: SectionOption) => {
    const newSection: HomeSection = {
      id: `sec_${option.type}_${Date.now()}`,
      type: option.type,
      title: isAr ? option.defaultTitleAr : option.defaultTitleEn,
      subtitle: isAr ? option.defaultSubtitleAr : option.defaultSubtitleEn,
      enabled: true,
      order: 999,
      config: JSON.parse(JSON.stringify(option.defaultConfig)),
      lastUpdated: new Date().toISOString(),
    };
    onAddSection(newSection);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[80vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b">
          <DialogTitle className="text-lg font-bold">{t("addModal.title")}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            {t("addModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-2.5">
          {SECTION_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.type}
                onClick={() => handleSelect(opt)}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl border bg-card hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {t(opt.titleKey as any)}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {t(opt.descKey as any)}
                    </p>
                  </div>
                </div>

                <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs shrink-0 font-medium group-hover:bg-primary group-hover:text-primary-foreground">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("addModal.addButton")}</span>
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
