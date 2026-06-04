"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface SpecialOfferFormProps {
    initialData?: {
        id?: number;
        imagePath?: string;
        sectionNum?: number;
        link?: string | null;
    };
    onSubmit: (data: { imageFile: File | null; sectionNum: number; link?: string }) => Promise<void>;
    loading: boolean;
    title: string;
}

const SpecialOfferForm = ({ initialData, onSubmit, loading, title }: SpecialOfferFormProps) => {
    const t = useTranslations("SpecialOffers");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imagePath || null);
    const [sectionNum, setSectionNum] = useState<string>(initialData?.sectionNum?.toString() || "1");
    const [link, setLink] = useState<string>(initialData?.link || "");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setPreviewUrl(initialData?.imagePath || null);
    };

    const handleSubmit = async () => {
        if (!imageFile && !initialData?.imagePath) {
            toast.error(t("imageRequired") || "Image is required");
            return;
        }
        await onSubmit({ imageFile, sectionNum: parseInt(sectionNum), link });
    };

    return (
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12">
                <Card>
                    <CardHeader className="border-b border-solid border-default-200 mb-6">
                        <CardTitle>{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center flex-wrap gap-4">
                                <Label className="w-[150px] flex-none">
                                    {t("image")}
                                </Label>
                                <div className="flex-1 flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="offer-upload"
                                    />
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="cursor-pointer"
                                    >
                                        <label htmlFor="offer-upload">
                                            <Upload className="w-4 h-4 mr-2" />
                                            {t("uploadImage")}
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
                                        alt="Offer Preview"
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

                            <div className="flex items-center flex-wrap gap-4 mt-6">
                                <Label className="w-[150px] flex-none">
                                    sectionNum
                                </Label>
                                <div className="flex-1">
                                    <Select 
                                        value={sectionNum} 
                                        onValueChange={setSectionNum}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="selectSection" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">specialOffer1</SelectItem>
                                            <SelectItem value="2">specialOffer2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center flex-wrap gap-4 mt-6">
                                <Label className="w-[150px] flex-none" htmlFor="offerLink">
                                    {t("link")}
                                </Label>
                                <div className="flex-1">
                                    <Input
                                        id="offerLink"
                                        type="text"
                                        className="w-full"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                    />
                                </div>
                            </div>
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
                    {initialData ? t("editOffer") : t("addOffer")}
                </Button>
            </div>
        </div>
    );
};

export default SpecialOfferForm;
