import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useEffect } from "react";
import { webAPI } from "../utils/constants";
import { useLocation } from "react-router-dom";
import { MdCloudDone } from "react-icons/md";
import CreateProduct from "./CreateProduct";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import EditProduct from "./EditProduct";

const Subscription = () => {
    const location = useLocation();
    const [iscreateModal, setCreateModal] = useState(false);
    const [iseditModal, setEditModal] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const params = new URLSearchParams(location.search);
    const session_id = params.get("session_id");
    const [item, setItem] = useState({});
    const user = JSON.parse(useSelector((state) => state.user.user));
    const [state, setState] = useState(false);
    //success the payment insert the DB for the user role
    useEffect(() => {
        if (session_id && localStorage.getItem("sessionId") === session_id) {
            console.log("success");
            localStorage.removeItem("sessionId");
        }
    }, [session_id]);

    useEffect(() => {
        setState(!state);
    }, [subscriptions]);

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
            .get(webAPI.get_products)
            .then((res) => {
                console.log("This is the products list ->", res);
                setSubscriptions(res.data);
            })
            .catch((err) => console.error(err));
    };
    const handleEditOk = () => {
        setEditModal(false);
        toast.success("Updated successfully !");
        getSubscription();
    };

    useEffect(() => {
        getSubscription();
    }, []);

    const handleCreateProduct = () => {
        setCreateModal(true);
    };

    const handleDeleteProduct = (data) => {
        axios
            .post(webAPI.delete_product, { user_id: user.id, product_id: data })
            .then((res) => {
                console.log(res.data);
                toast.success("Deleted successfully !");
                getSubscription();
            })
            .catch((err) => console.error(err));
    };
    const handleDeleteAllProducts = () => {
        axios
            .post(webAPI.delete_all_product, { user_id: user.id })
            .then((res) => {
                console.log(res.data);
                getSubscription();
            })
            .catch((err) => console.error(err));
    };
    const initiateSubscriptionCheckout = (data) => {
        axios
            .post(webAPI.create_checkout, {
                subscriptionPlanId: data,
            })
            .then(async (res) => {
                console.log(res);
                // Load Stripe and redirect to the Checkout page
                const stripe = await loadStripe(res.data.key);
                console.log(stripe);
                localStorage.setItem("sessionId", res.data.sessionId);
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
    };

    return (
        <div className="w-full h-full p-10">
            <Toaster />
            <CreateProduct
                open={iscreateModal}
                handleCancel={handleCancel}
                handleOk={handleOk}
            />
            <Toaster />
            <EditProduct
                data={item}
                open={iseditModal}
                handleCancel={handleCancel}
                handleEditOk={handleEditOk}
            />
            {user.role && user.role === 1 ? (
                <div className="flex w-full items-start justify-start gap-5">
                    <button
                        onClick={handleCreateProduct}
                        className="bg-[--site-card-icon-color] text-[--site-main-color3] p-2 rounded-xl mb-5"
                    >
                        Create Product
                    </button>
                    <button
                        onClick={handleDeleteAllProducts}
                        className="bg-[--site-card-icon-color] text-[--site-main-color3] p-2 rounded-xl mb-5"
                    >
                        Delete all Products
                    </button>
                </div>
            ): null}
            {subscriptions && subscriptions.length !== 0 && (
                <div className="bg-[--site-card-icon-color] gap-5 w-full h-full rounded-xl flex justify-center items-center container p-10 border border-[--site-card-icon-color]">
                    {subscriptions.map((item, index) => {
                        return (
                            <div
                                key={index}
                                className="w-1/3 h-full rounded-xl bg-[--site-main-color3] p-5 flex flex-col"
                            >
                                <div
                                    name="title"
                                    className="h-1/5 flex flex-col p-2 justify-center items-center"
                                >
                                    <span className="text-[35px] font-medium">
                                        {item.product.name}
                                    </span>
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
                                    className="h-3/5 w-full flex flex-col justify-start items-start gap-5 pl-5"
                                >
                                    {item.product.description
                                        .split("\n")
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
                                <div className="h-1/5 w-full items-center justify-center flex gap-3">
                                    <button
                                        name="button"
                                        onClick={() =>
                                            initiateSubscriptionCheckout(
                                                item.price_id
                                            )
                                        }
                                        className="items-center justify-center bg-[--site-card-icon-color] flex p-2 text-[--site-logo-text-color] rounded-xl hover:scale-110 active:ring-[--site-logo-text-color] active:ring-2"
                                    >
                                        CheckOut
                                    </button>
                                    {user.role && user.role === 1 ? (
                                        <button
                                            name="button"
                                            onClick={() => {
                                                setItem(item);
                                                setEditModal(true);
                                            }}
                                            className="items-center justify-center bg-[--site-card-icon-color] flex p-2 text-[--site-logo-text-color] rounded-xl hover:scale-110 active:ring-[--site-logo-text-color] active:ring-2"
                                        >
                                            Edit
                                        </button>
                                    ): null}
                                    {user.role && user.role === 1 ? (
                                        <button
                                            name="button"
                                            onClick={() =>
                                                handleDeleteProduct(
                                                    item.product.id
                                                )
                                            }
                                            className="items-center justify-center bg-[--site-card-icon-color] flex p-2 text-[--site-logo-text-color] rounded-xl hover:scale-110 active:ring-[--site-logo-text-color] active:ring-2"
                                        >
                                            Delete
                                        </button>
                                    ): null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
export default Subscription;
