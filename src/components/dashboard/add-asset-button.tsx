"use client";

import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  Briefcase,
  Coins,
  Home,
  Car,
  DollarSign,
  Globe,
  Database,
  Plus,
  Link,
  Lock,
  PenLine,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import StockSearch from "./stock-search";
import CryptoSearch from "./crypto-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddAssetForm from "./add-asset-form";
import { createClient } from "../../../supabase/client";

export default function AddAssetButton() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [showAssetTypes, setShowAssetTypes] = useState(true);
  const [showStocksOptions, setShowStocksOptions] = useState(false);
  const [activeTab, setActiveTab] = useState("cash");
  const [selectedAssetType, setSelectedAssetType] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setShowAssetTypes(true);
    setShowStocksOptions(false);
    setShowStockSearch(false);
    setShowCryptoSearch(false);
  };

  const handleAssetTypeSelect = (type: string) => {
    setSelectedAssetType(type);

    if (type === "stocks") {
      setShowStocksOptions(true);
      setShowAssetTypes(false);
    } else if (type === "crypto") {
      setShowStocksOptions(true); // Reuse the same options UI
      setShowAssetTypes(false);
    } else {
      setShowStocksOptions(false);
      setShowAssetTypes(false);

      // Map the selected type to the appropriate tab
      switch (type) {
        case "homes":
          setActiveTab("real-estate");
          break;
        case "cash":
          setActiveTab("cash");
          break;
        case "cars":
        case "metals":
        case "domains":
        case "manually":
        default:
          // For now, these will use the investments form
          setActiveTab("investments");
          break;
      }
    }
  };

  const [showStockSearch, setShowStockSearch] = useState(false);
  const [showCryptoSearch, setShowCryptoSearch] = useState(false);

  const handleStocksOptionSelect = async (option: string) => {
    setShowStocksOptions(false);

    if (option === "manual") {
      if (selectedAssetType === "crypto") {
        setShowCryptoSearch(true);
      } else {
        setShowStockSearch(true);
      }
    } else if (option === "link") {
      try {
        // Get the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Show loading state
        setIsLinking(true);

        console.log("Starting SnapTrade linking process for user:", user.id);

        // Import dynamically to avoid server-side issues
        const { createSnapTradeUserLink } = await import("@/utils/snaptrade");

        // Create a link for the user
        const origin = window.location.origin;
        console.log("Using origin for redirect:", origin);

        const redirectUri = await createSnapTradeUserLink(user.id, origin);

        console.log("Received redirect URI:", redirectUri);

        // Redirect to SnapTrade
        window.location.href = redirectUri;
      } catch (error) {
        console.error("Error linking account:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        alert(`Failed to link account: ${errorMessage}. Please try again.`);
        setIsLinking(false);
      }
    } else {
      // For any other option
      setActiveTab("investments");
    }
  };

  const handleStockSelect = (stock: any, quantity: number) => {
    // The stock has been saved to the database in the StockSearch component
    // Now we just need to close the dialog and potentially refresh the page
    setShowStockSearch(false);
    handleClose();

    // Refresh the page to show the newly added stock
    window.location.href = "/dashboard/assets";
  };

  const handleCryptoSelect = (crypto: any, quantity: number) => {
    // The crypto has been saved to the database in the CryptoSearch component
    // Now we just need to close the dialog and potentially refresh the page
    setShowCryptoSearch(false);
    handleClose();

    // Refresh the page to show the newly added cryptocurrency
    window.location.href = "/dashboard/assets";
  };

  const assetTypes = [
    {
      id: "stocks",
      name: "Stocks",
      icon: <Briefcase className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
    },
    {
      id: "crypto",
      name: "Crypto",
      icon: <Coins className="h-6 w-6" />,
      color: "bg-purple-100 text-purple-600 hover:bg-purple-200",
    },
    {
      id: "homes",
      name: "Homes",
      icon: <Home className="h-6 w-6" />,
      color: "bg-green-100 text-green-600 hover:bg-green-200",
    },
    {
      id: "cars",
      name: "Cars",
      icon: <Car className="h-6 w-6" />,
      color: "bg-yellow-100 text-yellow-600 hover:bg-yellow-200",
    },
    {
      id: "metals",
      name: "Metals",
      icon: <Database className="h-6 w-6" />,
      color: "bg-amber-100 text-amber-600 hover:bg-amber-200",
    },
    {
      id: "domains",
      name: "Domains",
      icon: <Globe className="h-6 w-6" />,
      color: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200",
    },
    {
      id: "cash",
      name: "Cash",
      icon: <DollarSign className="h-6 w-6" />,
      color: "bg-emerald-100 text-emerald-600 hover:bg-emerald-200",
    },
    {
      id: "manually",
      name: "Manually",
      icon: <Plus className="h-6 w-6" />,
      color: "bg-gray-100 text-gray-600 hover:bg-gray-200",
    },
  ];

  const stocksOptions = [
    {
      id: "link",
      name: "Securely Link Accounts",
      description: "Connect your investment accounts via SnapTrade",
      icon: <Lock className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
    },
    {
      id: "manual",
      name: "Enter Manually",
      description: "Add stocks by entering information manually",
      icon: <PenLine className="h-6 w-6" />,
      color: "bg-gray-100 text-gray-600 hover:bg-gray-200",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        {showAssetTypes && (
          <>
            <DialogHeader>
              <DialogTitle>Select Asset Type</DialogTitle>
              <DialogDescription>
                Choose the type of asset you want to add to your portfolio.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {assetTypes.map((type) => (
                <button
                  key={type.id}
                  className={`flex flex-col items-center justify-center p-6 rounded-lg border transition-colors ${type.color}`}
                  onClick={() => handleAssetTypeSelect(type.id)}
                >
                  <div className="mb-3">{type.icon}</div>
                  <span className="font-medium">{type.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {showStocksOptions && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Add Stocks</DialogTitle>
                  <DialogDescription>
                    Choose how you want to add your stocks
                  </DialogDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowStocksOptions(false);
                    setShowAssetTypes(true);
                  }}
                >
                  Back to Types
                </Button>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {stocksOptions.map((option) => (
                <button
                  key={option.id}
                  className={`flex items-center p-6 rounded-lg border transition-colors ${option.color}`}
                  onClick={() => handleStocksOptionSelect(option.id)}
                  disabled={isLinking && option.id === "link"}
                >
                  <div className="p-3 rounded-full bg-white mr-4">
                    {isLinking && option.id === "link" ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      option.icon
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-lg">{option.name}</div>
                    <div className="text-sm text-gray-600">
                      {isLinking && option.id === "link"
                        ? "Connecting to SnapTrade..."
                        : option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {showStockSearch && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Add New Stocks</DialogTitle>
                  <DialogDescription>
                    Search for stocks and add them to your portfolio.
                  </DialogDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowStockSearch(false);
                    setShowStocksOptions(true);
                  }}
                >
                  Back
                </Button>
              </div>
            </DialogHeader>

            <div className="mt-4">
              <StockSearch onStockSelect={handleStockSelect} />
            </div>
          </>
        )}

        {showCryptoSearch && (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Add New Crypto</DialogTitle>
                  <DialogDescription>
                    Search for cryptocurrencies and add them to your portfolio.
                  </DialogDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCryptoSearch(false);
                    setShowStocksOptions(true);
                  }}
                >
                  Back
                </Button>
              </div>
            </DialogHeader>

            <div className="mt-4">
              <CryptoSearch onCryptoSelect={handleCryptoSelect} />
            </div>
          </>
        )}

        {!showAssetTypes &&
          !showStocksOptions &&
          !showStockSearch &&
          !showCryptoSearch && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>
                      Add New{" "}
                      {selectedAssetType.charAt(0).toUpperCase() +
                        selectedAssetType.slice(1)}
                    </DialogTitle>
                    <DialogDescription>
                      Add details about your asset to track it in your
                      portfolio.
                    </DialogDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedAssetType === "stocks") {
                        setShowStocksOptions(true);
                      } else {
                        setShowAssetTypes(true);
                      }
                    }}
                  >
                    Back
                  </Button>
                </div>
              </DialogHeader>

              <Tabs
                defaultValue="cash"
                value={activeTab}
                onValueChange={setActiveTab}
                className="mt-4"
              >
                <TabsContent value="cash">
                  <AddAssetForm category="cash" onSuccess={handleClose} />
                </TabsContent>

                <TabsContent value="investments">
                  <AddAssetForm
                    category="investments"
                    onSuccess={handleClose}
                  />
                </TabsContent>

                <TabsContent value="real-estate">
                  <AddAssetForm
                    category="real-estate"
                    onSuccess={handleClose}
                  />
                </TabsContent>

                <TabsContent value="cryptocurrency">
                  <AddAssetForm
                    category="cryptocurrency"
                    onSuccess={handleClose}
                  />
                </TabsContent>

                <TabsContent value="debt">
                  <AddAssetForm
                    category="debt"
                    onSuccess={handleClose}
                    isLiability={true}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
      </DialogContent>
    </Dialog>
  );
}
