import React from 'react';
import AreaZonesTable from "@/app/[locale]/(protected)/dashboard/area-zone/transactions";
import { Card } from "@/components/ui/card";

function AreaZones() {
    return (
        <>
            <Card>
                <AreaZonesTable />
            </Card>
        </>
    );
}

export default AreaZones;
