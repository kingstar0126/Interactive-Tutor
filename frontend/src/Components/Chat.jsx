import { BsFillPlayFill, BsCartPlus } from "react-icons/bs";
import { useState, useEffect, useRef } from "react";
import Chatmodal from "./Chatmodal";
import ChatTable from "./ChatTable";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { webAPI } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { Outlet, useLocation } from "react-router-dom";
import { getUseraccount } from "../redux/actions/userAction";
import { setquery } from "../redux/actions/queryAction";
import { setOpenSidebar } from "../redux/actions/locationAction";
import { getchat } from "../redux/actions/chatAction";
import { Button, Carousel, IconButton } from "@material-tailwind/react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import NewChat from "./NewChat";

const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };
    const [chat, SetChat] = useState([]);
    const user = JSON.parse(useSelector((state) => state.user.user));
    const query = useSelector((state) => state.query.query);
    const chatState = useSelector((state) => state.chat.chat);
    const _chat = (chatState && JSON.parse(chatState)) || {};
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isopenModal, setIsOpenModal] = useState(false);
    const [check, setCheck] = useState(true);

    const handleOpenModel = () => {
        setIsOpenModal(!isopenModal);
    };

    const dispatch = useDispatch();
    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = (data) => {
        data["user_id"] = user.id;

        axios.post(webAPI.addchat, data).then((res) => {
            if (!res.data.success) {
                notification("error", res.data.message);
            } else {
                notification("success", res.data.message);
                getChats();
            }
        });
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        getChats();
        setIsModalOpen(false);
    };

    const handleTransfer = (message) => {
        notification("success", message);
        getChats();
    };

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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const getChats = async () => {
        let data = {
            user_id: user.id,
        };

        await axios.post(webAPI.getchats, data).then((res) => {
            if (res.data.success) {
                SetChat(res.data.data);
                getchat(dispatch, res.data.data);
            } else {
                notification("error", res.data.message);
            }
        });
    };

    // const handleMoreQuery = () => {
    //     axios
    //         .post(webAPI.create_checkout_query, {
    //             id: user.id,
    //             clientReferenceId: getClientReferenceId(),
    //         })
    //         .then(async (res) => {
    //             // Load Stripe and redirect to the Checkout page
    //             const stripe = await loadStripe(res.data.key);

    //             const { error } = stripe.redirectToCheckout({
    //                 sessionId: res.data.sessionId,
    //             });
    //             if (error) {
    //                 console.error("Error:", error);
    //             }
    //         })
    //         .catch((err) => {
    //             console.error(err);
    //         });
    // };
    return (
        <>
            <Outlet />
        </>
    );
};

export default Chat;
