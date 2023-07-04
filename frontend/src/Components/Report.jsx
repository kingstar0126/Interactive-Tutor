import axios from "axios";
import { webAPI } from "../utils/constants";
import { useState, useEffect } from "react";
import { HiDocumentReport } from "react-icons/hi";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Report = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const [datasets, setDatasets] = useState([]);
    const [traindata, setTraindata] = useState([]);
    const [chat, setChat] = useState([]);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) =>
        (i + 1).toString()
    );
    const user = JSON.parse(useSelector((state) => state.user.user));

    useEffect(() => {
        axios
            .post(webAPI.get_report_data, { id: user.id })
            .then((res) => {
                const dataset = [];
                res.data.data.map((item, index) => {
                    const output = Array(daysInMonth).fill("0");

                    item.forEach((element) => {
                        output.forEach((ele, index) => {
                            if (index === parseInt(element)) {
                                const ct = parseInt(ele) + 1;
                                output[index] = ct.toString();
                                return;
                            }
                        });
                    });
                    let new_data = {
                        label: "AI Tutor" + (index + 1).toString(),
                        data: output,
                        borderColor: getRandomColor(),
                    };
                    dataset.push(new_data);
                });
                setDatasets(dataset);
            })
            .catch((err) => console.error(err));
    }, []);

    function getRandomColor() {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    const data = {
        labels: labels,
        datasets: datasets,
    };

    return (
        <div className="w-full h-full p-4 pl-5 pr-10">
            <div className="flex items-center justify-between p-5 bg-[--site-card-icon-color] rounded-full">
                <div className="flex items-center justify-center gap-2 font-semibold text-[20px] text-white">
                    <HiDocumentReport className="fill-[--site-logo-text-color]" />
                    Report
                </div>
            </div>
            <div className="py-5">
                <span>Number of AI Tutor uses per month</span>
                <Line data={data} />
            </div>
        </div>
    );
};

export default Report;
