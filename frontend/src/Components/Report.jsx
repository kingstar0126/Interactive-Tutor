import React, { useState, useEffect } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Colors,
    Filler,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Colors,
    Filler,
    Legend
);

const Report = (props) => {
    const [data, setData] = useState({});

    useEffect(() => {
        let { labels, datas } = props;

        if (labels && datas.length) {
            setData({
                labels,
                datasets: [
                    {
                        fill: true,
                        data: props.datas,
                        borderColor: "rgba(71, 141, 4, 1)",
                        backgroundColor: createGradientBackground(),
                        borderWidth: 1,
                    },
                ],
            });
            if (data.labels && datas.length) {
                setData((prevState) => ({ ...prevState }));
            }
        }
    }, [props]);

    const createGradientBackground = () => {
        const ctx = document.createElement("canvas").getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, "rgba(216, 249, 173, 1)");
        gradient.addColorStop(1, "rgba(216, 249, 173, 0)");

        return gradient;
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: 16, // Set the font size for x-axis labels
                    },
                    color: "black",
                    padding: 10, // Adjust the padding between labels and axis
                },
            },
            y: {
                ticks: {
                    font: {
                        size: 16, // Set the font size for x-axis labels
                    },
                    color: "black",
                    padding: 10, // Adjust the padding between labels and axis
                },
            },
        },
    };
    return (
        <div className="w-full min-h-[20rem] text-black">
            {data.labels && (
                <Line
                    options={options}
                    data={data}
                    className="p-2 text-black"
                />
            )}
        </div>
    );
};

export default Report;
