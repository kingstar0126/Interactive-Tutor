import React from "react";
import { Avatar, Rating } from "@material-tailwind/react";

const ReviewItem = (props) => {
  const review = props.review;
  return (
    <div className="flex flex-col">
      <Rating value={review.rating} readonly/>
      <p>{review.message}</p>
      <div className="flex items-center gap-2">
        <Avatar src={review.useravatar} />
        <span>{review.username}</span>
      </div>
    </div>
  );
};

export default ReviewItem;
