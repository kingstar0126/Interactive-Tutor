import React from "react";
import { useForm } from "react-hook-form";
import Header from "../Layout/Header";
import { SERVER_URL } from "../config/constant";
import axios from "axios";

const Register = () => {
  const {
    register,
    getValues,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const onSubmit = async (data) => {
    axios.post(`${SERVER_URL}/api/signup`, data).then((res) => {
      console.log(res);
    });
    console.log(data);
  };
  return (
    <React.Fragment>
      <Header />
      <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
        <div className="w-full p-6 m-auto bg-[--site-main-color3] rounded-md shadow-xl shadow-rose-600/40 ring-2 ring-[--site-main-Login1] lg:max-w-xl">
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
                placeholder="Please input your full name"
                {...register("username", {
                  required: "Username is required.",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                })}
              />
              {errors.username && (
                <p className="text-xs italic text-red-500">
                  {errors.name.message}
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
                    message: "Password must be at least 8 characters",
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
            <a
              href="/login"
              className="font-medium text-[--site-main-Login1] hover:underline"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Register;
