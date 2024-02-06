import { apiFetch } from "./helper";
import { webAPI } from "../../utils/constants";
import { HttpMethod } from "./method";

export const login = (data) => {
  return apiFetch(webAPI.login, {
    method: HttpMethod.POST,
    data
  });
};
