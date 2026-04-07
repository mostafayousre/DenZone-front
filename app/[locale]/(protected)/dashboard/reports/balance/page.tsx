'use client'

import {Card, CardContent, CardHeader} from "@/components/ui/card";
import TransactionsTable from "./transactions";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import React from "react";

function BalanceReports() {
    return (
        <>
            <Tabs defaultValue="account-balances" className="w-full space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger className={"cursor-pointer hover:text-white hover:bg-gray-800 rounded-md"} value="account-balances"
                    >
                        Account Balances
                    </TabsTrigger>
                    <TabsTrigger className={"cursor-pointer hover:text-white hover:bg-gray-800 rounded-md"} value="transactions-balances"
                    >
                        Transactions Balances
                    </TabsTrigger>
                    <TabsTrigger className={"cursor-pointer hover:text-white hover:bg-gray-800 rounded-md"} value="summary"
                    >
                        Summary
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="account-balances">
                    <Card>
                        <CardHeader>Account Balances</CardHeader>
                        <CardContent>
                            <TransactionsTable type={"account"} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions-balances">
                    <Card>
                        <CardHeader>Transactions Balances</CardHeader>
                        <CardContent>
                            <TransactionsTable type={"transaction"} />
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
        </>
    )
}

export default BalanceReports;