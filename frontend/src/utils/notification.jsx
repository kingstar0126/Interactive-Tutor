import toast from "react-hot-toast";

const notification = (type, message) => {
  // To do in here
  if (type === "error") {
    toast.error(message);
  }
  if (type === "success") {
    toast.success(message);
  }
};

export default notification;
