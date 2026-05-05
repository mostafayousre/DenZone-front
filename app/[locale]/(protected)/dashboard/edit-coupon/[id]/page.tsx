"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import useGettingCouponById from "@/services/coupons/gettingCouponById";
import useUpdateCoupon from "@/services/coupons/updateCoupon";

const EditCoupon = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { coupon, getCouponById, loading: gettingCouponLoading } = useGettingCouponById();
  const { updateCoupon, loading: updatingCouponLoading } = useUpdateCoupon();

  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [isActive, setIsActive] = useState(false);

  // Read-only fields for context
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState("");

  useEffect(() => {
    getCouponById(id);
  }, [id]);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code || "");
      setDescription(coupon.description || "");
      setDiscountType(coupon.discountType || "");
      setDiscountValue(coupon.discountValue?.toString() || "");
      setStartDate(coupon.startDate?.slice(0, 10) || "");
      setEndDate(coupon.endDate?.slice(0, 10) || "");
      setUsageLimit(coupon.usageLimit?.toString() || "");
      setIsActive(coupon.isActive || false);
    }
  }, [coupon]);

  const onSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Validation Error", {
        description: "Please fill in Start Date and End Date.",
      });
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      toast.error("Validation Error", {
        description: "Start date must be before end date.",
      });
      return;
    }

    const payload = {
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      usageLimit: Number(usageLimit),
      isActive,
    };

    try {
      const { success, error } = await updateCoupon(id, payload as any);
      if (success) {
        toast.success("Coupon Updated Successfully");
        setTimeout(() => {
          router.push("/dashboard/coupons");
        }, 1000);
      } else {
        toast.error("Failed to update", { description: error });
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 rounded-lg">
      <div className="col-span-12 space-y-4">
        <Card>
          <CardHeader className="border-b border-default-200 mb-6">
            <CardTitle>Edit Coupon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gettingCouponLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Read-only Context */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-dashed border-default-200">
                    <div className="space-y-1">
                        <Label className="text-xs text-default-500">Coupon Code</Label>
                        <div className="font-bold">{code}</div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-default-500">Discount</Label>
                        <div className="font-bold">{discountValue} ({discountType})</div>
                    </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-4 pt-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="usageLimit">Total Usage Limit</Label>
                        <Input
                            id="usageLimit"
                            type="number"
                            placeholder="e.g. 500"
                            value={usageLimit}
                            onChange={(e) => setUsageLimit(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Label htmlFor="isActive" className="cursor-pointer">Is Active</Label>
                        <Input
                            id="isActive"
                            type="checkbox"
                            checked={isActive}
                            className="w-5 h-5 cursor-pointer"
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                    </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-12 flex justify-end">
        <Button
            disabled={updatingCouponLoading || gettingCouponLoading}
            onClick={onSubmit}
            className="w-32 h-12"
        >
          {updatingCouponLoading ? <Loader2 className="animate-spin" size={20} /> : "Update"}
        </Button>
      </div>
    </div>
  );
};

export default EditCoupon;
