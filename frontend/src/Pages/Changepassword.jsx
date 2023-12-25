import React from "react";
import { useForm } from "react-hook-form";
import Header from "../Layout/Header";
import axios from "axios";
import { webAPI } from "../utils/constants";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Button } from "@material-tailwind/react";

const Register = () => {
    const {
        register,
        getValues,
        formState: { errors },
        handleSubmit,
    } = useForm();

    const onSubmit = async (data) => {
        axios
            .post(webAPI.changepassword, data)
            .then((res) => notification("success", res.data.message))
            .catch((err) => notification("error", "Failed to change password"));
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
    return (
        <div className="font-logo pb-10 px-2 flex flex-col">
            <Header />
            <Toaster className="z-30"/>
            <div>
                <div className="container p-6 m-auto rounded-md lg:max-w-xl flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <span className="text-3xl font-semibold text-start text-[--site-main-Login1]">
                            Change Password
                        </span>
                    </div>
                    <span className="text-start">Change your password</span>
                    <form
                        className="flex flex-col gap-3 py-3"
                        onSubmit={handleSubmit(onSubmit)}
                    >
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
                                placeholder="Please input your original password"
                                {...register("old password", {
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
                                htmlFor="password"
                                className="text-md font-medium text-[--site-main-Login-Text]"
                            >
                                New Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="w-full p-4 text-[--site-main-Login] border rounded-md border-gray-800"
                                placeholder="Please input your new password"
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
                        <div className="mt-6">
                            <Button type="submit" className="normal-case w-full p-4 text-md rounded-md bg-[--site-main-Login1] text-[--site-file-upload]">
                                Change
                            </Button>
                        </div>
                    </form>

                    <p className="text-sm text-gray-600 flex gap-2 justify-center">
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
