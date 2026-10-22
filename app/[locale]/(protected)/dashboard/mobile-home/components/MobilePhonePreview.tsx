"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { HomeSection } from "../types";
import {
  Search,
  ShoppingCart,
  Bell,
  MapPin,
  Flame,
  Plus,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useGetHomeProduct from "@/services/home/getHomeProduct";

interface MobilePhonePreviewProps {
  sections: HomeSection[];
  selectedSectionId?: string;
  onSelectSection?: (id: string) => void;
}

export const MobilePhonePreview: React.FC<MobilePhonePreviewProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
}) => {
  const t = useTranslations("MobileHome");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Fetch live home screen data from /api/Home/GetHomeProduct
  const { data: homeData, loading: isLoadingHomeData, getHomeProduct } = useGetHomeProduct();

  useEffect(() => {
    getHomeProduct();
  }, []);

  // Active enabled sections sorted by order
  const activeSections = sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  // Neutral placeholder in case of load failure
  const fallbackImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3C/svg%3E";

  return (
    <div className="flex flex-col items-center w-full">
      {/* Sleek Minimalist Mobile Phone Frame */}
      <div className="relative w-[340px] h-[690px] rounded-[44px] p-2.5 shadow-2xl border-[8px] border-slate-900 bg-slate-900 shadow-slate-950/30 select-none">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 h-4.5 w-20 bg-black rounded-full flex items-center justify-between px-2">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
          <div className="h-2 w-2 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>

        {/* Screen Container */}
        <div className="relative flex flex-col h-full w-full rounded-[36px] overflow-hidden bg-slate-50 text-slate-900 shadow-inner">
          {/* Status Bar */}
          <div className="sticky top-0 z-40 flex items-center justify-between px-5 pt-2 pb-1 text-[10px] font-semibold bg-white/90 backdrop-blur-md">
            <span>09:41</span>
            <div className="flex items-center gap-2">
              {isLoadingHomeData && (
                <Loader2 className="w-2.5 h-2.5 animate-spin text-primary" />
              )}
              <span className="text-[9px] font-bold">5G</span>
              <div className="h-2 w-4 rounded-[3px] border border-slate-800 p-0.5 flex items-center">
                <div className="h-full w-2.5 bg-slate-800 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* App Top Header */}
          <div className="sticky top-6 z-30 px-3.5 pt-1 pb-2.5 space-y-2 bg-white/95 border-b border-slate-100 shadow-2xs backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-[9px] font-medium text-slate-400">{t("preview.deliverTo")}</p>
                  <p className="text-[11px] font-bold text-slate-800 truncate max-w-[130px]">
                    {homeData?.fullName ? `Dr. ${homeData.fullName}` : t("preview.clinicName")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => getHomeProduct()}
                  title="Reload Live Data"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:text-primary transition-colors"
                >
                  <RefreshCw className={cn("h-3 w-3", isLoadingHomeData && "animate-spin text-primary")} />
                </button>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <Bell className="h-3 w-3" />
                </div>
                <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                  <ShoppingCart className="h-3 w-3" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                    2
                  </span>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
              <div className="w-full h-7 pl-7 pr-3 rounded-full text-[10px] bg-slate-100 border border-slate-200/80 text-slate-500 flex items-center truncate">
                {t("preview.searchPlaceholder")}
              </div>
            </div>
          </div>

          {/* Scrollable Feed */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-12 space-y-3.5 px-3 pt-2 scrollbar-none">
            {isLoadingHomeData && !homeData ? (
              <div className="py-24 text-center px-4 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs text-slate-400 font-medium">Loading live preview data...</p>
              </div>
            ) : activeSections.length === 0 ? (
              <div className="py-24 text-center px-4">
                <p className="text-xs text-slate-400">{t("preview.noActiveSections")}</p>
              </div>
            ) : (
              activeSections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => onSelectSection?.(section.id)}
                  className={cn(
                    "rounded-xl transition-all duration-150 cursor-pointer",
                    selectedSectionId === section.id && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {/* 1. Hero Banner */}
                  {section.type === "hero_banner" && (() => {
                    // Check banners configured on the section first (using imageUrl)
                    const sectionBanners =
                      section.config.banners && section.config.banners.length > 0
                        ? section.config.banners
                            .filter((b) => Boolean(b.imageUrl || (b as any).imageName))
                            .map((b) => ({
                              id: b.id,
                              imageUrl: b.imageUrl || (b as any).imageName || "",
                              title: b.title || "",
                              subtitle: b.subtitle || "",
                            }))
                        : [];

                    // If section has banners, use them. Otherwise fallback to live API banners from homeData
                    const heroBanners =
                      sectionBanners.length > 0
                        ? sectionBanners
                        : homeData?.banners && homeData.banners.length > 0
                        ? homeData.banners.map((b) => ({
                            id: b.id,
                            imageUrl: b.imageUrl || b.imageName || (b as any).imageFile || "",
                            title: "",
                            subtitle: "",
                          }))
                        : [];

                    const currentBanner =
                      heroBanners[activeHeroIndex % Math.max(1, heroBanners.length)];

                    return (
                      <div className="space-y-1.5">
                        <div className="relative h-32 w-full rounded-xl overflow-hidden shadow-xs bg-slate-200">
                          {currentBanner?.imageUrl ? (
                            <>
                              <img
                                src={currentBanner.imageUrl}
                                alt={currentBanner.title || "Banner"}
                                className="h-full w-full object-cover"
                              />
                              {currentBanner.title && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-2.5 text-white">
                                  <h3 className="text-[11px] font-bold leading-tight">
                                    {currentBanner.title}
                                  </h3>
                                  {currentBanner.subtitle && (
                                    <p className="text-[9px] text-white/80 line-clamp-1 mt-0.5">
                                      {currentBanner.subtitle}
                                    </p>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="h-full w-full bg-primary/10 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-primary text-xs font-semibold gap-1">
                              <span>Hero Banner</span>
                              <span className="text-[9px] text-muted-foreground font-normal">
                                No banners configured
                              </span>
                            </div>
                          )}
                        </div>

                        {heroBanners.length > 1 && (
                          <div className="flex justify-center gap-1 py-0.5">
                            {heroBanners.map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveHeroIndex(i);
                                }}
                                className={cn(
                                  "h-1 rounded-full transition-all",
                                  activeHeroIndex === i ? "w-4 bg-primary" : "w-1 bg-slate-300"
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 2. Video Stories / Providers */}
                  {section.type === "video_stories" && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-800">
                          {homeData?.providers && homeData.providers.length > 0
                            ? (t("preview.certifiedDoctors") || "Providers & Doctors")
                            : section.title}
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {homeData?.providers && homeData.providers.length > 0
                          ? homeData.providers.map((prov) => (
                              <div key={prov.id} className="flex flex-col items-center shrink-0 w-12">
                                <div className="relative p-0.5 rounded-full ring-2 ring-primary">
                                  <img
                                    src={prov.profileImage || fallbackImg}
                                    alt={prov.fullName}
                                    className="h-10 w-10 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = fallbackImg;
                                    }}
                                  />
                                  {prov.isAvailableNow && (
                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                                  )}
                                </div>
                                <span className="mt-1 text-[8px] font-medium text-slate-700 truncate w-full text-center">
                                  {prov.fullName}
                                </span>
                              </div>
                            ))
                          : section.config.stories?.map((st) => (
                              <div key={st.id} className="flex flex-col items-center shrink-0 w-12">
                                <div className="p-0.5 rounded-full ring-2 ring-primary">
                                  <img
                                    src={st.thumbnailUrl}
                                    alt={st.doctorName}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                </div>
                                <span className="mt-1 text-[8px] font-medium text-slate-700 truncate w-full text-center">
                                  {st.doctorName}
                                </span>
                              </div>
                            ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Categories */}
                  {section.type === "categories_circle" && (() => {
                    const categoriesList =
                      homeData?.categories && homeData.categories.length > 0
                        ? homeData.categories.map((c) => ({
                            id: c.id,
                            name: c.name,
                            imageUrl: c.imageFile,
                          }))
                        : section.config.categories || [];

                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800">{section.title}</span>
                          <span className="text-[9px] text-primary font-semibold">{t("preview.viewAll")}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {categoriesList.slice(0, 6).map((cat) => (
                            <div
                              key={cat.id}
                              className="flex flex-col items-center p-2 rounded-xl bg-white border border-slate-100 text-center shadow-2xs hover:border-primary/40 transition-all"
                            >
                              <img
                                src={cat.imageUrl || fallbackImg}
                                alt={cat.name}
                                className="h-8 w-8 rounded-full object-cover mb-1 border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = fallbackImg;
                                }}
                              />
                              <span className="text-[9px] font-bold text-slate-800 line-clamp-1">
                                {cat.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 4. Flash Sale */}
                  {section.type === "flash_sale" && (() => {
                    const flashProducts =
                      homeData?.products && homeData.products.length > 0
                        ? homeData.products.slice(0, 4).map((p) => ({
                            id: p.productId || p.productPriceId,
                            title: p.productName,
                            price: p.salesPrice,
                            imageUrl: p.image,
                          }))
                        : section.config.products || [];

                    return (
                      <div className="p-2.5 rounded-xl border border-red-200 bg-red-50/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-red-600 font-bold text-[11px]">
                            <Flame className="h-3.5 w-3.5" />
                            <span>{section.title}</span>
                          </div>
                          <span className="bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                            05:42:19
                          </span>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                          {flashProducts.map((prod) => (
                            <div
                              key={prod.id}
                              className="shrink-0 w-24 p-1.5 rounded-lg bg-white border border-slate-200"
                            >
                              <img
                                src={prod.imageUrl || fallbackImg}
                                alt={prod.title}
                                className="h-14 w-full rounded object-cover mb-1"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = fallbackImg;
                                }}
                              />
                              <p className="text-[9px] font-semibold text-slate-800 line-clamp-1">
                                {prod.title}
                              </p>
                              <p className="text-[10px] font-bold text-red-600 mt-0.5">
                                {prod.price} EGP
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 5. Featured Products */}
                  {section.type === "featured_products" && (() => {
                    const productsList =
                      section.config.products && section.config.products.length > 0
                        ? section.config.products
                        : homeData?.products && homeData.products.length > 0
                        ? homeData.products.slice(0, 6).map((p: any) => ({
                            id: p.productId || p.productPriceId,
                            title: p.productName,
                            price: p.salesPrice,
                            imageUrl:
                              (Array.isArray(p.images) && p.images.length > 0
                                ? typeof p.images[0] === "string"
                                  ? p.images[0]
                                  : p.images[0]?.url || p.images[0]?.imageUrl || p.images[0]?.imagePath
                                : null) ||
                              p.image ||
                              p.imageUrl,
                          }))
                        : [];

                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800">{section.title}</span>
                          <span className="text-[9px] text-primary font-semibold">{t("preview.viewAll")}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {productsList.map((prod) => (
                            <div
                              key={prod.id}
                              className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between"
                            >
                              <img
                                src={prod.imageUrl || fallbackImg}
                                alt={prod.title}
                                className="h-16 w-full rounded-lg object-cover mb-1"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = fallbackImg;
                                }}
                              />
                              <h5 className="text-[9px] font-semibold text-slate-800 line-clamp-1">
                                {prod.title}
                              </h5>
                              <div className="mt-1 flex items-center justify-between">
                                <div className="flex items-center gap-1 min-w-0">
                                  <span className="text-[10px] font-bold text-slate-900">
                                    {prod.price} EGP
                                  </span>
                                  {Boolean((prod as any).oldPrice && (prod as any).oldPrice > prod.price) && (
                                    <span className="text-[8px] text-muted-foreground line-through">
                                      {(prod as any).oldPrice}
                                    </span>
                                  )}
                                </div>
                                <div className="h-5 w-5 rounded bg-primary text-white flex items-center justify-center shrink-0">
                                  <Plus className="h-3 w-3" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 6. Dual Promo Grid / Special Offers */}
                  {section.type === "promo_grid_2x" && (() => {
                    const promoList =
                      homeData?.specialOffersone && homeData.specialOffersone.length > 0
                        ? homeData.specialOffersone.map((so, idx) => ({
                            id: `so_${idx}`,
                            imageUrl: so.imagePath,
                            title: "",
                          }))
                        : section.config.banners || [];

                    return (
                      <div className="grid grid-cols-2 gap-2">
                        {promoList.map((pb) => (
                          <div
                            key={pb.id}
                            className="relative h-24 rounded-xl overflow-hidden shadow-2xs bg-slate-100"
                          >
                            <img
                              src={pb.imageUrl || fallbackImg}
                              alt="Offer"
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = fallbackImg;
                              }}
                            />
                            {pb.title && (
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-1.5 text-white">
                                <p className="text-[9px] font-bold leading-tight line-clamp-1">
                                  {pb.title}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* 7. Brands */}
                  {section.type === "brand_slider" && (() => {
                    const brandsList =
                      homeData?.brands && homeData.brands.length > 0
                        ? homeData.brands.map((b) => ({
                            id: String(b.id),
                            name: b.name,
                          }))
                        : section.config.brands || [];

                    return (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-800">{section.title}</span>
                        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                          {brandsList.map((brand) => (
                            <div
                              key={brand.id}
                              className="shrink-0 px-2.5 py-1 rounded bg-white border text-[9px] font-bold text-slate-700"
                            >
                              {brand.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))
            )}
          </div>

          {/* Bottom Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-40 flex items-center justify-around py-1.5 bg-white border-t border-slate-200 text-slate-500 text-[8px] font-medium">
            <span className="text-primary font-bold">{t("preview.home")}</span>
            <span>{t("preview.categories")}</span>
            <span>{t("preview.deals")}</span>
            <span>{t("preview.orders")}</span>
            <span>{t("preview.profile")}</span>
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-50 h-1 w-24 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
