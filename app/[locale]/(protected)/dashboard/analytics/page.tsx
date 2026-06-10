"use client";

import {useEffect, useState} from "react";
import { StatisticsBlock } from "@/components/blocks/statistics-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RevinueBarChart from "@/components/revenue-bar-chart";
import DashboardDropdown from "@/components/dashboard-dropdown";
import OverviewChart from "./components/overview-chart";
import CompanyTable from "./components/company-table";
import RecentActivity from "./components/recent-activity";
import MostSales from "./components/most-sales";
import OverviewRadialChart from "./components/overview-radial";
import { useTranslations } from "next-intl";
import useSummaryReports from "@/services/Reports/summary/summaryReports";
import { Loader2, Mail, Phone, User, Calendar, Hash, DollarSign, User2Icon } from "lucide-react";
import {SummaryReport} from "@/types/reports";
import AxiosInstance from "@/lib/AxiosInstance";
import useOrderReports from "@/services/Reports/Orders/orderReports";
import useGettingAllMainAreas from "@/services/area/gettingAllMainAreas";
import useGetRecentUsers from "@/services/users/getRecentUsers";
import useGetRecentOrders from "@/services/Orders/getRecentOrders";
import useGetActiveUsersLast10Days from "@/services/users/getActiveUsersLast10Days";
import useGetInactiveUsersLast10Days from "@/services/users/getInactiveUsersLast10Days";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const DashboardPage = () => {
  const t = useTranslations("AnalyticsDashboard");

  const {
    loading: loadingSummaryReports,
    fetchSummaryReports,
    summaryReports,
    error: errorSummaryReports,
  } = useSummaryReports();

  const {loading: loadingOrderReports, fetchOrderReports, orderReports} = useOrderReports()
  const [regionSummary, setRegionSummary] = useState<SummaryReport | null>(null);


  const {loading: loadingMainAreas, getAllMainAreas, mainAreas, error: errorMainAreas} = useGettingAllMainAreas()

  const [monthlySummary, setMonthlySummary] = useState<any[]>([]);
  const [loadingMonthlySummary, setLoadingMonthlySummary] = useState(true);

  const { loading: loadingRecentUsers, recentUsers, getRecentUsers } = useGetRecentUsers();
  const [recentUsersDialogOpen, setRecentUsersDialogOpen] = useState(false);

  const { loading: loadingRecentOrders, recentOrders, getRecentOrders } = useGetRecentOrders();
  const [recentOrdersDialogOpen, setRecentOrdersDialogOpen] = useState(false);

  const { loading: loadingActiveUsers, activeUsers, getActiveUsers } = useGetActiveUsersLast10Days();
  const [activeUsersDialogOpen, setActiveUsersDialogOpen] = useState(false);

  const { loading: loadingInactiveUsers, inactiveUsers, getInactiveUsers } = useGetInactiveUsersLast10Days();
  const [inactiveUsersDialogOpen, setInactiveUsersDialogOpen] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  interface MonthlyData {
    month: string;
    totalOrders: number;
    totalSales: number;
  }

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 10);
  
    end.setHours(23, 59, 59, 999);

    setStartDate(start);
    setEndDate(end);

    const params = new URLSearchParams();
    params.set("StartDate", start.toISOString());
    params.set("EndDate", end.toISOString());

    fetchSummaryReports(params.toString());
    fetchOrderReports(params.toString());
  }, []);



  useEffect(() => {
    const fetchMonthlyReports = async () => {
      setLoadingMonthlySummary(true);
      const now = new Date();
      const results: MonthlyData[] = [];

      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const params = new URLSearchParams();
        params.set("StartDate", start.toISOString());
        params.set("EndDate", end.toISOString());

        try {
          const response = await AxiosInstance.get(`/api/reports/summary?${params.toString()}`);
          const data = response.data;

          results.push({
            month: start.toLocaleString("default", { month: "short" }),
            totalOrders: data?.totalOrders ?? 0,
            totalSales: data?.totalSales ?? 0,
          });
        } catch (error) {
          results.push({
            month: start.toLocaleString("default", { month: "short" }),
            totalOrders: 0,
            totalSales: 0,
          });
        }
      }

      setMonthlySummary(results);
      setLoadingMonthlySummary(false);
    };

    fetchMonthlyReports();
  }, []);

  const revenueSeries = [
    {
      name: "Total Orders",
      data: monthlySummary.map((item) => item.totalOrders),
    },
    {
      name: "Total Sales",
      data: monthlySummary.map((item) => item.totalSales),
    },
  ];

  const months = monthlySummary.map((item) => item.month);
  const totalActiveUsers = (regionSummary?.activeUsers ?? regionSummary?.totalActiveUser ?? summaryReports?.activeUsers ?? summaryReports?.totalActiveUser) ?? "--";
  const totalInactiveUsers = (regionSummary?.inactiveUsers ?? regionSummary?.totalNonActiveUser ?? summaryReports?.inactiveUsers ?? summaryReports?.totalNonActiveUser) ?? "--";
  const totalRecentUser = (regionSummary?.totalRecentUser ?? summaryReports?.totalRecentUser) ?? "--";
  
  return (
      <div>
        <div className="grid grid-cols-12 items-center gap-5 mb-5">
          <div className="col-span-12">
            {loadingSummaryReports ? (
                <div className="w-full h-full flex justify-center items-center">
                  <Loader2 className="text-blue-500 mx-auto animate-spin" />
                </div>
            ) : (
                <Card>
                  <CardHeader className="flex flex-row justify-between space-x-1">
                    <CardTitle className="text-lg font-semibold text-default-900">
                      {"Weekly Overview"}
                    </CardTitle>
                    {startDate && endDate && (
                      <div className="text-sm text-default-500 font-normal">
                        {`${startDate.toLocaleDateString()} — ${endDate.toLocaleDateString()}`}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <Link className="cursor-pointer transition-transform hover:scale-[1.02]" href="/dashboard/order-list">
                      <StatisticsBlock
                          title={"Total Orders"}
                          total={(regionSummary?.totalOrders ?? summaryReports?.totalOrders) ?? "--"}
                          className="bg-info/10 border-none shadow-none"
                      />
                      </Link>
                      <div
                        className="cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => {
                          setRecentOrdersDialogOpen(true);
                          getRecentOrders();
                        }}
                      >
                        <StatisticsBlock
                            title={"New Orders"}
                            total={(regionSummary?.totalRecentOrders ?? summaryReports?.totalRecentOrders) ?? "--"}
                            className="bg-warning/10 border-none shadow-none"
                        />
                      </div>
                      <Link className="cursor-pointer transition-transform hover:scale-[1.02]" href="/dashboard/reports/invoices">
                      <StatisticsBlock
                          title={"Total Invoices"}
                          total={(regionSummary?.totalInvoices ?? summaryReports?.totalInvoices) ?? "--"}
                          className="bg-primary/10 border-none shadow-none"
                      />
                      </Link>
                      <div
                        className="cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => {
                          setRecentUsersDialogOpen(true);
                          getRecentUsers();
                        }}
                      >
                        <StatisticsBlock
                            title={"Total Recent Users"}
                            total={totalRecentUser}
                            className="bg-destructive/10 border-none shadow-none"
                        />
                      </div>
                      <div
                        className="cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => {
                          setActiveUsersDialogOpen(true);
                          getActiveUsers();
                        }}
                      >
                        <StatisticsBlock
                            title={"Total Active Users"}
                            total={totalActiveUsers}
                            className="bg-success/10 border-none shadow-none"
                        />
                      </div>
                      <div
                        className="cursor-pointer transition-transform hover:scale-[1.02]"
                        onClick={() => {
                          setInactiveUsersDialogOpen(true);
                          getInactiveUsers();
                        }}
                      >
                        <StatisticsBlock
                            title={"Total Inactive Users"}
                            total={totalInactiveUsers}
                            className="bg-destructive/10 border-none shadow-none"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
            )}
          </div>
        </div>

       
        <div className="grid grid-cols-12 gap-5">
          <div className="lg:col-span-8 col-span-12">
            <Card>
              <CardContent className="p-4">
                {loadingMonthlySummary ? (
                    <div className="w-full h-full flex justify-center items-center">
                      <Loader2 className="text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <RevinueBarChart
                        series={revenueSeries}
                        chartColors={["#3B82F6", "#10B981"]}
                        height={400}
                        chartType="bar"
                        xCategories={months}
                    />
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-4 col-span-12">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <CardTitle className="flex-1">{t("overview_circle_chart_title")}</CardTitle>
                {startDate && endDate && (
                  <div className="text-sm text-default-500 font-normal">
                    {`${startDate.toLocaleDateString()} — ${endDate.toLocaleDateString()}`}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loadingMonthlySummary ? (
                   <div className="w-full h-full flex justify-center items-center">
                     <Loader2 className="text-blue-500 animate-spin" />
                   </div>
                ) : (
                    <>
                      {summaryReports &&(
                          <OverviewChart
                              series={[
                                (regionSummary?.totalSales ?? summaryReports?.totalSales) ?? 0,
                                (regionSummary?.totalOrders ?? summaryReports?.totalOrders) ?? 0,
                                (regionSummary?.totalInvoices ?? summaryReports?.totalInvoices) ?? 0,
                              ]}
                              labels={["Sales", "Orders", "Invoices"]}
                          />
                      )}
                    </>
                )}
              </CardContent>
            </Card>
          </div>
          {/*<div className="lg:col-span-8 col-span-12">*/}
          {/*  <Card>*/}
          {/*    <CardHeader className="flex flex-row items-center">*/}
          {/*      <CardTitle className="flex-1">{t("company_table_title")}</CardTitle>*/}
          {/*      <DashboardDropdown />*/}
          {/*    </CardHeader>*/}
          {/*    <CardContent className="p-0">*/}
          {/*      <CompanyTable />*/}
          {/*    </CardContent>*/}
          {/*  </Card>*/}
          {/*</div>*/}
          <div className="lg:col-span-8 col-span-12">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <CardTitle className="flex-1">Sales Review</CardTitle>
                {startDate && endDate && (
                  <div className="text-sm text-default-500 font-normal">
                    {`${startDate.toLocaleDateString()} — ${endDate.toLocaleDateString()}`}
                  </div>
                )}
              </CardHeader>
              <MostSales onRegionSummaryFetched={(data) => setRegionSummary(data)} />
            </Card>
          </div>
          <div className="lg:col-span-4 col-span-12 ">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <CardTitle className="flex-1">{t("recent_activity_table_title")}</CardTitle>
                {startDate && endDate && (
                  <div className="text-sm text-default-500 font-normal">
                    {`${startDate.toLocaleDateString()} — ${endDate.toLocaleDateString()}`}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {loadingOrderReports ? (
                    <div className="w-full h-full flex justify-center items-center">
                      <Loader2 className="text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <RecentActivity
                        data={(orderReports?.items || []).map(item => ({
                          id: item.id,
                          fullName: item.fullName || 'Unknown User',
                          orderDate: item.orderDate
                        }))}
                    />
                )}
              </CardContent>
            </Card>
          </div>
          {/*<div className="lg:col-span-4 col-span-12">*/}
          {/*  <Card>*/}
          {/*    <CardHeader className="flex flex-row items-center">*/}
          {/*      <CardTitle className="flex-1">{t("overview_circle_chart_title")}</CardTitle>*/}
          {/*      <DashboardDropdown />*/}
          {/*    </CardHeader>*/}
          {/*    <CardContent>*/}
          {/*      <OverviewRadialChart />*/}
          {/*      <div className="bg-default-50 rounded p-4 mt-8 flex justify-between flex-wrap">*/}
          {/*        /!* Sample static values *!/*/}
          {/*        <div className="space-y-1">*/}
          {/*          <h4 className="text-default-600 text-xs font-normal">*/}
          {/*            {t("invested_amount")}*/}
          {/*          </h4>*/}
          {/*          <div className="text-sm font-medium text-default-900">*/}
          {/*            $8264.35*/}
          {/*          </div>*/}
          {/*          <div className="text-default-500 text-xs font-normal">*/}
          {/*            +0.001.23 (0.2%)*/}
          {/*          </div>*/}
          {/*        </div>*/}

          {/*        /!* Repeat as needed *!/*/}
          {/*      </div>*/}
          {/*    </CardContent>*/}
          {/*  </Card>*/}
          {/*</div>*/}
        </div>

        {/* Recent Users Dialog */}
        <Dialog open={recentUsersDialogOpen} onOpenChange={setRecentUsersDialogOpen}>
          <DialogContent size="md" className="max-h-[85vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>Recent Users</DialogTitle>
              <DialogDescription>
                <span>List of recently registered users</span>
              </DialogDescription>
            </DialogHeader>
            {loadingRecentUsers ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No recent users found.
              </div>
            ) : (
              <ScrollArea className="h-[60vh] overflow-y-auto pr-4">
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-2 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium text-default-900">{user.fullName}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span dir="ltr">{user.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User2Icon className="w-3.5 h-3.5" />
                          <span dir="ltr">{user.roleName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Recent Orders Dialog */}
        <Dialog open={recentOrdersDialogOpen} onOpenChange={setRecentOrdersDialogOpen}>
          <DialogContent size="md" className="max-h-[85vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>Recent Orders</DialogTitle>
              <DialogDescription>
                <span>List of recent orders in the system</span>
              </DialogDescription>
            </DialogHeader>
            {loadingRecentOrders ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No recent orders found.
              </div>
            ) : (
              <ScrollArea className="h-[60vh] overflow-y-auto pr-4">
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col gap-2 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between border-b pb-2 mb-1">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="font-medium text-default-900">Order #{order.orderNumber}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === "Pending" ? "bg-warning/10 text-warning" :
                          order.status === "Completed" ? "bg-success/10 text-success" :
                          order.status === "Cancelled" ? "bg-destructive/10 text-destructive" :
                          "bg-info/10 text-info"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-success" />
                          <span className="font-semibold text-default-900">{order.totalAmount.toLocaleString()} EGP</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>Doctor: {order.doctorName || "--"}</span>
                        </div>
                        {order.inventoryUserName && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-muted-foreground/75" />
                            <span>Inventory: {order.inventoryUserName}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(order.orderDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Active Users Dialog */}
        <Dialog open={activeUsersDialogOpen} onOpenChange={setActiveUsersDialogOpen}>
          <DialogContent size="md" className="max-h-[85vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>Active Users (Last 10 Days)</DialogTitle>
              <DialogDescription>
                <span>List of active users in the last 10 days</span>
              </DialogDescription>
            </DialogHeader>
            {loadingActiveUsers ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : activeUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No active users found.
              </div>
            ) : (
              <ScrollArea className="h-[60vh] overflow-y-auto pr-4">
                <div className="space-y-3">
                  {activeUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-2 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium text-default-900">{user.fullName}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span dir="ltr">{user.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>

        {/* Inactive Users Dialog */}
        <Dialog open={inactiveUsersDialogOpen} onOpenChange={setInactiveUsersDialogOpen}>
          <DialogContent size="md" className="max-h-[85vh] flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>Inactive Users (Last 10 Days)</DialogTitle>
              <DialogDescription>
                <span>List of inactive users in the last 10 days</span>
              </DialogDescription>
            </DialogHeader>
            {loadingInactiveUsers ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : inactiveUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No inactive users found.
              </div>
            ) : (
              <ScrollArea className="h-[60vh] overflow-y-auto pr-4">
                <div className="space-y-3">
                  {inactiveUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-2 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium text-default-900">{user.fullName}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span dir="ltr">{user.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default DashboardPage;