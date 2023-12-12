import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Forgetpassword from "./Pages/Forgetpassword";
import Changepassword from "./Pages/Changepassword";
import Layout from "./Layout/Layout";
import Chat from "./Components/Chat";
import Subscription from "./Components/Subscription";
import Tapcomponent from "./Components/Tapcomponent";
import NewChat from "./Components/NewChat";
import Thankyou from "./Pages/Thankyou";
import Notfound from "./Pages/Notfound";
import Enterprise from "./Components/Enterprise";
import Manager from "./Components/Manager";
import ManageAccount from "./Components/ManageAccount";
import Report from "./Components/Report";
import AccessChatbot from "./Pages/AccessChatbot";
import VerifyEmail from "./Pages/VerifyEmail";
import EmbeddingChat from "./Components/EmbeddingChat";
import OnBoarding from "./Components/OnBoarding";
import DashBoard from "./Components/DashBoard";

const AppRoutes = [
    {
        path: "/chatbot",
        element: <Layout />,
        children: [
            {
                path: "chat",
                element: <Chat />,
                children: [
                    {
                        path: "onboarding",
                        element: <OnBoarding />,
                    },
                    {
                        path: "newchat",
                        element: <Tapcomponent />,
                    },
                    {
                        path: "dashboard",
                        element: <DashBoard />
                    }
                ],
            },
            {
                path: "subscription",
                element: <Subscription />,
            },
            {
                path: "manager",
                element: <Manager />,
            },
            {
                path: "enterprise",
                element: <Enterprise />,
            },
            {
                path: "account",
                element: <ManageAccount />,
            },
            {
                path: "report",
                element: <Report />,
            },
        ],
    },
    {
        path: "/",
        children: [
            {
                path: "/",
                element: <Login />,
            },
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/register",
                element: <Register />,
            },
            {
                path: "/resetpassword",
                element: <Forgetpassword />,
            },
            {
                path: "/changepassword",
                element: <Changepassword />,
            },
            {
                path: "/thankyou",
                element: <Thankyou />,
            },
            {
                path: "/chatbot/share/url",
                element: <AccessChatbot />,
                children: [
                    {
                        path: "newchat",
                        element: <NewChat />,
                    },
                ],
            },
            {
                path: "/chat/embedding/:id",
                element: <EmbeddingChat />,
            },
            {
                path: "/verify-email/:token",
                element: <VerifyEmail />,
            },
        ],
    },
    {
        path: "*",
        element: <Notfound />,
    },
];

const AppRoutes_login = [
    {
        path: "/",
        children: [
            {
                path: "/",
                element: <Login />,
            },
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/register",
                element: <Register />,
            },
            {
                path: "/resetpassword",
                element: <Forgetpassword />,
            },
            {
                path: "/changepassword",
                element: <Changepassword />,
            },
            {
                path: "/chatbot/share/url",
                element: <AccessChatbot />,
                children: [
                    {
                        path: "newchat",
                        element: <NewChat />,
                    },
                ],
            },
            {
                path: "/chat/embedding/:id",
                element: <EmbeddingChat />,
            },
            {
                path: "/verify-email/:token",
                element: <VerifyEmail />,
            },
        ],
    },
    {
        path: "*",
        element: <Notfound />,
    },
];

export { AppRoutes, AppRoutes_login };
