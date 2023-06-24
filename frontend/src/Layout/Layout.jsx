import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex flex-row font-logo bg-[--site-card-icon-color] min-h-screen ">
      <div className="w-[25vh] min-w-[200px] h-auto hidden md:block">
        <Sidebar />
      </div>
      <div className="items-center justify-center w-screen bg-[--site-main-color3]">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
