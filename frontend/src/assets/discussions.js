const discussions = [
  {
    id: 1,
    title: "Best Forex strategies in 2025?",
    author: "JohnTrader",
    date: "Sep 20, 2025",
    category: "Forex",
    description:
      "In 2025, Forex strategies are becoming more advanced with the integration of AI tools, automated bots, and real-time sentiment analysis. Many traders still rely on classic strategies such as scalping, day trading, and swing trading, but these are now enhanced by machine learning algorithms that help identify better entry and exit points. Scalping is effective in volatile markets, while swing trading remains ideal for those who prefer holding positions for several days. Risk management is critical, as leverage can amplify both profits and losses. Keeping trades limited to a small percentage of account equity is a key survival tactic.",
    comments: [
      {
        id: 1,
        author: "FXNewbie",
        date: "Sep 21, 2025",
        text: "I’m experimenting with scalping strategies this year, focusing on short trades.",
      },
      {
        id: 2,
        author: "ProTrader",
        date: "Sep 22, 2025",
        text: "Swing trading still works best for me in Forex, especially on the EUR/USD pair.",
      },
    ],
  },
  {
    id: 2,
    title: "Thoughts on Bitcoin next bull run?",
    author: "CryptoQueen",
    date: "Sep 22, 2025",
    category: "Crypto",
    description:
      "Bitcoin’s next bull run is one of the most debated topics among crypto enthusiasts. Many believe the upcoming halving will once again act as a catalyst, reducing supply and creating scarcity. Institutional involvement through Bitcoin ETFs and increased corporate adoption could further push demand. However, unlike the 2021 bull run, regulatory frameworks are now tighter, and governments are monitoring crypto activity closely. Volatility is expected to remain high, with short-term corrections being normal in an upward trend. Long-term holders continue to accumulate, expecting new all-time highs, while skeptics argue the growth will be more gradual compared to earlier cycles.",
    comments: [
      {
        id: 1,
        author: "HODLer",
        date: "Sep 23, 2025",
        text: "I believe Bitcoin will rally after the next halving event.",
      },
      {
        id: 2,
        author: "Skeptic",
        date: "Sep 23, 2025",
        text: "It may pump, but I doubt we’ll see the same exponential growth as 2021.",
      },
    ],
  },
  {
    id: 3,
    title: "How to manage trading risk effectively?",
    author: "SafeInvestor",
    date: "Sep 24, 2025",
    category: "General",
    description:
      "Effective risk management remains the backbone of sustainable trading in 2025. Traders must approach the market with a clear plan that outlines maximum risk per trade, usually between 1–2% of total account equity. Stop-loss orders are essential to prevent large losses, while proper position sizing ensures traders do not overexpose themselves. Diversification across multiple asset classes, such as Forex, crypto, and equities, helps spread risk. Emotional control is equally important—traders should avoid revenge trading and overleveraging after losses. Consistency in applying risk management strategies is what separates successful long-term traders from those who frequently blow up their accounts.",
    comments: [
      {
        id: 1,
        author: "RiskAware",
        date: "Sep 24, 2025",
        text: "I always use stop-loss orders and keep risk under 2% per trade.",
      },
      {
        id: 2,
        author: "TraderX",
        date: "Sep 25, 2025",
        text: "Diversifying across multiple assets is key for me.",
      },
    ],
  },
  {
    id: 4,
    title: "Is Tesla stock still worth buying?",
    author: "StockGuru",
    date: "Sep 25, 2025",
    category: "Stocks",
    description:
      "Tesla continues to be one of the most polarizing stocks in 2025. Supporters argue that Tesla remains a market leader in electric vehicles and clean energy, benefiting from growing global demand for sustainable transportation. The company’s innovations in battery technology, AI-driven autonomous driving, and expansion into new markets keep investors optimistic. However, critics point out Tesla’s high valuation compared to traditional automakers and the increasing competition from companies like BYD, Rivian, and legacy brands. For long-term investors, Tesla may still offer growth potential, but short-term traders need to be cautious due to volatility and sharp corrections in its stock price.",
    comments: [
      {
        id: 1,
        author: "InvestorJoe",
        date: "Sep 25, 2025",
        text: "Tesla has potential but the valuation is still very high.",
      },
      {
        id: 2,
        author: "TechLover",
        date: "Sep 26, 2025",
        text: "EV growth is strong, so Tesla could still be a long-term play.",
      },
    ],
  },
  {
    id: 5,
    title: "Best options trading platforms?",
    author: "OptionMaster",
    date: "Sep 19, 2025",
    category: "Options",
    description:
      "Options trading platforms in 2025 are highly competitive, offering traders a wide variety of features such as advanced charting, low commission fees, and seamless order execution. Popular platforms like Interactive Brokers, Thinkorswim, and tastytrade continue to dominate the market by catering to both beginners and professionals. The choice often depends on individual preferences—some traders prioritize low costs, while others value educational resources and community support. With increased volatility in global markets, reliable platforms that can handle fast execution and provide detailed analytics are more important than ever. Security and regulation are also key factors when choosing a trading platform.",
    comments: [
      {
        id: 1,
        author: "TraderSam",
        date: "Sep 19, 2025",
        text: "I prefer Interactive Brokers for low fees and advanced tools.",
      },
      {
        id: 2,
        author: "OptionGeek",
        date: "Sep 20, 2025",
        text: "Thinkorswim is my go-to for options trading strategies.",
      },
    ],
  },
  {
    id: 6,
    title: "Ethereum vs Solana – which has more potential?",
    author: "BlockChainPro",
    date: "Sep 21, 2025",
    category: "Crypto",
    description:
      "Ethereum and Solana continue to be leading smart contract platforms in 2025, each with its own strengths and weaknesses. Ethereum has the advantage of a massive ecosystem, strong developer community, and dominance in DeFi and NFTs. Its transition to proof-of-stake has improved scalability, but gas fees can still be high during peak activity. Solana, on the other hand, is known for its speed and low transaction costs, attracting new projects and users. However, its history of network outages raises concerns about long-term stability. Ultimately, Ethereum offers reliability, while Solana provides speed, and many investors hold both to balance risks.",
    comments: [
      {
        id: 1,
        author: "ETHMaxi",
        date: "Sep 22, 2025",
        text: "Ethereum is still the leader because of its ecosystem.",
      },
      {
        id: 2,
        author: "SOLFan",
        date: "Sep 22, 2025",
        text: "Solana is faster and cheaper, I think it has huge potential.",
      },
    ],
  },
  {
    id: 7,
    title: "How to calculate leverage in Forex?",
    author: "FXNewbie",
    date: "Sep 23, 2025",
    category: "Forex",
    description:
      "Leverage in Forex trading allows traders to control a larger position size with a smaller amount of capital. The formula is simple: Leverage = Total Position Size ÷ Account Equity. For example, if a trader controls $100,000 worth of currency with $10,000 in their account, they are using 1:10 leverage. While leverage can magnify profits, it equally increases the risk of significant losses. Many experienced traders recommend using lower leverage ratios such as 1:5 or 1:10 to reduce exposure. Regulatory bodies have also placed restrictions on maximum leverage levels in many regions to protect traders from excessive risk.",
    comments: [
      {
        id: 1,
        author: "MathTrader",
        date: "Sep 23, 2025",
        text: "Leverage = Total Position Size ÷ Account Equity. Keep it low to reduce risk.",
      },
      {
        id: 2,
        author: "SafeInvestor",
        date: "Sep 24, 2025",
        text: "Never go above 1:10 leverage if you want to trade safely.",
      },
    ],
  },
  {
    id: 8,
    title: "Future trading strategies for beginners?",
    author: "TraderX",
    date: "Sep 20, 2025",
    category: "Futures",
    description:
      "For beginners, futures trading in 2025 can seem intimidating, but with the right strategies, it becomes manageable. The first step is understanding margin requirements, contract specifications, and the risks of leverage. Many new traders start with simple trend-following strategies, using indicators like moving averages to identify market direction. Practicing on demo accounts before risking real money is highly recommended. Risk control is vital—placing stop-losses and managing position size can help prevent large losses. Beginners should also focus on one or two markets rather than trying to trade everything. Over time, experience and discipline help traders refine strategies for consistent results.",
    comments: [
      {
        id: 1,
        author: "FuturePro",
        date: "Sep 21, 2025",
        text: "Focus on learning about margin requirements first.",
      },
      {
        id: 2,
        author: "DayTrader",
        date: "Sep 22, 2025",
        text: "Practice on demo accounts before putting real money in.",
      },
    ],
  },
  {
    id: 9,
    title: "What is the safest way to diversify portfolio?",
    author: "SmartInvestor",
    date: "Sep 18, 2025",
    category: "General",
    description:
      "Diversification remains a cornerstone of portfolio management in 2025. The safest approach is to spread investments across multiple asset classes such as stocks, bonds, real estate, commodities, and cryptocurrencies. Within each class, diversification can be further achieved by holding a mix of sectors and geographic regions. For example, investors may hold U.S. equities, European equities, and emerging markets to reduce regional risks. ETFs are a popular tool since they provide instant diversification with a single purchase. Many experts also recommend holding some safe-haven assets like gold or stable bonds. A well-diversified portfolio balances growth opportunities with downside protection.",
    comments: [
      {
        id: 1,
        author: "ETFInvestor",
        date: "Sep 18, 2025",
        text: "I prefer ETFs because they spread risk automatically.",
      },
      {
        id: 2,
        author: "GoldSaver",
        date: "Sep 19, 2025",
        text: "Always keep some allocation in gold for safety.",
      },
    ],
  },
];

export default discussions;
