import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Header from "../Layout/Header";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "../redux/actions/userAction";
import { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { setOpenSidebar } from "../redux/actions/locationAction";
import { Button } from "@material-tailwind/react";

const Login = () => {
    const statedata = JSON.parse(useSelector((state) => state.user.user));
    const isOpenSidebar = useSelector((state) => state.location.openSidebar);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [status, Setstatus] = useState(1);
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm();

    const handleOpenSidebar = () => {
        // dispatch(setOpenSidebar());
    };

    useEffect(() => {
        if (statedata && statedata.username) {
            Setstatus(0);
        }
    }, [statedata]);

    useEffect(() => {
        if (isOpenSidebar) {
            handleOpenSidebar();
        }
        if (status === 0) {
            navigate("/chatbot/chat");
            Setstatus(1);
        }
    }, [status]);
    const onSubmit = async (data) => {
        getUser(dispatch, data);
    };
    return (
        <div className="font-logo pb-10 px-2 flex flex-col">
            <Header />
            <Toaster className="z-30"/>
            <div>
                <div className="container p-6 m-auto rounded-md lg:max-w-xl flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <span className="text-3xl font-semibold text-start text-[--site-main-Login1]">
                            Login
                        </span>
                        <span className="text-start">
                            Log in to your account
                        </span>
                    </div>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex flex-col gap-3 py-3"
                    >
                        <div className="gap-2 flex flex-col">
                            <label
                                htmlFor="email"
                                className="text-md font-medium text-[--site-main-Login-Text]"
                            >
                                Enter full email address
                            </label>
                            <input
                                type="email"
                                name="email"
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
                                <div className="text-sm font-semibold mb-2 text-[--site-main-form-error]">
                                    {errors.password.message}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-row justify-between">
                            <Link
                                to="/changepassword"
                                className="text-sm text-gray-600 justify-end"
                            >
                                Change password
                            </Link>
                            <Link
                                to="/resetpassword"
                                className="text-sm text-gray-600"
                            >
                                Forget Password?
                            </Link>
                        </div>

                        <div className="mt-8">
                            <Button
                                type="submit"
                                className="normal-case w-full p-4 text-md rounded-md bg-[--site-main-Login1] text-[--site-file-upload]"
                            >
                                Login
                            </Button>
                        </div>
                    </form>

                    <p className="text-sm text-gray-600 flex gap-2 justify-center">
                        <span>Don't have an account?</span>
                        <Link
                            to="/register"
                            className="font-bold text-[--site-main-Login1] hover:underline"
                        >
                            Register
                        </Link>
                    </p>
                </div>
                {status === 1 && <div></div>}
            </div>
        </div>
    );
};

export default Login;
