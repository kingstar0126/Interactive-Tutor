import {
  DialogHeader,
  Dialog,
  DialogBody,
  DialogFooter,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import React, { Fragment } from "react";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { webAPI } from "../utils/constants";
import { loadStripe } from "@stripe/stripe-js";
import { GoCheckCircle } from "react-icons/go";
import axios from "axios";
import { getUseraccount } from "../redux/actions/userAction";
import { useSelector, useDispatch } from "react-redux";
import InviteEmailItem from "./InviteEmailItem";
import { IoCheckbox } from "react-icons/io5";

const SubscriptionModal = (props) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [price, setPrice] = useState("");
  const [isopen, setIsOpen] = useState(false);
  const [description, setDescription] = useState([]);
  const [type, setType] = useState(true);
  const [inviteEmails, setInviteEmails] = useState([]);
  const user = JSON.parse(useSelector((state) => state.user.user));
  const dispatch = useDispatch();

  const handleCustomPlan = () => {
    axios
      .post(webAPI.custom_plan, { id: user.id })
      .then((res) => notification("success", res.data.message))
      .catch((err) => {});
  };

  const handleOpenModal = () => {
    setIsOpen(!isopen);
  };

  useEffect(() => {
    if (props.open) {
      getSubscription();
      getInviteEmails();
      getUseraccount(dispatch, { id: user.id });
      setType(true);
    }
  }, [props.open]);

  const getClientReferenceId = () => {
    return (
      (window.Rewardful && window.Rewardful.referral) ||
      "checkout_" + new Date().getTime()
    );
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

  const initiateSubscriptionCheckout = (data) => {
    if (price) {
      if (price === data) {
        return;
      }
      axios
        .post(webAPI.updateSubscription, {
          subscriptionPlanId: data,
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
    } else {
      axios
        .post(webAPI.create_checkout, {
          subscriptionPlanId: data,
          id: user.id,
          clientReferenceId: getClientReferenceId(),
        })
        .then(async (res) => {
          if (res.data.success) {
            // Load Stripe and redirect to the Checkout page
            const stripe = await loadStripe(res.data.key);

            const { error } = stripe.redirectToCheckout({
              sessionId: res.data.sessionId,
            });
            if (error) {
              console.error("Error:", error);
            }
          } else {
            toast.success(res.data.message);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const getSubscription = () => {
    axios
      .post(webAPI.get_all_products, { id: user.id })
      .then((res) => {
        if (res.data.success) {
          const _subscriptions = [
            res.data.data.data[0],
            res.data.data.data[res.data.data.data.length - 1],
          ];
          setSubscriptions(_subscriptions);
          if (_subscriptions.price_id) {
            setPrice(_subscriptions.price_id);
          }
        }
      })
      .catch((err) => console.error(err));
  };
  const handleCancelSubscription = () => {
    axios
      .post(webAPI.cancel_subscription, { id: user.id })
      .then((res) => {
        window.location.href = res.data.url;
      })
      .catch((err) => console.error(err));
  };
  useEffect(() => {
    const newDescription = subscriptions.map((item) => {
      const parsedDescription = item["description"];
      return parsedDescription.split("\n");
    });
    setDescription(newDescription);
    // handleUpdateProduct();
  }, [subscriptions]);

  const getInviteEmails = () => {
    axios
      .post(webAPI.getinviteEmails, { id: user.id })
      .then((res) => {
        if (res.data.success) {
          let invite_email = [...res.data.data];
          while (invite_email.length < 8) {
            invite_email.push(null);
          }
          setInviteEmails(invite_email);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleUpdateProduct = () => {
    let data1 = {
      id: 1,
      name: "Teacher",
      price: 8.99,
      price_id: "price_1OPsImIhMOfFZaiyaXpphfqv",
      description: `1 Licence to Interactive Tutor
                            500 Monthly Queries (top-ups available)
                            Access to Library
                            Full Styling Options
                            Embed and Share Anywhere
                            Available on IoS and Android`,
    };
    let data2 = {
      id: 4,
      name: "School",
      price: 469,
      price_id: "price_1OPsJ5IhMOfFZaiyz0xmoN6O",
      description: `  Unlimited Licences to Interactive Tutor
                            30k Monthly Queries (top-ups available)
                            Access to Library
                            Full Styling Options
                            Embed and Share Anywhere
                            Available on IoS and Android
                            Integrations with WONDE/Teams/Google available at £1200 + VAT additional cost`,
    };
    axios.post(webAPI.updateProducts, data1).then((res) => console.log(res));
    axios.post(webAPI.updateProducts, data2).then((res) => console.log(res));
  };

  return (
    <Dialog
      open={props.open}
      size={"xl"}
      handler={props.handleCancel}
      className="border-[--site-chat-header-border] border rounded-md shadow-lg shadow-[--site-card-icon-color]"
    >
      <DialogHeader className="px-8 pt-8 pb-6 flex justify-between flex-col md:flex-row">
        <span className="text-[32px] w-full leading-12 font-semibold text-[--site-card-icon-color] flex flex-col items-center justify-center">
          Plans and pricing
        </span>
      </DialogHeader>
      <DialogBody className="text-black text-base font-medium md:px-12 py-4 md:max-h-full max-h-[25rem] overflow-y-auto">
        <Toaster />

        <div className="grid grid-rows-2 w-full gap-12 md:grid-cols-2 md:grid-rows-none">
          {subscriptions.map((item, index) => {
            return (
              <React.Fragment key={item.price_id}>
                {price && price === item.price_id ? (
                  <Card
                    variant="gradient"
                    className="col-span-1 row-span-1 h-full px-4 py-2 bg-primary text-white flex flex-col scale-y-105"
                  >
                    <CardHeader
                      floated={false}
                      shadow={false}
                      color="transparent"
                      className="pb-2 m-0 mb-4 text-center border-b rounded-none border-white/10 h-2/6"
                    >
                      <div className="flex flex-col w-full gap-4 py-2">
                        <span className="flex px-6 text-2xl items-center justify-start w-full">
                          {item.name}
                        </span>

                        <div className="flex items-end justify-start gap-2 px-6 font-semibold">
                          <span className="text-[36px] text-[--site-onboarding-primary-color]">
                            £{item.price} /
                          </span>
                          <span className="text-[--site-onboarding-primary-color] text-[20px]">
                            month
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="p-0">
                      <ul className="flex flex-col gap-2">
                        {subscriptions &&
                          description[index] &&
                          description[index].map((subscription) => (
                            <li
                              className="flex items-start gap-4"
                              key={subscription}
                            >
                              <div className="p-1">
                                <IoCheckbox className="text-[#2DC937] w-8 h-8" />
                              </div>
                              <div className="p-1 items-center justify-start">
                                <span className="font-normal text-start">
                                  {subscription}
                                </span>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </CardBody>
                    <CardFooter className="px-2 pb-4 mt-6 h-1/6 items-center justify-center flex">
                      <Button
                        size="lg"
                        color="white"
                        className="text-white bg-[--site-card-icon-color] hover:scale-[1.02] focus:scale-[1.02] active:scale-100 text-[20px] normal-case w-1/2"
                        ripple={false}
                        onClick={() => {
                          handleCancelSubscription();
                        }}
                        fullWidth={true}
                      >
                        Manage Plan
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card
                    variant="gradient"
                    className="col-span-1 row-span-1 justify-between px-4 py-2 text-[--site-onboarding-primary-color] flex flex-col border border-gray-400 h-full"
                  >
                    <CardHeader
                      floated={false}
                      shadow={false}
                      color="transparent"
                      className="m-0 mb-4 rounded-none border-b border-white/10 pb-2 text-center text-[--site-onboarding-primary-color] h-max flex flex-col"
                    >
                      <div className="flex flex-col w-full gap-4 py-2">
                        <span className="flex px-6 text-2xl items-center justify-start w-full">
                          {item.name}
                        </span>

                        <div className="flex items-end justify-start gap-2 px-6 font-semibold">
                          <span className="text-[36px] text-[--site-onboarding-primary-color]">
                            £{item.price} /
                          </span>
                          <span className="text-[--site-onboarding-primary-color] text-[20px]">
                            month
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="flex flex-col justify-start p-0">
                      <ul className="flex flex-col gap-2">
                        {subscriptions &&
                          description[index] &&
                          description[index].map((subscription) => (
                            <li
                              className="flex items-start gap-4 justify-start w-full"
                              key={subscription}
                            >
                              <div className="p-1">
                                <IoCheckbox className="text-[#2DC937] w-8 h-8" />
                              </div>
                              <div className="p-1 items-center justify-start">
                                <span className="font-normal text-start">
                                  {subscription}
                                </span>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </CardBody>
                    <CardFooter className="px-2 pb-4 items-center justify-center flex">
                      <Button
                        size="lg"
                        color="white"
                        variant="outlined"
                        className="text-[--site-onboarding-primary-color] border border-[--site-onboarding-primary-color] hover:scale-[1.02] focus:scale-[1.02] active:scale-100 text-[20px] normal-case w-1/2 "
                        ripple={false}
                        fullWidth={true}
                        onClick={() =>
                          initiateSubscriptionCheckout(item.price_id)
                        }
                      >
                        Choose Plan
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </DialogBody>
      <Dialog
        open={isopen}
        handler={handleOpenModal}
        className="border-[--site-chat-header-border] border rounded-md"
      >
        <DialogHeader>Custom Plan</DialogHeader>
        <DialogBody divider>
          <span className="text-base text-black">
            You are now on a Custom Plan. To change your plan please contact{" "}
            <span className="text-[--site-main-pricing-color]">
              info@interactive-tutor.com
            </span>
          </span>
        </DialogBody>
        <DialogFooter className="flex items-center justify-end gap-4 pb-8">
          <button
            onClick={handleOpenModal}
            className="bg-transparent border-[--site-card-icon-color] text-[--site-card-icon-color] text-base font-semibold border rounded-md px-4 py-2"
          >
            cancel
          </button>

          <button
            onClick={() => {
              handleCustomPlan();
              handleOpenModal();
            }}
            className="px-4 py-2 text-base font-semibold text-white bg-[--site-card-icon-color] rounded-md"
          >
            confirm
          </button>
        </DialogFooter>
      </Dialog>
    </Dialog>
  );
};

export default SubscriptionModal;
