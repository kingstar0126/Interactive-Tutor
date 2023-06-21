import { combineReducers } from "@reduxjs/toolkit";

import userReducer from "./userReducer";
import chatReducer from "./chatReducer";

const mainReducer = combineReducers({
  user: userReducer,
  chat: chatReducer,
});

export default mainReducer;
