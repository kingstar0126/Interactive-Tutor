import {
    DialogHeader,
    Dialog,
    DialogBody,
    DialogFooter,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Button,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import React, { Fragment } from "react";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { webAPI } from "../utils/constants";
import { loadStripe } from "@stripe/stripe-js";
import { GoCheckCircle } from "react-icons/go";
import axios from "axios";
import { getUseraccount } from "../redux/actions/userAction";
import { useSelector, useDispatch } from "react-redux";
import InviteEmailItem from "./InviteEmailItem";

const SubscriptionModal = (props) => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [price, setPrice] = useState("");
    const [isopen, setIsOpen] = useState(false);
    const [description, setDescription] = useState([]);
    const [type, setType] = useState(true);
    const [inviteEmails, setInviteEmails] = useState([]);
    const user = JSON.parse(useSelector((state) => state.user.user));
    const dispatch = useDispatch();

    const handleCustomPlan = () => {
        axios
            .post(webAPI.custom_plan, { id: user.id })
            .then((res) => notification("success", res.data.message))
            .catch((err) => {});
    };

    const handleOpenModal = () => {
        setIsOpen(!isopen);
    };

    useEffect(() => {
        getSubscription();
        getInviteEmails();
        getUseraccount(dispatch, { id: user.id });
        setType(true);
    }, []);

    const getClientReferenceId = () => {
        return (
            (window.Rewardful && window.Rewardful.referral) ||
            "checkout_" + new Date().getTime()
        );
    };
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const initiateSubscriptionCheckout = (data) => {
        if (price) {
            if (price === data) {
                return;
            }
            axios
                .post(webAPI.updateSubscription, {
                    subscriptionPlanId: data,
                    id: user.id,
                    clientReferenceId: getClientReferenceId(),
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
                    clientReferenceId: getClientReferenceId(),
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
    const handleCancelSubscription = () => {
        axios
            .post(webAPI.cancel_subscription, { id: user.id })
            .then((res) => {
                window.location.href = res.data.url;
            })
            .catch((err) => console.error(err));
    };
    useEffect(() => {
        const newDescription = subscriptions.map((item) => {
            const parsedDescription = JSON.parse(item["description"]);
            return parsedDescription.slice(0, parsedDescription.length - 1);
        });
        setDescription(newDescription);
    }, [subscriptions]);

    const getInviteEmails = () => {
        axios.post(webAPI.getinviteEmails, {id: user.id})
        .then(res => {
            if(res.data.success) {
                let invite_email = [...res.data.data]
                while (invite_email.length < 8) {
                    invite_email.push(null);
                }
                setInviteEmails(invite_email)
                console.log(invite_email)
            }})
        .catch(err => console.error(err));
    }
    const handleInvite = (type, message) => {
        notification(type, message);
        getInviteEmails();
    }

    return (
        <Dialog
            open={props.open}
            size={"xl"}
            handler={props.handleCancel}
            className="border-[--site-chat-header-border] border rounded-2xl from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-card-icon-color]"
        >
            <DialogHeader className="px-8 pt-8 pb-6 flex justify-between flex-col md:flex-row">
                <span className="text-[32px] leading-12 font-semibold text-[--site-card-icon-color]">
                    Subscription
                </span>
                <Link>
                    <span onClick={() => {setType(!type)}} className="bg-transparent text-[--site-card-icon-color] text-base font-semibold hover:text-[--site-main-slider-thumb-color]">Invite others for a 50% discount</span>
                </Link>
            </DialogHeader>
            <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium md:px-12 md:pb-20 md:max-h-[42rem] max-h-[25rem] overflow-y-auto">
                <Toaster />
                {type ? subscriptions && subscriptions.length !== 0 && (
                    <div>
                        {user.role !== 7 && <div className="flex flex-col items-start justify-center w-full gap-12 py-4 md:flex-row">
                            {subscriptions.map((item, index) => {
                                return (
                                    <React.Fragment key={item.price_id}>
                                        {price && price === item.price_id ? (
                                            <Card
                                                variant="gradient"
                                                className="w-full max-w-[20rem] p-8 bg-[#034F75] text-white flex flex-col scale-y-105"
                                            >
                                                <CardHeader
                                                    floated={false}
                                                    shadow={false}
                                                    color="transparent"
                                                    className="pb-2 m-0 mb-4 text-center border-b rounded-none border-white/10 h-2/6"
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <Typography
                                                            variant="small"
                                                            color="white"
                                                            className="py-2 px-6 rounded-[10px] text-2xl border border-white"
                                                        >
                                                            {item.name}
                                                        </Typography>
                                                    </div>
                                                    <Typography
                                                        variant="small"
                                                        color="white"
                                                        className="flex items-end justify-center gap-1 mt-6 font-semibold"
                                                    >
                                                        <span className="text-[36px]">
                                                            £{item.price} /
                                                        </span>
                                                        <span className="text-[20px] pb-2">
                                                            month
                                                        </span>
                                                    </Typography>
                                                </CardHeader>
                                                <CardBody className="p-0 md:h-[298px] h-3/6">
                                                    <ul className="flex flex-col gap-2">
                                                        {subscriptions &&
                                                            description[
                                                                index
                                                            ] &&
                                                            description[
                                                                index
                                                            ].map(
                                                                (
                                                                    subscription
                                                                ) => (
                                                                    <li
                                                                        className="flex items-start gap-4"
                                                                        key={
                                                                            subscription
                                                                        }
                                                                    >
                                                                        <div className="w-6">
                                                                            <GoCheckCircle className="text-[#2DC937] w-5 h-5 p-1" />
                                                                        </div>
                                                                        <Typography className="font-normal">
                                                                            {
                                                                                subscription
                                                                            }
                                                                        </Typography>
                                                                    </li>
                                                                )
                                                            )}
                                                    </ul>
                                                </CardBody>
                                                <CardFooter className="px-2 pb-4 mt-6 h-1/6">
                                                    <Button
                                                        size="lg"
                                                        color="white"
                                                        className="text-white bg-[--site-card-icon-color] hover:scale-[1.02] focus:scale-[1.02] active:scale-100 text-[20px] normal-case"
                                                        ripple={false}
                                                        onClick={() => {
                                                            handleCancelSubscription();
                                                        }}
                                                        fullWidth={true}
                                                    >
                                                        Manage Plan
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ) : (
                                            <Card
                                                variant="gradient"
                                                className="w-full max-w-[20rem] p-8 text-[#034F75] from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-sm shadow-[--site-card-icon-color] flex flex-col"
                                            >
                                                <CardHeader
                                                    floated={false}
                                                    shadow={false}
                                                    color="transparent"
                                                    className="m-0 mb-4 rounded-none border-b border-white/10 pb-2 text-center text-[#034F75] h-max flex flex-col"
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <Typography
                                                            variant="small"
                                                            className="py-2 px-6 rounded-[10px] text-2xl border border-[#034F75]"
                                                        >
                                                            {item.name}
                                                        </Typography>
                                                    </div>
                                                    <Typography
                                                        variant="small"
                                                        className="flex items-end justify-center gap-1 mt-6 font-semibold"
                                                    >
                                                        <span className="text-[36px] text-[#034F75]">
                                                            £{item.price} /
                                                        </span>
                                                        <span className="text-[#034F75] text-[20px] pb-2">
                                                            month
                                                        </span>
                                                    </Typography>
                                                </CardHeader>
                                                <CardBody className="flex flex-col justify-start gap-2 p-0 h-3/6  md:h-[298px] ">
                                                    <ul className="flex flex-col gap-2">
                                                        {subscriptions &&
                                                            description[
                                                                index
                                                            ] &&
                                                            description[
                                                                index
                                                            ].map(
                                                                (
                                                                    subscription
                                                                ) => (
                                                                    <li
                                                                        className="flex items-start gap-4"
                                                                        key={
                                                                            subscription
                                                                        }
                                                                    >
                                                                        <div className="w-6">
                                                                            <GoCheckCircle className="text-[#2DC937] w-5 h-5 p-1" />
                                                                        </div>

                                                                        <Typography className="font-normal">
                                                                            {
                                                                                subscription
                                                                            }
                                                                        </Typography>
                                                                    </li>
                                                                )
                                                            )}
                                                    </ul>
                                                </CardBody>
                                                <CardFooter className="px-2 pb-4 mt-6 h-1/6">
                                                    <Button
                                                        size="lg"
                                                        color="white"
                                                        className="text-white bg-[--site-card-icon-color] hover:scale-[1.02] focus:scale-[1.02] active:scale-100 text-[20px] normal-case"
                                                        ripple={false}
                                                        fullWidth={true}
                                                        onClick={() =>
                                                            initiateSubscriptionCheckout(
                                                                item.price_id
                                                            )
                                                        }
                                                    >
                                                        Choose Plan
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>}
                        <div className="justify-center flex p-2">
                            {user.role !== 6 ? (
                                <span
                                    onClick={handleOpenModal}
                                    className=" text-[#034F75] border border-[--site-main-pricing-color] rounded-lg mt-5 p-5 hover:scale-[1.02] focus:scale-[1.02] active:scale-100 shadow-sm shadow-[--site-card-icon-color]"
                                >
                                    Custom Plan
                                </span>
                            ) : (
                                <span
                                    onClick={handleOpenModal}
                                    className=" bg-[#034F75] text-white border border-[--site-main-pricing-color] rounded-lg mt-5 p-5 hover:scale-[1.02] focus:scale-[1.02] active:scale-100 shadow-sm shadow-[--site-card-icon-color]"
                                >
                                    Custom Plan
                                </span>
                            )}
                        </div>
                    </div>
                ): <div className="flex flex-col gap-5">
                        <span className="text-2xl font-semibold text-[--site-card-icon-color]">Invite 5 subscribers to get 50% off your subscription</span>
                        <div className="flex flex-col gap-2">
                            {console.log('HIHIHI', inviteEmails)}
                            {inviteEmails.map((item, id) => {
                                return <InviteEmailItem data={item} InviteConfirm={handleInvite} key={id}/>
                            })}
                        </div>
                        
                    </div>}
            </DialogBody>
            <Dialog
                open={isopen}
                handler={handleOpenModal}
                className="border-[--site-chat-header-border] border rounded-2xl from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-card-icon-color]"
            >
                <DialogHeader>Custom Plan</DialogHeader>
                <DialogBody divider>
                    <span className="text-base text-black">
                        You are now on a Custom Plan. To change your plan please
                        contact{" "}
                        <span className="text-[--site-main-pricing-color]">
                            info@interactive-tutor.com
                        </span>
                    </span>
                </DialogBody>
                <DialogFooter className="flex items-center justify-end gap-4 pb-8">
                    <button
                        onClick={handleOpenModal}
                        className="bg-transparent border-[--site-card-icon-color] text-[--site-card-icon-color] text-base font-semibold border rounded-md px-4 py-2"
                    >
                        cancel
                    </button>

                    <button
                        onClick={() => {
                            handleCustomPlan();
                            handleOpenModal();
                        }}
                        className="px-4 py-2 text-base font-semibold text-white bg-[--site-card-icon-color] rounded-md"
                    >
                        confirm
                    </button>
                </DialogFooter>
            </Dialog>
        </Dialog>
    );
};

export default SubscriptionModal;
