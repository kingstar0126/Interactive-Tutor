import { SERVER_URL } from "../config/constant";
export const stringConstant = {
    FAILED_GET_DATA: "Failed to get data",
};

export const webAPI = {
    email_verification: SERVER_URL + "/api/email_verification",
    register: SERVER_URL + "/api/signup",
    adduseraccount: SERVER_URL + "/api/adduseraccount",
    getuser: SERVER_URL + "/api/getaccount",
    getallusers: SERVER_URL + "/api/getallaccounts",
    checkUserInvite: SERVER_URL + "/api/checkUserInvite",
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
    get_system_prompt: SERVER_URL + "/api/generate_system_prompt",
    //THis is the send traindata to server

    sendurl: SERVER_URL + "/api/data/sendurl",
    sendfile: SERVER_URL + "/api/data/sendfile",
    sendtext: SERVER_URL + "/api/data/sendtext",
    sendapi: SERVER_URL + "/api/data/sendapi", //choose the API
    sendapikey: SERVER_URL + "/api/wonde/sendapikey", //send the select API key. this is only user role == 7
    getapikey: SERVER_URL + "/api/wonde/getapikey",
    taskstatus: SERVER_URL + "/api/wonde/taskstatus/",
    gettraindatas: SERVER_URL + "/api/data/gettraindatas",
    deletetrain: SERVER_URL + "/api/data/deletetrain",

    //stripe route

    create_product: SERVER_URL + "/api/create/product", // user_id
    // get_products: SERVER_URL + "/api/getproducts",
    get_all_products: SERVER_URL + "/api/getallproducts",
    update_product: SERVER_URL + "/api/update/product", //user_id, product_id
    cancel_subscription: SERVER_URL + "/api/cancel/subscription",
    delete_product: SERVER_URL + "/api/delete/product", //user_id, product_id
    delete_all_product: SERVER_URL + "/api/delete/all_products", //user_id

    create_checkout: SERVER_URL + "/api/create/checkout/session",
    create_checkout_query: SERVER_URL + "/api/create/checkout/session/query",
    create_customer: SERVER_URL + "/api/create-customer",
    updateSubscription: SERVER_URL + "/api/update/subscription",

    getaccess_AI_Tutor: SERVER_URL + "/api/getaccess_ai_tutor", //chatbot uuid to get pin code and organization code
    getquery: SERVER_URL + "/api/getquery",
    getChatwithPIN: SERVER_URL + "/api/getchatwithpin",
    change_user_limitation: SERVER_URL + "/api/change_user_limitation",
    transfer_tutor: SERVER_URL + "/api/transfer_tutor",
    imageupload: SERVER_URL + "/api/imageupload",
    custom_plan: SERVER_URL + "/api/subscription/custom_plan",
    upgrade_query: SERVER_URL + "/api/subscription/upgrade_query",
    inviteEmail: SERVER_URL + "/api/inviteEmail",
    getinviteEmails: SERVER_URL + "/api/getInviteEmails",
    remove_invite: SERVER_URL + "/api/removeInvite",

    userInvite: SERVER_URL + "/api/userInvite",
    userInviteRemove: SERVER_URL + "/api/userInviteRemove",
    setTutors: SERVER_URL + "/api/setTutors",
    resendInvitation: SERVER_URL + "/api/resendInvitation",
    uploadInviteFile: SERVER_URL + "/api/uploadInviteFile",

    streamingTest: SERVER_URL + "/api/testStreaming",
    closeAccount: SERVER_URL + "/api/closeAccunt",
};
