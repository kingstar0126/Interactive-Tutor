import React from "react";
import { useForm } from "react-hook-form";
import Header from "../Layout/Header";
import axios from "axios";
import { webAPI } from "../utils/constants";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Button } from "@material-tailwind/react";

const Forgetpassword = () => {
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm();

    const onSubmit = async (data) => {
        axios
            .post(webAPI.forget, data)
            .then((res) => notification("success", res.data.message))
            .catch((err) => notification("error", "Your address doesn't exit"));
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
                            Password reset
                        </span>
                    </div>
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
                                className="w-full p-4 text-[--site-main-Login] border rounded-md border-gray-800"
                                placeholder="Please input your email address"
                                {...register("email", {
                                    required:
                                        "Your e-mail address is required.",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                            />
                            {errors.email && (
                                <div className="text-sm font-semibold mb-2 text-[--site-main-form-error]">
                                    {errors.email.message}
                                </div>
                            )}
                        </div>
                        <div className="mt-6">
                            <Button type="submit" className="normal-case w-full p-4 text-md rounded-md bg-[--site-main-Login1] text-[--site-file-upload]">
                                Reset
                            </Button>
                        </div>
                    </form>

                    <p className="text-sm text-gray-600 flex gap-2 justify-center">
                        {" "}
                        Don't have an account?{" "}
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

export default Forgetpassword;
