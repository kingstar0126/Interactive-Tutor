import { combineReducers } from "@reduxjs/toolkit";

import userReducer from "./userReducer";
import chatReducer from "./chatReducer";
import locationReducer from "./locationReducer";

const mainReducer = combineReducers({
  user: userReducer,
  chat: chatReducer,
  location: locationReducer,
});

export default mainReducer;
