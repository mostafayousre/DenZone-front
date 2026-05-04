"use client";

import { useEffect, useState, ChangeEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import useGetCategoryById from "@/services/categories/getCategoryById";
import useUpdateCategoryById from "@/services/categories/UpdateCatergory";
import { Loader2, Upload, FileImage } from "lucide-react";
import { useTranslations } from "next-intl";

const EditCategory = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const t = useTranslations("categories");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { category, gettingCategoryById, loading: categoryLoading } = useGetCategoryById();
  const { updatingCategoryById, loading: updatingCategoryLoading } = useUpdateCategoryById();

  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [pref, setPref] = useState("");
  const [description, setDescription] = useState("");
  // const [companyPercentage, setCompanyPercentage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) gettingCategoryById(id);
  }, [id]);

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setArabicName(category.arabicName || "");
      setPref(category.pref || "");
      setDescription(category.description || "");
      // setCompanyPercentage(category.companyPercentage || "");
    }
  }, [category]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const updateCategory = async () => {
    if (!name.trim() || !arabicName.trim() || !pref.trim() || !description.trim()) {
      toast.error(t("validationError"), { description: t("fill_all_fields") });
      return;
    }

    const formData = new FormData();
    formData.append("Name", name);
    formData.append("ArabicName", arabicName);
    formData.append("Pref", pref);
    formData.append("Description", description);
    // formData.append("CompanyPercentage", companyPercentage);
    
    if (imageFile) {
      formData.append("ImageFile", imageFile);
    }

    const { success, error } = await (updatingCategoryById as any)(id, formData);

    if (success) {
      toast.success(t("category_updated"), {
        description: t("category_updated_success")
      });
      setTimeout(() => {
        router.push('/dashboard/categories');
      }, 2000);
    } else if (error) {
      toast.error(t("failed_to_update_category"));
    }
  };

  if (categoryLoading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12">
        <Card>
          <CardHeader className="border-b border-solid border-default-200 mb-6">
            <CardTitle>{t("category_Information")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="category-arabic-name">
                {t("category_arabic_name")}
              </Label>
              <Input
                id="category-arabic-name"
                className="flex-1 min-w-[300px]"
                placeholder={t("category_arabic_name")}
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="category-name">
                {t("category_name")}
              </Label>
              <Input
                id="category-name"
                className="flex-1 min-w-[300px]"
                placeholder={t("category_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="category-pref">
                {t("pref")}
              </Label>
              <Input
                id="category-pref"
                className="flex-1 min-w-[300px]"
                placeholder={t("pref")}
                value={pref}
                onChange={(e) => setPref(e.target.value)}
              />
            </div>
            

            <div className="flex items-start flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium mt-3" htmlFor="category-description">
                {t("description")}
              </Label>
              <Textarea
                id="category-description"
                className="flex-1 min-w-[300px]"
                placeholder={t("description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
        {/* <div className="flex items-center flex-wrap gap-2">
  <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="companyPercentage">
    {t("company_percentage")}
  </Label>
  
  <div className="relative flex-1 min-w-[300px]">
    <Input
      id="companyPercentage"
      type="number" 
      className="pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
      placeholder={t("company_percentage")}
      value={companyPercentage}
      onChange={(e) => setCompanyPercentage(e.target.value)}
    />
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground font-bold">
      %
    </div>
  </div>
</div> */}
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="imageFile">
                {t("category_image")}
              </Label>
              <div className="flex-1 min-w-[300px] flex items-center gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex gap-2 items-center bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileImage className="w-4 h-4" />
                  Choose File
                </Button>
                
                <span className="text-sm text-muted-foreground truncate">
                  {imageFile ? imageFile.name : "No file chosen"}
                </span>

                <input
                  ref={fileInputRef}
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-center mt-4">
        <Button 
          onClick={updateCategory} 
          disabled={updatingCategoryLoading}
          className="w-full max-w-[200px] gap-2"
        >
          {updatingCategoryLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Upload className="w-4 h-4" />
              {t("update_category")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditCategory;