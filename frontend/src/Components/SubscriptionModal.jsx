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
import React, { Fragment } from "react";
import { useState, useEffect } from "react";
import { webAPI } from "../utils/constants";
import { loadStripe } from "@stripe/stripe-js";
import { GoCheckCircle } from "react-icons/go";
import axios from "axios";
import { getUseraccount } from "../redux/actions/userAction";
import { useSelector, useDispatch } from "react-redux";

const SubscriptionModal = (props) => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState([]);
    const user = JSON.parse(useSelector((state) => state.user.user));
    const dispatch = useDispatch();

    useEffect(() => {
        getSubscription();
        getUseraccount(dispatch, { id: user.id });
    }, []);
    const initiateSubscriptionCheckout = (data) => {
        if (price) {
            console.log("Update");
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
            console.log("Create");
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
        const newDescription = subscriptions.map((item) => {
            const parsedDescription = JSON.parse(item["description"]);
            return parsedDescription.slice(1, parsedDescription.length - 1);
        });
        setDescription(newDescription);
    }, [subscriptions]);

    return (
        <Dialog
            open={props.open}
            size={"xl"}
            handler={props.handleCancel}
            className="border-[--site-chat-header-border] border rounded-2xl from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-card-icon-color]"
        >
            <DialogHeader className="px-8 pt-8 pb-6">
                <span className="text-[32px] leading-12 font-semibold text-[--site-card-icon-color]">
                    Chat
                </span>
            </DialogHeader>
            <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium md:px-12 md:pb-20 md:h-[42rem] h-[30rem] overflow-y-auto">
                {subscriptions && subscriptions.length !== 0 && (
                    <div className="flex flex-col items-center justify-center w-full gap-12 py-4 md:flex-row">
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
                                                        ${item.price} /
                                                    </span>
                                                    <span className="text-[20px] pb-2">
                                                        month
                                                    </span>
                                                </Typography>
                                            </CardHeader>
                                            <CardBody className="p-0 max-h-[18rem] h-3/6">
                                                <ul className="flex flex-col gap-2">
                                                    {subscriptions &&
                                                        description[index] &&
                                                        description[index].map(
                                                            (subscription) => (
                                                                <li
                                                                    className="flex items-start gap-4"
                                                                    key={
                                                                        subscription
                                                                    }
                                                                >
                                                                    <GoCheckCircle className="text-[#2DC937] w-5 h-5" />

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
                                                >
                                                    Choose Plan
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
                                                        ${item.price} /
                                                    </span>
                                                    <span className="text-[#034F75] text-[20px] pb-2">
                                                        month
                                                    </span>
                                                </Typography>
                                            </CardHeader>
                                            <CardBody className="flex flex-col justify-start gap-2 p-0 h-3/6">
                                                <ul className="flex flex-col gap-2">
                                                    {subscriptions &&
                                                        description[index] &&
                                                        description[index].map(
                                                            (subscription) => (
                                                                <li
                                                                    className="flex items-start gap-4"
                                                                    key={
                                                                        subscription
                                                                    }
                                                                >
                                                                    <GoCheckCircle className="text-[#2DC937] w-5 h-5" />

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
                    </div>
                )}
            </DialogBody>
        </Dialog>
    );
};

export default SubscriptionModal;
