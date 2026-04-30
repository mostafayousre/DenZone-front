'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetLimitOrder } from "@/services/Orders/getLimitOrder";
import { useUpdateLimitOrder } from "@/services/Orders/updateLimitOrder";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function Settings() {
    const { limit, getLimitOrder } = useGetLimitOrder();
    const { updateLimitOrder, loading: updatingLimit } = useUpdateLimitOrder();
    const [editableLimit, setEditableLimit] = useState("");

    useEffect(() => {
        getLimitOrder();
    }, []);

    useEffect(() => {
        if (limit) {
            setEditableLimit(limit.minimumOrder.toString());
        }
    }, [limit]);

    const handleUpdateLimit = async () => {
        const newVal = parseFloat(editableLimit);
        if (isNaN(newVal) || newVal < 0) {
            toast.error("Please enter a valid number");
            return;
        }

        const { success, error } = await updateLimitOrder(newVal);
        if (success) {
            toast.success("Order limit updated successfully");
            getLimitOrder();
        } else {
            toast.error(error || "Failed to update order limit");
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="border-b border-solid border-default-200 mb-6">
                    <CardTitle>Notification Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-3">
                            <Label size={"lg"}>Email Notifications</Label>
                            <Label>Receive emails for important updates</Label>
                        </div>
                        <div>
                            <Switch color="info" size={"lg"} />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-3">
                            <Label size={"lg"}>Order Notifications</Label>
                            <Label>Receive notifications when new orders are placed</Label>
                        </div>
                        <div>
                            <Switch color="info" size={"lg"} />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-3">
                            <Label size={"lg"}>Inventory Alerts</Label>
                            <Label>Get notified when products are low in stock</Label>
                        </div>
                        <div>
                            <Switch color="info" size={"lg"} />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-3">
                            <Label size={"lg"}>Promotional Emails</Label>
                            <Label>Receive marketing and promotional emails</Label>
                        </div>
                        <div>
                            <Switch color="info" size={"lg"} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="border-b border-solid border-default-200 mb-6">
                    <CardTitle>Order Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col gap-3">
                            <Label size={"lg"}>Minimum Order Price</Label>
                            <Label>Set the minimum price required for an order</Label>
                        </div>
                        <div className="flex items-center gap-2 border border-default-200 rounded-md p-1 px-3">
                            <Input
                                type="number"
                                value={editableLimit}
                                onChange={(e) => setEditableLimit(e.target.value)}
                                className="w-32 h-10"
                                disabled={updatingLimit}
                            />
                            <Button
                                onClick={handleUpdateLimit}
                                disabled={updatingLimit || !!(limit && editableLimit === limit.minimumOrder.toString())}
                            >
                                {updatingLimit ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Settings;