import marketsnapshotModel from "../../models/marketsnapshot/marketsnapshot.model.js";
import redisClient from "../../config/db/redis.js";

export const getMarketSnapshots = async (req, res) => {
  try {
    const cachedData = await redisClient.get("market_snapshots");

    if (cachedData) {
      return res.json({
        success: true,
        fromCache: true,
        data: JSON.parse(cachedData),
      });
    }

    const snapshots = await marketsnapshotModel.find().sort({ updatedAt: -1 });

    await redisClient.set("market_snapshots", JSON.stringify(snapshots), {
      EX: 60, // cache expires in 1 min
    });

    res.json({
      success: true,
      fromCache: false,
      data: snapshots,
    });

  } catch (error) {
    console.log("GET SNAPSHOT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
