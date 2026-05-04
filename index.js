
```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Simulated cryptocurrency data
const cryptoData = {
  BTC: { current: 45230, name: "Bitcoin" },
  ETH: { current: 2850, name: "Ethereum" },
  ADA: { current: 0.98, name: "Cardano" },
  XRP: { current: 2.45, name: "Ripple" },
};

// User-defined price alerts
const userAlerts = [
  { symbol: "BTC", type: "above", price: 45000 },
  { symbol: "ETH", type: "below", price: 3000 },
  { symbol: "ADA", type: "above", price: 1.0 },
];

// Tool definitions for Claude
const tools = [
  {
    name: "get_current_prices",
    description: "Get current cryptocurrency prices",
    input_schema: {
      type: "object",
      properties: {
        symbols: {
          type: "array",
          items: { type: "string" },
          description: "List of cryptocurrency symbols (BTC, ETH, ADA, XRP)",
        },
      },
      required: ["symbols"],
    },
  },
  {
    name: "check_alerts",
    description: "Check if any price alerts have been triggered",
    input_schema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Cryptocurrency symbol to check alerts for",
        },
      },
      required: ["symbol"],
    },
  },
  {
    name: "set_price_alert",
    description: "Set a new price alert for a cryptocurrency",
    input_schema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Cryptocurrency symbol",
        },
        alert_type: {
          type: "string",
          enum: ["above", "below"],
          description: "Alert when price goes above or below target",
        },
        target_price: {
          type: "number",
          description: "Target price for the alert",
        },
      },
      required: ["symbol", "alert_type", "target_price"],
    },
  },
  {
    name: "get_price_history",
    description: "Get historical price data for analysis",
    input_schema: {
      type: "object",
      properties: {
        symbol: {
          type: "string",
          description: "Cryptocurrency symbol",
        },
        days: {
          type: "number",
          description: "Number of days of history to retrieve",
        },
      },
      required: ["symbol", "days"],
    },
  },
];

// Tool implementation functions
function getCurrentPrices(symbols) {
  const prices = {};
  for (const symbol of symbols) {
    if (cryptoData[symbol]) {
      prices[symbol] = {
        name: cryptoData[symbol].name,
        price: cryptoData[symbol].current,
        currency: "USD",
      };
    }
  }
  return prices;
}

function checkAlerts(symbol) {
  const alerts = userAlerts.filter((alert) => alert.symbol === symbol);
  const triggered = [];

  for (const alert of alerts) {
    const current = cryptoData[symbol].current;
    let isTriggered = false;

    if (alert.type === "above" && current >= alert.price) {
      isTriggered = true;
    } else if (alert.type === "below" && current <= alert.price) {
      isTriggered = true;
    }

    if (isTriggered) {
      triggered.push({
        symbol: symbol,
        alertType: alert.type,
        targetPrice: alert.price,
        currentPrice: current,
        triggered: true,
      });
    }
  }

  return {
    symbol: symbol,
    hasAlerts: alerts.length > 0,
    triggeredCount: triggered.length,
    triggeredAlerts: triggered,
  };
}

function setPriceAlert(symbol, alertType, targetPrice) {
  if (!cryptoData[symbol]) {
    return { success: false, message: `Unknown symbol: ${symbol}` };
  }

  userAlerts.push({
    symbol: symbol,
    type: alertType,
    price: targetPrice,
  });

  return {
    success: true,
    message: `Alert set for ${symbol}: ${alertType} $${targetPrice}`,
    alert: { symbol, type: alertType, price: targetPrice },
  };
}

function getPriceHistory(symbol, days) {
  if (!cryptoData[symbol]) {
    return { success: false, message: `Unknown symbol: ${symbol}` };
  }

  // Simulate historical data
  const history = [];
  const basePrice = cryptoData[symbol].current;
  const variance = basePrice * 0.1; // 10% variance

  for (let i = days - 1; i >= 0; i--) {
    const randomVariance = (Math.random() - 0.5) * variance;
    history.push({
      day: i,
      price: parseFloat((basePrice - randomVariance).toFixed(2)),
    });
  }

  return {
    symbol: symbol,
    daysRequested: days,
    history: history,
  };
}

// Process tool calls from Claude
function processToolCall(toolName, toolInput) {
  switch (toolName) {
    case "get_current_prices":
      return getCurrentPrices(toolInput.symbols);
    case "check_alerts":
      return checkAlerts(toolInput.symbol);
    case "set_price_alert":
      return setPriceAlert(
        toolInput.symbol,
        toolInput.alert_type,
        toolInput.target_price
      );
    case "get_price_history":
      return getPriceHistory(toolInput.symbol, tool