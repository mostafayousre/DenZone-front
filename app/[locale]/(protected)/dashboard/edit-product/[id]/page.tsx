"use client";

import { useEffect, useState, ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { Loader2, Upload, FileImage, X } from "lucide-react";
import { useTranslations } from "next-intl";

import useGettingProductById from "@/services/products/gettingProductById";
import GetCategories from "@/services/categories/getCategories";
import useUpdateProductById from "@/services/products/UpdateProductById";

const EditProduct = () => {
  const t = useTranslations("productList");
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getProductById, product, loading } = useGettingProductById();
  const { data: categories, gettingAllCategories, loading: catsLoading } = GetCategories();
  const { updatingProductById, loading: updateLoading } = useUpdateProductById();

  const [formData, setFormData] = useState({
    name: "",
    arabicName: "",
    pref: "",
    arabicPreef: "",
    description: "",
    arabicDescription: "",
    categoryId: "",
    images: [] as File[],
    isPopular: false,
    existingImages: [] as string[],
  });

  useEffect(() => {
    gettingAllCategories();
    if (productId) getProductById(productId);
  }, [productId]);
useEffect(() => {
  if (product) {
    setFormData({
      name: product.productName || "",
      arabicName: product.productArabicName || "",
      pref: product.preef || "",
      arabicPreef: product.arabicPreef || "",
      description: product.description || "",
      arabicDescription: product.arabicDescription || "",
      categoryId: product.categoryId ? String(product.categoryId) : "",
      images: [],
      isPopular: product.isPopular || false,
      existingImages: Array.isArray(product.images) ? product.images : [],
    });
  }
}, [product]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));
    }
  };

  const removeNewImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.categoryId) {
      toast.error(t("fill_all_fields"));
      return;
    }

    const data = new FormData();
    data.append("Name", formData.name);
    data.append("ArabicName", formData.arabicName);
    data.append("Preef", formData.pref);
    data.append("ArabicPreef", formData.arabicPreef);
    data.append("Description", formData.description);
    data.append("ArabicDescription", formData.arabicDescription);
    data.append("CategoryId", formData.categoryId);
    data.append("IsPopular", formData.isPopular.toString());

    if (formData.images.length > 0) {
      formData.images.forEach((file) => {
        data.append("Photos", file);
      });
    }

    try {
      const response = await (updatingProductById as any)(productId, data);
      if (response) {
        toast.success(t("Product updated successfully"));
        router.push('/dashboard/product-list');
      }
    } catch (error) {
      toast.error(t("productUpdateError"));
    }
  };

  if (loading || catsLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12">
        <Card>
          <CardHeader className="border-b border-default-200 mb-6">
            <CardTitle>{t("productDetails")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium">{t("productName")}</Label>
              <Input 
                className="flex-1 min-w-[300px]"
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium">{t("arabicName")}</Label>
              <Input 
                className="flex-1 min-w-[300px]"
                value={formData.arabicName} 
                onChange={(e) => setFormData({...formData, arabicName: e.target.value})} 
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium">{t("productPref")}</Label>
              <Input 
                className="flex-1 min-w-[300px]"
                value={formData.pref} 
                onChange={(e) => setFormData({...formData, pref: e.target.value})} 
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium">{t("arabicPreef")}</Label>
              <Input 
                className="flex-1 min-w-[300px]"
                value={formData.arabicPreef} 
                onChange={(e) => setFormData({...formData, arabicPreef: e.target.value})} 
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium">{t("category")}</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(val) => setFormData({...formData, categoryId: val})}
              >
                <SelectTrigger className="flex-1 min-w-[300px]">
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium mt-3">{t("description")}</Label>
              <Textarea 
                className="flex-1 min-w-[300px]"
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <div className="flex items-start flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium mt-3">{t("arabicDescription")}</Label>
              <Textarea 
                className="flex-1 min-w-[300px]"
                value={formData.arabicDescription} 
                onChange={(e) => setFormData({...formData, arabicDescription: e.target.value})} 
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Switch 
                id="isPopular" 
                checked={formData.isPopular} 
                onCheckedChange={(val) => setFormData({...formData, isPopular: val})} 
              />
              <Label htmlFor="isPopular" className="cursor-pointer font-semibold">
                {t("isPopular")}
              </Label>
            </div>

            {formData.existingImages.length > 0 && (
              <div className="flex items-start flex-wrap gap-2">
                <Label className="w-[180px] flex-none text-sm font-medium mt-2">Current Photos</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.existingImages.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24 border rounded-md overflow-hidden bg-muted">
                      <img src={url} alt="product" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-start flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium mt-2">{t("productPhoto")}</Label>
              <div className="flex-1 min-w-[300px] space-y-4">
                <div className="flex items-center gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    {t("chooseFile") || "Upload Photos"}
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileChange} 
                  />
                </div>

                {formData.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative w-24 h-24 border rounded-md group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          className="w-full h-full object-cover rounded-md" 
                          alt="preview"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-center mt-6">
        <Button onClick={handleUpdate} disabled={updateLoading} className="w-full max-w-[200px] gap-2">
          {updateLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
          {t("updateProduct")}
        </Button>
      </div>
    </div>
  );
};

export default EditProduct;