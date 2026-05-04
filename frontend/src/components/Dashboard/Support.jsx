import { useRef, useState } from "react";
import { Mail, Phone, HelpCircle, ArrowRight } from "lucide-react";
import Footer from "../Home/Footer";
import emailjs from "emailjs-com";
import toast from "react-hot-toast";

const faqs = [
  {
    question: "How do I reset my BinaryV account password?",
    answer:
      "Click on 'Forgot Password' at login, enter your email, and follow the instructions sent to you.",
  },
  {
    question: "Can I withdraw funds anytime?",
    answer:
      "Yes, withdrawals are processed instantly in most cases, but may take up to 24 hours depending on your payment provider.",
  },
  {
    question: "Is my data secure with BinaryV?",
    answer:
      "We use top-grade SSL encryption and multi-factor authentication to protect your account and transactions.",
  },
];

export default function Support() {
  const [openIndex, setOpenIndex] = useState(null);
  const formRef = useRef();
  const serviceId = import.meta.env.VITE_SERVICE_ID;
  const templateId = import.meta.env.VITE_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_PUBLIC_KEY;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    emailjs.sendForm(serviceId, templateId, formRef.current, publicKey).then(
      () => {
        toast.success("Message sent successfully");
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      },
      (error) => {
        toast.error("Failed to send message");
      }
    );
  };

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="py-8 text-center bg-gradient-to-b from-black to-gray-900">
        <h1 className="text-4xl font-bold text-green-400">Support Center</h1>
        <p className="mt-4 text-lg text-gray-300">
          Need help with BinaryV? We’re here 24/7 to assist you.
        </p>
      </section>

      {/* Contact Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 p-6">
        <div className="space-y-4">
          <h2 className="text-4xl font-semibold leading-tight">
            Get in <span className="text-green">-</span> <br /> Touch with
            <span className="text-green ml-2">BinaryV</span>
          </h2>
          <p className="text-gray-300">
            Whether you have questions about your account, deposits,
            withdrawals, or trading on BinaryV, our support team is just a
            message away. We aim to respond within a few hours.
          </p>
          <div className="flex  gap-2">
            <p>Email: </p>
            <p className="text-gray-300">
              <a href="mailto:support@binaryv.com">support@binaryv.com</a>
            </p>
          </div>
          <p className="text-gray-400">
            Available Monday to Friday, 9 AM – 6 PM GMT
          </p>
        </div>

        {/* Right form */}
        <div className="bg-gradient-to-br from-gray-500 to-dark shadow-2xl rounded-lg py-6 xl:mx-12">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-3 px-6 xl:px-12"
          >
            <div className="w-full flex flex-col gap-1">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleOnChange}
                placeholder="Full name"
                className="px-3 py-1 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleOnChange}
                placeholder="example@gmail.com"
                className="px-3 py-1 bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label>How can we help you?</label>
              <textarea
                type="text"
                name="message"
                value={formData.message}
                onChange={handleOnChange}
                rows={3}
                placeholder="Enter your message..."
                className="px-3 bg-gray-900 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>

            <button
              type="submit"
              className="flex gap-1 justify-center items-center bg-gradient-to-br from-green to-green-700 px-3 py-2 rounded-lg cursor-pointer "
            >
              Send Message <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
