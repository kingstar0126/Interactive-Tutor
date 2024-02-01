import React from "react";
import { useForm } from "react-hook-form";
import Header from "../layout/Header";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { webAPI } from "../utils/constants";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Button } from "@material-tailwind/react";

const Register = () => {
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
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const email = searchParams.get("email") || "";
    const {
        register,
        formState: { errors },
        handleSubmit,
        getValues,
    } = useForm({
        defaultValues: {
            username: "", // Example initial value for the username field
            email: `${email}`, // Example initial value for the email field
            password: "", // Example initial value for the password field
            confirm: "", // Example initial value for the confirm field
        },
    });
    const onSubmit = async (data) => {
        console.log(data);
        axios.post(webAPI.register, data).then((res) => {
            if (res.data.success) {
                notification("success", res.data.message);
                navigate("/thankyou");
            } else {
                notification("error", res.data.message);
            }
        });
    };
    return (
        <div className="font-logo pb-10 px-2 flex flex-col">
            <Header />
            <Toaster className="z-30"/>
            <div>
            <div className="container p-6 m-auto rounded-md lg:max-w-xl flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <span className="text-3xl font-semibold text-start text-[--site-main-Login1]">
                            Register
                        </span>
                        <span className="text-start">
                            Register to create an account
                        </span>
                    </div>
                    <form
                        className="flex flex-col gap-3 py-3"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="gap-2 flex flex-col">
                            <label
                                htmlFor="username"
                                className="text-md font-medium text-[--site-main-Login-Text]"
                            >
                                Full name
                            </label>
                            <input
                                type="text"
                                name="username"
                                className="w-full p-4 text-[--site-main-Login] border rounded-md border-gray-800"
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
                            <div className="gap-2 flex flex-col">
                                <label
                                    htmlFor="email"
                                    className="text-md font-medium text-[--site-main-Login-Text]"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full p-4 text-[--site-main-Login] border rounded-md border-gray-800"
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
                        </div>
                        <div className="gap-2 flex flex-col">
                            <label
                                htmlFor="password"
                                className="text-md font-medium text-[--site-main-Login-Text]"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="w-full p-4 text-[--site-main-Login] border rounded-md border-gray-800"
                                placeholder="Please input your password"
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
                        <div className="gap-2 flex flex-col">
                            <label
                                htmlFor="confirm"
                                className="text-md font-medium text-[--site-main-Login-Text]"
                            >
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirm"
                                className="w-full p-4 text-[--site-main-Login] border rounded-md border-gray-800"
                                placeholder="Please re-enter your password"
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

                        <div className="flex items-start w-full select-none gap-2">
                            <input
                                id="link-checkbox"
                                type="checkbox"
                                onChange={() => setCheckbox(!checkbox)}
                                className="mt-[2px] w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded"
                            />
                            <label
                                htmlFor="link-checkbox"
                                className="text-md font-medium text-[--site-main-Login-Text] flex gap-2 flex-col"
                            >
                                By registering for Interactive Tutor you hereby
                                accept our user
                                <a
                                    href="https://www.interactive-tutor.com/user-terms-and-conditions"
                                    className="text-blue-600 dark:text-blue-500 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    terms and conditions
                                </a>
                            </label>
                        </div>
                        <div className="mt-6">
                            {checkbox ? (
                                <Button type="submit" className="normal-case w-full p-4 text-md rounded-md bg-[--site-main-Login1] text-[--site-file-upload]">
                                    Register
                                </Button>
                            ) : (
                                <Button
                                    className="normal-case w-full p-4 text-md rounded-md bg-[--site-main-Login1] text-[--site-file-upload] opacity-50 cursor-not-allowed"
                                    disabled
                                >
                                    Register
                                </Button>
                            )}
                        </div>
                    </form>

                    <p className="text-sm text-gray-600 flex gap-2 justify-center">
                        <span>Already have an account?</span>
                        <Link
                            to="/"
                            className="font-bold text-[--site-main-Login1]"
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
