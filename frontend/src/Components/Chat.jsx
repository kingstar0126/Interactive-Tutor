import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { getUseraccount } from "../redux/actions/userAction";
import { setquery } from "../redux/actions/queryAction";

const Chat = () => {
    const navigate = useNavigate();
    const user = JSON.parse(useSelector((state) => state.user.user));
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            getUseraccount(dispatch, { id: user.id });
            setquery(dispatch, user.query);
            if (user.role === 5 || user.role === 0) {
                navigate("onboarding");
            } else {
                navigate("dashboard");
            }
        };
        fetchData();
    }, []);

    return (
        <div className="flex w-full h-full">
            <Outlet />
        </div>
    );
};

export default Chat;
