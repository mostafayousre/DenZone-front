"use client";

import React, { useState } from 'react';
import TransactionsTable from "@/app/[locale]/(protected)/dashboard/coupons/transactions";
import { AddCouponDialog } from "@/components/partials/coupons/add-coupon-dialog";

function Coupons() {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <TransactionsTable onAdd={() => setOpen(true)} />
            <AddCouponDialog open={open} onOpenChange={setOpen} />
        </div>
    );
}

export default Coupons;