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
      let dataset = [];
      props.datas.map((item) => {
        if (item.length <= props.index) {
          item.unshift(0);
        }
        const data = {
          label: item.slice(-1),
          fill: true,
          data: item.slice(0, -1),
          borderColor: getRandomColor(),
          backgroundColor: createGradientBackground(),
          borderWidth: 1,
        };
        dataset.push(data);
      });

      setData({
        labels,
        datasets: dataset,
      });
      if (data.labels && datas.length) {
        setData((prevState) => ({ ...prevState }));
      }
    }
  }, [props]);

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  const createGradientBackground = () => {
    const ctx = document.createElement("canvas").getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    const color = getRandomColor();
    gradient.addColorStop(0, color + "ff");
    gradient.addColorStop(1, color + "00");

    return gradient;
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
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
        <Line options={options} data={data} className="p-2 text-black" />
      )}
    </div>
  );
};

export default Report;
