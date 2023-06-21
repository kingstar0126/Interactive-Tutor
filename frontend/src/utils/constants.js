import { SERVER_URL } from "../config/constant";
export const stringConstant = {
  FAILED_GET_DATA: "Failed to get data",
};

export const webAPI = {
  login: SERVER_URL + "/api/login",
  addchat: SERVER_URL + "/api/addchat",
  getchats: SERVER_URL + "/api/getchats",
  updatechat: SERVER_URL + "/api/updatechat",
  deletechat: SERVER_URL + "/api/deletechat",
};
