import { SET_USER } from "../type";
import { CHANGE_USER, GET_USER_ACCOUNT } from "../type";

const initialState = {
    user: localStorage.getItem("user") || null,
};

const userReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_USER:
        case CHANGE_USER:
        case GET_USER_ACCOUNT:
            localStorage.setItem("user", payload);
            return {
                ...state,
                user: localStorage.getItem("user"),
            };
        default:
            return state;
    }
};

export default userReducer;
