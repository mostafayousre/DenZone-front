import React from 'react';
import CountriesTable from "@/app/[locale]/(protected)/dashboard/country/transactions";
import { Card } from "@/components/ui/card";

function Countries() {
    return (
        <>
            <Card>
                <CountriesTable />
            </Card>
        </>
    );
}

export default Countries;
