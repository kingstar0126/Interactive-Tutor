import { stringConstant, webAPI } from "../../utils/constants";
import notification from "../../utils/notification";
import { ADD_CHAT } from "../type";
import axios from "axios";

export const addchat = (dispatch, data) => {
  axios
    .post(webAPI.addchat, data)
    .then((res) => {
      console.log(res);
      if (res.status === 200)
        dispatch({ type: ADD_CHAT, payload: res.data.data });
      else notification("error", stringConstant.FAILED_GET_DATA);
    })
    .catch((err) => console.log(err));
};
