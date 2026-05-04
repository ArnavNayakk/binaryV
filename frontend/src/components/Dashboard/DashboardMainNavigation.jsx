import React from "react";
import DashboardSidebar from "./DashboardSidebar";
import { Outlet } from "react-router-dom";

const DashboardMainNavigation = () => {
  return (
    <>
      <div className="flex h-screen bg-dark">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default DashboardMainNavigation;
