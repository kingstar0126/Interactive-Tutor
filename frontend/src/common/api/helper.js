import axios from "axios";

export const apiFetch = async (url, arg) => {
  const headers = {
    "Content-Type": "application/json",
    ...arg.headers
  };
  try {
    return await axios({ url, ...arg, headers }).then((res) => res.data);
  } catch (error) {
    console.error("Error fetching todos:", error);
    return error;
  }
};
