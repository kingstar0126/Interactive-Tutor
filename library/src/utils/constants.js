import { SERVER_URL } from "../config/constant";
export const stringConstant = {
    FAILED_GET_DATA: "Failed to get data",
};

export const webAPI = {
    getpublishchats: SERVER_URL + "/api/getpublishchats",
    sendreview: SERVER_URL + "/api/sendreview",
    getreviews: SERVER_URL + "/api/getallreviews",
    addbadge: SERVER_URL + "/api/addbadge",
    sendemail: SERVER_URL + "/api/sendemail",
};
