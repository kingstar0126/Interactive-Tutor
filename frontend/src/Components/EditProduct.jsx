import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { webAPI } from "../utils/constants";
import ReactLoading from "react-loading";

const EditProduct = (props) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [currency, setCurrency] = useState("usd");
    const [isloading, setLoadindg] = useState(false);
    const [error, SetError] = useState(false);
    const user = JSON.parse(useSelector((state) => state.user.user));

    useEffect(() => {
        if (props.data.price) {
            setName(props.data.product.name);
            setPrice(props.data.price);
            setDescription(props.data.product.description);
        }
    }, [props.data]);

    const handleSubmit = () => {
        if (name && price && description && currency) {
            setLoadindg(true);
            const productData = {
                user_id: user.id,
                product_id: props.data.product.id,
                price_id: props.data.price_id,
                name,
                price,
                currency,
                description,
            };

            axios
                .post(webAPI.update_product, productData)
                .then((response) => {
                    setLoadindg(false);
                    props.handleEditOk();
                    // Perform any further actions or display success message
                })
                .catch((error) => {
                    setLoadindg(false);
                    console.error(error);
                    // Handle error response
                });
        }
    };

    useEffect(() => {
        if (name && price && description) SetError(false);
        else SetError(true);
    }, [name, price, description]);

    const showHideClassname = props.open
        ? "fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
        : "hidden";

    return (
        <div className={showHideClassname}>
            <div className="relative w-3/5 p-5 mx-auto bg-[--site-card-icon-color] text-white rounded-md shadow-lg top-[250px]">
                <div className="flex flex-col gap-5 items-center justify-center p-5">
                    <label className="w-2/3 justify-center flex">
                        <span className="w-1/3 flex justify-end pr-2 items-center">
                            Product Name:
                        </span>
                        <input
                            type="text"
                            className="w-2/3 text-[--site-card-icon-color] p-2 rounded-xl"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>
                    <label className="w-2/3 justify-center flex">
                        <span className="w-1/3 flex justify-end pr-2 items-center">
                            Price:
                        </span>
                        <input
                            type="number"
                            className="w-2/3 text-[--site-card-icon-color] p-2 rounded-xl"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </label>
                    <label className="w-2/3 justify-center flex">
                        <span className="w-1/3 flex justify-end pr-2 items-center">
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
                    <label className="w-2/3 justify-center flex">
                        <span className="w-1/3 flex justify-end pr-2 items-center">
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
                    <div className="flex w-2/3 items-center justify-center">
                        <button
                            onClick={props.handleCancel}
                            className="mr-10 bg-[--site-logo-text-color] text-[--site-card-icon-color] rounded-lg p-2"
                        >
                            Cancel
                        </button>
                        <div className="bg-[--site-logo-text-color] flex w-[70px] h-[40px] items-center justify-center text-[--site-card-icon-color] rounded-lg p-2">
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
                                    Update
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
