import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { TradeProvider } from "./context/TradeContext.jsx";
import { PaymentContextProvider } from "./context/PaymentContext.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PaymentContextProvider>
          <TradeProvider>
            <App />
          </TradeProvider>
        </PaymentContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

