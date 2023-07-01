import { SET_USER } from "../type";

const initialState = {
  user: localStorage.getItem("user"),
};

const userReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SET_USER:
      localStorage.setItem("user", payload);
      return {
        ...state,
        user: localStorage.getItem("user"),
      };
    default:
      return state;
  }
};

export default userReducer;
