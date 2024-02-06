import { stringConstant, webAPI } from "../../utils/constants";
import notification from "../../utils/notification";
import { SET_USER, GET_USER_ACCOUNT } from "../type";
import axios from "axios";
import { CHANGE_USER } from "../type";
import { SET_QUERY } from "../type";

export const getUser = (dispatch, data) => {
  dispatch({
    type: SET_USER,
    payload: JSON.stringify(data)
  });
};
//This is to get the free trial account days and choose the user's role !

export const getUseraccount = (dispatch, data) => {
  axios
    .post(webAPI.getuser, data)
    .then((res) => {
      if (res.status === 200) {
        if (res.data.success) {
          dispatch({ type: SET_QUERY, payload: res.data.data.query });
          dispatch({
            type: GET_USER_ACCOUNT,
            payload: JSON.stringify(res.data.data)
          });
        } else {
          notification("error", res.data.message);
        }
      } else {
        notification("error", stringConstant.FAILED_GET_DATA);
      }
    })
    .catch((err) => console.log(err));
};

export const changeuser = (dispatch, data) => {
  dispatch({ type: CHANGE_USER, payload: JSON.stringify(data) });
};
