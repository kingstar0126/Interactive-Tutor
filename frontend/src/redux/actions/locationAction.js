import { SET_LOCATION } from "../type";

export const setlocation = (dispatch, data) => {
  dispatch({ type: SET_LOCATION, payload: data });
};
