// engine/payoutEngine.js
// Simple payout calculation using trade.payoutPercentage
// Exports:
//   calculatePayout(investment, payoutPercentage) -> { payoutAmount, netProfit }
// payoutAmount includes original investment when winning/draw, netProfit = payoutAmount - investment (could be negative on loss)

import Big from "big.js";

function calculatePayout(investment, payoutPercentage, result) {
  // console.log("This Payout engineeeeeeeeee-----------")
  // investment: Number or string, payoutPercentage: Number (0-100), result: "WIN"|"LOSS"|"DRAW"
  const inv = Big(investment);
  const pct = Big(payoutPercentage).div(100);

  if (result === "WIN") {
    // payout includes original stake
    const profitPart = inv.times(pct);
    const payoutAmount = inv.plus(profitPart);
    const netProfit = payoutAmount.minus(inv); // equals profitPart
    return { payoutAmount: Number(payoutAmount.toFixed(8)), netProfit: Number(netProfit.toFixed(8)) };
  }

  if (result === "DRAW") {
    // return stake
    return { payoutAmount: Number(inv.toFixed(8)), netProfit: 0 };
  }

  // LOSS
  return { payoutAmount: 0, netProfit: Number(inv.times(-1).toFixed(8)) }; // netProfit negative to show loss
}

export default { calculatePayout };
