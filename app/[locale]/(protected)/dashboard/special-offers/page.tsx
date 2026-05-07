import React from 'react';
import SpecialOffersTable from "./components/SpecialOffersTable";
import { Card } from "@/components/ui/card";

function SpecialOffersPage() {
    return (
        <div className="space-y-6">
            <Card>
                <SpecialOffersTable />
            </Card>
        </div>
    );
}

export default SpecialOffersPage;
