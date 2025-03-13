// SnapTrade API utility functions

const SNAPTRADE_CLIENT_ID = "QEEL-LROOP";
const SNAPTRADE_API_KEY = "fun4Coi5ggIHw66UVwOjrTsLk9ounvNzgIgyT7fknBeap7V7Ot";
const SNAPTRADE_BASE_URL = "https://api.snaptrade.com/api/v1";

// For debugging - log the API credentials
console.log("SnapTrade configuration:", {
  clientId: SNAPTRADE_CLIENT_ID,
  baseUrl: SNAPTRADE_BASE_URL,
  // Don't log the full API key for security reasons
  apiKeyPrefix: SNAPTRADE_API_KEY.substring(0, 5) + "...",
});

interface StockData {
  symbol: string;
  name: string;
  quantity: number;
  pricePerShare: number;
  totalValue: number;
  gainLoss: number;
  changePercentage: number;
}

// Function to fetch user's holdings from SnapTrade
export async function fetchSnapTradeHoldings(
  userId: string,
): Promise<StockData[]> {
  try {
    const headers = {
      "Content-Type": "application/json",
      "SNAPTRADE-CLIENT-ID": SNAPTRADE_CLIENT_ID,
      "SNAPTRADE-API-KEY": SNAPTRADE_API_KEY,
    };

    // First, get user accounts
    const accountsResponse = await fetch(
      `${SNAPTRADE_BASE_URL}/accounts?userId=${userId}`,
      {
        method: "GET",
        headers,
      },
    );

    if (!accountsResponse.ok) {
      throw new Error(
        `Failed to fetch accounts: ${accountsResponse.statusText}`,
      );
    }

    const accounts = await accountsResponse.json();

    // For each account, get holdings
    const holdings: StockData[] = [];

    for (const account of accounts) {
      const holdingsResponse = await fetch(
        `${SNAPTRADE_BASE_URL}/accounts/${account.id}/holdings`,
        {
          method: "GET",
          headers,
        },
      );

      if (!holdingsResponse.ok) {
        console.error(
          `Failed to fetch holdings for account ${account.id}: ${holdingsResponse.statusText}`,
        );
        continue;
      }

      const accountHoldings = await holdingsResponse.json();

      // Transform the data into our StockData format
      for (const holding of accountHoldings) {
        holdings.push({
          symbol: holding.symbol,
          name: holding.description || holding.symbol,
          quantity: holding.quantity,
          pricePerShare: holding.price,
          totalValue: holding.market_value,
          gainLoss: holding.gain_amount || 0,
          changePercentage: holding.gain_percentage || 0,
        });
      }
    }

    return holdings;
  } catch (error) {
    console.error("Error fetching SnapTrade holdings:", error);
    throw error;
  }
}

// Function to link a SnapTrade account
export async function createSnapTradeUserLink(
  userId: string,
  redirectUri: string,
): Promise<string> {
  try {
    const headers = {
      "Content-Type": "application/json",
      "SNAPTRADE-CLIENT-ID": SNAPTRADE_CLIENT_ID,
      "SNAPTRADE-API-KEY": SNAPTRADE_API_KEY,
    };

    console.log("Creating SnapTrade user link with:", {
      userId,
      redirectUri,
      baseUrl: SNAPTRADE_BASE_URL,
    });

    // Create or get a SnapTrade user
    const userResponse = await fetch(
      `${SNAPTRADE_BASE_URL}/snapTrade/registerUser`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId,
          userSecret: `secret-${userId}`,
        }),
      },
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("Register user response:", errorText);
      throw new Error(
        `Failed to register user: ${userResponse.status} ${userResponse.statusText}`,
      );
    }

    const userData = await userResponse.json();
    console.log("User registered successfully:", userData);

    // Generate a redirect URI for account connection
    const redirectResponse = await fetch(
      `${SNAPTRADE_BASE_URL}/snapTrade/login`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId,
          userSecret: `secret-${userId}`,
          broker: "ALPACA", // You can change this to another supported broker if needed
          immediateRedirect: false,
          redirectUri: `${redirectUri}/api/snaptrade/callback`,
        }),
      },
    );

    if (!redirectResponse.ok) {
      const errorText = await redirectResponse.text();
      console.error("Login redirect response:", errorText);
      throw new Error(
        `Failed to generate redirect URI: ${redirectResponse.status} ${redirectResponse.statusText}`,
      );
    }

    const redirectData = await redirectResponse.json();
    console.log("Redirect data:", redirectData);

    if (!redirectData.redirectUri) {
      throw new Error("No redirect URI returned from SnapTrade");
    }

    return redirectData.redirectUri;
  } catch (error) {
    console.error("Error creating SnapTrade link:", error);
    throw error;
  }
}
