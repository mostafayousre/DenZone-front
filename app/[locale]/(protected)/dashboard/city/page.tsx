import React from 'react';
import CitiesTable from "@/app/[locale]/(protected)/dashboard/city/transactions";
import { Card } from "@/components/ui/card";

function Cities() {
    return (
        <>
            <Card>
                <CitiesTable />
            </Card>
        </>
    );
}

export default Cities;
