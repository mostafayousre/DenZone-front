"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import GetCategories from "@/services/categories/getCategories";
import useGetBrands from "@/services/brands/getAllBrands"; 
import { Loader2, X } from "lucide-react";
import useCreateProduct from "@/services/products/createProduct";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const AddProduct = () => {
  const t = useTranslations("productList");
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [arabicName, setArabicName] = useState<string>("");
  const [preef, setPref] = useState<string>("");
  const [arabicPreef, setArabicPreef] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [arabicDescription, setArabicDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [isPopular, setIsPopular] = useState<boolean>(false);
  const [revenuePercentage, setRevenuePercentage] = useState<string>("");
  
  const [photos, setPhotos] = useState<File[]>([]);
  
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);

  const [brandSearch, setBrandSearch] = useState<string>("");
  const [filteredBrands, setFilteredBrands] = useState<any[]>([]);

  const { loading: gettingAllCatLoading, data: categoriesData, gettingAllCategories } = GetCategories();
  const { loading: gettingBrandsLoading, brands, getAllBrands } = useGetBrands();
  const { createProduct, loading: creatingProductLoading } = useCreateProduct();

  useEffect(() => {
    gettingAllCategories();
    getAllBrands();
  }, []);

  useEffect(() => {
    if (categoriesData) {
      const filtered = categoriesData.filter((category: any) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categorySearch, categoriesData]);

  useEffect(() => {
    if (brands) {
      const filtered = brands.filter((brand: any) =>
        brand.name.toLowerCase().includes(brandSearch.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [brandSearch, brands]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    if (!name.trim() || !categoryId || !brandId) {
      toast.error(t("fillRequiredFields"));
      return;
    }

    const formData = new FormData();
    formData.append("Name", name);
    formData.append("ArabicName", arabicName);
    formData.append("Preef", preef);
    formData.append("ArabicPreef", arabicPreef);
    formData.append("Description", description);
    formData.append("ArabicDescription", arabicDescription);
    formData.append("CategoryId", categoryId);
    formData.append("BrandId", brandId);
    formData.append("IsPopular", isPopular.toString());
    formData.append("RevenuePercentage", revenuePercentage);
    
    photos.forEach((file) => {
      formData.append("Photos", file);
    });
    if (photos.length > 0) {
      formData.append("ImageName", photos[0].name);
    }

    try {
      const success = await createProduct(formData);
      if (success) {
        toast.success(t("productCreated"));
        router.push("/dashboard/product-list");
      }
    } catch (error) {
      toast.error(t("productCreationError"));
    }
  };

  if (gettingAllCatLoading || gettingBrandsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12 space-y-4">
        <Card>
          <CardHeader className="border-b border-solid border-default-200 mb-6">
            <CardTitle>{t("productDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Label className="w-[120px]">{t("productName")}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Label className="w-[120px]">{t("ArabicName")}</Label>
                <Input value={arabicName} onChange={(e) => setArabicName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Label className="w-[120px]">{t("productPref")}</Label>
                <Input value={preef} onChange={(e) => setPref(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Label className="w-[120px]">Arabic Preef</Label>
                <Input value={arabicPreef} onChange={(e) => setArabicPreef(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Label className="w-[120px]">{t("category")}</Label>
                <Select onValueChange={(value) => setCategoryId(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t("selectCategoryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1">
                      <Input placeholder={t("searchCategory")} onChange={(e) => setCategorySearch(e.target.value)} />
                    </div>
                    <SelectGroup>
                      {filteredCategories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="w-[120px]">{t("brand")}</Label>
                <Select onValueChange={(value) => setBrandId(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t("selectBrandPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1">
                      <Input 
                        placeholder={t("searchBrand")} 
                        onChange={(e) => setBrandSearch(e.target.value)} 
                      />
                    </div>
                    <SelectGroup>
                      {filteredBrands.map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Label className="w-[120px]">Revenue Percentage (%)</Label>
                <Input type="number" value={revenuePercentage} onChange={(e) => setRevenuePercentage(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label className="w-[120px]">{t("productPhoto")}</Label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleFileChange} 
                  />
                </div>
            
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-[120px]">
                    {photos.map((file, index) => (
                      <div key={index} className="relative group bg-slate-100 p-1 rounded border">
                        <span className="text-xs truncate max-w-[100px] block">{file.name}</span>
                        <button 
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("description")}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Arabic Description</Label>
              <Textarea value={arabicDescription} onChange={(e) => setArabicDescription(e.target.value)} />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Switch 
                id="isPopular" 
                checked={isPopular} 
                onCheckedChange={setIsPopular} 
              />
              <Label htmlFor="isPopular" className="cursor-pointer font-semibold">
                {t("isPopular")}
              </Label>
            </div>

          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-end">
        <Button onClick={onSubmit} disabled={creatingProductLoading}>
          {creatingProductLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("save")}
        </Button>
      </div>
    </div>
  );
};

export default AddProduct;