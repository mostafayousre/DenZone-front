"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
import { Plus, Trash2, Save } from "lucide-react";
import { HomeSection, BannerItem, ProductItem } from "../types";

interface EditSectionModalProps {
  section: HomeSection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedSection: HomeSection) => void;
}

export const EditSectionModal: React.FC<EditSectionModalProps> = ({
  section,
  open,
  onOpenChange,
  onSave,
}) => {
  const t = useTranslations("MobileHome");
  const [formData, setFormData] = useState<HomeSection | null>(null);

  useEffect(() => {
    if (section) {
      setFormData(JSON.parse(JSON.stringify(section)));
    }
  }, [section]);

  if (!formData) return null;

  const handleSave = () => {
    if (formData) {
      onSave({
        ...formData,
        lastUpdated: new Date().toISOString(),
      });
      onOpenChange(false);
    }
  };

  // Add item helper
  const handleAddBanner = () => {
    const newBanner: BannerItem = {
      id: `b_${Date.now()}`,
      title: "New Dental Banner",
      subtitle: "Special promotion for dental clinics",
      imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
      linkType: "category",
    };
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        banners: [...(formData.config.banners || []), newBanner],
      },
    });
  };

  const handleRemoveBanner = (index: number) => {
    const updated = (formData.config.banners || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      config: { ...formData.config, banners: updated },
    });
  };

  const handleUpdateBanner = (index: number, field: keyof BannerItem, val: string) => {
    const updated = [...(formData.config.banners || [])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({
      ...formData,
      config: { ...formData.config, banners: updated },
    });
  };

  const handleAddProduct = () => {
    const newProd: ProductItem = {
      id: `p_${Date.now()}`,
      title: "New Product",
      category: "Consumables",
      price: 500,
      rating: 5.0,
      reviewsCount: 10,
      imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&auto=format&fit=crop&q=80",
      inStock: true,
    };
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        products: [...(formData.config.products || []), newProd],
      },
    });
  };

  const handleRemoveProduct = (index: number) => {
    const updated = (formData.config.products || []).filter((_, i) => i !== index);
    setFormData({
      ...formData,
      config: { ...formData.config, products: updated },
    });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold">{t("editModal.title")}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {t("editModal.description")}
              </DialogDescription>
            </div>
            <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/20">
              {formData.type}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{t("editModal.sectionTitleLabel")}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-xs h-8.5"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">{t("editModal.sectionSubtitleLabel")}</Label>
              <Input
                value={formData.subtitle || ""}
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
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            />
          </div>

          {/* Banners list if section has banners */}
          {(formData.config.banners !== undefined || formData.type === "hero_banner" || formData.type === "promo_grid_2x") && (
            <div className="space-y-2.5 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">{t("editModal.bannersLabel")} ({formData.config.banners?.length || 0})</Label>
                <Button size="sm" variant="outline" onClick={handleAddBanner} className="gap-1 h-7 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("editModal.addBanner")}</span>
                </Button>
              </div>

              <div className="space-y-2">
                {formData.config.banners?.map((b, idx) => (
                  <div key={b.id || idx} className="p-3 rounded-xl border bg-card space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">#{idx + 1}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleRemoveBanner(idx)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Input
                        placeholder={t("editModal.bannerTitle")}
                        value={b.title}
                        onChange={(e) => handleUpdateBanner(idx, "title", e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder={t("editModal.bannerImageUrl")}
                        value={b.imageUrl}
                        onChange={(e) => handleUpdateBanner(idx, "imageUrl", e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products list if section has products */}
          {(formData.config.products !== undefined || formData.type === "flash_sale" || formData.type === "featured_products") && (
            <div className="space-y-2.5 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">{t("editModal.productsLabel")} ({formData.config.products?.length || 0})</Label>
                <Button size="sm" variant="outline" onClick={handleAddProduct} className="gap-1 h-7 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("editModal.addProduct")}</span>
                </Button>
              </div>

              <div className="space-y-2">
                {formData.config.products?.map((p, idx) => (
                  <div key={p.id || idx} className="p-3 rounded-xl border bg-card space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">#{idx + 1}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleRemoveProduct(idx)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
          <Button variant="ghost" className="text-xs" onClick={() => onOpenChange(false)}>
            {t("editModal.cancel")}
          </Button>
          <Button onClick={handleSave} className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground">
            <Save className="w-3.5 h-3.5" />
            <span>{t("editModal.save")}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
