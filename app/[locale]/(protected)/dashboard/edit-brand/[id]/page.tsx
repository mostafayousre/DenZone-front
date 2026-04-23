"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import useUpdateBrand from "@/services/brands/updateBrand"; 
import AxiosInstance from "@/lib/AxiosInstance";
import { Loader2, Save } from "lucide-react";
import { useTranslations } from "next-intl";

const EditBrand = () => {
  const router = useRouter();
  const params = useParams();
  // الآن id سيقرأ القيمة من الرابط بسبب وجود مجلد [id]
  const id = params?.id as string; 
  const t = useTranslations("brands");

  const { updateBrand, loading: updatingLoading } = useUpdateBrand();

  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [fetching, setFetching] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  useEffect(() => {
    const getBrandData = async () => {
      try {
        // ملاحظة: تأكد من صحة الإملاء 'brnadbyId' إذا كان السيرفر يتطلب ذلك فعلاً
        const response = await AxiosInstance.get(`/api/Brands/brnadbyId/${id}`);
        if (response.data) {
          setName(response.data.name || "");
          setArabicName(response.data.arName || "");
        }
      } catch (error: any) {
        toast.error(t("error_fetching_brand"));
      } finally {
        setFetching(false);
      }
    };

    if (id) getBrandData();
  }, [id, t]);

  const handleUpdateBrand = async () => {
    if (!name.trim() || !arabicName.trim()) {
      toast.error(t("validationError"), { description: t("fill_all_fields") });
      return;
    }

    const formData = new FormData();
    formData.append("brandName", name);
    formData.append("brandArName", arabicName);
    if (photo) {
      formData.append("imageFile", photo);
    }

    try {
      const success = await updateBrand(id, formData);
      if (success) {
        toast.success(t("brand_updated_success"));
        setTimeout(() => {
          router.push("/dashboard/brand");
        }, 1500);
      }
    } catch (error: any) {
      toast.error(typeof error === "string" ? error : t("update_failed"));
    }
  };

  if (fetching) {
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
            <CardTitle>{t("brand_information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="brand-name">
                {t("brand_name")}
              </Label>
              <Input
                id="brand-name"
                className="flex-1 min-w-[300px]"
                placeholder={t("brand_name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="brand-arabic-name">
                {t("brand_arabic_name")}
              </Label>
              <Input
                id="brand-arabic-name"
                className="flex-1 min-w-[300px]"
                placeholder={t("brand_arabic_name")}
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
              />
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <Label className="w-[180px] flex-none text-sm font-medium" htmlFor="brand-photo">
                {t("brand_photo") || "Brand Photo"}
              </Label>
              <Input
                id="brand-photo"
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
          onClick={handleUpdateBrand} 
          disabled={updatingLoading}
          className="w-full max-w-[200px] gap-2"
        >
          {updatingLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="h-4 w-4" />
              {t("save_changes")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditBrand;