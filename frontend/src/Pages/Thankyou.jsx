import React from "react";
import Header from "../Layout/Header";
import { FiCheckCircle } from "react-icons/fi"
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'

const ThankYou = () => {
    const { width, height } = useWindowSize()
    
    return (
        <div className="font-logo h-screen pb-10 px-2 flex flex-col">
            <div>
                <Header />
            </div>
            <Confetti
            width={width}
            height={height}
            />
            <div className=" flex-1 flex flex-col justify-center items-center bg-no-repeat bg-cover relative text-center">
                <FiCheckCircle className="text-[rgba(0,255,8,0.75)] text-[400px] top-[calc(50%-200px)] md:left-[calc(50%-400px)] left-[calc(50%-200px)] opacity-75 absolute" />
                <h1 className="mb-5 font-bold text-gray-800 text-7xl drop-shadow-lg">
                    Success
                </h1>
                <h2 className="mb-3 text-3xl font-semibold text-gray-800 drop-shadow-lg">
                    Your registration was successful.
                </h2>
                <p className="mb-8 text-lg text-center text-gray-800 drop-shadow-lg">
                    An email confirmation has been sent.
                </p>
            </div>
        </div>
    );
};

export default ThankYou;