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

const getERC20Balance = async (tokenAddress : any, account : any) => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(account);
    return balance;
  } catch (error : any) {
    console.error("Error fetching token balance:", error.message);
  }
};

interface CheckBalanceProps {
  tokenAddress: string;
  fromAmount: number;
}

export const CheckBalance: React.FC<CheckBalanceProps> = ({ tokenAddress, fromAmount }) => {
  const { address, isConnected } = useAccount();
  const [isSufficientBalance, setIsSufficientBalance] = useState(false);

  useEffect(() => {
    const checkBalance = async () => {
      if (isConnected && address) {
        const tokenBalance = await getERC20Balance(tokenAddress, address);
        if (tokenBalance) {
          const balanceInEther = ethers.utils.formatEther(tokenBalance);
          setIsSufficientBalance(parseFloat(balanceInEther) >= fromAmount);
        }
      }
    };
    checkBalance();
  }, [address, isConnected, tokenAddress, fromAmount]);

  return (
    <div style={{background:"var(--GR, linear-gradient(91deg, #3C38FF 0.09%, #EC476E 51.34%, #FF9F76 118.21%))",borderRadius:"24px", boxShadow:" 16px 11px 50.9px 0px rgba(255, 73, 149, 0.35)",width:"95%"}} className='walletClass'>
      <ConnectButton label={!isSufficientBalance ? 'Connect Wallet':"insuffcient Balance"} />
    </div>
  );
};
