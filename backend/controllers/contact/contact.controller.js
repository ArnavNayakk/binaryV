import Contact from "../../models/contactus/contact.model.js";

// SUBMIT CONTACT FORM
const submitContactForm = async (req, res) => {
  try {
    const { name, email, query } = req?.body || {};

    // Basic validation
    if (!name?.trim() || !email?.trim() || !query?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, and Query are required"
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email?.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Save to database
    const saved = await Contact.create({
      name: name?.trim(),
      email: email?.trim(),
      query: query?.trim(),
    });

    return res.json({
      success: true,
      message: "Your query has been submitted successfully",
      data: saved,
    });

  } catch (error) {
    console.error("Contact Form Error:", error?.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later."
    });
  }
};

export { submitContactForm };
