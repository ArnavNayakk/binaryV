import axios from "axios";

export const fetchRealTimeData = async (symbol = "AAPL") => {
  try {
    const token = process.env.REACT_APP_FINNHUB_API_KEY;

    if (!token) {
      console.error("Finnhub API key is missing. Check your .env file.");
      return null;
    }

    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${token}`
    );

    const data = response.data;

    return {
      symbol,
      assetName: symbol === "AAPL" ? "Apple Inc." : symbol,
      price: data.c,
      changePercent: data.dp,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      sentiment: data.dp > 0 ? "bullish" : data.dp < 0 ? "bearish" : "neutral",
      extraData: data
    };

  } catch (error) {
    console.error("API Fetch Error:", error.message);
    return null;
  }
};
