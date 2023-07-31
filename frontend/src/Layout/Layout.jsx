import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";
import Chatbubble from "../Components/Chatbubble";
import { setlocation } from "../redux/actions/locationAction";
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setOpenSidebar } from "../redux/actions/locationAction";

const Layout = () => {
    let location = useLocation();
    const handleOpenSidebar = () => {
        dispatch(setOpenSidebar());
    };
    const isOpenSidebar = useSelector((state) => state.location.openSidebar);
    const sidebarRef = useRef(null);
    const dispatch = useDispatch();
    setlocation(dispatch, location.pathname);
    useEffect(() => {
        if (isOpenSidebar === true) {
            const handleClick = (event) => {
                if (event.button === 0) {
                    handleOpenSidebar();
                }
            };

            const element = sidebarRef.current;

            if (element) {
                element.addEventListener("mousedown", handleClick);
            }

            return () => {
                if (element) {
                    element.removeEventListener("mousedown", handleClick);
                }
            };
        }
    }, [isOpenSidebar]);

    return (
        <div className="flex flex-row font-logo bg-[--site-card-icon-color] min-h-screen ">
            <div className="md:w-1/5 md:min-w-[267px]">
                <Sidebar />
            </div>
            <div
                className="items-center justify-center w-screen bg-[--site-main-color3]"
                ref={sidebarRef}
            >
                <Outlet />
            </div>
            <div className="z-50 hidden md:flex">
                <Chatbubble />
            </div>
        </div>
    );
};

export default Layout;
