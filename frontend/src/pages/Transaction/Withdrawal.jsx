import React from 'react'
import { useNavigate } from "react-router-dom";

import WalletNavlink from '../../components/Dashboard/WalletNavlink'
import CryptoNetwork from '../../components/Payment/CryptoNetwork'

function Withdrawal() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <WalletNavlink/>
      <CryptoNetwork type="withdrawal"/>
    </div>
  )
}

export default Withdrawal