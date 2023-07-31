import { SET_LOCATION, SET_OPEN_SIDEBAR } from "../type";

export const setlocation = (dispatch, data) => {
    dispatch({ type: SET_LOCATION, payload: data });
};

export const setOpenSidebar = () => {
    return { type: SET_OPEN_SIDEBAR };
};
