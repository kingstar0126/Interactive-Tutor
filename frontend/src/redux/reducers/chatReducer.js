import { ADD_CHAT } from "../type";
import { GET_CHAT } from "../type";
import { SET_CHATBOT } from "../type";
import { GET_CHATBOT } from "../type";
import { UPDATE_CHAT } from "../type";

const initialState = {
    chat: JSON.stringify({}),
    chatbot: '',
    chatmessage: sessionStorage.getItem("chatmessage"),
    isUpdate: false,
};

const chatReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case ADD_CHAT:
            return {
                ...state,
                chat: JSON.stringify(payload),
            };
        case GET_CHAT:
            return {
                ...state,
                chat: payload,
            };
        case SET_CHATBOT:
            return {
                ...state,
                chatbot: payload,
            };
        case GET_CHATBOT:
            sessionStorage.setItem("chatmessage", payload);
            return {
                ...state,
                chatmessage: sessionStorage.getItem("chatmessage"),
            };
        case UPDATE_CHAT:
            return {
                ...state,
                isUpdate: payload
            }
        default:
            return state;
    }
};

export default chatReducer;
