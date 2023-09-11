import { SET_QUERY } from "../type";
import axios from "axios";
import { webAPI } from "../../utils/constants";

export const getquery = (dispatch, data) => {
    axios
        .post(webAPI.getquery, data)
        .then((res) => {
            dispatch({
                type: SET_QUERY,
                payload: res.data.query - res.data.usage,
            });
        })
        .catch((err) => {
            console.error(err);
        });
};

export const setquery = (dispatch, data) => {
    dispatch({ type: SET_QUERY, payload: data });
};
