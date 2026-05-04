import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosClient";
import { useAuth } from "./AuthContext";

export const PaymentContext = createContext();
export const usePayment = () => useContext(PaymentContext);


export const PaymentContextProvider = ({ children }) => {
    const { user } = useAuth();
    const [balances, setBalances] = useState({});
    const [totalBalanceUSD, setTotalBalanceUSD] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user balances
    const fetchBalances = async () => {
        if (!user?._id) {
            setBalances({});
            setTotalBalanceUSD(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await api.get("/api/payment/balance");
            console.log("This balance response", res);
            setBalances(res.data.balances);
            setTotalBalanceUSD(res.data.totalBalanceUSD);
            console.log("User balances fetched:", res.data);
        } catch (err) {
            console.error("Fetch balances error:", err.response?.data || err.message);
            setError(err.response?.data?.error || "Failed to fetch balances");
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalances();
    }, [user?._id])

    const value = {
        balances,
        setBalances,
        totalBalanceUSD,
        setTotalBalanceUSD,
        loading,
        error,
        fetchBalances,
    };

    return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}
