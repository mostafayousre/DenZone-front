"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatsBlock {
  className?: string;
  title: string;
  total?: number | string;

  // Commented chart-related props
  // series?: number[];
  // chartColor?: string;
  // chartType?: 'area' | 'bar' | 'line' | 'pie' | 'donut' | 'radialBar';
  // opacity?: number;
}

// Commented out default chart data
// const defaultData = [800, 600, 1000, 800, 600, 1000, 800, 900];

// Commented out chart import and theme hook
// import dynamic from "next/dynamic";
// import { useTheme } from "next-themes";
// const Chart = dynamic(() => import("react-apexcharts"));

const StatisticsBlock = ({
                           title = "Static Block",
                           total,
                           className,
                           // series = defaultData,
                           // chartColor = "#00EBFF",
                           // chartType = "area",
                           // opacity = 0.1
                         }: StatsBlock) => {
  // const { theme: mode } = useTheme();
  // const chartSeries = [{ data: series }];

  // const options: any = { ...chart options here };

  return (
      <Card className={cn("h-full w-full", className)}>
        <CardContent className="py-[12px] px-4 h-full flex items-center">
          <div className="flex gap-6 items-center w-full">
            {/* Chart commented out */}
            {/*
          <div className="flex-none">
            <Chart
              options={options}
              series={chartSeries}
              type={chartType}
              height={48}
              width={48}
            />
          </div>
          */}
            <div className="flex-1">
              <div className="text-default-800 text-sm mb-1 font-medium">
                {title}
              </div>
              <div className="text-default-900 text-lg font-medium">
                {total}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

export { StatisticsBlock };