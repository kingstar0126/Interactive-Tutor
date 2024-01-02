import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Chatbubble from "../Components/Chatbubble";
import Header from "../Components/HeaderComponent";

const Layout = () => {
    return (
        <div className="flex w-full h-screen flex-row">
            <div className="w-[267px] bg-primary hidden md:block rounded-r-[10px]"><Sidebar /></div>
            <div className="flex flex-col flex-1 w-full md:max-w-calc-267">
                <Header />
                <div className="flex-1 w-full max-h-full overflow-auto"><Outlet /></div>
            </div>
            <div className="z-50 hidden md:flex">
                <Chatbubble />
            </div>
        </div>
    );
};

export default Layout;
