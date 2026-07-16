"use client";

import { useEffect, useState } from "react";
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
import { Loader2, Plus, Eye, AlertCircle, Calendar, Sparkles } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import useGetFlashSalesDashboard from "@/services/productPrice/getFlashSalesDashboard";
import useToggleFlashSaleStatus from "@/services/productPrice/toggleFlashSaleStatus";
import { formatOrderDate } from "@/utils";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface StatusCellProps {
  sale: {
    flashId: string;
    isActive: boolean;
  };
  t: (key: string) => string;
  refresh: () => void;
}

const StatusCell = ({ sale, t, refresh }: StatusCellProps) => {
  const [isActive, setIsActive] = useState(sale.isActive);
  const { toggleFlashSaleStatus, loading } = useToggleFlashSaleStatus();

  // Keep state in sync with server updates
  useEffect(() => {
    setIsActive(sale.isActive);
  }, [sale.isActive]);

  const handleToggle = async (checked: boolean) => {
    const prev = isActive;
    setIsActive(checked); // Optimistic UI update
    const res = await toggleFlashSaleStatus(sale.flashId, checked);
    if (res.success) {
      toast.success(`Flash sale status updated to ${checked ? t("active") : t("inactive")}`);
      refresh();
    } else {
      setIsActive(prev); // Revert on failure
      toast.error(res.error || "Failed to update status");
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <Switch checked={isActive} onCheckedChange={handleToggle} />
      )}
      <span className={`text-[12px] font-semibold ${isActive ? "text-emerald-500" : "text-amber-500"}`}>
        {isActive ? t("active") : t("inactive")}
      </span>
    </div>
  );
};

function FlashSalesListPage() {
  const t = useTranslations("FlashSale");
  const router = useRouter();
  const { fetchFlashSales, flashSales, loading, error } = useGetFlashSalesDashboard();

  useEffect(() => {
    fetchFlashSales();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-default-100 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary/90 to-primary bg-clip-text flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            {t("flashSalesList")}
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor and manage all limited-time active or scheduled flash sales.
          </p>
        </div>
        <div>
          <Button
            onClick={() => router.push("/dashboard/flash-sale/create")}
            className="flex items-center gap-2 cursor-pointer font-semibold shadow-sm hover:scale-[1.02] transition-transform"
          >
            <Plus className="h-4.5 w-4.5" />
            {t("createFlashSale")}
          </Button>
        </div>
      </div>

      {/* Main content table card */}
      <Card className="border border-default-200 shadow-lg bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-default-100/60 bg-default-50/10 py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground/90">
            <Calendar className="h-5 w-5 text-primary/80" />
            All Campaigns
          </CardTitle>
          <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full border border-primary/20">
            {flashSales.length} total
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading flash sales...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <AlertCircle className="h-10 w-10 text-destructive mb-3" />
              <h3 className="font-semibold text-lg text-foreground">Failed to load data</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchFlashSales}>
                Try Again
              </Button>
            </div>
          ) : flashSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center border border-dashed border-primary/25 mb-4">
                <Calendar className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="font-bold text-xl text-foreground/90">{t("noFlashSales")}</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
                Start setting up limited-time promotional pricing on products.
              </p>
              <Button onClick={() => router.push("/dashboard/flash-sale/create")}>
                {t("createFlashSale")}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-default-50/30">
                  <TableRow className="border-b border-default-100 hover:bg-transparent">
                    <TableHead className="py-3.5 px-6 text-xs font-bold text-foreground/75 uppercase tracking-wider">{t("name")}</TableHead>
                    <TableHead className="py-3.5 px-6 text-xs font-bold text-foreground/75 uppercase tracking-wider">{t("startDate")}</TableHead>
                    <TableHead className="py-3.5 px-6 text-xs font-bold text-foreground/75 uppercase tracking-wider">{t("endDate")}</TableHead>
                    <TableHead className="py-3.5 px-6 text-xs font-bold text-foreground/75 uppercase tracking-wider text-center">{t("itemsCount")}</TableHead>
                    <TableHead className="py-3.5 px-6 text-xs font-bold text-foreground/75 uppercase tracking-wider text-center">{t("status")}</TableHead>
                    <TableHead className="py-3.5 px-6 text-xs font-bold text-foreground/75 uppercase tracking-wider text-right w-[100px]">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flashSales.map((sale) => (
                    <TableRow
                      key={sale.flashId}
                      className="border-b border-default-100/60 hover:bg-default-50/15 duration-200 transition-colors"
                    >
                      <TableCell className="py-4 px-6 font-semibold text-sm text-foreground/95">
                        {sale.flashSaleName}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-xs text-muted-foreground font-medium">
                        {formatOrderDate(sale.startDate)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-xs text-muted-foreground font-medium">
                        {formatOrderDate(sale.endDate)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center text-sm font-semibold">
                        <span className="bg-default-100 text-default-700 px-2.5 py-0.5 rounded-full text-xs font-medium border border-default-200/50">
                          {sale.items?.length || 0}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <StatusCell sale={sale} t={t} refresh={fetchFlashSales} />
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/flash-sale/details?flashId=${sale.flashId}`)}
                          className="h-8 w-8 text-primary hover:text-primary-foreground hover:bg-primary duration-200 transition-all rounded-full"
                          title={t("viewDetails")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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

export default FlashSalesListPage;
