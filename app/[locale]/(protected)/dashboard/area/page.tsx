import React from 'react';
import AreasTable from "@/app/[locale]/(protected)/dashboard/area/transactions";
import { Card } from "@/components/ui/card";

function Areas() {
    return (
        <>
            <Card>
                <AreasTable />
            </Card>
        </>
    );
}

export default Areas;
