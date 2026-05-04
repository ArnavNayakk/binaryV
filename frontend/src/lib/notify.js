import toast from "react-hot-toast";

const baseStyle = {
  background: "rgba(17, 24, 39, 0.96)",
  color: "#f9fafb",
  border: "1px solid rgba(148, 163, 184, 0.18)",
  boxShadow: "0 14px 40px rgba(15, 23, 42, 0.35)",
};

export const notifySuccess = (message) =>
  toast.success(message, {
    duration: 3500,
    style: baseStyle,
  });

export const notifyError = (message) =>
  toast.error(message, {
    duration: 4500,
    style: baseStyle,
  });
