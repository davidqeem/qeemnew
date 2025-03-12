"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssetAllocationChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex items-center justify-center bg-gray-50 rounded-md">
          <p className="text-muted-foreground text-sm">
            Asset allocation visualization will be implemented here
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
