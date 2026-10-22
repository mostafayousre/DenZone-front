import { HomeSection, LayoutPreset } from "./types";

// The 4 base fixed sections: Main Hero Slider, Shop By Category, Flash Deals, Doctor Tips & Demos
export const BASE_INITIAL_SECTIONS: HomeSection[] = [
  {
    id: "sec_hero_banners",
    type: "hero_banner",
    title: "Main Hero Slider",
    subtitle: "High impact top carousel",
    badge: "TOP CAROUSEL",
    badgeColor: "blue",
    enabled: true,
    order: 1,
    isStatic: true,
    config: {
      autoplay: true,
      autoplayInterval: 4000,
      layout: "carousel",
      banners: [],
    },
  },
  {
    id: "sec_categories",
    type: "categories_circle",
    title: "Shop By Category",
    subtitle: "Explore dental supplies catalog",
    badge: "TOP CATEGORIES",
    badgeColor: "indigo",
    enabled: true,
    order: 2,
    isStatic: true,
    config: {
      layout: "circle",
      showViewAll: true,
      categories: [],
    },
  },
  {
    id: "sec_flash_sale",
    type: "flash_sale",
    title: "Flash Deals • Limited Time",
    subtitle: "Special discounts expiring soon",
    badge: "LIMITED TIME",
    badgeColor: "red",
    enabled: true,
    order: 3,
    isStatic: true,
    config: {
      countdownEndHours: 6,
      showViewAll: true,
      products: [],
    },
  },
  {
    id: "sec_video_stories",
    type: "video_stories",
    title: "Doctor Tips & Demos",
    subtitle: "Quick video stories from certified doctors",
    badge: "STORIES",
    badgeColor: "purple",
    enabled: true,
    order: 4,
    isStatic: true,
    config: {
      stories: [],
    },
  },
];

export const INITIAL_SECTIONS: HomeSection[] = BASE_INITIAL_SECTIONS;

export const LAYOUT_PRESETS: LayoutPreset[] = [];
