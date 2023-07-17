import axios from "axios";
import toast from "react-hot-toast";
import { webAPI } from "../utils/constants";
import Select from "react-select";
import { useState } from "react";

const Adduser = (props) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [subscription, setSubscription] = useState("Starter");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const onOK = () => {
        if (
            !username ||
            !email ||
            !subscription ||
            !password ||
            !confirmPassword
        ) {
            notification("error", "Please fill all required fields");
            return;
        }
        if (password !== confirmPassword) {
            notification("error", "Passwords are not the same");
            return;
        }
        const data = {
            username,
            email,
            subscription,
            password,
            confirmPassword,
        };
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");

        axios
            .post(webAPI.adduseraccount, data)
            .then((res) => {
                if (res.data.success) {
                    {
                        props.handleOk();
                    }
                } else {
                    notification("error", res.data.message);
                }
            })
            .catch((err) => console.error(err));
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

    const showHideClassname = props.open
        ? "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
        : "hidden";

    return (
        <div className={showHideClassname}>
            <div className="relative w-3/5 p-5 mx-auto bg-[--site-card-icon-color] text-white rounded-md shadow-lg top-20">
                <div className="flex flex-col items-center justify-center w-full gap-5">
                    <div className="w-2/3 mb-2">
                        <label
                            htmlFor="username"
                            className="block text-sm font-semibold text-[--site-main-color3]"
                        >
                            Full name
                        </label>
                        <input
                            type="text"
                            name="username"
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full px-4 py-2 mt-2 mb-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                            placeholder="Please input your full name"
                        />

                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-[--site-main-color3]"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                            placeholder="Please input your email address"
                        />
                    </div>

                    <div className="w-2/3 mb-2">
                        <label
                            htmlFor="confirm"
                            className="block text-sm font-semibold text-[--site-main-color3]"
                        >
                            SubScription
                        </label>
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
                    </div>
                    <div className="w-2/3 mb-2">
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-[--site-main-color3]"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                            placeholder="********"
                        />
                    </div>
                    <div className="w-2/3 mb-2">
                        <label
                            htmlFor="confirm"
                            className="block text-sm font-semibold text-[--site-main-color3]"
                        >
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirm"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                            placeholder="********"
                        />
                    </div>
                    <div className="flex justify-between w-2/3">
                        <button
                            onClick={props.handleCancel}
                            className="w-auto px-4 py-2 text-base text-[--site-card-icon-color] font-semibold border bg-[--site-main-color3] rounded-md shadow-sm hover:scale-[105%] focus:outline-none focus:ring-2 focus:ring-green-300"
                        >
                            cancel
                        </button>

                        <button
                            onClick={() => onOK()}
                            className="w-auto px-4 py-2 text-[--site-card-icon-color] bg-[--site-logo-text-color] border rounded-md shadow-sm hover:scale-[105%] focus:outline-none focus:ring-2 focus:ring-green-300 font-semibold"
                        >
                            confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Adduser;
