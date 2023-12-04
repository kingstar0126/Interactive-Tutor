import { SET_QUERY } from "../type";

const initialState = {
    query: sessionStorage.getItem("query") || null,
};

const queryReducer = (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case SET_QUERY:
            sessionStorage.setItem("query", payload);
            return {
                ...state,
                query: sessionStorage.getItem("query"),
            };
        default:
            return state;
    }
};

export default queryReducer;
