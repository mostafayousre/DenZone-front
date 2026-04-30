"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; 
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useGetPolicy from "@/services/policy/getPolicy";
import useAddPolicy from "@/services/policy/addPolicy";
import { useTranslations } from "next-intl";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const PolicyPage = () => {
    const t = useTranslations("policy_page");
    const { getPolicy, loading: fetchLoading } = useGetPolicy();
    const { addPolicy, loading: updateLoading } = useAddPolicy();
    
    const [content, setContent] = useState("");

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const data = await getPolicy();
                setContent(typeof data === "string" ? data : data?.content || "");
            } catch (error) {
                toast.error(t("fetch_error") || "Failed to load policy");
            }
        };

        fetchPolicy();
    }, []);

    const handleSave = async () => {
        try {
            const isSuccess = await addPolicy(content);
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
                    {t("title") || "Terms & Privacy Policy"}
                </h1>
                <Button 
                    onClick={handleSave} 
                    disabled={updateLoading || fetchLoading}
                    className="font-semibold shadow-md px-6"
                >
                    {updateLoading ? (t("saving") || "Saving...") : (t("save") || "Save Policy")}
                </Button>
            </div>
            
            <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm min-h-[500px]">
                {!fetchLoading ? (
                    <ReactQuill 
                        theme="snow" 
                        value={content} 
                        onChange={setContent} 
                        className="h-[430px] pb-10"
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

export default PolicyPage;
