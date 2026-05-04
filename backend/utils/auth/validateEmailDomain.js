const allowedDomains = ["gmail.com", "yahoo.com", "hotmail.com"]; // Add  allowed domains

const validateEmailDomain = (email) => {
  if (!email) return false;

  const domain = email.split("@")[1];
  return allowedDomains.includes(domain);
};

export default validateEmailDomain;
