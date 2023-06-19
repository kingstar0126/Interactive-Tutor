import React from "react";
import { useForm } from "react-hook-form";
import Header from "../Layout/Header";

const Forgetpassword = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const onSubmit = async (data) => {
    const fields = { fields: data };
    console.log(fields);
  };

  return (
    <React.Fragment>
      <Header />
      <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
        <div className="w-full p-6 m-auto bg-[--site-main-color3] rounded-md shadow-xl shadow-rose-600/40 ring-2 ring-[--site-main-Login1] lg:max-w-xl">
          <h1 className="text-3xl font-semibold text-center text-[--site-main-Login] underline uppercase">
            Password reset
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
                className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="Please input your email address"
                {...register("email", {
                  required: "Your e-mail address is required.",
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
              <button className="w-full px-4 py-2 tracking-wide text-[--site-main-color3] transition-colors duration-200 transform bg-[--site-main-Login] rounded-md hover:bg-[--site-main-Login1] focus:outline-none focus:bg-[--site-main-Login1]">
                Reset
              </button>
            </div>
          </form>

          <p className="mt-8 text-xs font-light text-center text-[--site-main-Login-Text]">
            {" "}
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-[--site-main-Login1] hover:underline"
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Forgetpassword;
