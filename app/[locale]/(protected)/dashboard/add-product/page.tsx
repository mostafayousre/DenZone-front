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
import GetCategories from "@/services/categories/getCategories";
import { Loader2, X } from "lucide-react"; // أضفت X لحذف الصور
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
  
  // تغيير من ملف واحد إلى مصفوفة ملفات
  const [photos, setPhotos] = useState<File[]>([]);
  
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);

  const { loading: gettingAllCatLoading, data, gettingAllCategories } = GetCategories();
  const { createProduct, loading: creatingProductLoading } = useCreateProduct();

  useEffect(() => {
    gettingAllCategories();
  }, []);

  useEffect(() => {
    if (data) {
      const filtered = data.filter((category: any) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categorySearch, data]);

  // دالة التعامل مع رفع ملفات متعددة
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newFiles]);
    }
  };

  // دالة لحذف صورة مختارة قبل الرفع
  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async () => {
    if (!name.trim() || !categoryId) {
      toast.error(t("fillRequiredFields") || "الرجاء ملء الحقول المطلوبة");
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
    
    // إضافة كل الصور إلى FormData تحت نفس الاسم "Photos" ليراها الـ API كمصفوفة
    photos.forEach((file) => {
      formData.append("Photos", file);
    });

    // إرسال اسم أول صورة كـ ImageName (اختياري حسب منطق الـ Backend لديك)
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

  if (gettingAllCatLoading) {
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
              
              {/* قسم رفع الصور المتعددة */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label className="w-[120px]">{t("productPhoto")}</Label>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    multiple // تسمح باختيار أكثر من ملف
                    onChange={handleFileChange} 
                  />
                </div>
                {/* عرض قائمة الصور المختارة */}
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