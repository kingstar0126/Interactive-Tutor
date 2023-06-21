import { stringConstant, webAPI } from "../../utils/constants";
import notification from "../../utils/notification";
import { SET_USER } from "../type";
import axios from "axios";

export const getUser = (dispatch, data) => {
  axios
    .post(webAPI.login, data)
    .then((res) => {
      console.log(res);
      if (res.status === 200)
        if (res.data.success)
          dispatch({ type: SET_USER, payload: res.data.data });
        else notification("error", res.data.message);
      else notification("error", stringConstant.FAILED_GET_DATA);
    })
    .catch((err) => console.log(err));
};
