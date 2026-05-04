import React from "react";
import { Outlet } from "react-router-dom";
import CommunitySidebar from "../components/Community/CommunitySidebar";
import Navbar from "../components/Home/NavBar";
import Topbar from "../components/Community/Topbar";
import RightSidebar from "../components/Community/RightSidebar";

const CommunityNavigation = () => {
  return (
    <div className="min-h-screen bg-dark text-white pt-16">
      <Navbar />

      <Topbar />
      <div className="flex h-screen bg-dark">
        <CommunitySidebar />

        {/* Main content area */}
        <main className="flex-2 w-full h-full overflow-y-auto bg-dark px-6">
          <Outlet />
        </main>
        <aside className="hidden lg:flex">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
};

export default CommunityNavigation;
