import axios from "axios";
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
    const dispatch = useDispatch();
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


    const handleCancelSubscription = () => {
        axios
            .post(webAPI.cancel_subscription, { id: user.id })
            .then((res) => {
                window.location.href = res.data.url;
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        axios
            .post(webAPI.checkUserInvite, { id: user.id })
            .then((res) => {
                if (res.data.success) {
                    setCheck(false);
                } else {
                    setCheck(true);
                }
            })
            .catch((err) => console.error(err));
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

    return (
        <div className="w-full h-full">
            <Toaster className="z-30" />

            <div className="flex md:items-center items-end w-full md:h-[80px] shadow-md md:px-10 md:border-b-[--site-chat-header-border] md:border px-4 py-2 max-h-min gap-1">
                <div className="hidden md:flex gap-2 mt-9 mb-8 text-[--site-onboarding-primary-color]">
                    <PiUserCircleGearLight className="w-8 h-8" />
                    <span className="text-2xl font-semibold">Account</span>
                </div>
            </div>

            <div className="border-[--site-chat-header-border] border rounded-md md:m-10 m-5 flex flex-col gap-5 shadow-xl shadow-[--site-chat-header-border]">
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
                        {check && user.role !== 7 && (
                            <Button
                                className="normal-case px-4 py-2 text-base font-semibold text-[--site-onboarding-primary-color] border bg-transparent border-[--site-onboarding-primary-color] rounded-md"
                                onClick={() => handleCancelSubscription()}
                            >
                                Manage Subscription
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            className="normal-case px-4 py-2 text-base font-semibold text-[--site-onboarding-primary-color] border border-[--site-onboarding-primary-color] rounded-md"
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
