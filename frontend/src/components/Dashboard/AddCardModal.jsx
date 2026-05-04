import { useState } from "react";

export default function AddCardModal({ setCards, setIsModalOpen }) {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    type: "",
    cvv: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCards((prev) => [...prev, cardDetails]);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-md mx-auto h-[50%] text-green bg-gray-800 p-6 shadow-lg rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Add Card Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white"
          >
            Card Type
          </label>
          <input
            name="type"
            type="text"
            placeholder="Visa"
            value={cardDetails.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="cardHolderName"
            className="block text-sm font-medium text-white"
          >
            Cardholder Name
          </label>
          <input
            id="name"
            name="cardHolderName"
            type="text"
            placeholder="John Doe"
            value={cardDetails.cardHolderName}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="cardNumber"
            className="block text-sm font-medium text-white"
          >
            Card Number
          </label>
          <input
            id="number"
            name="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={handleChange}
            required
            maxLength={16}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="expiryDate"
              className="block text-sm font-medium text-white"
            >
              Expiry Date
            </label>
            <input
              id="expiry"
              name="expiryDate"
              type="text"
              placeholder="MM/YY"
              value={cardDetails.expiryDate}
              onChange={handleChange}
              required
              maxLength={5}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="cvv"
              className="block text-sm font-medium text-white"
            >
              CVV
            </label>
            <input
              id="cvv"
              name="cvv"
              type="password"
              placeholder="***"
              value={cardDetails.cvv}
              onChange={handleChange}
              required
              maxLength={4}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-green text-white py-2 px-4 rounded-lg hover:bg-green/90 cursor-pointer transition-colors"
        >
          Save Card
        </button>
      </form>
    </div>
  );
}
