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
import { Loader2 } from "lucide-react";
import {SummaryReport} from "@/types/reports";
import AxiosInstance from "@/lib/AxiosInstance";
import useOrderReports from "@/services/Reports/Orders/orderReports";
import useGettingAllMainAreas from "@/services/area/gettingAllMainAreas";

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
                    <div className="grid md:grid-cols-5 gap-4">
                      <StatisticsBlock
                          title={"Total Orders"}
                          total={(regionSummary?.totalOrders ?? summaryReports?.totalOrders) ?? "--"}
                          className="bg-info/10 border-none shadow-none"
                      />
                      <StatisticsBlock
                          title={"Total Sales"}
                          total={(regionSummary?.totalSales ?? summaryReports?.totalSales) ?? "--"}
                          className="bg-warning/10 border-none shadow-none"
                      />
                      <StatisticsBlock
                          title={"Total Invoices"}
                          total={(regionSummary?.totalInvoices ?? summaryReports?.totalInvoices) ?? "--"}
                          className="bg-primary/10 border-none shadow-none"
                      />
                      <StatisticsBlock
                          title={"Total Active Users"}
                          total={totalActiveUsers}
                          className="bg-success/10 border-none shadow-none"
                      />
                      <StatisticsBlock
                          title={"Total Inactive Users"}
                          total={totalInactiveUsers}
                          className="bg-destructive/10 border-none shadow-none"
                      />
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
          <div className="lg:col-span-4 col-span-12">
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
                        data={(orderReports?.items?.slice(0, 10) || []).map(item => ({
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
      </div>
  );
};

export default DashboardPage;