import { Outlet } from "react-router-dom";
import Navbar from "./Home/NavBar";
import Footer from "./Common/Footer";
// import Footer from "./Home/Footer";

const MainNavigation = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      {/* <Footer /> */}
      <Footer />
    </>
  );
};

export default MainNavigation;
