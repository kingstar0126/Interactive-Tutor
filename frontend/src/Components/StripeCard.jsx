import React, { useState } from "react";
import axios from "axios";
import { webAPI } from "../utils/constants";
import {
    CardElement,
    useStripe,
    useElements,
    Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Select from "react-select";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
// import { STRIPE_PUBLISH_KEY } from "../env";
import toast from "react-hot-toast";
import Autocomplete from "react-google-autocomplete";
// import { GOOGLE_MAP_API } from "../env";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISH_KEY);

const SubscriptionForm = (props) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const stripe = useStripe();
    const [subscription, setSubscription] = useState("Starter");
    const elements = useElements();
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [organization, setOrganization] = useState("");
    const [passwrod, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const user = JSON.parse(useSelector((state) => state.user.user));

    useEffect(() => {}, [props.open]);

    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email) {
            notification("error", "Please input all fields");
        }
        // const { error, paymentMethod } = await stripe.createPaymentMethod({
        //     type: "card",
        //     card: elements.getElement(CardElement),
        //     billing_details: {
        //         name: name,
        //         email: email,
        //     },
        // });

        // if (!error) {
        if (phone && isValidPhoneNumber(phone)) {
            await axios
                .post(webAPI.create_customer, {
                    id: user.id,
                    name,
                    email,
                    phone,
                    organization,
                    passwrod,
                    state,
                    city,
                    country,
                })
                .then((res) => {
                    if (res.data.success === true) {
                        notification(
                            "suceess",
                            "Subscription created successfully!"
                        );
                    } else {
                        notification("error", res.data.message);
                    }
                    props.handleCancel();
                })
                .catch(() => {
                    notification("error", "Subscription creation failed.");
                    props.handleCancel();
                });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full gap-5">
            <div className="p-5 bg-[--site-card-icon-color] w-3/5 flex flex-col gap-5">
                <input
                    type="text"
                    name="username"
                    defaultValue={name}
                    className="w-full p-2 rounded-xl focus:ring-2 focus:ring-[--site-logo-text-color] items-center justify-center flex"
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Username"
                />
                <input
                    type="email"
                    defaultValue={email}
                    name="email"
                    className="w-full p-2 rounded-xl focus:ring-2 focus:ring-[--site-logo-text-color] items-center justify-center flex"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                />
                {/* <Select
                    className="w-full mb-1 text-[--site-card-icon-color] py-2 "
                    onChange={(e) => {
                        setSubscription(e.label);
                    }}
                    defaultValue={{
                        value: "1",
                        label: "Starter",
                    }}
                    options={[
                        {
                            value: "1",
                            label: "Stater",
                        },
                        {
                            value: "2",
                            label: "Standard",
                        },
                        {
                            value: "3",
                            label: "Pro",
                        },
                    ]}
                /> */}
                {/* <div className="flex-col items-center justify-center w-full rounded-xl">
                    <CardElement className="p-2 bg-[--site-main-color3] text-[--site-card-icon-color] font-bold" />
                </div> */}
                <PhoneInput
                    international
                    value={phone}
                    countryCallingCodeEditable={false}
                    defaultCountry="GB"
                    className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                    onChange={(e) => {
                        setPhone(e);
                    }}
                />
                <Select
                    className="w-full mb-1 text-[--site-card-icon-color] mt-2"
                    onChange={(e) => {
                        setOrganization(e.label);
                    }}
                    defaultValue={{
                        value: "1",
                        label: "Schools",
                    }}
                    options={[
                        {
                            value: "1",
                            label: "Schools",
                        },
                        {
                            value: "2",
                            label: "Universities",
                        },
                        {
                            value: "3",
                            label: "Clubs",
                        },
                        {
                            value: "4",
                            label: "Businesses",
                        },
                    ]}
                />
                <Autocomplete
                    className="w-3/5 rounded-lg p-2 focus:ring-[--site-logo-text-color] focus:outline-none focus:ring focus:ring-opacity-40 text-[--site-card-icon-color]"
                    apiKey={process.env.REACT_APP_GOOGLE_MAP_API}
                    onPlaceSelected={(place) => {
                        const addressComponents = place.address_components;
                        let _state, _country, _city;
                        for (const component of addressComponents) {
                            const componentType = component.types[0];

                            if (
                                componentType === "administrative_area_level_1"
                            ) {
                                // State
                                _state = component.long_name;
                            }

                            if (componentType === "country") {
                                // Country
                                _country = component.short_name;
                            }

                            if (componentType === "locality") {
                                // City
                                _city = component.long_name;
                            }
                        }

                        setState(_state);
                        setCountry(_country);
                        setCity(_city);
                    }}
                />
                <div className="mb-2">
                    <input
                        type="password"
                        name="password"
                        className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                        placeholder="********"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex justify-between w-fll">
                    <button
                        onClick={props.handleCancel}
                        className="bg-[--site-logo-text-color] p-2 rounded-xl text-[--site-card-icon-color] w-[100px]"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={(e) => handleSubmit(e)}
                        className="bg-[--site-logo-text-color] p-2 rounded-xl text-[--site-card-icon-color] w-[100px]"
                    >
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
    );
};

function App(props) {
    const showHideClassname = props.open
        ? "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
        : "hidden";

    return (
        <div className={showHideClassname}>
            <div className="relative w-3/5 p-5 mx-auto bg-[--site-card-icon-color] text-white rounded-md shadow-lg top-20">
                <Elements stripe={stripePromise}>
                    <SubscriptionForm
                        open={props.open}
                        handleCancel={props.handleCancel}
                    />
                </Elements>
            </div>
        </div>
    );
}

export default App;
