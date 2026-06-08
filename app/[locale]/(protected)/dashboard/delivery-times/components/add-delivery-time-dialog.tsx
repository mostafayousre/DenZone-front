"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import useCreateDeliveryTimeSlot from "@/services/deliveryTimeSlots/createDeliveryTimeSlot";
import useUpdateDeliveryTimeSlot from "@/services/deliveryTimeSlots/updateDeliveryTimeSlot";
import { toast } from "sonner";
import { DeliveryTimeSlot } from "@/types/deliveryTimeSlot";

interface AddDeliveryTimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editData?: DeliveryTimeSlot | null;
}

export function AddDeliveryTimeDialog({ open, onOpenChange, onSuccess, editData }: AddDeliveryTimeDialogProps) {
  const { createDeliveryTimeSlot, loading: createLoading } = useCreateDeliveryTimeSlot();
  const { updateDeliveryTimeSlot, loading: updateLoading } = useUpdateDeliveryTimeSlot();

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    isActive: true,
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        from: editData.from,
        to: editData.to,
        isActive: editData.isActive,
      });
    } else {
      setFormData({
        from: "",
        to: "",
        isActive: true,
      });
    }
  }, [editData, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.from || !formData.to) {
        toast.error("Please fill in all required fields (From, To)");
        return;
    }

    try {
        if (editData) {
            const payload = {
                id: editData.id,
                ...formData,
            };
            await updateDeliveryTimeSlot(editData.id, payload);
            toast.success("Delivery time slot updated successfully");
        } else {
            await createDeliveryTimeSlot(formData);
            toast.success("Delivery time slot created successfully");
        }
        
        onOpenChange(false);
        if (onSuccess) onSuccess();
        
        setFormData({
            from: "",
            to: "",
            isActive: true,
        });
    } catch (error: any) {
        toast.error(error.message || `Failed to ${editData ? 'update' : 'create'} delivery time slot`);
    }
  };

  const loading = createLoading || updateLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-0">
           <DialogTitle className="text-xl font-bold text-default-900">
             {editData ? 'Edit Delivery Time' : 'Add Delivery Time'}
           </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium text-default-700">From</Label>
              <Input 
                type="time"
                value={formData.from}
                onChange={(e) => handleChange("from", e.target.value)}
                className="h-12 bg-default-50 border-default-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium text-default-700">To</Label>
              <Input 
                type="time"
                value={formData.to}
                onChange={(e) => handleChange("to", e.target.value)}
                className="h-12 bg-default-50 border-default-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
            
            {editData && (
              <div className="flex items-center gap-3 py-2">
                <Label className="font-medium text-default-700">Active Status</Label>
                <Switch 
                  checked={formData.isActive}
                  onCheckedChange={(val) => handleChange("isActive", val)}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-default-200">
             <Button 
                className="hover:bg-purple-600 dark:text-black text-white rounded-lg px-8 h-12 text-base font-medium flex-1 shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]"
                onClick={handleSubmit}
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (editData ? "Update" : "Save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
