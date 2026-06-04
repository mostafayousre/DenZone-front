"use client";

import React from 'react';
import SpecialOfferForm from "../special-offers/components/SpecialOfferForm";
import useAddSpecialOffer from "@/services/specialOffers/addSpecialOffer";
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

function AddSpecialOfferPage() {
    const t = useTranslations("SpecialOffers");
    const router = useRouter();
    const { addSpecialOffer, loading } = useAddSpecialOffer();

    const handleSubmit = async (data: { imageFile: File | null; sectionNum: number; link?: string }) => {
        const formData = new FormData();
        if (data.imageFile) {
            formData.append("file", data.imageFile);
        }
        formData.append("SectionNum", data.sectionNum.toString());
        if (data.link) {
            formData.append("link", data.link);
        }

        const result = await addSpecialOffer(formData);
        if (result.success) {
            toast.success(t("successAdd"));
            router.push("/dashboard/special-offers");
            router.refresh();
        } else {
            toast.error(t("errorAdd"), {
                description: result.error
            });
        }
    };

    return (
        <div className="space-y-6">
            <SpecialOfferForm 
                onSubmit={handleSubmit} 
                loading={loading} 
                title={t("addOffer")} 
            />
        </div>
    );
}

export default AddSpecialOfferPage;
