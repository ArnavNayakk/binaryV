import React, { useState } from "react";
import Home from "./pages/Home";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import PageNotFound from "./pages/PageNotFound";
import MainNavigation from "./components/MainNavigation";
import DashboardMainNavigation from "./components/Dashboard/DashboardMainNavigation";
import { Toaster } from "react-hot-toast";
import Market from "./pages/Market";
import Trade from "./pages/Trade";
import Blog from "./pages/Blog";
import AllArticle from "./components/Blogs/AllArticle";
import ArticlePage from "./components/Blogs/ArticlePage";
import Resources from "./pages/Resources";
import FaqSection from "./components/Home/FaqSection";
import Guides from "./components/Resources/Guides";
import Insights from "./components/Resources/Insights";
import Videos from "./components/Resources/Videos";
import Deposit from "./pages/Transaction/Deposit";
import CryptoDeposit from "./pages/Transaction/CryptoDeposit";
import Withdrawal from "./pages/Transaction/Withdrawal";
import CryptoWithdrawal from "./pages/Transaction/CryptoWithdrawal";
import Ebooks from "./components/Resources/Ebooks";
import Community from "./components/Resources/Community";
import DiscussionPage from "./components/Resources/DiscussionPage";
import DownloadApp from "./pages/DownloadApp";
import ScrollToTop from "./components/Common/ScrollToTop";
import AboutUs from "./pages/AboutUs";
import TransactionHistory from "./pages/Transaction/TransactionHistory";
import Tournaments from "./pages/Transaction/Tournaments";
import Support from "./components/Dashboard/Support";
import PrivateRoute from "./components/PrivateRoute";
import Stairs from "./components/Common/Stair";
import PublicRoute from "./components/PublicRoute";
import ReferralPage from "./components/Dashboard/Referral/ReferralPage";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Settings from "./components/Dashboard/Settings";
import DemoAccount from "./pages/DemoAccount";
import TermsOfServices from "./pages/Footer/TermsOfServices";
import PrivacyPolicy from "./pages/Footer/PrivacyPolicy";
import CookieSettings from "./pages/Footer/CookieSettings";
import CommunityNavigation from "./navigation/CommunityNavigation";
import VideoPlayer from "./components/Resources/VideoPlayer";
import { getWithExpiry } from "./helper/storageWithExpiry";
import CommunitiesPage from "./pages/Resources/community/CommunitiesPage";
import CommunityChat from "./pages/Resources/community/CommunityChat";
import BeginnerForum from "./pages/forum/BeginnerForum";
import Analytics from "./pages/Transaction/Analytics";

const App = () => {
  const tutorials = getWithExpiry("tutorials");
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "14px",
            background: "rgba(17, 24, 39, 0.96)",
            color: "#f9fafb",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            boxShadow: "0 14px 40px rgba(15, 23, 42, 0.35)",
            borderRadius: "14px",
          },
          success: {
            iconTheme: {
              primary: "#22c55e",
              secondary: "#ecfdf5",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fef2f2",
            },
          },
        }}
      />
      {/* Scroll To Top on every routes change */}
      <ScrollToTop />
      <Routes>
        <Route
          path="/demo-account"
          element={
            <Stairs>
              <DemoAccount />
            </Stairs>
          }
        />
        {/* Public routes (only visible when logged out) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route
          path="/"
          element={
            <Stairs>
              {" "}
              <MainNavigation />{" "}
            </Stairs>
          }
        >
          <Route index element={<Home />} />
          <Route path="about-us" element={<AboutUs />} />

          {/* Resources Routes */}
          <Route path="resources" element={<Resources />} />
          <Route path="resources/guides" element={<Guides />} />
          <Route path="resources/faqs" element={<FaqSection />} />
          <Route path="resources/insights" element={<Insights />} />
          <Route path="resources/videos" element={<Videos />} />
          <Route path="resources/videos/:id" element={<VideoPlayer />} />

          <Route path="resources/ebooks" element={<Ebooks />} />

          <Route path="download" element={<DownloadApp />} />

          <Route path="terms-of-services" element={<TermsOfServices />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="cookie-setting" element={<CookieSettings />} />

          {/* Blogs Routes */}
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:id" element={<ArticlePage />} />
          <Route path="blog/all" element={<AllArticle />} />

          <Route path="download" element={<DownloadApp />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/resources/community" element={<CommunityNavigation />}>
            <Route index element={<CommunitiesPage />} />
            <Route path="resources/ebooks" element={<Ebooks />} />

            {/* Forum routes */}
            <Route path="forum/beginners" element={<BeginnerForum />} />
            <Route path=":communityId" element={<CommunityChat />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>

          <Route path="/dashboard" element={<DashboardMainNavigation />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Dashboard />} />
            <Route path="markets" element={<Market />} />
            <Route path="trade" element={<Trade />} />
            <Route path="support" element={<Support />} />
            <Route path="referral" element={<ReferralPage />} />
            <Route path="settings" element={<Settings />} />

            {/* Portfolio routes */}
            <Route path="portfolio/deposit" element={<Deposit />} />
            <Route path="portfolio/withdrawal" element={<Withdrawal />} />
            <Route
              path="transactions"
              element={<Navigate to="/dashboard/portfolio/transactions" replace />}
            />
            <Route
              path="portfolio/transactions"
              element={<TransactionHistory />}
            />
            <Route path="portfolio/trades" element={<Trade />} />
            <Route path="portfolio/tournaments" element={<Tournaments />} />
            <Route path="portfolio/market" element={<Market />} />
            <Route path="portfolio/analytics" element={<Analytics />} />
            <Route path="portfolio/account" element={<Dashboard />} />
            <Route path="portfolio/deposit/:crypto" element={<CryptoDeposit />} />
            <Route path="portfolio/withdrawal/:crypto" element={<CryptoWithdrawal />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <Stairs>
              <PageNotFound />
            </Stairs>
          }
        />
      </Routes>
    </>
  );
};

export default App;
