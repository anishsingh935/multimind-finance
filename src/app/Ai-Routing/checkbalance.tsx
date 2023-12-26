import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { ConnectButton } from "@rainbow-me/rainbowkit";

const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
];

// const getERC20Balance = async (tokenAddress : any, account : any) => {
//   try {
//     const provider = new ethers.providers.Web3Provider(window.ethereum as any);
//     const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
//     const balance = await contract.balanceOf(account);
//     return balance;
//   } catch (error : any) {
//     console.error("Error fetching token balance:", error.message);
//   }
// };

interface CheckBalanceProps {
  tokenAddress: string;
  fromAmount: number;
  location: string;
}

export const CheckBalance: React.FC<CheckBalanceProps> = ({ tokenAddress, fromAmount,location }) => {
  console.log(location);
  
  const { address, isConnected } = useAccount();
  const [isSufficientBalance, setIsSufficientBalance] = useState(false);
  return (
    <div style={{background:"var(--GR, linear-gradient(91deg, #3C38FF 0.09%, #EC476E 51.34%, #FF9F76 118.21%))",borderRadius:"24px", boxShadow:" 16px 11px 50.9px 0px rgba(255, 73, 149, 0.35)",width:`${location=="top"?"15%":"95%"}`,minWidth:"200px"}} className='walletClass'>
      <ConnectButton label={!isSufficientBalance ? 'Connect Wallet':"Insuffcient Balance"} showBalance={false} chainStatus="none"/>
    </div>
  );
};
