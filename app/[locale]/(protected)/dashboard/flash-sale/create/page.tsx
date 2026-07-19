"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Search, SlidersHorizontal, Trash2, Calendar, Check, AlertCircle, Plus, Users, Gift, ArrowLeft, ChevronsUpDown } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import useGetUsersByRoleId from "@/services/users/GetUsersByRoleId";
import useCreateFlashSale from "@/services/productPrice/createFlashSale";
import AxiosInstance from "@/lib/AxiosInstance";
import { Price } from "@/types/price";

type SelectedItemType = {
  productPriceId: string;
  flashSalePrice: number;
  beforeSalePrice: number;
  productName: string;
  categoryName: string;
  providerId: string;
  providerName: string;
};

type ProviderSection = {
  id: string; // local unique identifier
  providerId: string;
  productSearch: string;
};

interface SearchableSelectProps {
  value: string;
  onValueChange: (val: string) => void;
  placeholder: string;
  loading?: boolean;
  options: { value: string; label: string }[];
  className?: string;
  disabled?: boolean;
}

function SearchableSelect({
  value,
  onValueChange,
  placeholder,
  loading,
  options,
  className,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn("w-full justify-between font-normal h-9 px-3 text-sm", className)}
        >
          <span className="truncate text-left flex-1">
            {loading
              ? "Loading..."
              : selectedLabel || <span className="text-muted-foreground">{placeholder}</span>}
          </span>
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => {
                      onValueChange(opt.value === value ? "" : opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 flex-shrink-0",
                        value === opt.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function AddFlashSalePage() {
  const t = useTranslations("FlashSale");
  const router = useRouter();

  // Create hook instances
  const { getUsersByRoleId, users, loading: usersLoading } = useGetUsersByRoleId();
  const { createFlashSale, loading: submitLoading } = useCreateFlashSale();

  // Form State
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Multi-Provider state
  const [providerSections, setProviderSections] = useState<ProviderSection[]>([
    { id: "initial-1", providerId: "", productSearch: "" },
  ]);
  const [providerProducts, setProviderProducts] = useState<Record<string, Price[]>>({});
  const [providerProductsLoading, setProviderProductsLoading] = useState<Record<string, boolean>>({});

  // Selected products mapped by productPriceId
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItemType>>({});

  // Fetch initial data: Providers (roleId 1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D)
  useEffect(() => {
    getUsersByRoleId("1A5A84FB-23C3-4F9B-A122-4C5BC6C5CB2D");
  }, []);

  // Add new provider section
  const handleAddProviderSection = () => {
    const newId = Date.now().toString();
    setProviderSections((prev) => [...prev, { id: newId, providerId: "", productSearch: "" }]);
  };

  // Remove a provider section
  const handleRemoveProviderSection = (sectionId: string, providerId: string) => {
    setProviderSections((prev) => prev.filter((s) => s.id !== sectionId));

    // Also rected products belonging tmove any seleo this provider
    if (providerId) {
      setSelectedItems((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key].providerId === providerId) {
            delete next[key];
          }
        });
        return next;
      });
    }
  };

  // Select a provider for a section
  const handleSelectProvider = async (sectionId: string, providerId: string) => {
    // Prevent duplicate providers
    if (providerSections.some((s) => s.providerId === providerId && s.id !== sectionId)) {
      toast.warning("This provider is already added to the flash sale list.");
      return;
    }

    // Update section's provider
    setProviderSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, providerId, productSearch: "" } : s))
    );

    // Fetch provider's products if not cached
    if (providerId && !providerProducts[providerId]) {
      setProviderProductsLoading((prev) => ({ ...prev, [providerId]: true }));
      try {
        const response = await AxiosInstance.get(`/api/ProductPrices/by-inventory-user-Provider/${providerId}`, {
          params: { page: 0, pageSize: 0 }, // Fetch large batch for dropdown selection
        });
        const payload = response.data?.data || response.data;
        const productsList = Array.isArray(payload) ? payload : [];
        setProviderProducts((prev) => ({ ...prev, [providerId]: productsList }));
      } catch (err) {
        toast.error("Failed to load products for this provider.");
      } finally {
        setProviderProductsLoading((prev) => ({ ...prev, [providerId]: false }));
      }
    }
  };

  // Update search text inside provider section
  const handleProductSearchChange = (sectionId: string, query: string) => {
    setProviderSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, productSearch: query } : s))
    );
  };

  // Toggle/Select product from provider dropdown
  const handleAddProduct = (providerId: string, priceItem: Price) => {
    if (!priceItem.id) return;
    const providerObj = users.find((u) => u.id === providerId);
    const providerName = providerObj?.businessName || providerObj?.fullName || "Provider";

    setSelectedItems((prev) => ({
      ...prev,
      [priceItem.id!]: {
        productPriceId: priceItem.id!,
        beforeSalePrice: priceItem.salesPrice,
        flashSalePrice: priceItem.salesPrice, // default to original sales price
        productName: priceItem.productName,
        categoryName: priceItem.categoryName,
        providerId,
        providerName,
      },
    }));
  };

  // Update flash sale price for product
  const handlePriceChange = (itemId: string, newPrice: number) => {
    setSelectedItems((prev) => {
      if (!prev[itemId]) return prev;
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          flashSalePrice: newPrice,
        },
      };
    });
  };

  // Remove individual product
  const handleRemoveProduct = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  // Submit Flash Sale
  const onSubmit = async () => {
    if (!name.trim() || !startDate || !endDate) {
      toast.error(t("validationError"), {
        description: t("fillRequiredFields"),
      });
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error(t("validationError"), {
        description: t("dateError"),
      });
      return;
    }

    const itemsArray = Object.values(selectedItems);
    if (itemsArray.length === 0) {
      toast.error(t("validationError"), {
        description: t("selectAtLeastOne"),
      });
      return;
    }

    // Validate prices
    for (const item of itemsArray) {
      if (item.flashSalePrice <= 0 || item.flashSalePrice > item.beforeSalePrice) {
        toast.error(t("validationError"), {
          description: `${item.productName}: ${t("invalidPrice")}`,
        });
        return;
      }
    }

    const payload = {
      flashSaleName: name,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      items: itemsArray.map(({ productPriceId, flashSalePrice, beforeSalePrice }) => ({
        productPriceId,
        flashSalePrice,
        beforeSalePrice,
      })),
    };

    const result = await createFlashSale(payload);
    if (result.success) {
      toast.success(t("successAdd"));
      router.push("/dashboard/flash-sale");
    } else {
      toast.error(t("validationError"), {
        description: result.error,
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
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
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary/90 to-primary bg-clip-text mt-1">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm">
          Set up a limited-time flash sale for multiple providers and products simultaneously.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Configuration & Multi-Provider Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Flash Sale Configuration */}
          <Card className="border border-default-200 shadow-md bg-card/40 backdrop-blur-md">
            <CardHeader className="border-b border-default-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                Flash Sale Info
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flashSaleName" className="font-semibold text-foreground/90">
                  {t("name")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="flashSaleName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="bg-default-50 border-default-300 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="font-semibold text-foreground/90 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {t("startDate")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-default-50 border-default-300 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="font-semibold text-foreground/90 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {t("endDate")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-default-50 border-default-300 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Heading & Add Button */}
          <div className="flex items-center justify-between border-b border-default-200 pb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Providers Inventory Selection
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddProviderSection}
              className="flex items-center gap-1 cursor-pointer font-medium hover:bg-default-100"
            >
              <Plus className="h-4 w-4" />
              Add Provider
            </Button>
          </div>

          {/* Provider Selection Cards */}
          {providerSections.map((section, idx) => {
            const hasSelectedProvider = !!section.providerId;
            const isLoading = providerProductsLoading[section.providerId];
            const rawProducts = providerProducts[section.providerId] || [];

            // Filter dropdown options by search text
            const filteredProducts = rawProducts.filter(
              (p) =>
                p.productName.toLowerCase().includes(section.productSearch.toLowerCase()) &&
                !selectedItems[p.id!] // hide already selected items from dropdown options
            );

            // Selected products belonging to this provider
            const selectedForThisProvider = Object.values(selectedItems).filter(
              (item) => item.providerId === section.providerId
            );

            return (
              <Card
                key={section.id}
                className="border border-default-200 shadow-sm relative overflow-hidden bg-card/20"
              >
                {/* Ribbon number indicator */}
                <div className="absolute top-0 right-0 bg-default-100 text-default-500 text-xs px-2.5 py-1 rounded-bl-lg font-medium border-l border-b border-default-200">
                  #{idx + 1}
                </div>

                <CardHeader className="p-4 border-b border-default-100 flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full max-w-sm">
                    {/* Provider Select */}
                    <SearchableSelect
                      value={section.providerId}
                      onValueChange={(val) => handleSelectProvider(section.id, val)}
                      placeholder={t("providerPlaceholder")}
                      loading={usersLoading}
                      options={users.map((provider) => ({
                        value: provider.id,
                        label: provider.businessName || provider.fullName || provider.userName || "",
                      }))}
                      className="bg-default-50 border-default-300 w-full"
                    />
                  </div>

                  {/* Remove provider section button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProviderSection(section.id, section.providerId)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer h-9 px-3"
                  >
                    Remove Provider
                  </Button>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {hasSelectedProvider ? (
                    isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="animate-spin h-4 w-4 text-primary" />
                        Fetching provider's products...
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Search and Product Selection */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          {/* Local filter for the select options */}
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              placeholder="Type to filter product list..."
                              value={section.productSearch}
                              onChange={(e) => handleProductSearchChange(section.id, e.target.value)}
                              className="pl-8 h-9 text-sm"
                            />
                          </div>

                          {/* Product select dropdown */}
                          <SearchableSelect
                            value=""
                            onValueChange={(val) => {
                              const matchItem = rawProducts.find((p) => p.id === val);
                              if (matchItem) handleAddProduct(section.providerId, matchItem);
                            }}
                            placeholder="Add Product to Sale..."
                            options={filteredProducts.map((p) => ({
                              value: p.id!,
                              label: `${p.productName} (${p.salesPrice} EGP)`,
                            }))}
                            className="bg-default-50 border-default-300 w-full sm:w-[260px] h-9"
                          />
                        </div>

                        {/* Local selected items table for this provider */}
                        {selectedForThisProvider.length > 0 ? (
                          <div className="rounded-lg border border-default-100 overflow-hidden bg-background/50">
                            <Table>
                              <TableHeader className="bg-default-50/50">
                                <TableRow>
                                  <TableHead className="py-2 text-xs">{t("productName")}</TableHead>
                                  <TableHead className="py-2 text-xs">{t("category")}</TableHead>
                                  <TableHead className="py-2 text-xs text-right">{t("originalPrice")}</TableHead>
                                  <TableHead className="py-2 text-xs text-right w-[150px]">{t("flashSalePrice")}</TableHead>
                                  <TableHead className="py-2 w-[40px]"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedForThisProvider.map((item) => {
                                  const isPriceError = item.flashSalePrice <= 0 || item.flashSalePrice > item.beforeSalePrice;
                                  return (
                                    <TableRow key={item.productPriceId} className="hover:bg-default-50/30">
                                      <TableCell className="font-medium text-xs py-2">
                                        {item.productName}
                                      </TableCell>
                                      <TableCell className="text-xs text-muted-foreground py-2">
                                        {item.categoryName}
                                      </TableCell>
                                      <TableCell className="text-xs text-right font-medium py-2">
                                        {item.beforeSalePrice} EGP
                                      </TableCell>
                                      <TableCell className="py-2 text-right">
                                        <Input
                                          type="number"
                                          value={item.flashSalePrice === 0 ? "" : item.flashSalePrice}
                                          onChange={(e) =>
                                            handlePriceChange(item.productPriceId, parseFloat(e.target.value) || 0)
                                          }
                                          className={`w-28 text-right text-xs h-7 px-2 border ${
                                            isPriceError
                                              ? "border-destructive text-destructive"
                                              : "border-primary/50 text-primary"
                                          }`}
                                        />
                                      </TableCell>
                                      <TableCell className="py-2 text-center">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleRemoveProduct(item.productPriceId)}
                                          className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors rounded hover:bg-destructive/10"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center p-6 text-center text-xs text-muted-foreground bg-default-50/20 border border-dashed border-default-200 rounded-lg">
                            No products added from this provider yet. Use the dropdown above.
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground text-xs">
                      <AlertCircle className="h-5 w-5 text-muted-foreground/50 mb-1" />
                      Select a provider from the header list to populate the inventory dropdown.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right column: Selected Summary Pane */}
        <div className="space-y-6">
          <Card className="border border-default-200 shadow-md bg-card/40 backdrop-blur-md sticky top-6">
            <CardHeader className="border-b border-default-100 flex items-center justify-between p-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-success" />
                {t("selectedProducts")}
              </CardTitle>
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                {Object.keys(selectedItems).length} items
              </span>
            </CardHeader>
            <CardContent className="p-6">
              {Object.keys(selectedItems).length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed border-default-200 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm">{t("noProductsSelected")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Flattened selection summary list */}
                  <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3">
                    {Object.values(selectedItems).map((item) => {
                      const isPriceError = item.flashSalePrice <= 0 || item.flashSalePrice > item.beforeSalePrice;

                      return (
                        <div
                          key={item.productPriceId}
                          className="flex items-center justify-between gap-3 p-3 bg-default-50/50 hover:bg-default-50 rounded-lg border border-default-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate text-foreground">
                              {item.productName}
                            </h4>
                            <p className="text-xs text-muted-foreground/80 truncate">
                              Provider: {item.providerName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Orig: {item.beforeSalePrice} EGP
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={item.flashSalePrice === 0 ? "" : item.flashSalePrice}
                              onChange={(e) =>
                                handlePriceChange(item.productPriceId, parseFloat(e.target.value) || 0)
                              }
                              className={`w-20 text-right text-xs p-1.5 h-8 border ${
                                isPriceError
                                  ? "border-destructive text-destructive focus-visible:ring-destructive"
                                  : "border-default-300"
                              }`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveProduct(item.productPriceId)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submission actions */}
                  <div className="pt-4 border-t border-default-100">
                    <Button
                      onClick={onSubmit}
                      className="w-full flex items-center justify-center gap-2 cursor-pointer font-semibold shadow-sm"
                      disabled={submitLoading || Object.keys(selectedItems).length === 1}
                    >
                      {submitLoading ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4" />
                          Creating...
                        </>
                      ) : (
                        t("submit")
                      )}
                    </Button>
                  </div>
                                      {Object.keys(selectedItems).length < 2 && (
                      <p className="text-xs text-destructive text-center mt-1">
                        Please add at least 2 product
                      </p>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AddFlashSalePage;