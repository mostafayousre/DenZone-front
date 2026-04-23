"use client";

import BannerForm from "../banners/components/BannerForm";
import useAddBanner from "@/services/banners/addBanner";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const AddBannerPage = () => {
    const { addBanner, loading } = useAddBanner();
    const router = useRouter();
    const t = useTranslations("banners");

    const handleSubmit = async (data: { imageFile: File | null; order: number }) => {
        if (!data.imageFile) {
            toast.error(t("image_required"));
            return;
        }

        const success = await addBanner({
            imageFile: data.imageFile,
            order: data.order
        });

        if (success) {
            toast.success(t("banner_added_success"));
            setTimeout(() => {
                router.push("/dashboard/banners");
            }, 1000);
        } else {
            toast.error(t("add_error"));
        }
    };

    return (
        <BannerForm 
            onSubmit={handleSubmit} 
            loading={loading} 
            title={t("add_banner")} 
        />
    );
};

export default AddBannerPage;
