import express from "express"
import { getUserTrades, placeTrade } from "../controllers/trading/tradingController.js";
import authUser from "../middleware/auth.js";
import tradeGuard from "../middleware/tradeGuard.js";
import tradeIdempotency from "../middleware/tradeIdempotency.js";
// import authUser from "../middleware/auth.js";
// import { startTrade } from "../controllers/trading/tradingController.js";

const TradeRouter = express.Router();

// TradeRouter.post("/trade", startTrade);
TradeRouter.post("/trade", authUser, tradeIdempotency, tradeGuard, placeTrade);
TradeRouter.get("/tradeHistory", authUser, getUserTrades);

export default TradeRouter;
