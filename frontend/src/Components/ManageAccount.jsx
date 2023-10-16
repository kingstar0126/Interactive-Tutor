import axios from "axios";
import { BsCartPlus } from "react-icons/bs";
import { webAPI } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Autocomplete from "react-google-autocomplete";
import { GOOGLE_MAP_API } from "../env";
import toast, { Toaster } from "react-hot-toast";
import { changeuser } from "../redux/actions/userAction";
import { PiUserCircleGearLight } from "react-icons/pi";
import { AiOutlineMenu } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import ReactSpeedometer from "react-d3-speedometer";
import { MdOutlineUpdate } from "react-icons/md";
import { setOpenSidebar } from "../redux/actions/locationAction";
import SubscriptionModal from "./SubscriptionModal";
import { Button } from "@material-tailwind/react";
import { loadStripe } from "@stripe/stripe-js";

const ManageAccount = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [check, setCheck] = useState(true);
    const [isSubscriptionOpenModal, setIsSubscriptionOpenModal] =
        useState(false);
    const [country, setCountry] = useState("");
    const user = JSON.parse(useSelector((state) => state.user.user));
    const query = useSelector((state) => state.query.query);
    const _chat = JSON.parse(useSelector((state) => state.chat.chat));
    const [trial, setTrial] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const notification = (type, message) => {
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const handleSubscriptionOpenModel = () => {
        setIsSubscriptionOpenModal(!isSubscriptionOpenModal);
    };

    const handleChange = () => {
        if (!username || !email || !state || !country || !city) {
            notification("error", "Please enter all values.");
            return;
        }

        if (phone && isValidPhoneNumber(phone)) {
            const data = {
                id: user.id,
                username: username,
                email: email,
                phone: phone,
                state,
                country,
                city,
            };
            axios
                .post(webAPI.changeuser, data)
                .then((res) => {
                    if (res.data.code === 200) {
                        notification("success", "Changed successfully");
                        const new_user = user;
                        new_user.email = email;
                        new_user.username = username;
                        changeuser(dispatch, new_user);
                    }
                })
                .catch((err) => console.error(err));
        }
    };

    const handleOpenSidebar = () => {
        dispatch(setOpenSidebar());
    };

    const handleOpenModel = () => {
        handleCancelSubscription();
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
        if (user.role === 5) {
            setTrial(user.days);
        }
        axios
            .post(webAPI.checkUserInvite, { id: user.id })
            .then(res => {
                if (res.data.success) {
                    setCheck(false)
                }
                else {
                    setCheck(true)
                }
            })
            .catch(err => console.error(err))
        axios
            .post(webAPI.getuser, { id: user.id })
            .then((res) => {
                setUsername(res.data.data.username);
                setEmail(res.data.data.email);
                setPhone(res.data.data.contact);
                setCity(res.data.data.city);
                setCountry(res.data.data.country);
                setState(res.data.data.state);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const getClientReferenceId = () => {
        return (
            (window.Rewardful && window.Rewardful.referral) ||
            "checkout_" + new Date().getTime()
        );
    };

    const handleMoreQuery = () => {
        axios
            .post(webAPI.create_checkout_query, {
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

    return (
        <div className="w-full h-full">
            <Toaster />

            <div className="flex md:items-center items-end justify-between w-full md:h-[100px] md:px-10 from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] md:border-b-[--site-chat-header-border] md:border bg-gradient-to-r px-4 py-2 max-h-min gap-1">
                <div className="hidden md:flex gap-2 mt-9 mb-8 text-[--site-card-icon-color]">
                    <PiUserCircleGearLight className="w-8 h-8" />
                    <span className="text-2xl font-semibold">Account</span>
                </div>
                <AiOutlineMenu
                    onClick={handleOpenSidebar}
                    className="w-6 h-6 mb-1 md:hidden"
                />
                {check && <div className="flex items-end justify-end md:mt-[27px] md:mb-[30px] md:pr-[44px] pr-9">
                    {_chat && _chat.organization && (
                        <div className="xl:flex flex-col items-start justify-center mr-2 p-2 bg-[--site-warning-text-color] rounded shadow-2xl hidden">
                            <p>
                                <span className="font-bold text-[14px]">
                                    Organisation ID:{" "}
                                </span>
                                <span className="text-[--site-error-text-color] font-semibold">
                                    {_chat.organization}
                                </span>
                            </p>
                        </div>
                    )}
                    {query && (
                        <p className="bg-[--site-logo-text-color] p-2 rounded gap-2 items-center justify-center h-full flex md:mr-0">
                            <span className="text-[--site-error-text-color] font-semibold text-[12px] md:text-base">
                                {query}
                            </span>
                            <span className="text-[--site-card-icon-color] text-[12px] md:text-base font-medium">
                                Queries
                            </span>
                        </p>
                    )}
                    {trial > 0 && (
                        <div className="flex items-end justify-end md:w-max scale-75 md:scale-100 ml-[-14px] mr-[-20px] translate-y-2 md:translate-y-0">
                            <ReactSpeedometer
                                maxSegmentLabels={0}
                                segments={4}
                                width={100}
                                height={58}
                                ringWidth={10}
                                value={24 - trial}
                                needleColor="black"
                                needleHeightRatio={0.5}
                                maxValue={24}
                                startColor={"#f5da42"}
                                endColor={"#ff0000"}
                            />
                        </div>
                    )}
                    <Button
                        onClick={() => {
                            handleSubscriptionOpenModel();
                        }}
                        className="normal-case flex p-2 rounded bg-[--site-logo-text-color] text-[--site-card-icon-color] ml-2"
                    >
                        <MdOutlineUpdate className="w-4 h-4 md:w-6 md:h-6" />
                        <span className="md:text-base text-[12px] font-medium">
                            Upgrade
                        </span>
                    </Button>
                    <Button
                        onClick={handleMoreQuery}
                        className="normal-case gap-1 flex p-2 rounded bg-[--site-logo-text-color] text-[--site-card-icon-color] ml-2"
                    >
                        <BsCartPlus className="w-4 h-4 md:w-6 md:h-6" />
                        <span className="md:text-base text-[12px] font-medium">
                            Top-up Queries
                        </span>
                    </Button>
                </div>}
            </div>

            <div className="flex md:hidden gap-2 text-[--site-card-icon-color] pt-8 px-5">
                <PiUserCircleGearLight className="w-8 h-8" />
                <span className="text-2xl font-semibold">Account</span>
            </div>

            <div className="bg-gradient-to-r from-[--site-chat-header-from-color] to-[--site-chat-header-to-color] border-[--site-chat-header-border] border rounded-xl md:m-10 m-5 flex flex-col gap-5 shadow-xl shadow-[--site-chat-header-border]">
                <div className="flex flex-col items-center justify-start gap-5 p-8 text-black">
                    <div className="flex flex-col w-full">
                        <span className="font-medium">Username</span>
                        <input
                            type="text"
                            defaultValue={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-transparent rounded-md border border-[--site-main-modal-input-border-color] focus:outline-none focus:ring focus:ring-opacity-40"
                            placeholder="Please input your username"
                        />
                    </div>
                    <div className="flex flex-col w-full">
                        <span className="font-medium">Email</span>
                        <input
                            type="text"
                            defaultValue={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                            className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-transparent border rounded-md border-[--site-main-modal-input-border-color] focus:ring-[--site-logo-text-color] focus:outline-none focus:ring focus:ring-opacity-40"
                            placeholder="Please input your email address"
                        />
                    </div>
                    <div className="flex flex-col w-full gap-2">
                        <span className="font-medium">Contact</span>
                        <div>
                            <PhoneInput
                                international
                                countryCallingCodeEditable={false}
                                value={phone}
                                defaultCountry="GB"
                                className="px-4 py-2 gap-2 rounded-lg focus-within:bg-transparent border border-[--site-main-modal-input-border-color] bg-transparent"
                                onChange={(e) => {
                                    setPhone(e);
                                }}
                            />
                        </div>
                        <span className="font-normal text-[12px] text-[--site-error-text-color]">
                            {phone && !isValidPhoneNumber(phone)
                                ? "*Invalid phone number"
                                : null}
                        </span>
                    </div>
                    <div className="flex flex-col w-full gap-2">
                        <span className="font-medium">Address</span>
                        <Autocomplete
                            defaultValue={city}
                            className="rounded-lg p-2 border border-[--site-main-modal-input-border-color] focus:outline-none bg-transparent"
                            apiKey={GOOGLE_MAP_API}
                            onPlaceSelected={(place) => {
                                const addressComponents =
                                    place.address_components;
                                let _state, _country, _city;
                                for (const component of addressComponents) {
                                    const componentType = component.types[0];

                                    if (
                                        componentType ===
                                        "administrative_area_level_1"
                                    ) {
                                        // State
                                        _state = component.short_name;
                                    }

                                    if (componentType === "country") {
                                        // Country
                                        _country = component.short_name;
                                    }

                                    if (componentType === "locality") {
                                        // City
                                        _city = component.short_name;
                                    }
                                }

                                setState(_state);
                                setCountry(_country);
                                setCity(_city);
                            }}
                        />
                    </div>
                    <div className="flex flex-col justify-end w-full gap-3 md:flex-row">
                        {check && user.role !== 7 && <Button
                            className="normal-case px-4 py-2 text-base font-semibold text-[--site-card-icon-color] border bg-transparent border-[--site-card-icon-color] rounded-md"
                            onClick={() => handleCancelSubscription()}
                        >
                            Manage Subscription
                        </Button>}

                        <Button
                            className="normal-case px-4 py-2 text-base font-semibold text-white bg-[--site-card-icon-color] rounded-md"
                            onClick={() => handleChange()}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>
            <SubscriptionModal
                open={isSubscriptionOpenModal}
                handleCancel={() => handleSubscriptionOpenModel()}
            />
        </div>
    );
};

export default ManageAccount;
