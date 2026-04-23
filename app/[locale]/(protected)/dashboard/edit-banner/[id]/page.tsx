"use client";

import { useEffect } from "react";
import BannerForm from "../../banners/components/BannerForm";
import useUpdateBanner from "@/services/banners/updateBanner";
import useGetBannerById from "@/services/banners/getBannerById";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

const EditBannerPage = () => {
    const params = useParams();
    const id = params?.id as string;
    const { getBannerById, banner, loading: fetchLoading } = useGetBannerById();
    const { updateBanner, loading: updateLoading } = useUpdateBanner();
    const router = useRouter();
    const t = useTranslations("banners");

    useEffect(() => {
        if (id) {
            getBannerById(id);
        }
    }, [id]);

    const handleSubmit = async (data: { imageFile: File | null; order: number }) => {
        const success = await updateBanner(id, {
            imageFile: data.imageFile,
            order: data.order
        });

        if (success) {
            toast.success(t("banner_updated_success"));
            setTimeout(() => {
                router.push("/dashboard/banners");
            }, 1000);
        } else {
            toast.error(t("update_error"));
        }
    };

    if (fetchLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (!banner && !fetchLoading) {
        return <div className="text-center py-10">{t("banner_not_found")}</div>;
    }

    return (
        <BannerForm 
            initialData={banner || undefined}
            onSubmit={handleSubmit} 
            loading={updateLoading} 
            title={t("edit_banner")} 
        />
    );
};

export default EditBannerPage;
