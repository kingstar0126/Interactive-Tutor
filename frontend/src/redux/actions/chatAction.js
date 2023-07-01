import { stringConstant, webAPI } from "../../utils/constants";
import notification from "../../utils/notification";
import { ADD_CHAT } from "../type";
import { GET_CHAT } from "../type";
import { SET_CHATBOT } from "../type";
import { GET_CHATBOT } from "../type";
import axios from "axios";

export const addchat = (dispatch, data) => {
    axios
        .post(webAPI.addchat, data)
        .then((res) => {
            if (res.status === 200)
                dispatch({ type: ADD_CHAT, payload: res.data.data });
            else notification("error", stringConstant.FAILED_GET_DATA);
        })
        .catch((err) => console.log(err));
};

export const getchat = (dispatch, data) => {
    console.log(data)
    dispatch({ type: GET_CHAT, payload: JSON.stringify(data) });
};

export const setchatbot = (dispatch, data) => {
    axios
        .post(webAPI.start_message, data)
        .then((res) => {
            if (res.status === 200) {
                dispatch({ type: SET_CHATBOT, payload: res.data.data });
            } else notification("error", stringConstant.FAILED_GET_DATA);
        })
        .catch((err) => console.log(err));
};

export const getchatbot = (dispatch, data) => {
    axios
        .post(webAPI.get_message, data)
        .then((res) => {
            console.log(res);
            if (res.status === 200)
                dispatch({ type: GET_CHATBOT, payload: res.data.data });
            else notification("error", stringConstant.FAILED_GET_DATA);
        })
        .catch((err) => console.log(err));
};
