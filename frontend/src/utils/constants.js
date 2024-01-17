export const stringConstant = {
    FAILED_GET_DATA: "Failed to get data",
};


export const webAPI = {
    email_verification: `${process.env.REACT_APP_SERVER_URL}/api/email_verification`,
    register: `${process.env.REACT_APP_SERVER_URL}/api/signup`,
    adduseraccount: `${process.env.REACT_APP_SERVER_URL}/api/adduseraccount`,
    getuser: `${process.env.REACT_APP_SERVER_URL}/api/getaccount`,
    getallusers: `${process.env.REACT_APP_SERVER_URL}/api/getallaccounts`,
    checkUserInvite: `${process.env.REACT_APP_SERVER_URL}/api/checkUserInvite`,
    changeuser: `${process.env.REACT_APP_SERVER_URL}/api/changeaccount`,
    changeuserstatus: `${process.env.REACT_APP_SERVER_URL}/api/changeaccountstatus`,
    deleteuser: `${process.env.REACT_APP_SERVER_URL}/api/deleteaccount`,

    forget: `${process.env.REACT_APP_SERVER_URL}/api/reset`,
    changepassword: `${process.env.REACT_APP_SERVER_URL}/api/change`,
    login: `${process.env.REACT_APP_SERVER_URL}/api/login`,
    addchat: `${process.env.REACT_APP_SERVER_URL}/api/addchat`,
    getchat: `${process.env.REACT_APP_SERVER_URL}/api/getchat`,
    getchats: `${process.env.REACT_APP_SERVER_URL}/api/getchats`,
    updatechat: `${process.env.REACT_APP_SERVER_URL}/api/updatechat`,
    deletechat: `${process.env.REACT_APP_SERVER_URL}/api/deletechat`,
    start_message: `${process.env.REACT_APP_SERVER_URL}/api/createmessage`,
    sendchat: `${process.env.REACT_APP_SERVER_URL}/api/sendchat`,
    get_message: `${process.env.REACT_APP_SERVER_URL}/api/getchatmessage`,
    send_bubble_chat: `${process.env.REACT_APP_SERVER_URL}/api/sendchatbubble`,
    send_branding: `${process.env.REACT_APP_SERVER_URL}/api/sendbrandingdata`,
    get_messages: `${process.env.REACT_APP_SERVER_URL}/api/getmessages`,
    delete_message: `${process.env.REACT_APP_SERVER_URL}/api/deletemessage`,
    get_all_messages: `${process.env.REACT_APP_SERVER_URL}/api/getallmessages`,
    get_report_data: `${process.env.REACT_APP_SERVER_URL}/api/getreportdata`,
    get_system_prompt: `${process.env.REACT_APP_SERVER_URL}/api/generate_system_prompt`,
    //THis is the send traindata to server

    sendurl: `${process.env.REACT_APP_SERVER_URL}/api/data/sendurl`,
    sendfile: `${process.env.REACT_APP_SERVER_URL}/api/data/sendfile`,
    sendtext: `${process.env.REACT_APP_SERVER_URL}/api/data/sendtext`,
    sendapi: `${process.env.REACT_APP_SERVER_URL}/api/data/sendapi`, 
    sendapikey: `${process.env.REACT_APP_SERVER_URL}/api/wonde/sendapikey`, //send the select API key. this is only user role == 7 
    getapikey: `${process.env.REACT_APP_SERVER_URL}/api/wonde/getapikey`,
    taskstatus: `${process.env.REACT_APP_SERVER_URL}/api/wonde/taskstatus/`,
    gettraindatas: `${process.env.REACT_APP_SERVER_URL}/api/data/gettraindatas`,
    deletetrain: `${process.env.REACT_APP_SERVER_URL}/api/data/deletetrain`,

    //stripe route

    create_product: `${process.env.REACT_APP_SERVER_URL}/api/create/product`,
    // get_products: `${process.env.REACT_APP_SERVER_URL}/api/getproducts`,
    get_all_products: `${process.env.REACT_APP_SERVER_URL}/api/getallproducts`,
    updateProducts: `${process.env.REACT_APP_SERVER_URL}/api/updateproducts`,

    cancel_subscription: `${process.env.REACT_APP_SERVER_URL}/api/cancel/subscription`,

    create_checkout: `${process.env.REACT_APP_SERVER_URL}/api/create/checkout/session`,
    create_checkout_query: `${process.env.REACT_APP_SERVER_URL}/api/create/checkout/session/query`,
    create_customer: `${process.env.REACT_APP_SERVER_URL}/api/create-customer`,
    updateSubscription: `${process.env.REACT_APP_SERVER_URL}/api/update/subscription`,

    getquery: `${process.env.REACT_APP_SERVER_URL}/api/getquery`,
    getChatwithPIN: `${process.env.REACT_APP_SERVER_URL}/api/getchatwithpin`,
    change_user_limitation: `${process.env.REACT_APP_SERVER_URL}/api/change_user_limitation`,
    transfer_tutor: `${process.env.REACT_APP_SERVER_URL}/api/transfer_tutor`,
    imageupload: `${process.env.REACT_APP_SERVER_URL}/api/imageupload`,
    custom_plan: `${process.env.REACT_APP_SERVER_URL}/api/subscription/custom_plan`,
    upgrade_query: `${process.env.REACT_APP_SERVER_URL}/api/subscription/upgrade_query`,
    inviteEmail: `${process.env.REACT_APP_SERVER_URL}/api/inviteEmail`,
    getinviteEmails: `${process.env.REACT_APP_SERVER_URL}/api/getInviteEmails`,
    remove_invite: `${process.env.REACT_APP_SERVER_URL}/api/removeInvite`,

    userInvite: `${process.env.REACT_APP_SERVER_URL}/api/userInvite`,
    userInviteRemove: `${process.env.REACT_APP_SERVER_URL}/api/userInviteRemove`,
    setTutors: `${process.env.REACT_APP_SERVER_URL}/api/setTutors`,
    resendInvitation: `${process.env.REACT_APP_SERVER_URL}/api/resendInvitation`,
    uploadInviteFile: `${process.env.REACT_APP_SERVER_URL}/api/uploadInviteFile`,

    streamingTest: `${process.env.REACT_APP_SERVER_URL}/api/testStreaming`,
    closeAccount: `${process.env.REACT_APP_SERVER_URL}/api/closeAccunt`,

    dashboard: `${process.env.REACT_APP_SERVER_URL}/api/dashboardchat`,
    sharechatbot: `${process.env.REACT_APP_SERVER_URL}/api/sharechatbot`,
    publishchat: `${process.env.REACT_APP_SERVER_URL}/api/publishchat`,
};
