import { SERVER_URL } from "../config/constant";
export const stringConstant = {
    FAILED_GET_DATA: "Failed to get data",
};

export const webAPI = {
    login: SERVER_URL + "/api/login",
    addchat: SERVER_URL + "/api/addchat",
    getchat: SERVER_URL + "/api/getchat",
    getchats: SERVER_URL + "/api/getchats",
    updatechat: SERVER_URL + "/api/updatechat",
    deletechat: SERVER_URL + "/api/deletechat",
    start_message: SERVER_URL + "/api/createmessage",
    sendchat: SERVER_URL + "/api/sendchat",
    get_message: SERVER_URL + "/api/getchatmessage",
    send_bubble_chat: SERVER_URL + "/api/sendchatbubble",
    send_branding: SERVER_URL + "/api/sendbrandingdata",
    get_messages: SERVER_URL + "/api/getmessages",
    delete_message: SERVER_URL + "/api/deletemessage",

    //THis is the send traindata to server

    sendurl: SERVER_URL + "/api/data/sendurl",
    sendfile: SERVER_URL + "/api/data/sendfile",
    sendtext: SERVER_URL + "/api/data/sendtext",
    gettraindatas: SERVER_URL + "/api/data/gettraindatas",
    deletetrain: SERVER_URL + "/api/data/deletetrain",
};
