import React from "react";
import Header from "../Layout/Header";
import { Outlet } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import PinField from "react-pin-field";
import { webAPI } from "../utils/constants";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRef } from "react";
import { getchat } from "../redux/actions/chatAction";

const AccessChatbot = () => {
    const chat = JSON.parse(useSelector((state) => state.chat.chat));
    const [error, SetError] = useState(false);
    const [organization, setOrganization] = useState("");
    const [validate, SetValidate] = useState(false);
    const [pin, setPin] = useState(0);
    const pinField = useRef(null);
    const [status, setStatus] = useState(false);
    const dispatch = useDispatch();
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const submit = async () => {
        if (!organization || !pin) {
            return;
        }
        await axios
            .post(webAPI.getChatwithPIN, {
                organization: organization,
                pin: pin,
            })
            .then((res) => {
                console.log(res.data);
                if (res.data.success === false) {
                    notification("error", res.data.message);
                    setStatus(false);
                } else {
                    getchat(dispatch, res.data.data);
                    setStatus(true);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleComplete = async (value) => {
        console.log(value, organization);
        setPin(value);

        pinField.current.forEach((input) => (input.value = ""));
        pinField.current[0].focus();
        submit();
    };

    return (
        <div className="bg-[--site-main-color-home] font-logo h-screen flex flex-col">
            <Header />
            <Toaster />
            {status == false && (
                <div className="mt-[100px]">
                    <div className="w-full p-6 m-auto bg-[--site-main-color3] rounded-md h-full lg:max-w-xl">
                        <h1 className="text-3xl font-semibold text-center text-[--site-main-Login] underline">
                            AI Tutor
                        </h1>
                        <div className="mt-6">
                            <div className="mb-2">
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-semibold text-[--site-main-Login-Text]"
                                >
                                    Organizaiotn ID
                                </label>
                                <input
                                    type="text"
                                    onChange={(e) =>
                                        setOrganization(e.target.value)
                                    }
                                    placeholder="First, enter your Organization ID."
                                    className="block w-full px-4 py-2 mt-2 mb-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-main-Login-border-focus] focus:ring-[--site-main-Login-border-focus] focus:outline-none focus:ring focus:ring-opacity-40"
                                    required
                                />
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-[--site-main-Login-Text]"
                                >
                                    PIN
                                </label>
                                <div className="flex gap-2">
                                    <PinField
                                        name="chatdescription"
                                        length={6}
                                        type="password"
                                        inputMode="numeric"
                                        onRejectKey={() => {
                                            SetValidate(true);
                                        }}
                                        onResolveKey={() => {
                                            SetValidate(false);
                                        }}
                                        ref={pinField}
                                        validate="0123456789"
                                        onComplete={handleComplete}
                                        className="mb-1 w-[40px] p-[15px] items-center justify-center h-[40px] focus:border-none focus:ring-opacity-40 text-[--site-card-icon-color] focus:outline-none focus:ring focus:border-[--site-main-color4] border rounded-lg hover:border-[--site-main-color5]"
                                    />
                                </div>
                                <div className="mb=2">
                                    {validate && (
                                        <span className="text-[--site-main-form-error] text-[12px]">
                                            The PIN must be number
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {chat && status && <Outlet />}
        </div>
    );
};

export default AccessChatbot;
