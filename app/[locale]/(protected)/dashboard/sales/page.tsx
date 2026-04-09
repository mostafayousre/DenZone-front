"use client";

import React from "react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import ColumnNegativeValues from "@/app/[locale]/(protected)/charts/appex-charts/charts-appex-column/column-negative-values";
import DistributedChart from "@/app/[locale]/(protected)/charts/appex-charts/charts-appex-column/distributed-chart";
import BasicBar from "@/app/[locale]/(protected)/charts/appex-charts/charts-appex-bar/basic-bar";
import BasicDonut from "@/app/[locale]/(protected)/charts/appex-charts/charts-appex-pie/basic-donut";
import TransactionsTable from "@/app/[locale]/(protected)/dashboard/sales/transactions";

function Sales() {
    return (
        <Tabs defaultValue="area-statistics" className="w-full space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger className={"cursor-pointer hover:text-white hover:bg-gray-300 rounded-md"} value="area-statistics"
                >
                    Area Statistics
                </TabsTrigger>
                <TabsTrigger className={"cursor-pointer hover:text-white hover:bg-gray-300 rounded-md"} value="pharmacy-statistics"
                >
                   Doctor Statistics
                </TabsTrigger>
                <TabsTrigger className={"cursor-pointer hover:text-white hover:bg-gray-300 rounded-md"} value="inventory-statistics"
                >
                    Inventory statistics
                </TabsTrigger>
                <TabsTrigger className={"cursor-pointer hover:text-white hover:bg-gray-300 rounded-md"} value="status-statistics"
                >
                    Status statistics
                </TabsTrigger>

                <TabsTrigger className={"cursor-pointer hover:text-white hover:bg-gray-300 rounded-md"} value="summary"
                >
                    Summary
                </TabsTrigger>
            </TabsList>

            <TabsContent value="area-statistics">
                <Card>
                    <CardHeader>Area Statistics</CardHeader>
                    <CardContent>
                        <TransactionsTable type={"area"} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="pharmacy-statistics">
                <Card>
                    <CardHeader>Doctor Statistics</CardHeader>
                    <CardContent>
                        <TransactionsTable type={"user"} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="inventory-statistics">
                <Card>
                    <CardHeader>Inventory statistics</CardHeader>
                    <CardContent>
                        <TransactionsTable type={"inventory"} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="status-statistics">
                <Card>
                    <CardHeader>Status statistics</CardHeader>
                    <CardContent>
                        <TransactionsTable type={"status"} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="summary">
                <Card>
                    <CardHeader>Summary</CardHeader>
                    <CardContent>
                        <TransactionsTable type={"summary"} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}

export default Sales;