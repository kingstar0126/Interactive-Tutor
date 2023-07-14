import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { webAPI } from "../utils/constants";
import toast, { Toaster } from "react-hot-toast";
import notification from "../utils/notification";

const VerifyEmail = () => {
    const navigate = useNavigate();
    let location = useLocation();
    useEffect(() => {
        const url = location.pathname;
        const token = url.split("=")[1];
        if (token) {
            axios
                .post(webAPI.email_verification, { token })
                .then((res) => {
                    if (res.data.success) {
                        setTimeout(() => {
                            toast.success(res.data.message);
                        }, 3000);
                        navigate("/");
                    } else {
                        setTimeout(() => {
                            toast.error(res.data.message);
                        }, 3000);
                        navigate("/");
                    }
                })
                .catch((err) => {
                    console.error(err);
                    navigate("/");
                });
        } else {
            navigate("/");
        }
    }, []);
    return <Toaster />;
};

export default VerifyEmail;
