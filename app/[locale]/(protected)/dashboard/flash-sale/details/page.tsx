"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Gift,
  AlertCircle,
  Tag,
  Clock,
  Layers,
  ShoppingBag,
  TrendingDown,
} from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import useGetFlashSaleDetails from "@/services/productPrice/getFlashSaleDetails";
import { formatOrderDate } from "@/utils";

function FlashSaleDetailsPage() {
  const t = useTranslations("FlashSale");
  const router = useRouter();
  const searchParams = useSearchParams();
  const flashId = searchParams?.get("flashId") || null;

  const { fetchDetails, details, loading, error } = useGetFlashSaleDetails();

  useEffect(() => {
    if (flashId) {
      fetchDetails(flashId);
    }
  }, [flashId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading campaign details...</p>
      </div>
    );
  }

  if (error || !flashId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto">
        <AlertCircle className="h-12 w-12 text-destructive mb-3" />
        <h3 className="font-bold text-lg text-foreground">Error Loading Details</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          {error || "No valid Flash Sale ID was provided in the query parameters."}
        </p>
        <Button onClick={() => router.push("/dashboard/flash-sale")} className="w-full">
          {t("backToList")}
        </Button>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 max-w-md mx-auto">
        <AlertCircle className="h-12 w-12 text-muted-foreground/60 mb-3" />
        <h3 className="font-bold text-lg text-foreground">Campaign Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          We couldn't retrieve details for this flash sale campaign. It might have been deleted or expired.
        </p>
        <Button onClick={() => router.push("/dashboard/flash-sale")} className="w-full">
          {t("backToList")}
        </Button>
      </div>
    );
  }

  const startDateObj = new Date(details.startDate);
  const endDateObj = new Date(details.endDate);
  const now = new Date();
  const isExpired = now > endDateObj;
  const isUpcoming = now < startDateObj;
  const isCurrentlyActive = details.isActive && !isExpired && !isUpcoming;

  return (
    <div className="space-y-6 pb-12">
      {/* Back navigation and title */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/flash-sale")}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer pl-0 hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-1">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary/95 to-primary bg-clip-text">
              {details.flashSaleName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Flash Sale Campaign details and product pricing adjustments.
            </p>
          </div>
          <div>
            {isCurrentlyActive ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm animate-pulse">
                Active Now
              </span>
            ) : isUpcoming ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm">
                Scheduled
              </span>
            ) : isExpired ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/20 shadow-sm">
                Expired
              </span>
            ) : details.isActive ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                {t("active")}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
                {t("inactive")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-default-200 shadow bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary/80" />
              {t("duration")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">{t("startDate")}</p>
              <p className="font-semibold text-sm text-foreground/90">
                {formatOrderDate(details.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("endDate")}</p>
              <p className="font-semibold text-sm text-foreground/90">
                {formatOrderDate(details.endDate)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-default-200 shadow bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-success" />
              Campaign Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Total Products</p>
              <p className="text-3xl font-extrabold text-foreground">
                {details.items?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unique SKU Count</p>
              <p className="text-sm font-semibold text-foreground/90">
                {details.items?.length || 0} Items
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-default-200 shadow bg-card/40 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-amber-500" />
              Promotional Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Average Discount</p>
              <p className="text-3xl font-extrabold text-foreground">
                {details.items && details.items.length > 0
                  ? Math.round(
                      details.items.reduce((sum, item) => sum + item.discountPercentage, 0) /
                        details.items.length
                    )
                  : 0}
                %
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-emerald-500" /> Max Discount Offered
              </p>
              <p className="text-sm font-semibold text-foreground/90">
                {details.items && details.items.length > 0
                  ? Math.max(...details.items.map((item) => item.discountPercentage))
                  : 0}
                % off
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table Card */}
      <Card className="border border-default-200 shadow-md bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-default-100 bg-default-50/10 py-4 px-6">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Promotional Products ({details.items?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!details.items || details.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/35 mb-2" />
              <p className="text-sm">No products configured for this flash sale.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-default-50/20">
                  <TableRow className="border-b border-default-100 hover:bg-transparent">
                    <TableHead className="py-3 px-6 text-xs font-bold text-foreground/75 uppercase tracking-wider">{t("productName")}</TableHead>
                    <TableHead className="py-3 px-6 text-xs font-bold text-foreground/75 uppercase tracking-wider text-right">{t("priceBefore")}</TableHead>
                    <TableHead className="py-3 px-6 text-xs font-bold text-foreground/75 uppercase tracking-wider text-right">{t("priceAfter")}</TableHead>
                    <TableHead className="py-3 px-6 text-xs font-bold text-foreground/75 uppercase tracking-wider text-center">{t("discount")}</TableHead>
                    <TableHead className="py-3 px-6 text-xs font-bold text-foreground/75 uppercase tracking-wider text-center">{t("stock")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.items.map((item) => (
                    <TableRow
                      key={item.productPriceId}
                      className="border-b border-default-100/50 hover:bg-default-50/10 duration-150 transition-colors"
                    >
                      <TableCell className="py-3.5 px-6 font-semibold text-xs md:text-sm text-foreground/90 max-w-sm">
                        <div className="flex items-center gap-3">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="h-10 w-10 object-cover rounded border border-default-200"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-default-100 border border-default-200 rounded flex items-center justify-center text-muted-foreground/50">
                              <ShoppingBag className="h-5 w-5" />
                            </div>
                          )}
                          <span className="truncate">{item.productName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-6 text-right text-xs md:text-sm text-muted-foreground line-through font-medium">
                        {item.beforeSalePrice.toFixed(2)} EGP
                      </TableCell>
                      <TableCell className="py-3.5 px-6 text-right text-xs md:text-sm font-extrabold text-primary">
                        {item.flashSalePrice.toFixed(2)} EGP
                      </TableCell>
                      <TableCell className="py-3.5 px-6 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-sm">
                          -{item.discountPercentage}%
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-6 text-center text-xs md:text-sm font-semibold text-foreground/80">
                        {item.stockQuantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FlashSaleDetailsPage;
