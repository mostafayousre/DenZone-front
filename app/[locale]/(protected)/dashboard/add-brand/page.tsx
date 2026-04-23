"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import useAddBrand from "@/services/brands/addBrand"; 
import { Loader2, Upload } from "lucide-react"; 
import { useTranslations } from "next-intl";

const AddBrandPage = () => {
  const { addBrand, loading } = useAddBrand(); 
  const router = useRouter();
  const t = useTranslations("brands");

  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [imagePath, setImagePath] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagePath(e.target.files[0]);
    }
  };

  const handleAddBrandSubmit = async () => {
    if (!name.trim() || !arabicName.trim() || !imagePath) {
      toast.error(t("validationError"), { 
        description: t("fill_required_fields_and_photo") || "Please fill all fields and select a photo"
      });
      return;
    }

    const formData = new FormData();
    formData.append("brandName", name);
    formData.append("brandArName", arabicName);
    formData.append("imageFile", imagePath);

    try {
      const success = await addBrand(formData);
      
      if (success) {
        toast.success(t("brand_added_success"));
        setTimeout(() => {
          router.push("/dashboard/brand");
        }, 1000);
      }
    } catch (error: any) {
      toast.error(t("error"), {
        description: typeof error === 'string' ? error : error.message,
      });
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12">
        <Card>
          <CardHeader className="border-b border-solid border-default-200 mb-6">
            <CardTitle>{t("brand_information")} </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="brandName">
                {t("brand name")}
              </Label>
              <Input
                id="brandName"
                className="flex-1 min-w-[300px]"
                placeholder={t("brand name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="brandArabicName">
                {t("brand arabic name")}
              </Label>
              <Input
                id="brandArabicName"
                className="flex-1 min-w-[300px]"
                placeholder={t("brand arabic name")}
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="brandPhoto">
                {t("brand_photo") || "Brand Photo"}
              </Label>
              <Input
                id="brandPhoto"
                type="file"
                accept="image/*"
                className="flex-1 min-w-[300px]"
                onChange={handleFileChange}
              />
            </div>
           
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-center mt-4">
        <Button 
          onClick={handleAddBrandSubmit} 
          disabled={loading} 
          className="w-full max-w-[200px] gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin"/>
          ) : (
            <Upload className="w-4 h-4"/>
          )}
          {t("add_brand")}
        </Button>
      </div>
    </div>
  );
};

export default AddBrandPage;