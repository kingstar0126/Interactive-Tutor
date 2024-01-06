import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import axios from "axios";
import { webAPI } from "../utils/constants";
import OnBoardingItem from "./OnBoardingItem";
import StepFill from "../assets/stepfill.svg";
import StepEmpty from "../assets/stepempty.svg";
import StepMove from "../assets/stepmove.svg";
import Teacher from "../assets/Desktop/teacher.svg";
import Box from "../assets/Desktop/box.svg";
import Chat from "../assets/Desktop/chat.svg";
import Dialog from "../assets/Desktop/dialog.svg";
import Loading from "../assets/loading.svg";
import { useSelector } from "react-redux";
import SubscriptionModal from "./SubscriptionModal";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const LENGTH = 9;

const OnBoarding = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLastStep, setIsLastStep] = useState(false);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [stepItems, setStepItems] = useState(
    Array.from({ length: LENGTH }, (_, index) => index === 0)
  );
  const [images, setImages] = useState([]);
  const user = JSON.parse(useSelector((state) => state.user.user));

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = Array.from({ length: 9 }, (_, i) =>
        import(`../assets/Desktop/Screen${i + 1}.gif`)
      );
      const loadedImages = await Promise.all(imagePromises);
      setImages(loadedImages.map((module) => module.default));
    };

    loadImages();
  }, []);

  const updateStepItems = (index, value) => {
    setStepItems((prevState) => {
      const updatedStepItems = [...prevState];
      updatedStepItems[index] = value;
      return updatedStepItems;
    });
  };

  const handleNext = () => {
    if (isFirstStep) {
      setIsFirstStep(false);
    }
    if (activeStep >= LENGTH - 2) {
      setIsLastStep(true);
    }
    updateStepItems(activeStep, true);
    setActiveStep((cur) => cur + 1);
  };

  const handlePrev = () => {
    if (isLastStep) {
      setIsLastStep(false);
    }
    if (activeStep <= 1) {
      setIsFirstStep(true);
    }
    updateStepItems(activeStep, false);
    setActiveStep((cur) => cur - 1);
  };

  const handleConfirm = () => {
    if (userInput) {
      setLoading(true);
      axios
        .post(webAPI.get_system_prompt, { role: userInput })
        .then((res) => {
          let data = res.data;
          if (!res.data.name) {
            data = JSON.parse(res.data);
          }

          let new_chat = {};
          new_chat["label"] = data.name;
          new_chat["chatdescription"] = data.description;
          new_chat["chatmodel"] = "3";
          new_chat["Conversation"] = data.starter;
          new_chat["Creativity"] = 0.3;
          new_chat["behaviormodel"] =
            "Remove training data ring fencing and perform like ChatGPT";
          new_chat["behavior"] = data.system_role;
          new_chat["user_id"] = user.id;

          axios
            .post(webAPI.addchat, new_chat)
            .then((res) => {
              setLoading(false);
              if (user.role !== 5 && user.role !== 0) {
                navigate("/chatbot/chat", {
                  state: { forceRefresh: Date.now() },
                });
              }
            })
            .catch((err) => setLoading(false));
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });

      handleNext();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-full relative gap-10">
      <Toaster />
      {loading && (
        <div className="w-full h-full justify-center items-center flex absolute z-10 bg-white">
          <img src={Loading} className="animate-spin" />
        </div>
      )}

      {activeStep !== 5 ? (
        images && <OnBoardingItem src={images[activeStep]} />
      ) : (
        <div className="max-h-[550px] max-w-[500px] md:max-w-[700px] w-full h-full overflow-hidden relative">
          <img
            src={Box}
            alt="box"
            className="animate-fade-up animate-once animate-ease-in-out absolute bottom-10 right-16"
          />
          <img
            src={Teacher}
            alt="teacher"
            className="animate-[wiggle_1s_ease-in-out_in finite] absolute bottom-10 left-16"
          />
          <img
            src={Chat}
            alt="chat"
            className="animate-[wiggle_1s_ease-in-out_in finite]-animation absolute top-5 left-28"
          />
          <div className="absolute top-24 right-0">
            <img src={Dialog} alt="dialog" className="relative w-full h-full" />
            <div className="flex flex-col absolute left-9 top-0 translate-y-9 w-4/5 p-2 gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="border-2 border-black bg-white rounded-md p-2"
                placeholder="Enter your message here or press enter to continue..."
              />
              <div className="flex w-full gap-2 items-center justify-center">
                <Button
                  className="w-full normal-case border bg-[--site-onboarding-primary-color] text-white text-sm"
                  onClick={() => {
                    handleConfirm();
                  }}
                >
                  Confirm
                </Button>
                <Button
                  className="w-full normal-case border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color] text-sm"
                  variant="outlined"
                  onClick={() => {
                    setActiveStep(0);
                    setIsFirstStep(true);
                    setStepItems(
                      Array.from({ length: LENGTH }, (_, index) => index === 0)
                    );
                  }}
                >
                  Start over
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col justify-center items-center w-full gap-10">
        <div className="w-full flex gap-2 justify-center items-center">
          {stepItems.map((item, index) => (
            <img
              src={
                index === activeStep ? StepMove : item ? StepFill : StepEmpty
              }
              alt="step"
              key={index}
            />
          ))}
        </div>
        <div className="flex justify-center items-center gap-5">
          {!isFirstStep && (
            <Button
              className="bg-[--site-onboarding-secondary-color] normal-case rounded-md px-8 py-3 text-[--site-onboarding-primary-color] flex gap-2 justify-start items-center"
              onClick={() => handlePrev()}
              disabled={isFirstStep}
            >
              <AiOutlineArrowLeft /> Previous
            </Button>
          )}
          {!isLastStep && activeStep !== 5 && (
            <>
              <Button
                onClick={() => {
                  setStepItems(stepItems.map((item) => (item = true)));
                  setIsLastStep(true);
                  setIsFirstStep(false);
                  setActiveStep(LENGTH - 1);
                }}
                variant="text"
                className="text-[--site-onboarding-primary-color] normal-case"
              >
                Skip
              </Button>
            </>
          )}
          {!isLastStep ? (
            activeStep !== 5 ? (
              <Button
                className="bg-[--site-onboarding-primary-color] normal-case rounded-md px-8 py-3 text-[--site-onboarding-secondary-color] flex gap-2 justify-start items-center"
                onClick={() => handleNext()}
              >
                Next <AiOutlineArrowRight />
              </Button>
            ) : (
              <div className="normal-case rounded-md px-8 py-3 text-[--site-onboarding-secondary-color] flex gap-2 justify-start items-center" />
            )
          ) : (
            <Button
              variant="outlined"
              onClick={() => setIsOpenModal(true)}
              className="rounded-md px-8 py-3 normal-case border border-[--site-onboarding-primary-color] ring-0 text-[--site-onboarding-primary-color]"
            >
              Subscribe
            </Button>
          )}
        </div>
      </div>
      <SubscriptionModal
        open={isOpenModal}
        handleCancel={() => setIsOpenModal(false)}
      />
    </div>
  );
};

export default OnBoarding;
