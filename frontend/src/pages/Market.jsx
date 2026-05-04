import React, { useEffect, useState } from "react";
import LiveChart from "../components/Market/LiveChart";
import SymbolSelector from "../components/Market/SymbolSelector";
import IntervalSelector from "../components/Market/IntervalSelector";
import TradingSideBar from "../components/Market/TradingSideBar";
import DemoBalanceBox from "../components/Market/DemoBalanceBox";

const Market = () => {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1m");
  const [refreshKey, setRefreshKey] = useState(0);
  const [symbolPayoutData, setSymbolPayoutData] = useState({});
  const [showAreaOverlay, setShowAreaOverlay] = useState(false);
  const [tradeHoverState, setTradeHoverState] = useState(null);
  
  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ✅ NEW: Orientation and device detection
  const [orientation, setOrientation] = useState('portrait');
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isTabletDevice, setIsTabletDevice] = useState(false);

  // ✅ NEW: Orientation detection hook
  useEffect(() => {
    const detectDeviceAndOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window;
      
      // Device detection
      setIsMobileDevice(width < 768 || (isTouchDevice && width < 1024));
      setIsTabletDevice(width >= 768 && width < 1200 && isTouchDevice);
      
      // Orientation detection using matchMedia (most reliable)
      if (window.matchMedia("(orientation: portrait)").matches) {
        setOrientation('portrait');
      } else if (window.matchMedia("(orientation: landscape)").matches) {
        setOrientation('landscape');
      }
    };

    // Initial detection
    detectDeviceAndOrientation();

    // Listen for orientation changes
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const handleOrientationChange = (e) => {
      setOrientation(e.matches ? 'portrait' : 'landscape');
      
      // Force refresh key update to help chart re-render properly
      setRefreshKey(prev => prev + 1);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleOrientationChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleOrientationChange);
    }

    // Also listen for resize (backup)
    window.addEventListener('resize', detectDeviceAndOrientation);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleOrientationChange);
      } else {
        mediaQuery.removeListener(handleOrientationChange);
      }
      window.removeEventListener('resize', detectDeviceAndOrientation);
    };
  }, []);

  const handleTradeHover = (direction) => {
    setTradeHoverState(direction);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setRefreshKey((prev) => prev + 1);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // ✅ NEW: Dynamic classes based on device and orientation
  const getContainerClasses = () => {
    const baseClasses = "h-screen bg-gray-900 text-white overflow-hidden";
    
    if (isMobileDevice && orientation === 'landscape') {
      // Mobile landscape: Horizontal layout like desktop
      return `${baseClasses} flex flex-row`;
    } else if (isTabletDevice && orientation === 'landscape') {
      // Tablet landscape: Similar to desktop but more compact
      return `${baseClasses} flex flex-row`;
    }
    
    // Portrait or desktop: Original layout
    return `${baseClasses} flex flex-col lg:flex lg:flex-row`;
  };

  const getChartAreaClasses = () => {
    if (isMobileDevice && orientation === 'landscape') {
      // Mobile landscape: Act like desktop
      return "flex-1 flex flex-col min-w-0 min-h-0";
    } else if (isTabletDevice && orientation === 'landscape') {
      // Tablet landscape: Similar to desktop
      return "flex-1 flex flex-col min-w-0 min-h-0";
    }
    
    // Portrait or desktop: Original classes
    return `flex-1 flex flex-col min-w-0 min-h-0 pb-16 lg:pb-0 lg:flex-1 lg:flex lg:flex-col lg:min-w-0 lg:min-h-0`;
  };

  // ✅ NEW: Get sidebar props based on orientation
  const getSidebarProps = () => {
    if (isMobileDevice && orientation === 'landscape') {
      // Mobile landscape: Show sidebar like desktop, but compact
      return {
        isMobileOpen: false,
        onMobileClose: () => {},
        isLandscapeMode: true,
        isCompact: true
      };
    } else if (isTabletDevice && orientation === 'landscape') {
      // Tablet landscape: Similar to desktop
      return {
        isMobileOpen: false,
        onMobileClose: () => {},
        isLandscapeMode: true,
        isCompact: false
      };
    }
    
    // Portrait or desktop: Original behavior
    return {
      isMobileOpen: isMobileSidebarOpen,
      onMobileClose: () => setIsMobileSidebarOpen(false),
      isLandscapeMode: false,
      isCompact: false
    };
  };

  const sidebarProps = getSidebarProps();

  return (
    <div
      key={refreshKey}
      className={getContainerClasses()}
    >
      {/* Mobile Toggle Button - Hide in mobile landscape */}
      {!(isMobileDevice && orientation === 'landscape') && (
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="fixed bottom-4 right-4 z-30 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg lg:hidden"
        >
          📊
        </button>
      )}

      {/* Chart Area - Mobile First */}
      <div className={getChartAreaClasses()}>
        <div
          className="flex-1 relative min-h-0 min-w-0"
          style={{
            display: 'flex',
            flexDirection: 'column',
            // ✅ NEW: Reduce height in landscape for small devices
            height: (isMobileDevice && orientation === 'landscape') 
              ? 'calc(100vh - 60px)' // Leave space for controls
              : (isTabletDevice && orientation === 'landscape')
                ? 'calc(100vh - 80px)'
                : undefined
          }}
        >
          <div className="flex-1 relative min-h-0 min-w-0">
            <DemoBalanceBox />
            <LiveChart 
              symbol={symbol} 
              interval={interval}
              showAreaOverlay={showAreaOverlay}
              tradeHoverState={tradeHoverState}
              orientation={orientation}
              deviceType={isMobileDevice ? 'mobile' : isTabletDevice ? 'tablet' : 'desktop'}
            />
          </div>

          {/* Symbol Selector - Responsive positioning */}
          <SymbolSelector 
            onChange={setSymbol} 
            interval={interval}
            onPayoutDataUpdate={setSymbolPayoutData}
            orientation={orientation}
            deviceType={isMobileDevice ? 'mobile' : isTabletDevice ? 'tablet' : 'desktop'}
          />

          {/* Interval Selector - Responsive positioning */}
          <IntervalSelector 
            interval={interval} 
            onChange={setInterval}
            orientation={orientation}
            deviceType={isMobileDevice ? 'mobile' : isTabletDevice ? 'tablet' : 'desktop'}
          />
          
          {/* Area Overlay Toggle Button - Responsive positioning */}
          <div className={`
            absolute z-20
            ${(isMobileDevice && orientation === 'landscape') 
              ? 'bottom-2 left-3' // More compact in mobile landscape
              : (isTabletDevice && orientation === 'landscape')
                ? 'bottom-4 left-12'
                : 'bottom-16 left-3 lg:bottom-6 lg:left-16' // Original positioning
            }
          `}>
            <button
              onClick={() => setShowAreaOverlay(!showAreaOverlay)}
              className={`w-10 h-10 rounded-md flex items-center justify-center bottom-35 text-white text-sm transition-all duration-200 relative group ${
                showAreaOverlay 
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
              }`}
            >
              📈
              
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {showAreaOverlay ? 'Hide Area' : 'Show Area'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Trading Sidebar - Responsive */}
      <TradingSideBar 
        symbol={symbol} 
        selectedInterval={interval}
        symbolPayoutData={symbolPayoutData}
        onSwitch={() => { }} 
        onTradeHover={handleTradeHover}
        {...sidebarProps}
      />

      {/* Mobile Overlay - Only show in portrait mode */}
      {!(isMobileDevice && orientation === 'landscape') && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Market;
