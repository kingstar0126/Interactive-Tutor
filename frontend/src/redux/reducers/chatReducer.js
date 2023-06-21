import { ADD_CHAT } from "../type";

const initialState = {
  chat: localStorage.getItem("chat"),
};

const chatReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case ADD_CHAT:
      localStorage.setItem("chat", payload);
      return {
        ...state,
        chat: localStorage.getItem("chat"),
      };
    default:
      return state;
  }
};

export default chatReducer;
