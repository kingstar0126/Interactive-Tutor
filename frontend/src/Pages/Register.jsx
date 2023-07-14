import React from "react";
import { useForm } from "react-hook-form";
import Header from "../Layout/Header";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { webAPI } from "../utils/constants";
import { useState } from "react";

const Register = () => {
    const {
        register,
        getValues,
        formState: { errors },
        handleSubmit,
    } = useForm();
    const [checkbox, setCheckbox] = useState(0);
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const onSubmit = async (data) => {
        axios.post(webAPI.register, data).then((res) => {
            console.log(res.data);
            if (res.data.success) {
                notification("success", res.data.message);
            } else {
                notification("error", res.data.message);
            }
        });
    };
    return (
        <div className="bg-[--site-main-color-home] font-logo h-full md:h-screen pb-10 px-2 flex flex-col">
            <Header />
            <Toaster />
            <div className="mt-[100px]">
                <div className="w-full p-6 m-auto bg-[--site-main-color3] rounded-md h-full lg:max-w-xl">
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
                        <div className="mb-2">
                            <div className="flex items-start w-full select-none">
                                <input
                                    id="link-checkbox"
                                    type="checkbox"
                                    onChange={() => setCheckbox(!checkbox)}
                                    className="mt-[2px] w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label
                                    for="link-checkbox"
                                    className="ml-2 text-sm font-thin text-gray-900 dark:text-[--site-card-icon]"
                                >
                                    By registering for Interactive Tutor you
                                    hereby accept our user{" "}
                                    <a
                                        href="https://www.interactive-tutor.com/user-terms-and-conditions"
                                        className="text-blue-600 dark:text-blue-500 hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        terms and conditions
                                    </a>
                                    .
                                </label>
                            </div>
                        </div>
                        <div className="mt-6">
                            {checkbox ? (
                                <button className="w-full px-4 py-2 tracking-wide text-[--site-main-color3] transition-colors duration-200 transform bg-[--site-main-Login] rounded-md hover:bg-[--site-main-Login1] focus:outline-none focus:bg-[--site-main-Login1]">
                                    Register
                                </button>
                            ) : (
                                <button
                                    className="w-full px-4 py-2 tracking-wide text-[--site-main-color3] transition-colors duration-200 transform bg-[--site-main-Login] rounded-md opacity-50 cursor-not-allowed"
                                    disabled
                                >
                                    Register
                                </button>
                            )}
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
