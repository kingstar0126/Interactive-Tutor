import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";
import Chatbubble from "../Components/Chatbubble";
import { useDispatch } from "react-redux";
import { setlocation } from "../redux/actions/locationAction";

const Layout = () => {
    let location = useLocation();
    const dispatch = useDispatch();
    setlocation(dispatch, location.pathname);
    return (
        <div className="flex flex-row font-logo bg-[--site-card-icon-color] min-h-screen ">
            <div className="w-[25vh] min-w-[250px] hidden md:block">
                <Sidebar />
            </div>
            <div className="items-center justify-center w-screen bg-[--site-main-color3]">
                <Outlet />
            </div>
            <div className="z-50">
                <Chatbubble />
            </div>
        </div>
    );
};

export default Layout;
