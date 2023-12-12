import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

import OnBoardingItem from "./OnBoardingItem";
import StepFill from "../assets/stepfill.svg";
import StepEmpty from "../assets/stepempty.svg";
import StepMove from "../assets/stepmove.svg";

const LENGTH = 9;

const OnBoarding = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [isLastStep, setIsLastStep] = useState(false);
    const [isFirstStep, setIsFirstStep] = useState(true);
    const [stepItems, setStepItems] = useState(
        Array.from({ length: LENGTH }, (_, index) => index === 0)
    );
    const [images, setImages] = useState([]);

    const headers = [
        "Welcome to Interactive Tutor",
        "It’s easy to get what you need.",
        "Make your own art!",
        "Data Analysis",
        "Now its time to build your own",
        "Setting up the AI Bot",
        "Personalize with Training data",
        "Congratulations",
        "Subscribe",
    ];

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
        console.log(index, stepItems);
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
        console.log("Prev");
        if (isLastStep) {
            setIsLastStep(false);
        }
        if (activeStep <= 1) {
            setIsFirstStep(true);
        }
        updateStepItems(activeStep, false);
        setActiveStep((cur) => cur - 1);
    };

    return (
        <div className="flex flex-col justify-center items-center w-full h-full px-32 pb-10">
            <div>
                {images && (
                    <OnBoardingItem
                        header={headers[activeStep]}
                        src={images[activeStep]}
                    />
                )}
            </div>
            <div className="w-3/5 py-4 px-8 justify-center items-center">
                <div className="w-full flex gap-2 justify-center items-center">
                    {stepItems.map((item, index) => (
                        <img
                            src={
                                index === activeStep
                                    ? StepMove
                                    : item
                                    ? StepFill
                                    : StepEmpty
                            }
                            alt="step"
                            key={index}
                        />
                    ))}
                </div>
                <div className="mt-16 flex justify-center gap-3">
                    {!isLastStep && (
                        <>
                            {!isFirstStep && (
                                <Button
                                    className="bg-[--site-onboarding-secondary-color] normal-case rounded-md px-8 py-3 text-[--site-onboarding-primary-color] flex gap-2 justify-start items-center"
                                    onClick={() => handlePrev()}
                                    disabled={isFirstStep}
                                >
                                    <AiOutlineArrowLeft /> Previous
                                </Button>
                            )}

                            <Button
                                variant="text"
                                className="text-[--site-onboarding-primary-color] normal-case"
                            >
                                Skip
                            </Button>
                        </>
                    )}
                    {!isLastStep ? (
                        !isFirstStep ? (
                            <Button
                                className="bg-[--site-onboarding-primary-color] normal-case rounded-md px-8 py-3 text-[--site-onboarding-secondary-color] flex gap-2 justify-start items-center"
                                onClick={() => handleNext()}
                            >
                                Next <AiOutlineArrowRight />
                            </Button>
                        ) : (
                            <Button
                                className="rounded-md px-8 py-3 normal-case border border-[--site-onboarding-primary-color] text-[--site-onboarding-primary-color] flex gap-2"
                                onClick={() => handleNext()}
                                variant="outlined"
                            >
                                Next <AiOutlineArrowRight />
                            </Button>
                        )
                    ) : (
                        <Button
                            variant="outlined"
                            className="rounded-md px-8 py-3 normal-case border border-[--site-onboarding-primary-color] ring-0 text-[--site-onboarding-primary-color]"
                        >
                            Subscribe
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnBoarding;
