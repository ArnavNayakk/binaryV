import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import AddCardModal from "./AddCardModal";
import { useDraggable } from "react-use-draggable-scroll";

const CardDetails = ({ isEditing, setIsEditing }) => {
  const scrollRef = useRef(null);
  const { events } = useDraggable(scrollRef); //events for draggable scroll
  const [cards, setCards] = useState([
    {
      cardNumber: "4111111111111111",
      cardHolderName: "John Doe",
      expiryDate: "09/28",
      cvv: "123",
      type: "Visa",
    },
    {
      cardNumber: "5500000000000004",
      cardHolderName: "Jane Smith",
      expiryDate: "05/27",
      cvv: "456",
      type: "MasterCard",
    },
    {
      cardNumber: "340000000000009",
      cardHolderName: "Michael Johnson",
      expiryDate: "12/29",
      cvv: "789",
      type: "Amex",
    },
    {
      cardNumber: "6011000000000004",
      cardHolderName: "Emily Brown",
      expiryDate: "03/26",
      cvv: "321",
      type: "Discover",
    },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="bg-gray-800/70 p-6 rounded-2xl border border-white/6">
      <div className="flex justify-between">
        <h1 className="font-space-grotesk font-semibold mb-6 text-xl text-green">My Cards</h1>
        <div className="flex justify-center items-center gap-2 font-semibold mb-6 text-green">
          <p>{cards.length} Cards</p>
          <button
            onClick={() => setIsModalOpen(!isModalOpen)}
            className="border border-gray-50 rounded-md px-2 py-1 bg-black text-white cursor-pointer"
          >
            {isModalOpen ? "Close" : "Add more cards"}
          </button>
        </div>
      </div>
      {/*Modal */}
      {isModalOpen && (
        <AddCardModal setCards={setCards} setIsModalOpen={setIsModalOpen} />
      )}
      <div
        ref={scrollRef}
        {...events}
        className="grid  grid-flow-col gap-6 h-66 overflow-auto cursor-grab select-none scrollbar-hide"
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className="metal-profile-card text-white rounded-2xl p-6 w-110 shadow-lg"
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/55">BinaryV Signature</p>
                  <h2 className="text-lg font-semibold mt-2 font-space-grotesk">{card.type}</h2>
                </div>
                <div className="metal-chip h-10 w-14 rounded-lg border border-white/20" />
              </div>

              <p className="text-xl tracking-[0.35em] mb-6 font-space-grotesk">
              {card.cardNumber?.replace(/(\d{4})(?=\d)/g, "$1 ")}
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">Card Holder</p>
                  <p className="font-semibold">{card.cardHolderName}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">Expires</p>
                  <p className="font-semibold">{card.expiryDate}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-end text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">CVV</p>
                  <p className="font-semibold">{card.cvv}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
                  Premium Access
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardDetails;
