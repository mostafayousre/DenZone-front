"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import {
  Smartphone,
  Plus,
  Search,
  Layers,
  LayoutTemplate,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { HomeSection, SectionType, SectionConfig } from "./types";
import { BASE_INITIAL_SECTIONS } from "./initial-data";
import { SectionCard } from "./components/SectionCard";
import { MobilePhonePreview } from "./components/MobilePhonePreview";
import { AddSectionModal } from "./components/AddSectionModal";
import { EditSectionModal } from "./components/EditSectionModal";
import { EditItemModal } from "./components/EditItemModal";
import useGetHomeSections, { HomeSectionApiItem } from "@/services/homeSections/getHomeSections";
import useDeleteHomeSection from "@/services/homeSections/deleteHomeSection";
import useUpdateHomeSection from "@/services/homeSections/updateHomeSection";
import useMoveHomeSection from "@/services/homeSections/moveHomeSection";

const getDefaultConfigForType = (secType: SectionType, apiId: string): SectionConfig => {
  if (secType === "hero_banner") {
    return {
      autoplay: true,
      layout: "carousel",
      banners: [],
    };
  }

  if (secType === "featured_products") {
    return {
      layout: "grid_2",
      showViewAll: true,
      products: [],
    };
  }

  return {};
};

export default function MobileHomePageBuilder() {
  const t = useTranslations("MobileHome");
  const [sections, setSections] = useState<HomeSection[]>(BASE_INITIAL_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { getHomeSections, loading: isLoadingSections } = useGetHomeSections();
  const { deleteHomeSection } = useDeleteHomeSection();
  const { updateHomeSection } = useUpdateHomeSection();
  const { moveHomeSection } = useMoveHomeSection();

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editItemModalOpen, setEditItemModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);

  // Load API sections on mount
  useEffect(() => {
    let isMounted = true;

    const loadSections = async () => {
      try {
        const apiData = await getHomeSections();
        if (!isMounted) return;

        if (Array.isArray(apiData) && apiData.length > 0) {
          const apiMappedSections: HomeSection[] = apiData.map((item: HomeSectionApiItem, idx: number) => {
            const secType: SectionType =
              (item.typeKey as SectionType) ||
              (item.type === 1 ? "hero_banner" : "featured_products");

            const config = getDefaultConfigForType(secType, item.id);
            if (Array.isArray(item.items) && item.items.length > 0) {
              if (secType === "hero_banner" || item.type === 1) {
                config.banners = item.items.map((it: any) => ({
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
              } else if (secType === "featured_products" || item.type === 4) {
                config.products = item.items.map((it: any) => {
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
                    salesPrice: it.salesPrice ?? it.oldPrice ?? null,
                    oldPrice: it.oldPrice ?? it.salesPrice ?? null,
                    discountRate: it.discountRate ?? null,
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
              id: item.id,
              type: secType,
              typeNumber: item.type,
              title: item.title,
              subtitle: item.subtitle,
              enabled: item.isVisible ?? true,
              order: BASE_INITIAL_SECTIONS.length + idx + 1,
              config,
              items: item.items || [],
              lastUpdated: item.createdAt,
              startDate: item.startDate,
              endDate: item.endDate,
            };
          });

          // Combine the 4 base fixed sections + dynamic sections from /api/HomeSections
          const combined = [...BASE_INITIAL_SECTIONS, ...apiMappedSections].map((s, idx) => ({
            ...s,
            order: idx + 1,
            isStatic: s.isStatic ?? idx < 4,
          }));

          setSections(combined);
        } else {
          setSections(BASE_INITIAL_SECTIONS);
        }
      } catch (err) {
        console.error("Failed to load sections from /api/HomeSections:", err);
      }
    };

    loadSections();

    return () => {
      isMounted = false;
    };
  }, []);


  // Helper to re-index and update
  const updateSections = (newSections: HomeSection[]) => {
    const ordered = newSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(ordered);
  };

  // Reorder Up
  const handleMoveUp = async (id: string) => {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx <= 0) return;
    if (sections[idx]?.isStatic) return;
    if (sections[idx - 1]?.isStatic) return;

    const previousSections = [...sections];
    const newSections = [...sections];
    const [moved] = newSections.splice(idx, 1);
    newSections.splice(idx - 1, 0, moved);
    updateSections(newSections);

    try {
      await moveHomeSection(id, "up");
    } catch (err: any) {
      updateSections(previousSections);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to move section up"
      );
    }
  };

  // Reorder Down
  const handleMoveDown = async (id: string) => {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx < 0 || idx >= sections.length - 1) return;
    if (sections[idx]?.isStatic) return;

    const previousSections = [...sections];
    const newSections = [...sections];
    const [moved] = newSections.splice(idx, 1);
    newSections.splice(idx + 1, 0, moved);
    updateSections(newSections);

    try {
      await moveHomeSection(id, "down");
    } catch (err: any) {
      updateSections(previousSections);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to move section down"
      );
    }
  };

  // Toggle Visibility
  const handleToggleEnabled = async (id: string) => {
    const target = sections.find((s) => s.id === id);
    if (!target || target.isStatic) return;

    const nextVisibility = !target.enabled;

    // Optimistically update UI
    const updatedSections = sections.map((s) =>
      s.id === id ? { ...s, enabled: nextVisibility } : s
    );
    updateSections(updatedSections);

    const payload = {
      title: target.title || "",
      subtitle: target.subtitle || "",
      isVisible: nextVisibility,
      startDate: target.startDate || new Date().toISOString(),
      endDate: target.endDate || new Date().toISOString(),
    };

    try {
      await updateHomeSection(id, payload);
      toast.success(t("editSuccess"));
    } catch (err: any) {
      // Revert if API call fails
      const reverted = sections.map((s) =>
        s.id === id ? { ...s, enabled: target.enabled } : s
      );
      updateSections(reverted);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to update section visibility"
      );
    }
  };

  // Delete Section
  const handleDelete = async (id: string) => {
    const target = sections.find((s) => s.id === id);
    if (!target || target.isStatic) return;

    try {
      await deleteHomeSection(id);
      const newSections = sections.filter((s) => s.id !== id);
      updateSections(newSections);
      if (selectedSectionId === id) {
        setSelectedSectionId(undefined);
      }
      toast.success(t("deleteSuccess"));
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to delete section"
      );
    }
  };

  // Add Items to Section (formerly edit button)
  const handleAddItem = (section: HomeSection) => {
    if (section.isStatic) return;
    setEditingSection(section);
    setAddItemModalOpen(true);
  };

  // Edit Section Item via /api/HomeSections/{id}/items/{itemId}
  const handleEdit = (section: HomeSection) => {
    if (section.isStatic) return;
    setEditingSection(section);
    setEditItemModalOpen(true);
  };

  const handleSaveEditedSection = (updated: HomeSection) => {
    const newSections = sections.map((s) => (s.id === updated.id ? updated : s));
    updateSections(newSections);
    toast.success(t("editSuccess"));
  };

  // Add Section
  const handleAddSection = (newSection: HomeSection) => {
    const newSections = [...sections, newSection];
    updateSections(newSections);
    setSelectedSectionId(newSection.id);
    toast.success(`${t("addSuccess")} ${newSection.title}`);
  };

  // Filter sections by search query
  const displayedSections = sections.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.subtitle && s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Clean Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-card border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutTemplate className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              {t("pageTitle")}
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 text-xs font-semibold">
              {t("liveBadge")}
            </Badge>
            {isLoadingSections && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse ml-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Loading API sections...</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("pageDescription")}
          </p>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Sections List & Ordering (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Action Bar: Search & Add Section */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-card shadow-2xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            <Button
              onClick={() => setAddModalOpen(true)}
              size="sm"
              className="gap-1.5 text-xs font-bold h-9 px-4 bg-primary text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              <span>{t("addNewSection")}</span>
            </Button>
          </div>

          {/* Sections List */}
          <div className="space-y-2.5">
            {displayedSections.length === 0 ? (
              <div className="py-16 text-center rounded-2xl border border-dashed p-8 bg-muted/10">
                <Layers className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">{t("noResults")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("noResultsSub")}</p>
              </div>
            ) : (
              displayedSections.map((section, index) => {
                const fullIdx = sections.findIndex((s) => s.id === section.id);
                const canMoveUp =
                  !section.isStatic && fullIdx > 0 && !sections[fullIdx - 1]?.isStatic;
                const canMoveDown =
                  !section.isStatic && fullIdx >= 0 && fullIdx < sections.length - 1;

                return (
                  <SectionCard
                    key={section.id}
                    section={section}
                    index={index}
                    totalSections={displayedSections.length}
                    canMoveUp={canMoveUp}
                    canMoveDown={canMoveDown}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onToggleEnabled={handleToggleEnabled}
                    onAddItem={handleAddItem}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isSelected={selectedSectionId === section.id}
                    onSelect={(id) => setSelectedSectionId(id)}
                  />
                );
              })
            )}
          </div>

          {/* Bottom Add Section Button */}
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="w-full py-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 text-primary flex items-center justify-center gap-2 font-semibold text-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{t("addNewSectionBottom")}</span>
          </button>
        </div>

        {/* Right Side: Clean Live Phone Mockup (5 cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <Card className="border shadow-xs bg-card overflow-hidden">
            <CardHeader className="p-3.5 border-b bg-secondary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <CardTitle className="text-xs font-bold">{t("preview.title")}</CardTitle>
                </div>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {t("preview.liveUpdate")}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-3 flex justify-center bg-slate-100/50 dark:bg-black/20">
              <MobilePhonePreview
                sections={sections}
                selectedSectionId={selectedSectionId}
                onSelectSection={(id) => setSelectedSectionId(id)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddSectionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddSection={handleAddSection}
      />

      {/* Add Items to Section Modal (POST /api/HomeSections/{id}/items) */}
      <EditSectionModal
        section={editingSection}
        open={addItemModalOpen}
        onOpenChange={setAddItemModalOpen}
        onSave={handleSaveEditedSection}
        availableSections={sections}
      />

      {/* Edit Section Item Modal (PUT /api/HomeSections/{id}/items/{itemId}) */}
      <EditItemModal
        section={editingSection}
        open={editItemModalOpen}
        onOpenChange={setEditItemModalOpen}
        onSaveSuccess={handleSaveEditedSection}
        onOpenAddItem={handleAddItem}
        availableSections={sections}
      />
    </div>
  );
}

