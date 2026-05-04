import express from "express";
import authrouter from "../routers/auth.router.js";
import aboutRouter from "./Frontend/about.router.js";
import blogRouter from "./blog/blog.router.js";
import tutorialRouter from "./Frontend/tutorial.router.js";
import employeauthRouter from "./employe/auth.router.js";
import roleRouter from "./employe/role.router.js";
import communityRouter from "./community/community.router.js";
import postRouter from "./community/post.router.js";
import messageRouter from "./community/message.router.js";
import TransactionRouter from "./payment.js";
import tradeRouter from "./trade.js";
// import TransactionRouter from "../routers/payment.js";

const router = express.Router();

// Mount routers
router.use("/auth", authrouter);

//community
router.use('/community',communityRouter);
router.use('/post',postRouter);
router.use('/message',messageRouter)

// Frontend
router.use('/about',aboutRouter);
router.use('/blog',blogRouter);
router.use('/tutorial',tutorialRouter)

//employe
router.use('/employe-auth',employeauthRouter);
router.use('/role',roleRouter);

//payment
router.use('/payment', TransactionRouter);

// trades (portfolio/trade)
router.use("/trades", tradeRouter);


export default router;
