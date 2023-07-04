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
import { BsFillCreditCard2FrontFill } from "react-icons/bs";
import { STRIPE_PUBLISH_KEY } from "../env";
import toast, { Toaster } from "react-hot-toast";
import Autocomplete from "react-google-autocomplete";
import { GOOGLE_MAP_API } from "../env";

const stripePromise = loadStripe(STRIPE_PUBLISH_KEY);

const SubscriptionForm = () => {
    const [email, setEmail] = useState("");
    const stripe = useStripe();
    const [subscription, setSubscription] = useState("Starter");
    const elements = useElements();
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");

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

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement),
        });

        if (!error) {
            await axios
                .post(webAPI.create_customer, {
                    email,
                    paymentMethod,
                    subscription,
                    state,
                    city,
                    country,
                })
                .then((res) =>
                    notification(
                        "suceess",
                        "Subscription created successfully!"
                    )
                )
                .catch((err) =>
                    notification("error", "Subscription creation failed.")
                );
        }
    };

    return (
        <div className="w-full h-full p-4 pl-5 pr-10">
            <Toaster />
            <div className="flex items-center justify-between p-5 bg-[--site-card-icon-color] rounded-full">
                <div className="flex items-center justify-center gap-2 font-semibold text-[20px] text-white">
                    <BsFillCreditCard2FrontFill className="fill-[--site-logo-text-color]" />
                    Subscriptions
                </div>
            </div>
            <div className="flex flex-col items-center justify-center my-5 p-5 bg-[--site-card-icon-color] rounded-xl">
                <form
                    onSubmit={handleSubmit}
                    className="p-5 bg-[--site-card-icon-color] w-3/5 flex flex-col gap-5"
                >
                    <input
                        type="email"
                        value={email}
                        className="w-full p-2 rounded-xl focus:ring-2 focus:ring-[--site-logo-text-color] items-center justify-center flex"
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <Select
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
                    />
                    <div className="flex-col items-center justify-center w-full rounded-xl">
                        <CardElement className="p-2 bg-[--site-main-color3] text-[--site-card-icon-color] font-bold" />
                    </div>
                    <Autocomplete
                        className="w-3/5 rounded-lg p-2 focus:ring-[--site-logo-text-color] focus:outline-none focus:ring focus:ring-opacity-40"
                        apiKey={GOOGLE_MAP_API}
                        onPlaceSelected={(place) => {
                            const addressComponents = place.address_components;
                            let _state, _country, _city;
                            for (const component of addressComponents) {
                                const componentType = component.types[0];

                                if (
                                    componentType ===
                                    "administrative_area_level_1"
                                ) {
                                    // State
                                    _state = component.long_name;
                                }

                                if (componentType === "country") {
                                    // Country
                                    _country = component.long_name;
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
                    <button
                        type="submit"
                        className="bg-[--site-logo-text-color] p-2 rounded-xl"
                    >
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
    );
};

const App = () => {
    return (
        <Elements stripe={stripePromise}>
            <SubscriptionForm />
        </Elements>
    );
};

export default App;
