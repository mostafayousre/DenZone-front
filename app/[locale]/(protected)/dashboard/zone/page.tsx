import React from 'react';
import ZonesTable from "@/app/[locale]/(protected)/dashboard/zone/transactions";
import { Card } from "@/components/ui/card";

function Zones() {
    return (
        <>
            <Card>
                <ZonesTable />
            </Card>
        </>
    );
}

export default Zones;
