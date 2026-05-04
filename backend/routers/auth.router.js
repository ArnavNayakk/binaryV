import express from "express";

// Middlewares
import authUser from "../middleware/auth.js";
// import adminAuth from "../middleware/admin.auth.js";

// Guidde
import { createGuide, addFAQ, updateFAQ, getGuideById, getAllGuides, deleteGuide, updateGuide, deleteFAQ } from "../controllers/guide/guide.controller.js";


// User Auth Controllers
import { userRegister, userSignIn } from "../controllers/auth/auth/userauth.controller.js";
import { forgotPassword, resetPassword } from "../controllers/auth/auth/password.controller.js";
import { userSignOut } from "../controllers/auth/auth/logout.controller.js";

// Refresh auth controller
import {refreshAccessToken}from "../controllers/auth/auth/refreshtoken.controller.js"

// User Controllers
import { deactivateAccount } from "../controllers/user/deactivateaccount.controller.js";
import { changeUserPassword, updateUserProfile, getUserProfile } from "../controllers/user/userprofile.controller.js";

// Contact Controller
import { submitContactForm } from "../controllers/contact/contact.controller.js";

// OTP Verification
import { verifyEmail } from "../controllers/auth/auth/otpVerification.js";
import { resendOtp } from "../controllers/auth/auth/resendotp.controller.js";

// // Admin Controllers
// import { registerAdmin, loginAdmin, logoutAdmin } from "../controllers/auth/admin/admin.controller.js";
// import {addVideo, getAllVideos} from "../controllers/auth/admin/adminvideo_update.Controller.js"

// Admin Video Controllers
import { uploadSingleImage } from "../middleware/multer/multer.js"

// E-book controller
import { downloadBook } from "../controllers/e-book/dowebook.controller.js";
import { addBook } from "../controllers/e-book/addebook.controller.js";
import { uploadSinglePDF } from "../middleware/multer/multer.js";

// marketplace controller
import { getMarketSnapshots } from "../controllers/marketsnapshot/marketsnapshot.controller.js";

const router = express.Router();

// -------------------- AUTH --------------------
router.post("/register", userRegister);
router.post("/verifyemail", verifyEmail);
router.post("/signin", userSignIn);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/signOut",authUser, userSignOut)

// refreshaccesstoken

router.get("/refreshaccessToken", refreshAccessToken);

// -------------------- USER --------------------
router.put("/deactivateaccount", authUser, deactivateAccount);
router.get("/profile", authUser, getUserProfile);
router.put("/update", authUser, uploadSingleImage, updateUserProfile);
router.put("/change-password", authUser, changeUserPassword);


// -------------------- CONTACT US --------------------
router.post("/contact", submitContactForm);

// // -------------------- ADMIN AUTH --------------------
// router.post("/adminregister", registerAdmin);
// router.post("/adminlogin", loginAdmin);
// router.post("/adminlogOut", authUser, adminAuth, logoutAdmin);

// -------------------- ADMIN - VIDEOS --------------------
// router.post("/videos", addVideo);
// router.get("/getvideos", getAllVideos);

// -------------------- E-book  --------------------
router.get("/download/:slug", downloadBook);
router.post("/add-book", uploadSinglePDF("file"), addBook);


// ----------------------Guide --------------------------

router.post("/guide", createGuide);
router.get("/guide", getAllGuides);
router.get("/guide-by-id", getGuideById);
router.put("/guide", updateGuide);
router.delete("/guide", deleteGuide);
router.post("/guide/faq", addFAQ);
router.put("/guide/faq", updateFAQ);
router.delete("/guide/faq", deleteFAQ);


// real time fecth data route for the marketplace section

router.get("/market-snapshot", getMarketSnapshots);


// Export router
export default router;
