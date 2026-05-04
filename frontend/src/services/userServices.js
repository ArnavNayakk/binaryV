import api from "../api/axiosClient";

const toProfileFormData = (input) => {
  if (input instanceof FormData) return input;

  const formData = new FormData();
  Object.entries(input || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, value);
  });
  return formData;
};

// Get User API
export const getUser = async () => {
  const res = await api.get("/api/auth/profile");
  return res.data;
};

// Update User
export const updateProfile = async (data) => {
  const formData = toProfileFormData(data);
  const res = await api.put("/api/auth/update", formData, {
    timeout: 60000,
  });
  return res.data;
};

export const changePassword = async (data) => {
  const res = await api.put("/api/auth/change-password", data);
  return res.data;
};
