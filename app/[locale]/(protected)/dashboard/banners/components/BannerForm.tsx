"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface BannerFormProps {
    initialData?: {
        id?: string;
        imageName?: string;
        order?: number;
    };
    onSubmit: (data: { imageFile: File | null; order: number }) => Promise<void>;
    loading: boolean;
    title: string;
}

const BannerForm = ({ initialData, onSubmit, loading, title }: BannerFormProps) => {
    const t = useTranslations("banners");
    const [order, setOrder] = useState<number>(initialData?.order || 0);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageName || null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setPreviewUrl(initialData?.imageName || null);
    };

    const handleSubmit = async () => {
        if (!imageFile && !initialData?.imageName) {
            toast.error(t("image_required"));
            return;
        }
        await onSubmit({ imageFile, order });
    };

    return (
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
                <Card>
                    <CardHeader className="border-b border-solid border-default-200 mb-6">
                        <CardTitle>{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center flex-wrap gap-4">
                            <Label className="w-[150px] flex-none" htmlFor="bannerOrder">
                                {t("order")}
                            </Label>
                            <Input
                                id="bannerOrder"
                                type="number"
                                className="flex-1 min-w-[200px]"
                                value={order}
                                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center flex-wrap gap-4">
                                <Label className="w-[150px] flex-none">
                                    {t("banner_image")}
                                </Label>
                                <div className="flex-1 flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="banner-upload"
                                    />
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="cursor-pointer"
                                    >
                                        <label htmlFor="banner-upload">
                                            <Upload className="w-4 h-4 mr-2" />
                                            {t("choose_image")}
                                        </label>
                                    </Button>
                                    {imageFile && (
                                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                            {imageFile.name}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {previewUrl && (
                                <div className="ml-[150px] relative w-full max-w-[400px] aspect-video border rounded-lg overflow-hidden group">
                                    <Image
                                        src={previewUrl}
                                        alt="Banner Preview"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    {imageFile && (
                                        <button
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="col-span-12 flex justify-center mt-6">
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full max-w-[200px] gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Upload className="w-4 h-4" />
                    )}
                    {initialData ? t("update_banner") : t("add_banner")}
                </Button>
            </div>
        </div>
    );
};

export default BannerForm;
