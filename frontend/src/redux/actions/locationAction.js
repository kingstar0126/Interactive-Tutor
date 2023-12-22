import { SET_LOCATION, SET_OPEN_SIDEBAR } from "../type";

export const setlocation = (dispatch, data) => {
    dispatch({ type: SET_LOCATION, payload: data });
};

export const setOpenSidebar = (dispatch, data) => {
    console.log('HIHIHI', data)
    dispatch ({ type: SET_OPEN_SIDEBAR, payload: data});
};
