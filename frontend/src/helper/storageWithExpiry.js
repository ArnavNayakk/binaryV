// Save data with expiry time (in milliseconds)
export const setWithExpiry = (key, value, expiryInMs) => {
  const now = Date.now();

  const item = {
    value,
    expiry: now + expiryInMs,
  };

  localStorage.setItem(key, JSON.stringify(item));
};

// Get data which expires
export const getWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);

  // If item does not exist, return null
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = Date.now();

  // Check if expired
  if (now > item.expiry) {
    localStorage.removeItem(key); // delete expired cache
    return null;
  }

  return item.value; // return actual data
};
