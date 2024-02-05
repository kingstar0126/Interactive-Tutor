import axios from "axios";
import { webAPI } from "../utils/constants";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { BsPersonFillAdd } from "react-icons/bs";
import { BsDatabaseFillGear } from "react-icons/bs";
import { BsCheckCircleFill } from "react-icons/bs";
import { AiOutlineMenu } from "react-icons/ai";
import { BiImport } from "react-icons/bi";
import { MdOutlineUpdate } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Scrollbar } from "react-scrollbars-custom";
import {
  DialogHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  Button,
  Chip,
  Checkbox,
  List,
  ListItem,
  ListItemPrefix,
  Typography,
} from "@material-tailwind/react";
import { GiSpookyHouse } from "react-icons/gi";

const Enterprise = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [item, setItem] = useState({});
  const [checkedItems, setCheckedItems] = useState([]);
  const [chats, setChats] = useState([]);
  const [file, setFile] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const chatState = useSelector((state) => state.chat.chat);
  const [validation, setValidation] = useState(false);
  const user = JSON.parse(useSelector((state) => state.user.user));

  const onChange = ({ target }) => {
    setUserEmail(target.value);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(target.value)) {
      setValidation(true);
    } else {
      setValidation(false);
    }
  };

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
    getChats();
    getAlluser();
  }, []);

  const getAlluser = () => {
    axios
      .post(webAPI.getallusers, { id: user.id, search: "" })
      .then((res) => {
        setData(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  const handleConfirm = () => {
    if (!userEmail) return;
    axios
      .post(webAPI.userInvite, {
        id: user.id,
        email: [userEmail],
      })
      .then((res) => {
        {
          if (res.data.success) {
            getAlluser();
            setOpen(false);
            notification("success", res.data.message);
          } else {
            setOpen(false);
            getAlluser();
            notification("error", res.data.message);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  const handleRemove = (item) => {
    console.log(item);
    axios
      .post(webAPI.userInviteRemove, { id: user.id, email: item.email })
      .then((res) => {
        if (res.data.success) {
          notification("success", res.data.message);
          getAlluser();
        } else {
          notification("error", res.data.message);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSetTutors = () => {
    let tutors = checkedItems.filter((item) => item.checked === true);
    console.log(tutors);

    axios
      .post(webAPI.setTutors, {
        id: user.id,
        email: item.email,
        chats: tutors,
      })
      .then((res) => {
        if (res.data.success) {
          notification("success", res.data.message);
          getChats();
          getAlluser();
          setTutorOpen(false);
        } else {
          notification("error", res.data.message);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleCheckboxClick = (event, item) => {
    const isChecked = event.target.checked;
    // Add the checked item to the state
    setCheckedItems(
      checkedItems.map((checkedItem) => {
        if (checkedItem === item) {
          return { ...checkedItem, checked: isChecked };
        }
        return checkedItem;
      })
    );
  };

  const handleResend = (item) => {
    console.log(item);
    axios
      .post(webAPI.resendInvitation, { id: user.id, email: item.email })
      .then((res) => {
        if (res.data.success) {
          notification("success", res.data.message);
        } else {
          notification("error", res.data.message);
        }
      })
      .catch((err) => console.error(err));
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

  const handleFileUpload = () => {
    if (file && file.name) {
      let data = new FormData();
      const filename = file.name.replaceAll(" ", "");
      data.append("file", file, filename);
      axios
        .post(webAPI.uploadInviteFile, data)
        .then((res) => {
          if (!res.data.success) {
            notification("error", res.data.message);
          } else {
            notification("success", res.data.message);
            axios
              .post(webAPI.userInvite, {
                id: user.id,
                email: res.data.data,
              })
              .then((res) => {
                {
                  if (res.data.success) {
                    getAlluser();
                    setOpen(false);
                    notification("success", res.data.message);
                  } else {
                    setOpen(false);
                    getAlluser();
                    notification("error", res.data.message);
                  }
                }
              })
              .catch((err) => console.error(err));
          }
          setImportOpen(false);
        })
        .catch((err) => {
          notification("error", "Failed Uploading File");
          setImportOpen(false);
        });
    }
  };

  return (
    <div className="w-full h-full">
      <Toaster className="z-30" />
      <div className="flex md:items-center items-end w-full md:h-[80px] shadow-md md:px-10 md:border-b-[--site-chat-header-border] md:border px-4 py-2 max-h-min gap-1">
        <div className="hidden md:flex gap-2 mt-9 mb-8 text-[--site-onboarding-primary-color]">
          <GiSpookyHouse className="w-8 h-8" />
          <span className="text-2xl font-semibold">Enterprise</span>
        </div>
      </div>

      <div className="border-[--site-chat-header-border] border rounded-md md:m-10 m-5 flex flex-col gap-5 shadow-xl shadow-[--site-chat-header-border] overflow-x-auto">
        <div className="w-full h-full rounded-md p-2">
          <div className="flex items-center justify-between w-full p-2">
            <Button
              variant="outlined"
              className="normal-case border border-[--site-onboarding-primary-color] p-2 rounded-md font-semibold text-base text-[--site-onboarding-primary-color] flex gap-3 items-center justify-center"
              onClick={(e) => setOpen(true)}
            >
              <BsPersonFillAdd className="fill-[ --site-onboarding-primary-color] w-[20px] h-[20px]" />
              Invite user
            </Button>
            <Button
              variant="outlined"
              className="normal-case border border-[--site-onboarding-primary-color] p-2 rounded-md font-semibold text-base text-[--site-onboarding-primary-color] flex gap-3 items-center justify-center"
              onClick={(e) => setImportOpen(true)}
            >
              <BiImport className="fill-[ --site-onboarding-primary-color] w-[20px] h-[20px]" />
              Import CSV
            </Button>
          </div>
          <table className="w-full rounded-md">
            <thead className="rounded-xl">
              <tr className="text-md font-semibold tracking-wide text-center text-[black] uppercase border-b border-gray-600 rounded-xl">
                <th className="px-4 py-3 w-[50px]">No</th>
                <th className="px-4 py-3 ">Name</th>
                <th className="px-4 py-3 ">Email</th>
                <th className="px-4 py-3 ">Tutors</th>
                <th className="px-4 py-3 ">Status</th>
                <th className="px-4 py-3 ">Action</th>
              </tr>
            </thead>
            <tbody className="text-center bg-white">
              {data &&
                data.map((item, index) => {
                  return (
                    <tr className="text-gray-700" key={index}>
                      <td className="px-4 py-3 border">
                        <div className="flex items-center justify-center text-[14px]">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold border text-ms">
                        {item.username}
                      </td>
                      <td className="px-4 py-3 font-medium border text-ms">
                        {item.email}
                      </td>
                      <td className="px-4 py-3 font-semibold border text-ms">
                        {item.chats.map((item, index) => {
                          return (
                            <Chip
                              variant="ghost"
                              color="green"
                              size="sm"
                              key={index}
                              value={item.label}
                              className="normal-case h-full w-full mt-1"
                              icon={
                                <BsCheckCircleFill className="h-4 w-4 rounded-full fill-green-900" />
                              }
                            />
                          );
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold border text-ms">
                        {item.status ? (
                          <Chip
                            variant="ghost"
                            color="green"
                            size="sm"
                            value="SignUp"
                            className="normal-case h-full w-full"
                            icon={
                              <BsCheckCircleFill className="h-4 w-4 rounded-full fill-green-900" />
                            }
                          />
                        ) : (
                          <Chip
                            variant="ghost"
                            color="amber"
                            size="sm"
                            value="Not SignUp"
                            className="normal-case h-full w-full"
                            icon={
                              <BsCheckCircleFill className="h-4 w-4 rounded-full fill-yellow-900" />
                            }
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold border text-ms">
                        {item.status == true && (
                          <Button
                            variant="outlined"
                            onClick={() => {
                              let data = chats.map((item) => ({
                                ...item,
                                checked: false,
                              }));
                              if (item.chats) {
                                data.map((data) => {
                                  item.chats.map((_item) => {
                                    if (
                                      data.label === _item.label &&
                                      data.description === _item.description
                                    ) {
                                      data.checked = true;
                                    }
                                  });
                                });
                                setCheckedItems(data);
                              } else setCheckedItems(data);
                              setTutorOpen(true);
                              setItem(item);
                            }}
                            className="normal-case mr-2 p-2 border-[#0f6d09] w-[80px] text-[#0f6d09] rounded-lg hover:scale-110"
                          >
                            Set Tutors
                          </Button>
                        )}
                        {item.status == false && (
                          <Button
                            variant="outlined"
                            onClick={() => handleResend(item)}
                            className=" normal-case mr-2 p-2 rounded-lg hover:scale-110 border-[--site-main-pricing-color] text-[--site-main-pricing-color]"
                          >
                            Resend
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          onClick={() => handleRemove(item)}
                          className=" normal-case p-2 rounded-lg hover:scale-110 border-[--site-error-text-color] text-[--site-error-text-color]"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={open}
        size={"sm"}
        handler={() => setOpen(false)}
        className="border-[--site-chat-header-border] border rounded-md shadow-lg shadow-[--site-onboarding-primary-color]"
      >
        <Toaster className="z-30" />
        <DialogHeader className="px-8 pt-8 pb-6">
          <span className="text-[32px] leading-12 font-semibold text-[--site-onboarding-primary-color]">
            Invite user
          </span>
        </DialogHeader>
        <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium px-8 pt-6">
          <div className="flex gap-2 relative w-full">
            <input
              type="email"
              value={userEmail}
              onChange={onChange}
              className="w-full h-10 px-5 py-3 bg-transparent border-[--site-main-modal-input-border-color] border rounded-md placeholder:text-black/60 placeholder:opacity-50 focus:outline-[--site-onboarding-primary-color]"
            />
            <Button
              size="sm"
              // color={!validation ? "gray" : "blue-gray"}
              disabled={!validation}
              className={` normal-case !absolute right-1 top-1 rounded ${
                !validation
                  ? "bg-gray-700"
                  : "bg-[--site-onboarding-primary-color]"
              }`}
              onClick={() => handleConfirm()}
            >
              Invite
            </Button>
          </div>
        </DialogBody>
        <DialogFooter className="flex items-center justify-end px-8">
          <Button
            onClick={() => setOpen(false)}
            className=" normal-case bg-transparent border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color] text-base font-semibold border rounded-md px-4 py-2"
          >
            cancel
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={importOpen}
        size={"sm"}
        handler={() => setImportOpen(false)}
        className="border-[--site-chat-header-border] border rounded-md shadow-lg shadow-[--site-onboarding-primary-color]"
      >
        <Toaster className="z-30" />
        <DialogHeader className="px-8 pt-8 pb-6">
          <span className="text-[32px] leading-12 font-semibold text-[--site-onboarding-primary-color]">
            Import Data
          </span>
        </DialogHeader>
        <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium px-8 pt-6">
          <div className="flex gap-2 relative w-full">
            <input
              type="file"
              name="label"
              onChange={
                (e) => handleFileChange(e)
                // console.log(e)
              }
              accept=".csv"
              max="100000000"
              className="block w-full text-sm border rounded-md text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:text-sm file:font-medium file:bg-[--site-onboarding-primary-color] file:border-[--site-main-modal-input-border-color] file:text-white hover:file:opacity-75 border-[--site-main-modal-input-border-color]"
            />
          </div>
        </DialogBody>
        <DialogFooter className="flex items-center justify-end px-8 gap-4">
          <Button
            onClick={() => setImportOpen(false)}
            className=" normal-case bg-transparent border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color] text-base font-semibold border rounded-md px-4 py-2"
          >
            cancel
          </Button>
          <Button
            onClick={() => handleFileUpload()}
            className=" normal-case bg-[--site-onboarding-primary-color] border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color] text-base font-semibold border rounded-md px-4 py-2 text-white"
          >
            confirm
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={tutorOpen}
        size={"md"}
        handler={() => setTutorOpen(false)}
        className="border-[--site-chat-header-border] border rounded-md from-[--site-main-modal-from-color] to-[--site-main-modal-to-color] bg-gradient-to-br shadow-lg shadow-[--site-onboarding-primary-color]"
      >
        <Toaster className="z-30" />
        <DialogHeader className="px-8 pt-8 pb-6">
          <span className="text-[32px] leading-12 font-semibold text-[--site-onboarding-primary-color]">
            Set Tutors
          </span>
        </DialogHeader>
        <DialogBody className="border-t border-[--site-main-modal-divide-color] text-black text-base font-medium px-8 pt-6 h-[25rem]">
          <Scrollbar>
            <div className="flex gap-2 relative flex-wrap">
              <List>
                {checkedItems &&
                  checkedItems.map((item, index) => {
                    return (
                      <ListItem className="p-0" key={index}>
                        <label
                          htmlFor={index + 1}
                          className="flex w-full cursor-pointer items-center px-3 py-2"
                        >
                          <ListItemPrefix className="mr-3">
                            <Checkbox
                              id={index + 1}
                              ripple={false}
                              defaultChecked={item.checked}
                              onClick={(event) =>
                                handleCheckboxClick(event, item)
                              }
                              className="hover:before:opacity-0"
                              containerProps={{
                                className: "p-0",
                              }}
                            />
                          </ListItemPrefix>
                          <span className="font-medium items-center justify-center">
                            {item.label}
                          </span>
                        </label>
                      </ListItem>
                    );
                  })}
              </List>
            </div>
          </Scrollbar>
        </DialogBody>
        <DialogFooter className="flex items-center justify-end px-8 gap-2">
          <Button
            onClick={() => setTutorOpen(false)}
            className=" normal-case bg-transparent border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color] text-base font-semibold border rounded-md px-4 py-2"
          >
            cancel
          </Button>
          <Button
            onClick={() => {
              handleSetTutors();
            }}
            className=" normal-case px-4 py-2 text-base font-semibold text-white bg-[--site-onboarding-primary-color] rounded-md"
          >
            confirm
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Enterprise;
