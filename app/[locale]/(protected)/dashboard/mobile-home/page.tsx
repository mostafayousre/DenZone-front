"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import {
  Smartphone,
  Plus,
  Save,
  RotateCcw,
  Search,
  Layers,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { HomeSection } from "./types";
import { INITIAL_SECTIONS } from "./initial-data";
import { SectionCard } from "./components/SectionCard";
import { MobilePhonePreview } from "./components/MobilePhonePreview";
import { AddSectionModal } from "./components/AddSectionModal";
import { EditSectionModal } from "./components/EditSectionModal";

export default function MobileHomePageBuilder() {
  const t = useTranslations("MobileHome");
  const [sections, setSections] = useState<HomeSection[]>(INITIAL_SECTIONS);
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to re-index and update
  const updateSections = (newSections: HomeSection[]) => {
    const ordered = newSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(ordered);
  };

  // Reorder Up
  const handleMoveUp = (id: string) => {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx <= 0) return;
    const newSections = [...sections];
    const [moved] = newSections.splice(idx, 1);
    newSections.splice(idx - 1, 0, moved);
    updateSections(newSections);
  };

  // Reorder Down
  const handleMoveDown = (id: string) => {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx < 0 || idx >= sections.length - 1) return;
    const newSections = [...sections];
    const [moved] = newSections.splice(idx, 1);
    newSections.splice(idx + 1, 0, moved);
    updateSections(newSections);
  };

  // Toggle Visibility
  const handleToggleEnabled = (id: string) => {
    const newSections = sections.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    updateSections(newSections);
  };

  // Delete Section
  const handleDelete = (id: string) => {
    const newSections = sections.filter((s) => s.id !== id);
    updateSections(newSections);
    toast.success(t("deleteSuccess"));
  };

  // Edit Section
  const handleEdit = (section: HomeSection) => {
    setEditingSection(section);
    setEditModalOpen(true);
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

  // Reset to default
  const handleResetToDefault = () => {
    if (confirm(t("resetConfirm"))) {
      updateSections(INITIAL_SECTIONS);
      toast.success(t("resetSuccess"));
    }
  };

  // Save changes
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(t("saveSuccess"));
    }, 600);
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
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("pageDescription")}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetToDefault}
            className="text-xs h-9 gap-1.5 text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t("resetDefault")}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs h-9 px-4 gap-1.5 font-bold bg-primary text-primary-foreground"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? t("saving") : t("saveChanges")}</span>
          </Button>
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
              displayedSections.map((section, index) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={index}
                  totalSections={displayedSections.length}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onToggleEnabled={handleToggleEnabled}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isSelected={selectedSectionId === section.id}
                  onSelect={(id) => setSelectedSectionId(id)}
                />
              ))
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

      <EditSectionModal
        section={editingSection}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveEditedSection}
      />
    </div>
  );
}
