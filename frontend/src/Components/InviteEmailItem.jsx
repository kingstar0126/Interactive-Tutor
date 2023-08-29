import { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { BsCheckCircleFill } from "react-icons/bs"
import { Button, Chip } from "@material-tailwind/react";
import { useEffect } from "react";
import axios from "axios";
import { webAPI } from "../utils/constants";
import { useSelector } from "react-redux";

const InviteEmailItem = (props) => {
    const [data, setData] = useState('');
    const [email, setEmail] = useState('');
    const [index, setIndex] = useState(0);
    const user = JSON.parse(useSelector((state) => state.user.user));

    useEffect(() => {
        if (props.data) {
            console.log(props.data)
            setData(props.data);
            setIndex(props.data.index);
            setEmail(props.data.email);
        }
    }, [props])

    const handleChange = (e) => {
        let {value} = e.target
        setEmail(value);
    }

    const handleOk = (e) => {
        e.preventDefault();
        if (email) {
            axios
            .post(webAPI.inviteEmail, {email:email, id: user.id, index: index})
            .then(res => {
                if(res.data.success) {
                    props.InviteConfirm('success', res.data.message)
                }
                else {
                    props.InviteConfirm('error', res.data.message)
                }
            })
            .catch(err => console.error(err))
        }
    }

    return (
        <div className="w-full flex gap-2 justify-center items-center ">
            <div className="w-2/3 flex">
                <div className="flex flex-col w-1/2 relative items-center m-auto">
                    <input className="border-[--site-chat-header-border] border bg-transparent pl-4 pr-6 py-2 rounded-md w-full" placeholder="Enter email address" onChange={handleChange} defaultValue={email}/>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                        <RiDeleteBin6Line className="active:fill-[--site-error-text-color] fill-[--site-card-icon-color]" onClick={() => setEmail('')}/>
                    </div>
                </div>

                <div className="w-1/2 flex p-1 ml-2">
                {data ? data.status ? 
                <Chip
                    variant="ghost"
                    color="green"
                    size="sm"
                    value="Subscribed"
                    className="normal-case h-full w-full"
                    icon={
                        < BsCheckCircleFill className="h-4 w-4 rounded-full fill-green-900" />
                    }
                /> :
                <Chip
                    variant="ghost"
                    color="amber"
                    size="sm"
                    value="Not Subscribed"
                    className="normal-case h-full w-full"
                    icon={
                        < BsCheckCircleFill className="h-4 w-4 rounded-full fill-yellow-900" />
                    }
                />
                : <Button className=" normal-case bg-[--site-main-pricing-color]" onClick={handleOk}>Invite</Button>}
                </div>
            </div>
        </div>
    );
};

export default InviteEmailItem;
