import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
const Layout = () => {
  return (
    <div className="flex flex-row">
      <div className="w-[25vh]  min-w-[200px] h-screen container hidden md:block">
        <Sidebar />
      </div>
      <div className="items-center justify-center w-screen h-screen bg-[--site-main-color8]">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
