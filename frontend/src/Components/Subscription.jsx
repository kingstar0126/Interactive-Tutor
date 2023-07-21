import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useEffect } from "react";
import { webAPI } from "../utils/constants";
import { useLocation } from "react-router-dom";
import { MdCloudDone } from "react-icons/md";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { AiOutlineTrophy } from "react-icons/ai";
import { getUseraccount } from "../redux/actions/userAction";
import { useDispatch } from "react-redux";

const Subscription = () => {
    const location = useLocation();
    const [iscreateModal, setCreateModal] = useState(false);
    const [iseditModal, setEditModal] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [price, setPrice] = useState("");
    const dispatch = useDispatch();
    const user = JSON.parse(useSelector((state) => state.user.user));
    //success the payment insert the DB for the user role

    const handleCancel = () => {
        setCreateModal(false);
        setEditModal(false);
    };
    const handleOk = () => {
        toast.success("Created successfully !");
        setCreateModal(false);
        getSubscription();
    };
    const getSubscription = () => {
        axios
            .post(webAPI.get_all_products, { id: user.id })
            .then((res) => {
                setSubscriptions(res.data.data.data);
                if (res.data.data.price_id) {
                    setPrice(res.data.data.price_id);
                }
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        getSubscription();
        getUseraccount(dispatch, { id: user.id });
    }, []);

    const initiateSubscriptionCheckout = (data) => {
        if (price) {
            if (price === data) {
                return;
            }
            axios
                .post(webAPI.updateSubscription, {
                    subscriptionPlanId: data,
                    id: user.id,
                })
                .then(async (res) => {
                    // Load Stripe and redirect to the Checkout page
                    const stripe = await loadStripe(res.data.key);

                    const { error } = stripe.redirectToCheckout({
                        sessionId: res.data.sessionId,
                    });
                    if (error) {
                        console.error("Error:", error);
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        } else {
            axios
                .post(webAPI.create_checkout, {
                    subscriptionPlanId: data,
                    id: user.id,
                })
                .then(async (res) => {
                    // Load Stripe and redirect to the Checkout page
                    const stripe = await loadStripe(res.data.key);

                    const { error } = stripe.redirectToCheckout({
                        sessionId: res.data.sessionId,
                    });
                    if (error) {
                        console.error("Error:", error);
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    };

    return (
        <div className="w-full h-full">
            <Toaster />
            <div className="flex items-center justify-between w-full p-5">
                <div className="flex items-center justify-center gap-2 font-semibold text-[20px] text-[--site-card-icon-color]">
                    <AiOutlineTrophy className="w-7 h-7" />
                    <span className="flex items-end">Subscriptions</span>
                </div>
            </div>
            <div className="p-4 py-5 pl-5 pr-10">
                {subscriptions && subscriptions.length !== 0 && (
                    <div className="bg-[--site-card-icon-color] gap-5 w-full h-full rounded-xl flex justify-center items-start container p-10 border border-[--site-card-icon-color]">
                        {subscriptions.map((item, index) => {
                            return (
                                <div
                                    key={index}
                                    className="w-1/3 h-[600px] rounded-xl bg-[--site-main-color3] p-5 flex flex-col"
                                >
                                    <div
                                        name="title"
                                        className="flex flex-col items-center justify-center p-2 h-1/5"
                                    >
                                        {price ? (
                                            price === item.price_id ? (
                                                <span className="text-[35px] font-bold border-2 border-[--site-card-icon-color] px-2">
                                                    {item.name}
                                                </span>
                                            ) : (
                                                <span className="text-[35px] font-medium">
                                                    {item.name}
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-[35px] font-medium">
                                                {item.name}
                                            </span>
                                        )}
                                        <span className="text-[45px] font-bold">
                                            $ {item.price}
                                            <span className="text-[20px]">
                                                {" "}
                                                / month
                                            </span>
                                        </span>
                                    </div>
                                    <div
                                        name="body"
                                        className="flex flex-col items-start justify-start w-full gap-5 pl-5 h-3/5"
                                    >
                                        {JSON.parse(item["description"])
                                            .slice(
                                                1,
                                                item["description"].length - 1
                                            )
                                            .map((item, index) => {
                                                return (
                                                    <div
                                                        className="flex gap-3"
                                                        key={index}
                                                    >
                                                        <MdCloudDone className="fill-[--site-card-icon-color] w-5 h-5 pointer-events-none" />
                                                        {item}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                    <div className="flex items-center justify-center w-full gap-3 h-1/5">
                                        <button
                                            name="button"
                                            onClick={() =>
                                                initiateSubscriptionCheckout(
                                                    item.price_id
                                                )
                                            }
                                            className="items-center justify-center bg-[--site-card-icon-color] flex p-2 my-5 text-[--site-logo-text-color] rounded-xl hover:scale-110 active:ring-[--site-logo-text-color] active:ring-2"
                                        >
                                            CheckOut
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
export default Subscription;
