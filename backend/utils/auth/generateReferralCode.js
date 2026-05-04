const generateReferralCode = () => {
  // Generates a random 8-character alphanumeric code
  return Math.random().toString(36).slice(2, 10).toUpperCase();
};

export default generateReferralCode;
