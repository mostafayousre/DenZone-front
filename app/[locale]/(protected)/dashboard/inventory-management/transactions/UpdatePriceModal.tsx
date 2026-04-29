"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import useUpdateProductPrices from "@/services/productPrice/updateProductPrices";
import { Price } from "@/types/price";

interface UpdatePriceModalProps {
    isOpen: boolean;
    onClose: () => void;
    priceData: Price;
    onSuccess: () => void;
}

export function UpdatePriceModal({ isOpen, onClose, priceData, onSuccess }: UpdatePriceModalProps) {
    const { updateProductPrices, loading } = useUpdateProductPrices();
    
    const [formData, setFormData] = useState({
        purchasePrice: priceData.purchasePrice || 0,
        salesPrice: priceData.salesPrice || 0,
        stockQuantity: Number(priceData.stockQuantity) || 0,
        maxQuantity: Number(priceData.maxQuantity) || 0,
        discountRate: priceData.discountRate || 0,
    });

    useEffect(() => {
        setFormData({
            purchasePrice: priceData.purchasePrice || 0,
            salesPrice: priceData.salesPrice || 0,
            stockQuantity: Number(priceData.stockQuantity) || 0,
            maxQuantity: Number(priceData.maxQuantity) || 0,
            discountRate: priceData.discountRate || 0,
        });
    }, [priceData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: Number(value)
        }));
    };

    const handleUpdate = async () => {
        if (!priceData.id) {
            toast.error("Price ID is missing");
            return;
        }

        const result = await updateProductPrices({
            priceId: priceData.id,
            ...formData
        });

        if (result.success) {
            toast.success("Prices updated successfully");
            onSuccess();
            onClose();
        } else {
            toast.error(result.error || "Failed to update prices");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Prices - {priceData.productName}</DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="purchasePrice" className="text-right text-xs">Purchase Price</Label>
                        <Input
                            id="purchasePrice"
                            name="purchasePrice"
                            type="number"
                            value={formData.purchasePrice}
                            onChange={handleChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="salesPrice" className="text-right text-xs">Sales Price</Label>
                        <Input
                            id="salesPrice"
                            name="salesPrice"
                            type="number"
                            value={formData.salesPrice}
                            onChange={handleChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stockQuantity" className="text-right text-xs">Stock Qty</Label>
                        <Input
                            id="stockQuantity"
                            name="stockQuantity"
                            type="number"
                            value={formData.stockQuantity}
                            onChange={handleChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="maxQuantity" className="text-right text-xs">Max Qty</Label>
                        <Input
                            id="maxQuantity"
                            name="maxQuantity"
                            type="number"
                            value={formData.maxQuantity}
                            onChange={handleChange}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discountRate" className="text-right text-xs">Discount (%)</Label>
                        <Input
                            id="discountRate"
                            name="discountRate"
                            type="number"
                            value={formData.discountRate}
                            onChange={handleChange}
                            className="col-span-3"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
