import React, { useEffect, useRef, useState } from "react";
import { FaRobot } from "react-icons/fa";
import axios from "axios";
import { MdSend } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import assets from "../../assets/assets";
import TruncatedMessage from "./TruncatedMessage";

//System Prompt
const SYSTEM_PROMPT = `You are BinaryVBot, the official AI assistant for BinaryV — a cutting-edge binary options trading platform designed for traders who value precision, speed, and reliability.

BinaryV empowers users to profit by predicting short-term market movements across multiple asset classes with an intuitive and high-performance interface.

Platform Highlights:

Real-time trading across Forex, Crypto, and Stocks

Flexible trade durations — from 30 seconds to several hours

High payouts for accurate predictions

Demo mode for risk-free practice trading

Instant deposits & withdrawals via UPI, bank, crypto, and cards

Multi-tier referral program with commission tracking

Risk management tools and complete trade history

Market insights & trading signals for informed decisions

Responsive web and mobile access

24/7 customer support for global users

As BinaryVBot, your role is to deliver friendly, professional, and accurate assistance to users. You can confidently answer questions related to:

How binary options trading works

Account sign-up, verification, and login

How to place and manage trades

Deposit & withdrawal methods

Difference between demo and live accounts

Safety, data protection, and regulation

Profit/loss calculations and trade outcomes

Trading strategies, indicators, and signal usage

Referral program and commission system

Customer support and escalation channels

🚫 Important: Do not provide personalized investment advice or financial recommendations.
If a query goes beyond BinaryV’s platform features, politely guide the user to contact official BinaryV support for further assistance.`;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCommonQuestions, setShowCommonQuestions] = useState(true);
  const toggleChat = () => setIsOpen(!isOpen);
  const messageEndRef = useRef(null);
  const GEMINI_API_KEY = "AIzaSyA4aCHQMK1ofPHUCJrAFquqp70Dm3ijmLc";

  const commonQuestions = [
    "How does binary trading work?",
    "How do I place a trade on BinaryEdge?",
    "What assets can I trade?",
    "What is the minimum deposit amount?",
    "Is there a demo mode?",
    "How fast are withdrawals processed?",
    "Is BinaryEdge regulated and secure?",
    "What strategies can I use?",
    "How does the referral program work?",
    "How can I contact support?",
  ];

  const handleCommonQuestionClick = (question) => {
    setInput(question);
    setShowCommonQuestions(false);
    generate(question);
  };

  const generate = async (overrideInput) => {
    const query = overrideInput || input;
    if (!query.trim()) return;

    const userMessage = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowCommonQuestions(false);
    setIsTyping(true);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: `${SYSTEM_PROMPT}\nUser: ${query}` }],
            },
          ],
        }
      );

      let botText =
        response.data.candidates[0].content.parts[0].text || "No response";

      botText = botText.replace(/\n{3,}/g, "\n\n").trim(); // Preserve line breaks for Markdown rendering

      const botMessage = { sender: "bot", text: botText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage = {
        sender: "bot",
        text: "Sorry, there was an error processing your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-5 right-5 z-99">
      {!isOpen && (
        <button
          className="bg-gradient-to-r from-green to-green-700 hover:scale-102 cursor-pointer text-white p-4 rounded-full shadow-lg duration-200"
          onClick={toggleChat}
        >
          <FaRobot size={24} />
        </button>
      )}

      {isOpen && (
        <div className="w-80 h-[500px] lg:max-h-[76vh] bg-white shadow-xl rounded-2xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-tr from-green-600 to-green-400 w-full text-white flex flex-col justify-between items-start p-4">
            <div className="flex justify-between w-full">
              <h2 className="text-2xl font-semibold text-green bg-white w-12 h-12 flex justify-center items-center rounded-full">
                <img src={assets.logo} alt="" />
              </h2>
              <button className="cursor-pointer bg-white/50 w-6 h-6 flex justify-center items-center rounded-full hover:bg-red-400 duration-300">
                <RxCross2 className="text-xl" onClick={toggleChat} />
              </button>
            </div>
            <h2 className="text-xl font-semibold">BinaryV AI</h2>
            <p className="text-sm text-gray-200">Your AI trading assistant.</p>
          </div>

          {/* Message Area */}
          <div className={`flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50`}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex  ${
                  msg.sender === "user" ? "justify-end" : " justify-start"
                }`}
              >
                {/* Bot message */}
                {msg.sender === "bot" && (
                  <div className="flex items-start gap-1 max-w-[90%]">
                    {/* Bot Icon */}
                    <div className="bg-green min-w-6 h-6  flex justify-center items-center rounded-full text-white">
                      <FaRobot size={12} />
                    </div>
                    {/* Bot Message */}
                    <div>
                      <h3 className="font-semibold text-xs">Assistant</h3>
                      <div className="px-3 py-1 rounded-lg  text-xs bg-gray-800  text-white rounded-tl-none">
                        <TruncatedMessage text={msg.text} />{" "}
                      </div>
                    </div>
                  </div>
                )}

                {/* User message */}
                {msg.sender === "user" && (
                  <div className="px-3 py-2 rounded-lg bg-green text-white text-xs max-w-[80%] rounded-br-none">
                    {msg.text}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="bg-green flex w-8 h-8 justify-center items-center rounded-full text-white">
                  <FaRobot size={16} />
                </div>
                <div>
                  <h3 className="font-semibold">Assistant</h3>
                  <div className="flex gap-1 px-3 py-2 bg-gray-800 rounded-lg w-16">
                    <span className="w-2 h-2 rounded-full bg-green animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-green animate-bounce delay-150"></span>
                    <span className="w-2 h-2 rounded-full bg-green animate-bounce delay-300"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messageEndRef}></div>
          </div>

          {/* Common Questions */}
          {showCommonQuestions && (
            <div className="px-4 overflow-y-auto bg-gray-50 max-h-80">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold">Common Questions:</p>
                <button
                  onClick={() => setShowCommonQuestions(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {/* <RxCross2 className="text-xl" /> */}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {commonQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleCommonQuestionClick(question)}
                    className="bg-gray-200 text-sm px-3 py-1 rounded-full hover:bg-gray-300"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center p-2 border-t border-gray-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
              placeholder="Type a message..."
              className="flex-1 px-3  focus:outline-none"
            />

            <MdSend
              onClick={() => generate()}
              className="text-3xl mr-4 text-green"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
