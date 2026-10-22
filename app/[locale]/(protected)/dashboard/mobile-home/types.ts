export type SectionType =
  | "hero_banner"
  | "categories_circle"
  | "flash_sale"
  | "featured_products"
  | "promo_grid_2x"
  | "single_promo_banner"
  | "brand_slider"
  | "video_stories"
  | "doctor_reviews"
  | "deal_grid_2x"
  | (string & {});

export interface BannerItem {
  id: string;
  kind?: number;
  title: string;
  subtitle?: string;
  price?: number;
  imageUrl: string;
  imageFile?: File | null;
  linkUrl?: string;
  productPriceId?: string | null;
  linkSectionId?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  badge?: string;
  linkType?: "external" | "product" | "section" | "category" | "brand" | "flash_sale" | (string & {});
  targetId?: string;
  buttonText?: string;
  bgColor?: string;
  selectedProductName?: string;
  selectedProductImage?: string;
  selectedSectionTitle?: string;
}

export interface ProductItem {
  id: string;
  kind?: number;
  title: string;
  subtitle?: string;
  category: string;
  price: number;
  salesPrice?: number | null;
  oldPrice?: number | null;
  discountRate?: number | null;
  originalPrice?: number;
  discountPercentage?: number;
  rating?: number;
  reviewsCount?: number;
  imageUrl: string;
  imageFile?: File | null;
  linkUrl?: string;
  productPriceId?: string;
  categoryId?: string;
  brandId?: string;
  inStock?: boolean;
  brand?: string;
  badge?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  iconName?: string;
  imageUrl?: string;
  bgColor?: string;
  itemCount?: number;
  badge?: string;
}

export interface BrandItem {
  id: string;
  name: string;
  logoUrl: string;
  featured?: boolean;
}

export interface StoryItem {
  id: string;
  title: string;
  doctorName: string;
  clinicName?: string;
  thumbnailUrl: string;
  duration?: string;
  isLive?: boolean;
}

export interface ReviewItem {
  id: string;
  doctorName: string;
  clinicName: string;
  avatarUrl: string;
  rating: number;
  comment: string;
  productName?: string;
  verified: boolean;
}

export interface SectionConfig {
  layout?: "carousel" | "grid_2" | "grid_3" | "grid_4" | "circle" | "card" | "single" | "dual_half" | "list";
  bgStyle?: "white" | "gradient_blue" | "gradient_purple" | "gradient_emerald" | "subtle_gray" | "dark";
  showViewAll?: boolean;
  viewAllRoute?: string;
  viewAllText?: string;
  autoplay?: boolean;
  autoplayInterval?: number;
  // Flash sale specific
  countdownEndHours?: number;
  flashSaleEndsAt?: string;
  progressPercent?: number;
  // Items arrays for respective section types
  banners?: BannerItem[];
  products?: ProductItem[];
  categories?: CategoryItem[];
  brands?: BrandItem[];
  stories?: StoryItem[];
  reviews?: ReviewItem[];
  // Schedule
  isScheduled?: boolean;
  scheduleStart?: string;
  scheduleEnd?: string;
}

export interface HomeSectionTypeDto {
  type: number;
  key: string;
  name: string;
  defaultTitle: string;
  defaultSubtitle: string;
  itemKind: number;
}

export interface HomeSection {
  id: string;
  type: SectionType;
  typeNumber?: number;
  itemKind?: number;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: "red" | "blue" | "emerald" | "amber" | "purple" | "indigo";
  enabled: boolean;
  order: number;
  config: SectionConfig;
  lastUpdated?: string;
  isStatic?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  items?: any[];
}

export interface LayoutPreset {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  tag: string;
  tagColor: string;
  icon: string;
  sections: HomeSection[];
}
