import React from "react";
import ReactSpeedometer from "react-d3-speedometer";

const Speedometer = ({ id, value, title }) => {
  return (
    <div>
      <ReactSpeedometer
        maxValue={14}
        minValue={0}
        height={40}
        width={140}
        value={value}
        needleTransition="easeQuadIn"
        needleTransitionDuration={1000}
        needleColor="red"
        startColor="green"
        segments={7}
        endColor="blue"
      />
      <div>{title}</div>
    </div>
  );
};

export default Speedometer;
