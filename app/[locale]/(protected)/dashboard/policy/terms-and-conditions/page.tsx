"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import usePolicy from "@/services/policy/usePolicy";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const TermsAndConditionsPage = () => {
    const t = useTranslations("policy_page");
    const { getPolicy, addPolicy, fetchLoading, loading: updateLoading } = usePolicy({
        getEndpoint: "/api/TermsAndConditions/get-terms",
        addEndpoint: "/api/TermsAndConditions/add-terms"
    });

    const [content, setContent] = useState("");
    const [lang, setLang] = useState(1);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const data = await getPolicy(lang);
                setContent(typeof data === "string" ? data : data?.content || "");
            } catch (error) {
                toast.error(t("fetch_error") || "Failed to load policy");
            }
        };

        fetchPolicy();
    }, [lang]);

    const handleSave = async () => {
        try {
            const isSuccess = await addPolicy(content, lang);
            if (isSuccess) {
                toast.success(t("save_success") || "Policy saved successfully");
            } else {
                toast.error(t("save_error") || "Failed to save policy");
            }
        } catch (error) {
            toast.error(t("save_error") || "Failed to save policy");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    {t("terms_and_conditions_title") || "Terms & Conditions"}
                </h1>
                <Button
                    onClick={handleSave}
                    disabled={updateLoading || fetchLoading}
                    className="font-semibold shadow-md px-6"
                >
                    {updateLoading ? (t("saving") || "Saving...") : (t("save") || "Save Policy")}
                </Button>
            </div>

            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm min-h-[500px] space-y-4">
                <div className="flex items-center gap-3 w-full max-w-[200px]">
                    <span className="text-sm font-medium whitespace-nowrap">{t("select_language") || "Language"}:</span>
                    <Select value={lang.toString()} onValueChange={(val) => setLang(parseInt(val))}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">العربية</SelectItem>
                            <SelectItem value="2">English</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {!fetchLoading ? (
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[430px] resize-y"
                        placeholder="Enter policy content here..."
                    />
                ) : (
                    <div className="flex justify-center items-center h-[500px]">
                        <span className="text-muted-foreground animate-pulse">{t("loading") || "Loading content..."}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TermsAndConditionsPage;
