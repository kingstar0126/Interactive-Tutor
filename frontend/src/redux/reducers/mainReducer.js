import { combineReducers } from "@reduxjs/toolkit";

import userReducer from "./userReducer";
import chatReducer from "./chatReducer";
import locationReducer from "./locationReducer";
import queryReducer from "./queryReducer";

const mainReducer = combineReducers({
    user: userReducer,
    chat: chatReducer,
    location: locationReducer,
    query: queryReducer,
});

export default mainReducer;
