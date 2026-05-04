import React from 'react';
import cryptoLogos from '../../assets/cryptoLogos';
import { useNavigate } from 'react-router-dom';

function CryptoNetwork({ type = 'deposit' }) {
  const navigate = useNavigate();

  const handleCryptoClick = (route) => {
    navigate(`/dashboard/portfolio/${type}${route}`);
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="grid grid-cols-1  lg:grid-cols-3 gap-6">
        {cryptoLogos.map((crypto) => (
          <div
            key={crypto.symbol}
            role="button"
            tabIndex={0}
            onClick={() => handleCryptoClick(crypto.route)}
            onKeyPress={(e) => e.key === 'Enter' && handleCryptoClick(crypto.route)}
            className="group relative flex items-center gap-4 p-4 bg-gray-900 border border-gray-700 rounded-xl shadow-md cursor-pointer
                       transform transition duration-300 hover:scale-102 hover:shadow-lg hover:shadow-green-500/20  backdrop-blur-md"
          >
            {/* Icon */}
            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-lg p-2 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
              <img
                src={`/crypto-icons/${crypto.file}`}
                alt={crypto.name}
                className="w-6 h-6 object-contain"
              />
            </div>

            {/* Name */}
            <span className="text-white font-semibold text-sm sm:text-base">
              {crypto.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CryptoNetwork;
