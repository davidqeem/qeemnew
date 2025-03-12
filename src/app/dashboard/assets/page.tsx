import DashboardNavbar from "@/components/dashboard-navbar";
import Sidebar from "@/components/dashboard/sidebar";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import AddAssetButton from "@/components/dashboard/add-asset-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AssetsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's assets
  const { data: assets } = await supabase
    .from("assets")
    .select("*, asset_categories(name, slug, icon)")
    .eq("is_liability", false);

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <div className="flex">
        <Sidebar />
        <main className="w-full bg-gray-50 min-h-screen pl-64">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold">My Assets</h1>
              <AddAssetButton />
            </header>

            {/* Assets List */}
            <Card>
              <CardHeader>
                <CardTitle>All Assets</CardTitle>
              </CardHeader>
              <CardContent>
                {assets && assets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-sm">
                            Name
                          </th>
                          <th className="text-left p-3 font-medium text-sm">
                            Identifier
                          </th>
                          <th className="text-right p-3 font-medium text-sm">
                            Quantity
                          </th>
                          <th className="text-right p-3 font-medium text-sm">
                            Price per share
                          </th>
                          <th className="text-right p-3 font-medium text-sm">
                            Total Value
                          </th>
                          <th className="text-right p-3 font-medium text-sm">
                            Gain/Loss
                          </th>
                          <th className="text-right p-3 font-medium text-sm">
                            Change %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {assets.map((asset) => {
                          // Check if this is a stock asset
                          const isStock =
                            asset.metadata?.asset_type === "stock";
                          const stockMetadata = isStock ? asset.metadata : null;

                          // Calculate gain/loss if it's a stock
                          const gainLoss =
                            isStock && asset.acquisition_value
                              ? asset.value - asset.acquisition_value
                              : 0;

                          // Calculate percentage change
                          const percentChange =
                            isStock && asset.acquisition_value
                              ? ((asset.value - asset.acquisition_value) /
                                  asset.acquisition_value) *
                                100
                              : 0;

                          // Generate a fake identifier for stocks
                          const identifier = isStock
                            ? `USD${Math.floor(Math.random() * 900000000) + 100000000}`
                            : "";

                          // Convert USD to EUR (simplified conversion for demo)
                          const eurRate = 0.82;
                          const valueEUR = asset.value * eurRate;
                          const pricePerShareEUR = isStock
                            ? stockMetadata.price_per_share * eurRate
                            : 0;
                          const gainLossEUR = gainLoss * eurRate;

                          return (
                            <tr key={asset.id} className="hover:bg-muted/30">
                              <td className="p-3">
                                <div className="font-medium">{asset.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {asset.asset_categories?.name ||
                                    "Uncategorized"}
                                </div>
                              </td>
                              <td className="p-3 text-sm">
                                {isStock ? identifier : asset.location || "-"}
                              </td>
                              <td className="p-3 text-right">
                                {isStock
                                  ? stockMetadata.quantity.toLocaleString()
                                  : "-"}
                              </td>
                              <td className="p-3 text-right">
                                {isStock ? (
                                  <div>
                                    <div>€{pricePerShareEUR.toFixed(2)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      $
                                      {stockMetadata.price_per_share.toFixed(2)}
                                    </div>
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="p-3 text-right font-medium">
                                <div>€{valueEUR.toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">
                                  ${asset.value.toFixed(2)}
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                {isStock ? (
                                  <div
                                    className={
                                      gainLoss >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {gainLoss >= 0 ? "" : "-"}€
                                    {Math.abs(gainLossEUR).toFixed(2)}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="p-3 text-right">
                                {isStock ? (
                                  <div
                                    className={
                                      percentChange >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {percentChange >= 0 ? "+" : ""}
                                    {percentChange.toFixed(2)}%
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No assets found. Add your first asset to get started.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SubscriptionCheck>
  );
}
