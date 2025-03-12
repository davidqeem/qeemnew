"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function PortfolioChart() {
  const [timeframe, setTimeframe] = useState("1m");

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Portfolio Growth</CardTitle>
          <Tabs
            defaultValue="1m"
            value={timeframe}
            onValueChange={setTimeframe}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-4 w-[200px]">
              <TabsTrigger value="1m">1M</TabsTrigger>
              <TabsTrigger value="3m">3M</TabsTrigger>
              <TabsTrigger value="1y">1Y</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-md">
          <p className="text-muted-foreground text-sm">
            Chart visualization will be implemented here
          </p>
        </div>
        <div className="flex justify-between mt-4 text-sm">
          <div>
            <p className="text-muted-foreground">Starting Value</p>
            <p className="font-medium">$125,000</p>
          </div>
          <div>
            <p className="text-muted-foreground">Current Value</p>
            <p className="font-medium">$152,500</p>
          </div>
          <div>
            <p className="text-muted-foreground">Growth</p>
            <p className="font-medium text-green-600">+$27,500 (22%)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
