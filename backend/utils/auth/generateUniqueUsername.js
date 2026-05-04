import authModel from "../../models/auth/auth.model.js";

const generateUniqueUsername = async (name) => {
  // Create a base username by removing spaces & lowercasing
  let baseUsername = name.replace(/\s+/g, "").toLowerCase();

  // Check if username exists in DB
  let username = baseUsername;
  let count = 0;
  while (await authModel.findOne({ userName: username })) {
    count++;
    username = `${baseUsername}${count}`;
  }

  return username;
};

export default generateUniqueUsername;
