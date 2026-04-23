import React from 'react';
import BannersTable from "./components/BannersTable";
import { Card } from "@/components/ui/card";

function BannersPage() {
    return (
        <div className="space-y-6">
            <Card>
                <BannersTable />
            </Card>
        </div>
    );
}

export default BannersPage;
