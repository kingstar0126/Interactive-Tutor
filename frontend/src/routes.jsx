import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Forgetpassword from "./Pages/Forgetpassword";
import Changepassword from "./Pages/Changepassword";
import Layout from "./Layout/Layout";
import Chat from "./Components/Chat";
import Subscription from "./Components/Subscription";
import Tapcomponent from "./Components/Tapcomponent";
import NewChat from "./Components/NewChat";
import Chatbubble from "./Components/Chatbubble";
import Notfound from "./Pages/Notfound";

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
            element: <Tapcomponent />,
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
      {
        path: "/chat/embedding/:id",
        element: <NewChat />,
      },
    ],
  },
  {
    path: "*",
    element: <Notfound />,
  },
];

export default AppRoutes;
