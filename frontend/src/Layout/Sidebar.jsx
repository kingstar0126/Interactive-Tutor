import {
  DialogHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  MenuHandler,
  Menu,
  MenuItem,
  MenuList,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { BsDatabaseFillGear, BsThreeDots } from "react-icons/bs";
import { MdOutlineAdd, MdDeleteOutline } from "react-icons/md";
import { PiUserCircleGearLight } from "react-icons/pi";
import { IoLogOutOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import Logo from "../assets/logo.png";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { setlocation } from "../redux/actions/locationAction";
import { useSelector, useDispatch } from "react-redux";
import { SERVER_URL } from "../config/constant";
import { webAPI } from "../utils/constants";
import { useState, useEffect, useMemo } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { getchat, updatechatbot } from "../redux/actions/chatAction";
import axios from "axios";
import { Scrollbar } from "react-scrollbars-custom";
import Chatmodal from "../Components/Chatmodal";
import PublishModal from "../Components/PublishModal";
import { CiEdit } from "react-icons/ci";

import Share from "../assets/noun-books.svg";
import Publish from "../assets/noun-publish.svg";
import Subscription from "../assets/Icons.svg";

import { GiSpookyHouse } from "react-icons/gi";

const Sidebar = () => {
  let location = useLocation();
  const redirections = [
    "chat",
    "subscription",
    "manager",
    "enterprise",
    "account",
  ];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [check, setCheck] = useState(true);
  const [open, setOpen] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const user = JSON.parse(useSelector((state) => state.user.user));
  const isUpdate = useSelector((state) => state.chat.isUpdate);
  const query = useSelector((state) => state.query.query);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState({});

  const notification = (type, message) => {
    // To do in here
    if (type === "error") {
      toast.error(message);
    }
    if (type === "success") {
      toast.success(message);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      if (location) {
        setlocation(dispatch, location.pathname);
      }
      navigate("chat/dashboard");
      getChats();
      axios
        .post(webAPI.checkUserInvite, { id: user.id })
        .then((res) => {
          if (res.data.success) {
            setCheck(false);
          } else {
            setCheck(true);
          }
        })
        .catch((err) => console.error(err));
    }
  }, []);

  const selection = useMemo(() => {
    let url = location.pathname.split("/").slice(-1);
    let index = redirections.indexOf(url[0]) + 1;
    if (index) {
      return index;
    } else {
      let url = location.pathname.split("/").slice(-2, -1);
      let index = redirections.indexOf(url[0]) + 1;
      return index;
    }
  }, [location]);

  const handleLogout = () => {
    window.sessionStorage.clear();
    window.location.replace(window.location.origin + "/login");
  };

  const handleOk = (data) => {
    data["user_id"] = user.id;

    axios.post(webAPI.addchat, data).then((res) => {
      if (!res.data.success) {
        notification("error", res.data.message);
      } else {
        notification("success", res.data.message);
        getChats();
      }
    });
    setIsChatModalOpen(false);
  };

  const handleUpdate = (data) => {
    axios.post(webAPI.updatechat, data).then((res) => {
      if (!res.data.success) {
        notification("error", res.data.message);
      } else {
        notification("success", res.data.message);
        getChats();
      }
    });
    setIsChatModalOpen(false);
  };

  const handleCancel = () => {
    getChats();
    setIsChatModalOpen(false);
    setIsPublishModalOpen(false);
  };

  const getChats = async () => {
    let data = {
      user_id: user.id,
    };

    await axios.post(webAPI.getchats, data).then((res) => {
      if (res.data.success) {
        setChats(res.data.data);
      } else {
        notification("error", res.data.message);
      }
    });
  };

  useEffect(() => {
    if (isUpdate) {
      updatechatbot(dispatch, false);
      getChats();
    }
  }, [isUpdate]);

  const handleMoreQuery = () => {
    axios
      .post(webAPI.create_checkout_query, {
        id: user.id,
        clientReferenceId: getClientReferenceId(),
      })
      .then(async (res) => {
        // Load Stripe and redirect to the Checkout page
        const stripe = await loadStripe(res.data.key);

        const { error } = stripe.redirectToCheckout({
          sessionId: res.data.sessionId,
        });
        if (error) {
          console.error("Error:", error);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getClientReferenceId = () => {
    return (
      (window.Rewardful && window.Rewardful.referral) ||
      "checkout_" + new Date().getTime()
    );
  };

  const handleBotClick = (chat) => {
    if (user.role === 0 || user.role === 5) {
      notification("error", "You have to subscribe to use this feature!");
    } else {
      setCurrentChat(chat);
      getchat(dispatch, chat);
      navigate(`chat/newchat/${chat.uuid}`);
    }
  };

  const handleEditBot = (chat) => {
    if (user.role !== 0 && user.role !== 5) {
      setIsChatModalOpen(true);
    }
  };
  const handleShareBot = (chat) => {
    if (user.role !== 0 && user.role !== 5) {
      axios
        .post(webAPI.sharechatbot, { chat, id: user.id })
        .then((res) => {
          if (res.data.success) {
            notification("success", "Successful");
          } else {
            notification("error", res.data.message);
          }
        })
        .catch((err) => notification("error", err));
    }
  };
  const handlePublishBot = (chat) => {
    if (user.role !== 0 && user.role !== 5) {
      setIsPublishModalOpen(true);
    }
  };
  const handleDeleteBot = (chat) => {
    if (user.role !== 0 && user.role !== 5) {
      setCurrentChat(chat);
      setIsDeleteModalOpen(true);
    }
  };

  const handlePublishOk = (chat) => {
    if (
      currentChat.label !== chat.label ||
      currentChat.description !== chat.description
    ) {
      axios.post(webAPI.updatechat, chat).then((res) => {
        if (!res.data.success) {
          notification("error", res.data.message);
        } else {
          axios.post(webAPI.publishchat, { chat, id: user.id }).then((res) => {
            if ((res.data.success)) {
              notification("success", res.data.message);
            } else {
              notification("error", res.data.message);
            }
          });
        }
      });
    } else {
      axios.post(webAPI.publishchat, { chat, id: user.id }).then((res) => {
        if ((res.data.success)) {
          notification("success", res.data.message);
        } else {
          notification("error", res.data.message);
        }
      });
    }

    setIsPublishModalOpen(false);
  };

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col w-full h-1/2">
        <div className="flex pr-8 pl-6 w-full">
          <div
            className="w-1/3 flex p-3"
            onClick={() => navigate("chat/dashboard")}
          >
            <img
              src={`${SERVER_URL}${Logo}`}
              alt="logo"
              className="w-full h-full"
            />
          </div>
          {query && (
            <div className="justify-center items-center flex w-2/3">
              <Button
                className="bg-[--site-logo-text-color] rounded-md normal-case text-sm w-full"
                onClick={handleMoreQuery}
              >
                <div className="gap-2 justify-center items-center flex">
                  <span className="text-[--site-error-text-color]">
                    {query}
                  </span>
                  <span className="text-[--site-card-icon-color]">Queries</span>
                </div>
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end md:py-2 px-4 w-full flex-col">
          <div>
            <Button
              onClick={() => {
                if (user && user.role !== 0 && user.role !== 5) {
                  setCurrentChat({});
                  setIsChatModalOpen(true);
                } else {
                  notification(
                    "error",
                    "You have to subscribe to use this feature!"
                  );
                }
              }}
              variant="outlined"
              className="normal-case border border-gray-400 rounded-md text-white flex items-center focus:ring-0 justify-start w-full gap-4 text-base"
            >
              <MdOutlineAdd className="w-6 h-6" />
              <span>Add AI bots</span>
            </Button>
          </div>
          <Accordion open={open === 1}>
            <AccordionHeader
              onClick={() => handleOpen(1)}
              className="text-white text-base hover:text-[--site-main-color1]"
            >
              My AI Bots
            </AccordionHeader>
            <AccordionBody>
              <div className="w-full md:h-96 h-36">
                <Scrollbar>
                  <div className="flex flex-col md:gap-2 truncate px-2">
                    {chats.length &&
                      chats
                        .filter((item) => item.islibrary !== true)
                        .map((chat) => (
                          <div
                            className="w-full relative flex gap-2 items-center hover:bg-[--site-bot-background-hover] rounded-md text-white hover:text-black group hover:cursor-default transition-all duration-300 ease-in-out p-2"
                            style={{
                              backgroundColor:
                                currentChat.uuid === chat.uuid ? "#C7C7F2" : "",
                              color:
                                currentChat.uuid === chat.uuid ? "black" : "",
                            }}
                            key={chat.access}
                            onClick={() => handleBotClick(chat)}
                          >
                            <img
                              src={
                                chat.chat_logo.url
                                  ? chat.chat_logo.url
                                  : chat.chat_logo.ai
                              }
                              alt="logo"
                              className="w-8 h-8 p-1"
                            />
                            <span className="">
                              {chat.label.length >= 20
                                ? chat.label.substring(0, 20).concat("...")
                                : chat.label}
                            </span>
                            <div className="absolute right-2">
                              <Menu placement="right">
                                <MenuHandler>
                                  <span>
                                    <BsThreeDots className="h-5 w-6 opacity-0 group-hover:opacity-100 rounded-sm text-[-site-onboarding-primary-color] transition-all duration-300 ease-in-out bg-[--site-threedot-background] z-10 group-hover:cursor-pointer" />
                                  </span>
                                </MenuHandler>
                                <MenuList className=" z-[99999]">
                                  <MenuItem>
                                    <div
                                      className="flex h-full w-full items-center justify-start gap-2"
                                      onClick={() => handleEditBot(chat)}
                                    >
                                      <CiEdit className="w-6 h-6 hover:scale-125 transition-transform duration-200" />
                                      <span>Edit</span>
                                    </div>
                                  </MenuItem>
                                  {user &&
                                    (user.role === 4 || user.role === 7) && (
                                      <MenuItem>
                                        <div
                                          className="flex h-full w-full items-center justify-start gap-2"
                                          onClick={() => handleShareBot(chat)}
                                        >
                                          <img
                                            src={Share}
                                            alt="share"
                                            className="w-6 h-6 hover:scale-125 transition-transform duration-200"
                                          />
                                          <span>Share with School</span>
                                        </div>
                                      </MenuItem>
                                    )}
                                  <MenuItem>
                                    <div
                                      className="flex h-full w-full items-center justify-start gap-2"
                                      onClick={() => handlePublishBot(chat)}
                                    >
                                      <img
                                        src={Publish}
                                        alt="share"
                                        className="w-6 h-6 hover:scale-125 transition-transform duration-200"
                                      />
                                      <span>Publish to Library</span>
                                    </div>
                                  </MenuItem>

                                  <MenuItem>
                                    <div
                                      className="flex h-full w-full items-center justify-start gap-2"
                                      onClick={() => handleDeleteBot(chat)}
                                    >
                                      <MdDeleteOutline className="w-6 h-6 hover:scale-125 transition-transform duration-200" />
                                      <span>Delete</span>
                                    </div>
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </div>
                          </div>
                        ))}
                  </div>
                </Scrollbar>
              </div>
            </AccordionBody>
          </Accordion>
          <Accordion open={open === 2}>
            <AccordionHeader
              onClick={() => handleOpen(2)}
              className="text-white text-base hover:text-[--site-main-color1]"
            >
              Library
            </AccordionHeader>
            <AccordionBody>
              <div className="w-full flex-col md:h-96 h-36">
                <Scrollbar>
                  <div className="flex flex-col md:gap-2 truncate px-2">
                    {chats.length &&
                      chats
                        .filter((item) => item.islibrary === true)
                        .map((chat) => (
                          <div
                            className="w-full relative flex gap-2 items-center hover:bg-[--site-bot-background-hover] rounded-md text-white hover:text-black group hover:cursor-default transition-all duration-300 ease-in-out p-2"
                            style={{
                              backgroundColor:
                                currentChat.uuid === chat.uuid ? "#C7C7F2" : "",
                              color:
                                currentChat.uuid === chat.uuid ? "black" : "",
                            }}
                            key={chat.access}
                            onClick={() => handleBotClick(chat)}
                          >
                            <img
                              src={
                                chat.chat_logo.url
                                  ? chat.chat_logo.url
                                  : chat.chat_logo.ai
                              }
                              alt="logo"
                              className="w-8 h-8 p-1"
                            />
                            <span className="">
                              {chat.label.length >= 20
                                ? chat.label.substring(0, 20).concat("...")
                                : chat.label}
                            </span>
                            <div className="absolute right-2">
                              <Menu placement="right">
                                <MenuHandler>
                                  <span>
                                    <BsThreeDots className="h-5 w-6 opacity-0 group-hover:opacity-100 rounded-sm text-[-site-onboarding-primary-color] transition-all duration-300 ease-in-out bg-[--site-threedot-background] z-10 group-hover:cursor-pointer" />
                                  </span>
                                </MenuHandler>
                                <MenuList className=" z-[99999]">
                                  <MenuItem>
                                    <div
                                      className="flex h-full w-full items-center justify-start gap-2"
                                      onClick={() => handleEditBot(chat)}
                                    >
                                      <CiEdit className="w-6 h-6 hover:scale-125 transition-transform duration-200" />
                                      <span>Edit</span>
                                    </div>
                                  </MenuItem>
                                  {user &&
                                    (user.role === 4 || user.role === 7) && (
                                      <MenuItem>
                                        <div
                                          className="flex h-full w-full items-center justify-start gap-2"
                                          onClick={() => handleShareBot(chat)}
                                        >
                                          <img
                                            src={Share}
                                            alt="share"
                                            className="w-6 h-6 hover:scale-125 transition-transform duration-200"
                                          />
                                          <span>Share with School</span>
                                        </div>
                                      </MenuItem>
                                    )}
                                  <MenuItem>
                                    <div
                                      className="flex h-full w-full items-center justify-start gap-2"
                                      onClick={() => handlePublishBot(chat)}
                                    >
                                      <img
                                        src={Publish}
                                        alt="share"
                                        className="w-6 h-6 hover:scale-125 transition-transform duration-200"
                                      />
                                      <span>Publish to Library</span>
                                    </div>
                                  </MenuItem>

                                  <MenuItem>
                                    <div
                                      className="flex h-full w-full items-center justify-start gap-2"
                                      onClick={() => handleDeleteBot(chat)}
                                    >
                                      <MdDeleteOutline className="w-6 h-6 hover:scale-125 transition-transform duration-200" />
                                      <span>Delete</span>
                                    </div>
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </div>
                          </div>
                        ))}
                  </div>
                </Scrollbar>
              </div>
            </AccordionBody>
          </Accordion>
        </div>
        <div className="flex-col py-4 items-center justify-start fixed md:bottom-10 md:gap-4 bottom-0">
          {check && (
            <Link
              to="subscription"
              className="flex w-full gap-4 px-6 py-2 transition-all duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
              style={{
                color: selection === 2 ? "#c1ff72" : "#ffffff",
                fontWeight: selection === 2 ? 600 : 500,
              }}
            >
              <img src={Subscription} alt="subscription" className="w-6 h-6" />
              <span className="flex items-end text-base ">Subscriptions</span>
            </Link>
          )}
          {/* //Todo This is user manager page */}
          {user && user.role === 1 ? (
            <Link
              to="manager"
              className="flex w-full gap-4 px-6 py-2 transition-all duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
              style={{
                color: selection === 3 ? "#c1ff72" : "#ffffff",
                fontWeight: selection === 3 ? 600 : 500,
              }}
            >
              <BsDatabaseFillGear className="w-6 h-6" />

              <span className="flex items-end text-base ">Manager</span>
            </Link>
          ) : user && user.role === 7 ? (
            <Link
              to="enterprise"
              className="flex w-full gap-4 px-6 py-2 transition-all duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
              style={{
                color: selection === 4 ? "#c1ff72" : "#ffffff",
                fontWeight: selection === 4 ? 600 : 500,
              }}
            >
              <GiSpookyHouse className="w-6 h-6" />

              <span className="flex items-end text-base ">Enterprise</span>
            </Link>
          ) : null}
          <Link
            to="account"
            className="flex w-full gap-4 px-6 py-2 transition-all duration-300 ease-in-out hover:bg-black hover:bg-opacity-25"
            style={{
              color: selection === 5 ? "#c1ff72" : "#ffffff",
              fontWeight: selection === 5 ? 600 : 500,
            }}
          >
            <PiUserCircleGearLight className="w-6 h-6" />
            <span className="flex items-end text-base ">Account</span>
          </Link>
          <div
            className="flex w-full gap-4 px-6 py-2 transition-all duration-300 ease-in-out hover:bg-black hover:bg-opacity-25 hover:cursor-pointer"
            onClick={() => {
              handleLogout();
            }}
          >
            <IoLogOutOutline className="w-6 h-6 text-white" />

            <span className="flex items-center text-[--site-main-color3] font-normal text-base">
              Logout
            </span>
          </div>
        </div>
      </div>

      {/*Delete Chatbot*/}
      <Dialog
        open={isDeleteModalOpen}
        handler={() => setIsDeleteModalOpen(false)}
        className="border-[--site-chat-header-border] border rounded-md shadow-lg shadow-[--site-onboarding-primary-color]"
      >
        <DialogHeader>Are you sure?</DialogHeader>
        <DialogBody divider>
          <span className="text-base text-black">
            Are you sure to delete this AI Bots?
          </span>
        </DialogBody>
        <DialogFooter className="flex items-center justify-end gap-4 pb-8">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-transparent border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color] text-base font-semibold border rounded-md px-4 py-2"
          >
            cancel
          </button>

          <button
            onClick={() => {
              axios
                .delete(`${webAPI.deletechat}/${currentChat.id}`)
                .then((res) => {
                  notification("success", res.data.message);
                  getChats();
                })
                .catch((err) => {
                  console.error("Failed to delete chat:", err);
                });
              setIsDeleteModalOpen(false);
            }}
            className="px-4 py-2 text-base font-semibold text-white bg-[--site-onboarding-primary-color] rounded-md"
          >
            confirm
          </button>
        </DialogFooter>
      </Dialog>

      <Chatmodal
        open={isChatModalOpen}
        handleOk={handleOk}
        handleUpdate={handleUpdate}
        handleCancel={handleCancel}
        chat={currentChat}
      />

      <PublishModal
        open={isPublishModalOpen}
        handleOk={handlePublishOk}
        handleCancel={handleCancel}
        chat={currentChat}
      />
    </div>
  );
};

export default Sidebar;
