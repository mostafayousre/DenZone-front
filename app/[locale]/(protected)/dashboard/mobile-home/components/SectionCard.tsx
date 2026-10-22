"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { HomeSection, SectionType } from "../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Lock,
  Plus,
  Image as ImageIcon,
  Flame,
  ShoppingBag,
  LayoutGrid,
  Sparkles,
  Award,
  Video,
  MessageSquare,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  section: HomeSection;
  index: number;
  totalSections: number;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onAddItem: (section: HomeSection) => void;
  onEdit: (section: HomeSection) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const getSectionIcon = (type: SectionType) => {
  switch (type) {
    case "hero_banner":
      return <ImageIcon className="w-4 h-4 text-blue-500" />;
    case "flash_sale":
      return <Flame className="w-4 h-4 text-red-500" />;
    case "categories_circle":
      return <LayoutGrid className="w-4 h-4 text-indigo-500" />;
    case "featured_products":
      return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
    // case "promo_grid_2x":
    // case "single_promo_banner":
    //   return <Sparkles className="w-4 h-4 text-amber-500" />;
    // case "brand_slider":
    //   return <Award className="w-4 h-4 text-cyan-500" />;
    case "video_stories":
      return <Video className="w-4 h-4 text-purple-500" />;
    // case "doctor_reviews":
    //   return <MessageSquare className="w-4 h-4 text-pink-500" />;
    default:
      return <Layers className="w-4 h-4 text-slate-500" />;
  }
};

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  index,
  totalSections,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onToggleEnabled,
  onAddItem,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
}) => {
  const t = useTranslations("MobileHome");
  const isStatic = Boolean(section.isStatic);

  // Check if section contains 1 or more items
  const bannerCount = section.config?.banners?.length || 0;
  const productCount = section.config?.products?.length || 0;
  const rawItemsCount = section.items?.length || 0;
  const hasItems = bannerCount > 0 || productCount > 0 || rawItemsCount > 0;

  const getSectionTypeName = (type: SectionType) => {
    switch (type) {
      case "hero_banner":
        return t("sectionTypes.hero_banner");
      // case "flash_sale":
      //   return t("sectionTypes.flash_sale");
      // case "categories_circle":
      //   return t("sectionTypes.categories_circle");
      case "featured_products":
        return t("sectionTypes.featured_products");
      // case "promo_grid_2x":
      //   return t("sectionTypes.promo_grid_2x");
      // case "single_promo_banner":
      //   return t("sectionTypes.single_promo_banner");
      // case "brand_slider":
      //   return t("sectionTypes.brand_slider");
      // case "video_stories":
      //   return t("sectionTypes.video_stories");
      // case "doctor_reviews":
      //   return t("sectionTypes.doctor_reviews");
      default:
        return t("sectionTypes.custom");
    }
  };

  return (
    <div
      onClick={() => onSelect?.(section.id)}
      className={cn(
        "group relative flex items-center justify-between gap-3 rounded-xl border bg-card p-3.5 transition-all duration-150 hover:shadow-xs",
        section.enabled
          ? "border-border bg-card"
          : "border-dashed border-muted-foreground/30 bg-muted/20 opacity-60",
        isSelected && "ring-2 ring-primary border-transparent"
      )}
    >
      {/* Left: Index + Icon + Title + Type */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-foreground">
          {index + 1}
        </span>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/80 border border-border/60">
          {getSectionIcon(section.type)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {section.title}
            </h4>
            <Badge className="text-[10px] py-0 px-1.5 font-medium bg-secondary text-muted-foreground border">
              {getSectionTypeName(section.type)}
            </Badge>
          </div>
          {section.subtitle && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {section.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Controls or Static Badge */}
      {isStatic ? (
        <div className="flex items-center shrink-0">
          <Badge className="text-[11px] font-medium text-muted-foreground bg-secondary/80 border border-border/60 px-2.5 py-1 gap-1.5 select-none">
            <Lock className="w-3 h-3 text-muted-foreground/70" />
            <span>{t("fixedSection")}</span>
          </Badge>
        </div>
      ) : (
        <div className="flex items-center gap-2 shrink-0">
          {/* Visibility Switch */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/50">
            <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
              {section.enabled ? t("visible") : t("hidden")}
            </span>
            <Switch
              checked={section.enabled}
              onCheckedChange={() => onToggleEnabled(section.id)}
              className="scale-75 data-[state=checked]:bg-primary"
            />
          </div>

          {/* Up / Down Order Buttons */}
          <div className="flex items-center gap-0.5 border rounded-lg p-0.5 bg-secondary/30">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded hover:bg-secondary"
              disabled={canMoveUp === false || index === 0}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp(section.id);
              }}
              title={t("moveUp")}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded hover:bg-secondary"
              disabled={canMoveDown === false || index === totalSections - 1}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown(section.id);
              }}
              title={t("moveDown")}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Add Item Button (hidden when section has 1 or more items) */}
          {!hasItems && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 px-2.5 text-xs font-medium border-border hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onAddItem(section);
              }}
              title={t("addItem")}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("addItem")}</span>
            </Button>
          )}

          {/* Edit Button */}
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 px-2.5 text-xs font-medium border-border hover:bg-secondary transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(section);
            }}
            title={t("edit")}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("edit")}</span>
          </Button>

          {/* Delete Button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(section.id);
            }}
            title={t("delete")}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
