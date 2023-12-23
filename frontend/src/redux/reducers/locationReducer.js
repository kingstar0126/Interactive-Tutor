import { SET_LOCATION, SET_OPEN_SIDEBAR } from "../type";

const initialState = {
    previous_location: sessionStorage.getItem("location.previous"),
    current_location: sessionStorage.getItem("location.current"),
    openSidebar: false,
};

const chatReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_LOCATION:
            sessionStorage.setItem(
                "location.previous",
                sessionStorage.getItem("location.current")
            );
            sessionStorage.setItem("location.current", payload);
            return {
                ...state,
                previous_location: sessionStorage.getItem("location.previous"),
                current_location: sessionStorage.getItem("location.current"),
            };
        case SET_OPEN_SIDEBAR:
            return {
                ...state,
                openSidebar: payload,
            };
        default:
            return state;
    }
};

export default chatReducer;
