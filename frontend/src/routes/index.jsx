import Login from "../pages/Login";
import Register from "../pages/Register";
import Forgetpassword from "../pages/Forgetpassword";
import Changepassword from "../pages/Changepassword";
import Layout from "../layout/Layout";
import Chat from "../components/Chat";
import Subscription from "../components/Subscription";
import Tapcomponent from "../components/Tapcomponent";
import NewChat from "../components/NewChat";
import Thankyou from "../pages/Thankyou";
import Notfound from "../pages/Notfound";
import Enterprise from "../components/Enterprise";
import Manager from "../components/Manager";
import ManageAccount from "../components/ManageAccount";
import Report from "../components/Report";
import AccessChatbot from "../pages/AccessChatbot";
import VerifyEmail from "../pages/VerifyEmail";
import EmbeddingChat from "../components/EmbeddingChat";
import OnBoarding from "../components/OnBoarding";
import DashBoard from "../components/DashBoard";

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
                        path: "newchat/:chat",
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

export { AppRoutes };
