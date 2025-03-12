import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import SummaryServer from "@/components/dashboard/summary-server";
import AssetCategoryWidgetClient from "@/components/dashboard/asset-category-widget-client";
import AddAssetButton from "@/components/dashboard/add-asset-button";
import PortfolioChart from "@/components/dashboard/portfolio-chart";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import AssetAllocationChart from "@/components/dashboard/asset-allocation-chart";
import Sidebar from "@/components/dashboard/sidebar";
import {
  handleAddAsset,
  handleViewDetails,
} from "@/app/actions/dashboard-actions";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch asset categories
  const { data: categories } = await supabase
    .from("asset_categories")
    .select("*");

  // Fetch user's assets
  const { data: assets } = await supabase
    .from("assets")
    .select("*, asset_categories(name, slug, icon)");

  // Calculate totals
  const totalAssets = assets
    ? assets
        .filter((asset) => !asset.is_liability)
        .reduce((sum, asset) => sum + asset.value, 0)
    : 0;

  const totalLiabilities = assets
    ? assets
        .filter((asset) => asset.is_liability)
        .reduce((sum, asset) => sum + asset.value, 0)
    : 0;

  const netWorth = totalAssets - totalLiabilities;

  // Group assets by category
  const assetsByCategory = {};
  if (assets) {
    assets.forEach((asset) => {
      const categorySlug = asset.asset_categories?.slug || "uncategorized";
      if (!assetsByCategory[categorySlug]) {
        assetsByCategory[categorySlug] = [];
      }
      assetsByCategory[categorySlug].push(asset);
    });
  }

  // Calculate category totals
  const getCategoryTotal = (categorySlug: string) => {
    if (!assetsByCategory[categorySlug]) return 0;
    return assetsByCategory[categorySlug].reduce((sum: number, asset: any) => {
      return asset.is_liability ? sum - asset.value : sum + asset.value;
    }, 0);
  };

  // Get asset count by category
  const getCategoryAssetCount = (categorySlug: string) => {
    return assetsByCategory[categorySlug]?.length || 0;
  };

  return (
    <SubscriptionCheck>
      <DashboardNavbar />
      <div className="flex">
        <Sidebar />
        <main className="w-full bg-gray-50 min-h-screen pl-64">
          <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-normal">HI,</h1>
              <AddAssetButton />
            </header>

            {/* Summary Header */}
            <SummaryServer
              netWorth={netWorth}
              totalAssets={totalAssets}
              totalLiabilities={totalLiabilities}
              // Sample data
              changePercentage={2.5}
            />

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PortfolioChart className="w-[1300px]" />
              <AssetAllocationChart />
            </div>

            {/* Asset Categories Section */}
            <h2 className="text-xl font-semibold mt-4">Asset Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <AssetCategoryWidgetClient
                title="Cash"
                iconName="DollarSign"
                totalValue={getCategoryTotal("cash")}
                assetCount={getCategoryAssetCount("cash")}
                changePercentage={0.5}
              />
              <AssetCategoryWidgetClient
                title="Investments"
                iconName="Landmark"
                totalValue={getCategoryTotal("investments")}
                assetCount={getCategoryAssetCount("investments")}
                changePercentage={3.2}
              />
              <AssetCategoryWidgetClient
                title="Real Estate"
                iconName="Home"
                totalValue={getCategoryTotal("real-estate")}
                assetCount={getCategoryAssetCount("real-estate")}
                changePercentage={1.8}
              />
              <AssetCategoryWidgetClient
                title="Cryptocurrency"
                iconName="Coins"
                totalValue={getCategoryTotal("cryptocurrency")}
                assetCount={getCategoryAssetCount("cryptocurrency")}
                changePercentage={-2.1}
              />
              <AssetCategoryWidgetClient
                title="Debt"
                iconName="CreditCard"
                totalValue={getCategoryTotal("debt")}
                assetCount={getCategoryAssetCount("debt")}
                changePercentage={0}
              />
            </div>

            {/* Recent Transactions */}
            <h2 className="text-xl font-semibold mt-4">Recent Activity</h2>
            <RecentTransactions />
          </div>
        </main>
      </div>
    </SubscriptionCheck>
  );
}
