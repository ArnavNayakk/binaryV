import React, { useRef, useState } from "react";

const faqs = [
  {
    question: "What is BinaryV Trading?",
    answer:
      "BinaryV Trading is an online trading platform that allows users to trade stocks, forex, crypto, options, and other financial instruments with ease and security.",
  },
  {
    question: "How do I create an account?",
    answer:
      "To create an account, click on the 'Sign Up' button, fill in your details, verify your email, and set up a secure password. Once completed, you can start trading.",
  },
  {
    question: "Is my money safe on BinaryV Trading?",
    answer:
      "Yes, we use advanced encryption, secure servers, and regulatory-compliant protocols to ensure your funds and personal information are fully protected.",
  },
  {
    question: "How do I deposit money?",
    answer:
      "Log in to your account, go to the 'Deposit' section, choose your preferred payment method, enter the amount, and confirm the transaction.",
  },
  {
    question: "How do I withdraw funds?",
    answer:
      "Go to the 'Withdraw' section, enter the amount you want to withdraw, choose your preferred withdrawal method, and confirm. Withdrawals are processed quickly and securely.",
  },
  {
    question: "What types of trading are available?",
    answer:
      "BinaryV Trading offers multiple trading options including Stocks, Forex, Cryptocurrency, Options, and Futures to help you diversify your portfolio.",
  },
  {
    question: "Do I need prior experience to trade?",
    answer:
      "No prior experience is necessary. Our platform offers beginner guides, tutorials, and demo accounts to help you learn trading at your own pace.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can reach our support team via live chat, email, or the contact form on our website. We provide assistance 24/7.",
  },
  {
    question: "Is there a demo account available?",
    answer:
      "Yes, BinaryV Trading provides a demo account where you can practice trading with virtual funds before investing real money.",
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const contentRef = useRef([]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-[#0b0f1a]  h-full pb-50  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl  mx-auto">
        <h2 className="text-white text-4xl font-bold text-center mb-6">
          FAQs <span className="text-green">Section</span>
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-lg transition-colors duration-300 cursor-pointer border ${
                openIndex === index
                  ? "border-gray-600 bg-gray-900"
                  : "bg-gray-800 border-transparent"
              }`}
              onClick={() => toggleFAQ(index)}
            >
              <div
                className={`flex justify-between items-center px-6 py-4 ${
                  openIndex === index ? "text-green" : "text-white"
                } font-medium`}
              >
                <span>{faq.question}</span>
                <span className="text-green text-xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </div>
              <div
                ref={(el) => (contentRef.current[index] = el)}
                className="overflow-hidden transition-all duration-300 px-6"
                style={{
                  maxHeight:
                    openIndex === index
                      ? contentRef.current[index]?.scrollHeight + "px"
                      : "0px",
                }}
              >
                <p className="pb-4 text-sm text-gray-300">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqSection;
