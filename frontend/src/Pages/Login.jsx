import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Header from "../Layout/Header";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getUser } from "../redux/actions/userAction";
import { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { setOpenSidebar } from "../redux/actions/locationAction";

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
        dispatch(setOpenSidebar());
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
        <div className="bg-[--site-main-color-home] font-logo h-screen pb-10 px-2 flex flex-col">
            <Header />
            <Toaster />
            <div className="mt-[100px]">
                <div className="w-full p-6 m-auto bg-[--site-main-color3] rounded-md h-full lg:max-w-xl">
                    <h1 className="text-3xl font-semibold text-center text-[--site-main-Login1] underline uppercase">
                        Login
                    </h1>
                    <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-2">
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
                                className="text-xs text-[--site-card-icon-color] hover:underline justify-end"
                            >
                                Change password
                            </Link>
                            <Link
                                to="/resetpassword"
                                className="text-xs text-[--site-card-icon-color] hover:underline"
                            >
                                Forget Password?
                            </Link>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full px-4 py-2 tracking-wide text-[--site-main-color3] transition-colors duration-200 transform bg-[--site-main-Login] rounded-md hover:bg-[--site-main-Login1] focus:outline-none focus:bg-[--site-main-Login1]"
                            >
                                Login
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-xs font-light text-center text-[--site-main-Login-Text]">
                        {" "}
                        Don't have an account?{" "}
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
