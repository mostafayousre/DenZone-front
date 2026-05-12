"use client";

import React, { useEffect, useState } from 'react';

import { DeliveryTimeSlot } from "@/types/deliveryTimeSlot";
import useGettingAllDeliveryTimeSlots from "@/services/deliveryTimeSlots/gettingAllDeliveryTimeSlots";
import DeliveryTimesTable from './components/transactions';
import { AddDeliveryTimeDialog } from './components/add-delivery-time-dialog';

function DeliveryTimes() {
    const { loading, error, deliveryTimeSlots, getAllDeliveryTimeSlots } = useGettingAllDeliveryTimeSlots();
    const [open, setOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<DeliveryTimeSlot | null>(null);

    useEffect(() => {
        getAllDeliveryTimeSlots();
    }, []);

    const handleEdit = (slot: DeliveryTimeSlot) => {
        setSelectedSlot(slot);
        setOpen(true);
    };

    const handleAdd = () => {
        setSelectedSlot(null);
        setOpen(true);
    };

    return (
        <div>
            <DeliveryTimesTable
                data={deliveryTimeSlots}
                loading={loading}
                onAdd={handleAdd} 
                onEdit={handleEdit} 
                refresh={getAllDeliveryTimeSlots}
            />
            <AddDeliveryTimeDialog
                open={open} 
                onOpenChange={(val) => {
                    setOpen(val);
                    if (!val) setSelectedSlot(null);
                }} 
                editData={selectedSlot}
                onSuccess={getAllDeliveryTimeSlots}
            />
        </div>
    );
}

export default DeliveryTimes;
