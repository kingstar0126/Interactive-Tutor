import axios from "axios";
import { webAPI } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Autocomplete from "react-google-autocomplete";
import { GOOGLE_MAP_API } from "../env";
import toast, { Toaster } from "react-hot-toast";
import { changeuser } from "../redux/actions/userAction";
import { MdManageAccounts } from "react-icons/md";

const ManageAccount = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const user = JSON.parse(useSelector((state) => state.user.user));
    const dispatch = useDispatch();

    const notification = (type, message) => {
        if (type === "error") {
            toast.error(message);
        }
        if (type === "success") {
            toast.success(message);
        }
    };

    const handleChange = () => {
        if (!username || !email || !state || !country || !city) {
            notification("error", "Please enter all values.");
            return;
        }

        if (phone && isValidPhoneNumber(phone)) {
            const data = {
                id: user.id,
                username: username,
                email: email,
                phone: phone,
                state,
                country,
                city,
            };
            axios
                .post(webAPI.changeuser, data)
                .then((res) => {
                    if (res.data.code === 200) {
                        notification("success", "Changed successfully");
                        const new_user = user;
                        new_user.email = email;
                        new_user.username = username;
                        changeuser(dispatch, new_user);
                    }
                })
                .catch((err) => console.error(err));
        }
    };

    useEffect(() => {
        axios
            .post(webAPI.getuser, { id: user.id })
            .then((res) => {
                setUsername(res.data.data.username);
                setEmail(res.data.data.email);
                setPhone(res.data.data.contact);
                setCity(res.data.data.city);
                setCountry(res.data.data.country);
                setState(res.data.data.state);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    return (
        <div className="w-full h-full py-4 pl-5 pr-10">
            <Toaster />
            <div className="flex items-center justify-between p-5 bg-[--site-card-icon-color] rounded-full">
                <div className="flex items-center justify-center gap-2 font-semibold text-[20px] text-white">
                    <MdManageAccounts className="fill-[--site-logo-text-color]" />
                    Account
                </div>
            </div>
            <div className="py-5">
                <div className="bg-[--site-card-icon-color] w-full h-full rounded-xl p-10 flex flex-col gap-5 ">
                    <div className="border-2 rounded-lg border-[--site-logo-text-color] p-5 items-center justify-start flex-col flex gap-5">
                        <div className="flex flex-col w-3/5">
                            <span className="text-[--site-main-color3] font-semibold">
                                Username
                            </span>
                            <input
                                type="text"
                                defaultValue={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-logo-text-color] focus:ring-[--site-logo-text-color] focus:outline-none focus:ring focus:ring-opacity-40"
                                placeholder="Please input your username"
                            />
                        </div>
                        <div className="flex flex-col w-3/5">
                            <span className="text-[--site-main-color3] font-semibold">
                                Email
                            </span>
                            <input
                                type="text"
                                defaultValue={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                }}
                                className="block w-full px-4 py-2 mt-2 text-[--site-main-Login] bg-[--site-main-color3] border rounded-md focus:border-[--site-logo-text-color] focus:ring-[--site-logo-text-color] focus:outline-none focus:ring focus:ring-opacity-40"
                                placeholder="Please input your email address"
                            />
                        </div>
                        <div className="flex flex-col w-3/5">
                            <span className="text-[--site-main-color3] font-semibold">
                                Contact
                            </span>
                            <div className="w-2/5">
                                <PhoneInput
                                    international
                                    countryCallingCodeEditable={false}
                                    value={phone}
                                    defaultCountry="GB"
                                    className="px-4 py-2 gap-2 bg-[--site-main-color3] rounded-lg focus-within:bg-[--site-logo-text-color]"
                                    onChange={(e) => {
                                        setPhone(e);
                                    }}
                                />
                            </div>
                            <span className=" font-normal text-[12px] text-[--site-error-text-color]">
                                {phone && !isValidPhoneNumber(phone)
                                    ? "Invalid phone number"
                                    : null}
                            </span>
                        </div>
                        <div className="flex flex-col w-3/5">
                            <span className="text-[--site-main-color3] font-semibold">
                                Address
                            </span>
                            <Autocomplete
                                defaultValue={city}
                                className="w-3/5 rounded-lg p-2 focus:ring-[--site-logo-text-color] focus:outline-none focus:ring focus:ring-opacity-40"
                                apiKey={GOOGLE_MAP_API}
                                onPlaceSelected={(place) => {
                                    const addressComponents =
                                        place.address_components;
                                    let _state, _country, _city;
                                    for (const component of addressComponents) {
                                        const componentType =
                                            component.types[0];

                                        if (
                                            componentType ===
                                            "administrative_area_level_1"
                                        ) {
                                            // State
                                            _state = component.short_name;
                                        }

                                        if (componentType === "country") {
                                            // Country
                                            _country = component.short_name;
                                        }

                                        if (componentType === "locality") {
                                            // City
                                            _city = component.short_name;
                                        }
                                    }

                                    setState(_state);
                                    setCountry(_country);
                                    setCity(_city);
                                }}
                            />
                        </div>
                        <div className="flex flex-col items-end w-3/5">
                            <button
                                onClick={(e) => handleChange()}
                                className="p-2 bg-[--site-logo-text-color] text-[--site-card-icon-color] font-semibold rounded-lg hover:scale-110 "
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageAccount;
