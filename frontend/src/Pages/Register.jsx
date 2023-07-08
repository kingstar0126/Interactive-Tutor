import React from "react";
import { useForm } from "react-hook-form";
import Header from "../Layout/Header";
import { SERVER_URL } from "../config/constant";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useState } from "react";
import Select from "react-select";
import Autocomplete from "react-google-autocomplete";
import { GOOGLE_MAP_API } from "../env";
import { webAPI } from "../utils/constants";

const Register = () => {
    const {
        register,
        getValues,
        formState: { errors },
        handleSubmit,
    } = useForm();

    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };
    const navigate = useNavigate();

    const [phone, setPhone] = useState("");
    const [organization, setOrganization] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");

    const onSubmit = async (data) => {
        if (phone && isValidPhoneNumber(phone)) {
            data["phone"] = phone;
            data["country"] = country;
            data["state"] = state;
            data["city"] = city;
            data["organization"] = organization;
            axios.post(webAPI.register, data).then((res) => {
                console.log(res.data);
                if (res.data.success) {
                    notification("success", res.data.message);
                    navigate("/");
                } else {
                    notification("error", res.data.message);
                }
            });
        }
    };
    return (
        <div className="bg-[--site-main-color-home] h-full font-logo pb-28">
            <Header />
            <Toaster />
            <div className="mt-[100px]">
                <div className="w-full p-6 m-auto bg-[--site-main-color3] rounded-md lg:max-w-xl">
                    <h1 className="text-3xl font-semibold text-center text-[--site-main-Login] underline uppercase">
                        Register
                    </h1>
                    <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-2">
                            <label
                                htmlFor="username"
                                className="block text-sm font-semibold text-[--site-main-Login-Text]"
                            >
                                Full name
                            </label>
                            <input
                                type="text"
                                name="username"
                                className="block w-full px-4 py-2 mt-2 mb-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                                required
                                placeholder="Please input your full name"
                                {...register("username", {
                                    required: "Username is required.",
                                    minLength: {
                                        value: 3,
                                        message:
                                            "Username must be at least 3 characters",
                                    },
                                })}
                            />
                            {errors.username && (
                                <p className="text-xs italic text-red-500">
                                    {errors.username.message}
                                </p>
                            )}
                            <label
                                htmlFor="email"
                                className="block text-sm font-semibold text-[--site-main-Login-Text]"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                                required
                                placeholder="Please input your email address"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                            />
                            {errors.email && (
                                <p className="text-xs italic text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                            <label
                                htmlFor="contact"
                                className="block text-sm font-semibold text-[--site-main-Login-Text] mt-2"
                            >
                                Contact
                            </label>
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

                            <label
                                htmlFor="Organization"
                                className="block text-sm font-semibold text-[--site-main-Login-Text] mt-2"
                            >
                                Organization
                            </label>

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

                            <label
                                htmlFor="address"
                                className="block text-sm font-semibold text-[--site-main-Login-Text] mt-2"
                            >
                                Address
                            </label>

                            <Autocomplete
                                className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                                apiKey={GOOGLE_MAP_API}
                                onPlaceSelected={(place) => {
                                    const addressComponents =
                                        place.address_components;
                                    let _state, _country, _city;
                                    for (const component of addressComponents) {
                                        const componentType =
                                            component.types[0];

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
                        <div className="mb-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-semibold text-[--site-main-Login-Text]"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                                placeholder="********"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message:
                                            "Password must be at least 8 characters",
                                    },
                                })}
                            />
                            {errors.password && (
                                <p className="text-xs italic text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="confirm"
                                className="block text-sm font-semibold text-[--site-main-Login-Text]"
                            >
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirm"
                                className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                                placeholder="********"
                                {...register("confirm", {
                                    required: "Confirm password is required",
                                    validate: (value) =>
                                        value === getValues("password") ||
                                        "Password and confirm password do not match",
                                })}
                            />
                            {errors.confirm && (
                                <p className="text-xs italic text-red-500">
                                    {errors.confirm.message}
                                </p>
                            )}
                        </div>
                        <div className="mt-6">
                            <button className="w-full px-4 py-2 tracking-wide text-[--site-main-color3] transition-colors duration-200 transform bg-[--site-main-Login] rounded-md hover:bg-[--site-main-Login1] focus:outline-none focus:bg-[--site-main-Login1]">
                                Register
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-xs font-light text-center text-[--site-main-Login-Text]">
                        {" "}
                        Do you have an account?{" "}
                        <Link
                            to="/"
                            className="font-bold text-[--site-main-Login1] hover:underline"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
