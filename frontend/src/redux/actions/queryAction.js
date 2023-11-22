import { SET_QUERY } from "../type";
import axios from "axios";
import { webAPI } from "../../utils/constants";

export const getquery = (dispatch, data) => {
    axios
        .post(webAPI.getquery, data)
        .then((res) => {
            if (res.data.success)
                dispatch({
                    type: SET_QUERY,
                    payload: Math.max(res.data.query - res.data.usage, 0),
                });
        })
        .catch((err) => {
            console.error(err);
        });
};

export const setquery = (dispatch, data) => {
    dispatch({ type: SET_QUERY, payload: data });
};
