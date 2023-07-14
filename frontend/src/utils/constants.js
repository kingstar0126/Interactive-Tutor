import { SERVER_URL } from "../config/constant";
export const stringConstant = {
    FAILED_GET_DATA: "Failed to get data",
};

export const webAPI = {
    email_verification: SERVER_URL + "/api/email_verification",
    getuseraccount: SERVER_URL + "/api/getuseraccount",
    register: SERVER_URL + "/api/signup",
    adduseraccount: SERVER_URL + "/api/adduseraccount",
    getuser: SERVER_URL + "/api/getaccount",
    getallusers: SERVER_URL + "/api/getallaccounts",
    changeuser: SERVER_URL + "/api/changeaccount",
    changeuserstatus: SERVER_URL + "/api/changeaccountstatus",
    deleteuser: SERVER_URL + "/api/deleteaccount",

    forget: SERVER_URL + "/api/reset",
    changepassword: SERVER_URL + "/api/change",
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
    get_all_messages: SERVER_URL + "/api/getallmessages",
    get_report_data: SERVER_URL + "/api/getreportdata",
    //THis is the send traindata to server

    sendurl: SERVER_URL + "/api/data/sendurl",
    sendfile: SERVER_URL + "/api/data/sendfile",
    sendtext: SERVER_URL + "/api/data/sendtext",
    gettraindatas: SERVER_URL + "/api/data/gettraindatas",
    deletetrain: SERVER_URL + "/api/data/deletetrain",

    //stripe route

    create_product: SERVER_URL + "/api/create/product", // user_id
    // get_products: SERVER_URL + "/api/getproducts",
    get_all_products: SERVER_URL + "/api/getallproducts",
    update_product: SERVER_URL + "/api/update/product", //user_id, product_id
    delete_product: SERVER_URL + "/api/delete/product", //user_id, product_id
    delete_all_product: SERVER_URL + "/api/delete/all_products", //user_id

    create_checkout: SERVER_URL + "/api/create/checkout/session", //
    create_customer: SERVER_URL + "/api/create-customer",
    updateSubscription: SERVER_URL + "/api/update/subscription",

    getaccess_AI_Tutor: SERVER_URL + "/api/getaccess_ai_tutor", //chatbot uuid to get pin code and organization code
    getquery: SERVER_URL + "/api/getquery",
    getChatwithPIN: SERVER_URL + "/api/getchatwithpin",

    imageupload: SERVER_URL + "/api/imageupload",
};
