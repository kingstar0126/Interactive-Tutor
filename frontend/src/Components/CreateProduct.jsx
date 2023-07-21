import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { webAPI } from "../utils/constants";
import ReactLoading from "react-loading";

const CreateProduct = (props) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [currency, setCurrency] = useState("usd");
    const [isloading, setLoadindg] = useState(false);
    const [error, SetError] = useState(false);
    const user = JSON.parse(useSelector((state) => state.user.user));

    const handleSubmit = () => {
        setLoadindg(true);
        if (name && price && description && currency) {
            const productData = {
                user_id: user.id,
                name,
                price,
                description,
                currency,
            };

            axios
                .post(webAPI.create_product, productData)
                .then((response) => {
                    setLoadindg(false);
                    if (response.data.code === 200) {
                        props.handleOk();
                    }
                    // Perform any further actions or display success message
                })
                .catch((error) => {
                    console.error(error);
                    setLoadindg(false);
                    // Handle error response
                });
        } else {
            console.error("Please Enter all field.");
            setLoadindg(false);
        }
    };

    useEffect(() => {
        if (name && price && description) {
            SetError(false);
        } else {
            SetError(true);
        }
    }, [name, price, description]);

    const showHideClassname = props.open
        ? "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
        : "hidden";

    return (
        <div className={showHideClassname}>
            <div className="relative w-3/5 p-5 mx-auto bg-[--site-card-icon-color] text-white rounded-md shadow-lg top-[250px]">
                <div className="flex flex-col items-center justify-center gap-5 p-5">
                    {error && (
                        <span className="text-[--site-error-text-color] font-light">
                            Please Enter all field
                        </span>
                    )}
                    <label className="flex justify-center w-2/3">
                        <span className="flex items-center justify-end w-1/3 pr-2">
                            Product Name:
                        </span>
                        <input
                            type="text"
                            className="w-2/3 text-[--site-card-icon-color] p-2 rounded-xl"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>
                    <label className="flex justify-center w-2/3">
                        <span className="flex items-center justify-end w-1/3 pr-2">
                            Price:
                        </span>
                        <input
                            type="number"
                            className="w-2/3 text-[--site-card-icon-color] p-2 rounded-xl"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </label>
                    <label className="flex justify-center w-2/3">
                        <span className="flex items-center justify-end w-1/3 pr-2">
                            Description:
                        </span>
                        <textarea
                            className="w-2/3 text-[--site-card-icon-color] p-2 rounded-xl"
                            value={description}
                            cols={30}
                            rows={5}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>
                    <label className="flex justify-center w-2/3">
                        <span className="flex items-center justify-end w-1/3 pr-2">
                            Currency:
                        </span>
                        <select
                            className="w-2/3 text-[--site-card-icon-color] p-2 rounded-xl"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            <option value="usd">USD</option>
                            <option value="eur">EUR</option>
                            {/* Add other currency options as needed */}
                        </select>
                    </label>
                    <div className="flex items-center justify-center w-2/3">
                        <button
                            onClick={props.handleCancel}
                            className="mr-10 bg-[--site-logo-text-color] text-[--site-card-icon-color] rounded-lg p-2"
                        >
                            Cancel
                        </button>
                        <div className="bg-[--site-logo-text-color] flex w-[70px] items-center justify-center text-[--site-card-icon-color] rounded-lg p-2">
                            {isloading && (
                                <ReactLoading
                                    type="spin"
                                    color="#153144"
                                    height={20}
                                    width={20}
                                    delay={15}
                                ></ReactLoading>
                            )}
                            {!isloading && (
                                <button
                                    onClick={() => handleSubmit()}
                                    className="w-[50px] h-[20px]"
                                >
                                    Create
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProduct;
