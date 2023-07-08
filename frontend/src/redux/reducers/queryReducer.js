import { SET_QUERY } from "../type";

const initialState = {
    query: localStorage.getItem("query") || null,
};

const queryReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_QUERY:
            localStorage.setItem("query", payload);
            return {
                ...state,
                query: localStorage.getItem("query"),
            };
        default:
            return state;
    }
};

export default queryReducer;
