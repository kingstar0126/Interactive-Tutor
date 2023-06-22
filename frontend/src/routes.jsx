import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Forgetpassword from "./Pages/Forgetpassword";
import Changepassword from "./Pages/Changepassword";
import Layout from "./Layout/Layout";
import Chat from "./Components/Chat";
import Subscription from "./Components/Subscription";
import ChatTable from "./Components/ChatTable";
import NewChat from "./Components/NewChat";
import TrainData from "./Components/TrainData";
import ChatHistory from "./Components/Chathistory";

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
            path: "newchat",
            element: <NewChat />,
          },
          {
            path: "train",
            element: <TrainData />,
          },
          {
            path: "history",
            element: <ChatHistory />,
          },
        ],
      },
      {
        path: "subscription",
        element: <Subscription />,
      },
    ],
  },
  {
    path: "/",
    children: [
      {
        path: "/",
        element: <Home />,
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
    ],
  },
];

export default AppRoutes;
