"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import SpecialOfferForm from "../../special-offers/components/SpecialOfferForm";
import useUpdateSpecialOffer from "@/services/specialOffers/updateSpecialOffer";
import useGetSpecialOfferById from "@/services/specialOffers/getSpecialOfferById";
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

function EditSpecialOfferPage() {
    const t = useTranslations("SpecialOffers");
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    
    const { offer, loading: fetching, getSpecialOfferById } = useGetSpecialOfferById();
    const { updateSpecialOffer, loading: updating } = useUpdateSpecialOffer();

    useEffect(() => {
        if (id) {
            getSpecialOfferById(id);
        }
    }, [id]);

    const handleSubmit = async (data: { imageFile: File | null; sectionNum: number; link?: string }) => {
        const formData = new FormData();
        if (data.imageFile) {
            formData.append("file", data.imageFile);
        }
        formData.append("SectionNum", data.sectionNum.toString());
        if (data.link) {
            formData.append("link", data.link);
        }

        const result = await updateSpecialOffer(id, formData);
        if (result.success) {
            toast.success(t("successUpdate"));
            router.push("/dashboard/special-offers");
            router.refresh();
        } else {
            toast.error(t("errorUpdate"), {
                description: result.error
            });
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!offer && !fetching) {
        return <div className="text-center py-10">{t("errorFetch") || "Offer not found"}</div>;
    }

    return (
        <div className="space-y-6">
            <SpecialOfferForm 
                initialData={offer || undefined}
                onSubmit={handleSubmit} 
                loading={updating} 
                title={t("editOffer")} 
            />
        </div>
    );
}

export default EditSpecialOfferPage;
