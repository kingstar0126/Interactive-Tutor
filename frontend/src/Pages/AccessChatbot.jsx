import React from "react";
import Header from "../Layout/Header";
import { Outlet } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import PinField from "react-pin-field";
import { webAPI } from "../utils/constants";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import { useLocation } from "react-router-dom";
import { setlocation } from "../redux/actions/locationAction";
import { setchatbot, getchat } from "../redux/actions/chatAction";

const AccessChatbot = () => {
    const chatState = useSelector((state) => state.chat.chat);
    const chat = chatState && JSON.parse(chatState) || {};
    const [error, SetError] = useState(false);
    const navigate = useNavigate();
    const [organization, setOrganization] = useState("");
    const [validate, SetValidate] = useState(false);
    let location = useLocation();
    const chatbot = useSelector((state) => state.chat.chatbot);
    const dispatch = useDispatch();
    const pinField = useRef(null);
    const [status, setStatus] = useState(false);
    const [isloading, setLoadindg] = useState(false);
    const notification = (type, message) => {
        // To do in here
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const submit = async (pin) => {
        await axios
            .post(webAPI.getChatwithPIN, {
                organization: organization,
                pin: pin,
            })
            .then(async (res) => {
                if (res.data.success === false) {
                    notification("error", res.data.message);
                    setLoadindg(false);
                    setStatus(false);
                    alert('Failed')
                } else {
                    alert('Success')
                    getchat(dispatch, res.data.data);
                    let chat = res.data.data;
                    let response = await axios.get("https://geolocation-db.com/json/")
                    alert(response.data.country_name)
                    let country = response.data.country_name || ''
                    chat["country"] = country;
                    setchatbot(dispatch, chat);
                    setStatus(true);
                    navigate("newchat");
                }
            });
    };

    const handleComplete = async (value) => {
        submit(value);
        setLoadindg(true);
    };

    return (
        <div className="bg-[--site-main-color-home] font-logo h-screen pb-10">
            {status === false && <Header />}
            <Toaster />
            {status === false && (
                <div className="mt-[100px]">
                    <div className="w-full p-6 m-auto bg-[--site-main-color3] rounded-md h-full lg:max-w-xl">
                        <h1 className="text-3xl font-semibold text-center text-[--site-main-Login] underline">
                            AI Tutor
                        </h1>
                        {isloading ? (
                            <div className="flex items-center justify-center mt-6">
                                <ReactLoading
                                    type="spin"
                                    color="#153144"
                                    height={40}
                                    width={40}
                                    delay={15}
                                ></ReactLoading>
                            </div>
                        ) : (
                            <div className="mt-6">
                                <div className="mb-2">
                                    <label
                                        htmlFor="username"
                                        className="block text-sm font-semibold text-[--site-main-Login-Text]"
                                    >
                                        Organisation ID
                                    </label>
                                    <input
                                        type="text"
                                        onChange={(e) =>
                                            setOrganization(e.target.value)
                                        }
                                        placeholder="First, enter your Organisation ID."
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
                        )}
                    </div>
                </div>
            )}
            {chat && status && <Outlet />}
        </div>
    );
};

export default AccessChatbot;
