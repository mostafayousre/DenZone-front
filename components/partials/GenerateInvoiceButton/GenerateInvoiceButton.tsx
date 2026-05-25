"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import useGenerateOrderInvoice from "@/services/invoices/generate/generateOrderInvoice";
import { useTranslations } from "next-intl";

interface Props {
    orderNumber: string;
    isDisabled?: boolean;
}

const GenerateInvoiceButton = ({ isDisabled, orderNumber }: Props) => {
    const t = useTranslations("generateInvoice");
    const {loading, generateOrderInvoice} = useGenerateOrderInvoice()

    const handleGenerateInvoice = async () => {
        const {success, error} =  await generateOrderInvoice(orderNumber);

        if (success) {
            toast.success(t("invoiceGenerated"));
        } else {
             toast.error(t("invoiceGenerationError"));
        }

    };

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={handleGenerateInvoice}
                disabled={loading || isDisabled}
                size="icon"
                variant="ghost"
                className="flex items-center p-2 border text-green-600 hover:text-white bg-green-100 hover:bg-green-400 transition-all rounded-full w-[32px] h-[32px]"
            >
                <FileText className="w-4 h-4" />
            </Button>
        </div>
    );
};

export default GenerateInvoiceButton;