import { SET_LOCATION, SET_OPEN_SIDEBAR } from "../type";

const initialState = {
    previous_location: localStorage.getItem("location.previous"),
    current_location: localStorage.getItem("location.current"),
    openSidebar: true,
};

const chatReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_LOCATION:
            localStorage.setItem(
                "location.previous",
                localStorage.getItem("location.current")
            );
            localStorage.setItem("location.current", payload);
            return {
                ...state,
                previous_location: localStorage.getItem("location.previous"),
                current_location: localStorage.getItem("location.current"),
            };
        case SET_OPEN_SIDEBAR:
            return {
                ...state,
                openSidebar: !state.openSidebar,
            };
        default:
            return state;
    }
};

export default chatReducer;
