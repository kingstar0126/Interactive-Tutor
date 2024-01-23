import { stringConstant, webAPI } from "../../utils/constants";
import notification from "../../utils/notification";
import { ADD_CHAT } from "../type";
import { GET_CHAT } from "../type";
import { SET_CHATBOT } from "../type";
import { GET_CHATBOT } from "../type";
import { UPDATE_CHAT } from "../type";

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
    dispatch({ type: GET_CHAT, payload: JSON.stringify(data) });
};

export const setchatbot = (dispatch, data) => {
    axios
        .post(webAPI.start_message, data)
        .then((res) => {
            if (res.status === 200) {
                if (res.data.success) {
                    dispatch({ type: SET_CHATBOT, payload: res.data.data });
                } else {
                    notification("error", 'Failed to create chat!');
                }
            } else notification("error", stringConstant.FAILED_GET_DATA);
        })
        .catch((err) => console.log(err));
};

export const getchatbot = (dispatch, data) => {
    axios
        .post(webAPI.get_message, data)
        .then((res) => {
            if (res.status === 200)
                dispatch({ type: GET_CHATBOT, payload: res.data.data });
            else notification("error", stringConstant.FAILED_GET_DATA);
        })
        .catch((err) => console.log(err));
};

export const updatechatbot = (dispatch, data) => {
    dispatch({ type: UPDATE_CHAT, payload: data });
};
