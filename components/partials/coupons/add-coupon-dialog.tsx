"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Check, X, Loader2 } from "lucide-react";
import useCreateCoupon from "@/services/coupons/createCoupon";
import { toast } from "sonner";

interface AddCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddCouponDialog({ open, onOpenChange, onSuccess }: AddCouponDialogProps) {
  const { createCoupon, loading } = useCreateCoupon();

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minimumOrderAmount: 0,
    maximumDiscountAmount: 0,
    startDate: "",
    endDate: "",
    usageLimit: 0,
    perUserLimit: 0,
    isActive: true,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.startDate || !formData.endDate) {
        toast.error("Please fill in all required fields (Code, Start Date, End Date)");
        return;
    }

    const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
        maximumDiscountAmount: Number(formData.maximumDiscountAmount),
        usageLimit: Number(formData.usageLimit),
        perUserLimit: Number(formData.perUserLimit),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        applicabilities: [] // Simplified for now
    };

    const result = await createCoupon(payload as any);
    if (result.success) {
        toast.success("Coupon created successfully");
        onOpenChange(false);
        if (onSuccess) onSuccess();
        // Reset form
        setFormData({
            code: "",
            description: "",
            discountType: "percentage",
            discountValue: 0,
            minimumOrderAmount: 0,
            maximumDiscountAmount: 0,
            startDate: "",
            endDate: "",
            usageLimit: 0,
            perUserLimit: 0,
            isActive: true,
        });
    } else {
        toast.error(result.error || "Failed to create coupon");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-0 flex flex-row items-center justify-between">
          <button 
            onClick={() => onOpenChange(false)}
            className="text-default-400 hover:text-default-900 transition-colors"
          >
            <X size={20} />
          </button>
          <DialogTitle className="text-xl font-bold text-default-900">Add Coupon</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[85vh]">
          {/* Code and Description row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                 <Label className="font-medium text-default-700">Coupon Code</Label>
                 <span 
                    className="bg-cyan-50 text-cyan-500 px-3 py-1 rounded text-xs font-medium cursor-pointer hover:bg-cyan-100 transition-colors"
                    onClick={() => handleChange("code", Math.random().toString(36).substring(2, 10).toUpperCase())}
                 >
                    Generate Code
                 </span>
              </div>
              <Input 
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
                placeholder="e.g. SAVE20" 
                className="h-12 bg-default-50 border-default-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="block font-medium text-default-700">Description</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter coupon description" 
                className="min-h-[48px] bg-default-50 border-default-200"
              />
            </div>
          </div>

          {/* Type and Value row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="block font-medium text-default-700">Discount Type</Label>
              <Select 
                value={formData.discountType}
                onValueChange={(val) => handleChange("discountType", val)}
              >
                <SelectTrigger className="h-12 bg-default-50 border-default-200">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="block font-medium text-default-700">Discount Value</Label>
              <Input 
                type="number"
                value={formData.discountValue}
                onChange={(e) => handleChange("discountValue", e.target.value)}
                placeholder="Value" 
                className="h-12 bg-default-50 border-default-200"
              />
            </div>
          </div>

          {/* Min and Max Amount row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 relative">
              <Label className="block font-medium text-default-700">Min Order Amount</Label>
              <div className="relative">
                <Input 
                    type="number"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => handleChange("minimumOrderAmount", e.target.value)}
                    className="h-12 bg-default-50 border-emerald-500/30 focus:border-emerald-500 pl-10"
                />
                <Check className="absolute top-1/2 -translate-y-1/2 left-3 text-emerald-500" size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="block font-medium text-default-700">Max Discount Amount</Label>
              <Input 
                type="number"
                value={formData.maximumDiscountAmount}
                onChange={(e) => handleChange("maximumDiscountAmount", e.target.value)}
                placeholder="Max Discount" 
                className="h-12 bg-default-50 border-default-200"
              />
            </div>
          </div>

          {/* Usage and Per User Limit row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="block font-medium text-default-700">Total Usage Limit</Label>
              <Input 
                type="number"
                value={formData.usageLimit}
                onChange={(e) => handleChange("usageLimit", e.target.value)}
                placeholder="Total limit" 
                className="h-12 bg-default-50 border-default-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="block font-medium text-default-700">Per User Limit</Label>
              <Input 
                type="number"
                value={formData.perUserLimit}
                onChange={(e) => handleChange("perUserLimit", e.target.value)}
                placeholder="Per user limit" 
                className="h-12 bg-default-50 border-default-200"
              />
            </div>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="block font-medium text-default-700">Start Date</Label>
              <div className="relative">
                <Input 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="h-12 bg-default-50 border-emerald-500/30 focus:border-emerald-500 pl-10"
                />
                <Check className="absolute top-1/2 -translate-y-1/2 left-3 text-emerald-500" size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="block font-medium text-default-700">End Date</Label>
              <div className="relative">
                <Input 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="h-12 bg-default-50 border-emerald-500/30 focus:border-emerald-500 pl-10"
                />
                <Check className="absolute top-1/2 -translate-y-1/2 left-3 text-emerald-500" size={18} />
              </div>
            </div>
          </div>

          {/* Status and Applicability row */}
          <div className="grid grid-cols-2 gap-6 items-center">
            <div className="flex items-center gap-3">
                <Label className="text-default-700 font-medium">Is Active</Label>
                <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(val) => handleChange("isActive", val)}
                    className="data-[state=checked]:bg-purple-500"
                />
            </div>
            <div className="space-y-2">
                <Label className="block font-medium text-default-700 text-xs">Applicability (Type | ID)</Label>
                <div className="flex gap-2">
                    <Input placeholder="Type" className="h-10 text-xs" />
                    <Input placeholder="ID" className="h-10 text-xs" />
                </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-default-200 pt-6">
             <Button 
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-8 h-12 text-base font-medium flex-1 md:flex-none md:w-32"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Send"}
            </Button>
            <Button 
                variant="outline"
                className="bg-cyan-400 hover:bg-cyan-500 text-white border-none rounded-lg px-6 h-12 text-base font-medium flex-1 md:flex-none"
                onClick={() => {}}
            >
                Add New Record
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
