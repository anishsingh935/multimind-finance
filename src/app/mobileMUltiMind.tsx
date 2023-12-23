"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

import '@rainbow-me/rainbowkit/styles.css';
import { CheckBalance } from "./Ai-Routing/checkbalance";
import { Button } from "@/components/ui/button";
import { ethers } from 'ethers';
import { TbRefresh } from "react-icons/tb";
import { AiOutlineSwap } from "react-icons/ai";
import CircleImage from '@/app/CircleImage.svg'
import {
  DropdownMenu,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import calculateTrades from './Ai-Routing/Trades' 
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BLOCKCHAIN_NAME, CrossChainTrade,OnChainTrade, SDK, WalletProvider, CHAIN_TYPE, Configuration } from "rubic-sdk";
import { Input } from "@/components/ui/input";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import RouteCard from "@/components/route-card";
import DialogModal from "@/components/dialogModal";
import { Alchemy ,Network } from "alchemy-sdk";
import configuration from './rubic';


declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider; 
  }
  interface CoinData {
    chains: Array<Chain>; 
  }
}
interface Chain {
  id: string;
  name: string;
  logoURI: string;
}
interface IWalletProvider {
  [key: string]: { crossChain?: string; onChain?: string };
}

interface CoinData {
  [x: string]: any;
  chains?: Chain[]; 
}
interface Token {
  name: string;
  image: string;
}

export default function MobileHome() {
  
  const [isBalance,setIsBalance] = useState(false);

  const [fromData, setFromData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: "",
    tokenSymbol: "",
    usdprice:""
  });

  const [toData, setToData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: "",
    tokenSymbol: "",
    usdprice : ""
  });
  const { isConnected, address } = useAccount();
  const [showAccordion1, setShowAccordion1] = useState(false);
  const [showAccordion2, setShowAccordion2] = useState(false);
  const [coinData, setCoinData] = useState<CoinData>({ chains: [] });
  const [selectedToken1, setSelectedToken1] = useState<Token | null>(null);
  const [selectedToken2, setSelectedToken2] = useState<Token | null>(null);
  const [value, setValue] = useState<any[]>([]);
  const [walletClicked, setWalletClicked] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [providerArray, setProviderArray] = useState<any[]>([]); 
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [TradeClicked, setTradeClicked] = useState<any>();
  type MyBlockchainName = 'ETHEREUM' | 'POLYGON'  | 'AVALANCHE' | 'SOLANA';

  const getAlchemyConfig = (blockchainName) => {
    const apiKeyMapping = {
      'ethereum': 'R0XpsJFtNE8vdpN3eZpRfWh5TzBfFFsU',
      'polygon': '6mwmXKoYNk2dqMEqePtoptLbRDaIhQyP'
    };
    const networkMapping = {
      'ethereum': Network.ETH_MAINNET,
      'polygon': Network.MATIC_MAINNET
    };
    return {
      apiKey: apiKeyMapping[blockchainName],
      network: networkMapping[blockchainName]
    };
  };


  const fetchTokenBalance = async (address, tokenAddress, blockchain) => {
    const alchemyConfig = getAlchemyConfig(blockchain);
    const alchemy = new Alchemy(alchemyConfig);
    try {
      const data = await alchemy.core.getTokenBalances(address, [tokenAddress]);
      console.log("Token balance for Address", data);
      return data.tokenBalances[0].tokenBalance;
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };
 


  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await axios.get("https://li.quest/v1/chains");
        const temp = response?.data?.chains?.filter(
          (res: any) =>
            res?.name === "Ethereum" ||
            res?.name === "Polygon" ||
            res?.name === "Avalanche"
        );
        const solanaobj = {
          id: 1399811149,
          name: "solana",
          logoURI:
            "https://app.rubic.exchange/assets/images/icons/coins/solana.svg",
        };
        temp.push(solanaobj);
        setCoinData(temp);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCoinData();
  }, []);

  async function fetchTrades() {
    try {
      console.log("fromData in fetchTrades",typeof fromData.token)
      console.log("toData in fetchTrades",typeof toData.token)
      const blockchainFrom = fromData.token.toUpperCase() as MyBlockchainName;
      const blockchainTo = toData.token.toUpperCase() as MyBlockchainName;
      console.log(blockchainFrom)
      console.log(blockchainTo)
      const result = await calculateTrades(blockchainFrom, fromData.tokenAddress, blockchainTo, toData.tokenAddress, fromData.amount);
      setProviderArray(result)
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  }
  


  const handleNetworkRender = async (tokenName: any, type: any) => {
    // const {isConnected}=useAccount();
    // https://tokens.rubic.exchange/api/v1/tokens/?page=1&pageSize=200&network=polygon
    try {
      const res = await axios.get(
        `https://tokens.rubic.exchange/api/v1/tokens/?page=1&pageSize=200&network=${tokenName}`
      );
      if (type === "from") {
        setFromData({ ...fromData, token: tokenName });
      }
      if (type === "to") {
        setToData({ ...toData, token: tokenName });
      }
      setValue(res.data.results);
      console.log("Tokens ss", res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleTokenSelection1 = (tokenName: string, tokenImage: string) => {
    const selectedToken: Token = {
      name: tokenName,
      image: tokenImage,
    };
    setSelectedToken1(selectedToken);
    setShowAccordion1(false);
  };

  const handleTokenSelection2 = (tokenName: string, tokenImage: string) => {
    const selectedToken2: Token = {
      name: tokenName,
      image: tokenImage,
    };
    setSelectedToken2({ name: tokenName, image: tokenImage });
    setShowAccordion2(false);
  };
  const handleNetworkset=(value:any, networkValue:any,networkSymbol:any )=>{  
    setToData({ ...toData, network: value,  tokenAddress: networkValue?.address, tokenSymbol:networkSymbol,usdprice: networkValue.usdPrice, });
  }
  const handleNetworkset1=(value:any, networkValue:any,networkSymbol:any )=>{
    setFromData({ ...fromData, network: value, tokenAddress:networkValue?.address,tokenSymbol:networkSymbol,usdprice: networkValue.usdPrice, });
  }

  const calculateToAmount = async () => {
    try {
      debugger
      let USDPriceFromToken : any = fromData.usdprice;
      let USDPriceToToken : any = toData.usdprice;     
      const amountInUSD : any =fromData.amount*(USDPriceFromToken);
      const toAmount = amountInUSD/(USDPriceToToken);
      setToData({ ...toData, amount: toAmount });
      fetchTrades();
    } catch (error) {
      console.error("Error in calculating toToken amount:", error);
    }
};

  
  useEffect(() => {
    if (fromData.tokenAddress && toData.tokenAddress && fromData.amount) {
      calculateToAmount();
    }
  }, [fromData.tokenAddress, toData.tokenAddress, fromData.amount]);


  const configureWallet = async () => {

    if (isConnected && address) {
      const walletProvider: any = {
        [CHAIN_TYPE.EVM]: {
          address,
          core: window.ethereum
        }
      };

      try {
        const updatedConfiguration: any = { ...configuration, walletProvider };
        const sdk = await SDK.createSDK(updatedConfiguration);
        sdk.updateWalletProvider(walletProvider);
        console.log("SDK configuration successful");
      } catch (error) {
        console.error("Error in SDK configuration:", error);
      }
    }
  };

  useEffect(() => {
    configureWallet();
  }, [address, isConnected]);


  useEffect(() => {
    if (fromData.tokenAddress && address && isConnected && fromData.amount > 0 && toData.tokenAddress) {
      fetchTokenBalance(address, fromData.tokenAddress, fromData.token)
        .then(balance => {
          if (parseFloat(balance) >= fromData.amount) {
            performSwap(TradeClicked);
          } else {
            alert(`Insufficient Balance for Transaction`);
            console.log("Insufficient Balance");
          }
        })
        .catch(error => console.error(error));
    }
  }, [TradeClicked, fromData]);
  
  

  const performSwap = async (bestTrade: any) => {

    console.log(bestTrade.trade);
    try {

      const trade = bestTrade.trade as CrossChainTrade | OnChainTrade ;

      const receipt = trade.swap(
        {
          onConfirm: (hash: any) => console.log('Transaction Hash:', hash),
        }).then(hash => {
          console.log("swap function called success");
          alert(`Transaction was successfull ${hash}`);
          console.log(hash);
        }).catch(err => {
          alert("SWAP TRANSACTION FAILED");
          console.log("swap function called failed");
          console.error(err);
        });
      console.log('Trade executed:', receipt);
    } catch (error) {
      console.error('Error executing trade:', error);
    }
  };


  return (
    <div
      style={{ display: "flex", flexDirection:"column", color: "white", backgroundColor: "#0E111C", alignItems:"center" }}
    >
      <nav className="flex w-full justify-start items-start">
            <Image src="/MUFI.png" width={50} height={50}  alt="navicon" className="pl-0 ml-4 mt-2 object-fill" />
            {/* <button></button> */}
          </nav>
      <div
        style={{ marginTop: "1vh", width: "90%", borderRadius: "20px", display: "flex", flexDirection: "column", paddingTop:"10px", height:"55vh" }}
      >
        <div style={{ fontSize: "20px", fontWeight: "600" }} className="w-full flex px-5 py-4  justify-between"><h1>MultiMind Finance</h1> <TbRefresh /></div>
        <div className="border-[1px] border-[#27272A]"></div>
        <div>
        <div
          style={{  height: "90%", width: "100%", borderRadius: "24px", display: "flex", flexDirection: "column",gap:"10px" ,justifyContent: "space-between",  padding: "20px", alignItems: "center", marginTop:"4px" }}
        >
          <div
            style={{ color:"white" ,width: "100%", height:"200px", borderRadius: "24px", padding: "20px",gap:"11px",background:"var(--Dark-80, #27272A)",border: "1px solid var(--Dark-70, #3F3F46)", display:"flex",flexDirection:"column",justifyContent:"center" }}
          >
            <div style={{height:"40%",display:"flex",flexDirection:"row",alignItems:"center",gap:"22px"}}>
              <Button variant="ghost" className="bg-transparent text-white hover:bg-transparent hover:text-white w-[29%] h-[137px] space-x-2" onClick={() => setShowAccordion1(!showAccordion1)}>
                    {selectedToken1?.image ? (
                      <div className="relative">
                      <img src={selectedToken1.image} alt="bt-image" style={{width:"50px",height:"50px",maxWidth:"50px",borderRadius:"50%"}}/>
                      <img src={fromData.tokenSymbol} alt="bt-image"  style={{width:"30px",height:"30px", maxWidth:"30px",borderRadius:"50%",position:"relative",bottom:"20px",left:"25px"}}/>
                      </div>
                    ) : (
                      <div className="" style={{display:"flex",flexDirection:"column"}}>
                        <img
                        src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                        alt="bt-image"
                        style={{width:"50px",height:"50px",maxWidth:"50px",borderRadius:"50%"}}
                      />
                      <img
                        src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                        alt="bt-image"
                        style={{width:"35px",height:"35px", maxWidth:"35px",borderRadius:"50%",position:"relative",bottom:"20px",left:"25px"}}
                      />
                      </div>

                    )}
                  </Button>
                    <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"flex-start",marginTop:"-15px"}}>
                      <span className="font-bold text-lg"> {fromData?.token ? fromData?.token : "Coin name"} </span>
                      <span className="font-normal text-xl text-[#52525B]"> {fromData?.network ? fromData?.network : "Network name"} </span>
                      </div>
            </div>
              {showAccordion1 && coinData && (
               <DialogModal
               coinData={coinData}
               handleNetworkset={handleNetworkset1}
               value={value}
               handleNetworkRender={handleNetworkRender}
               handleTokenSelection={handleTokenSelection1}
               type={'from'}
             />)}

                <input
                  type="number"
                  placeholder="Enter an Amount"
                  className="bg-[#52525B] border-2 text-neutral-400 w-[100%] h-[40%] px-[16px] py-[12px] flex bg-transparent text-2xl border-none focus:border-none float-right rounded-[22px]"
                  value={fromData?.amount}
                  onChange={(e)=>setFromData({ ...fromData, amount:parseFloat(e.target.value) })}
                />
          </div>

          <div style={{display:"flex",flexDirection:"row",gap:"2px"}}>
            <Image src={CircleImage} alt="arrow" width={50} height={50}  className="rounded-full mt-2" />
            {/* <AiOutlineSwap className="text-3xl rounded-full mr-1 border-2 " /> */}
          </div>

          <div
          style={{ width: "100%", height:"200px", borderRadius: "24px", padding: "20px",gap:"11px",background:"var(--Dark-90, #18181B)",border: "1px solid var(--Dark-70, #3F3F46)", display:"flex",flexDirection:"column",justifyContent:"center" }}
          >
          <div
           style={{height:"40%",display:"flex",flexDirection:"row",alignItems:"center",gap:"22px"}}
          >
            <Button variant="ghost" className="w-[29%] h-[137px] bg-transparent text-white hover:bg-transparent hover:text-white" onClick={() => setShowAccordion2(!showAccordion2)}>
                  {selectedToken2?.image ? (
                     <div className="relative">
                     <img src={selectedToken2.image} alt="bt-image" style={{width:"50px",height:"50px",maxWidth:"50px",borderRadius:"50%"}}/>
                     <img src={toData.tokenSymbol} alt="bt-image"  style={{width:"30px",height:"30px", maxWidth:"30px",borderRadius:"50%",position:"relative",bottom:"20px",left:"25px"}}/>
                     </div>
                  ) : (
                    <div className="relative ">
                      <img
                      src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                      alt="bt-image"
                      style={{width:"50px",height:"50px",maxWidth:"50px",borderRadius:"50%"}}
                    />
                    <img
                      src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                      alt="bt-image"
                      style={{width:"35px",height:"35px", maxWidth:"35px",borderRadius:"50%",position:"relative",bottom:"20px",left:"25px"}}
                    />
                    </div>
                  )}
                </Button>
                 <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"flex-start",marginTop:"-15px"}}>
                    <span className="font-normal text-md"> {toData?.token ? toData?.token : "Coin name"} </span>
                    <span className="font-bold text-lg"> {toData?.network ? toData?.network :  "Network name"} </span>
                  </div>
          </div>
              {showAccordion2 && coinData && (
               <DialogModal
               coinData={coinData}
               handleNetworkset={handleNetworkset}
               value={value}
               handleNetworkRender={handleNetworkRender}
               handleTokenSelection={handleTokenSelection2}
               type={'to'}
             />
              )} 
                <input
                disabled
                type="number"
                placeholder="Enter an Amount"
                className="bg-[#52525B] border-2 text-neutral-400 w-[100%] h-[40%] px-[16px] py-[12px] flex bg-transparent text-2xl border-none focus:border-none float-right rounded-[22px]"
                value={toData?.amount}
              />
          </div>

        </div>
        <div
         style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 0,
                }}
              >
                  <CheckBalance
                    tokenAddress={fromData.tokenAddress}
                    fromAmount={fromData.amount}
                  />
              </div>
        </div>
      </div>
      { providerArray?.length > 0 && <div style={{ fontSize: "20px",  width: "95%",fontWeight: "600",borderTopLeftRadius: "20px",borderTopRightRadius: "20px", padding: "15px 33px",marginTop:"29vh" }} className="w-full flex px-5 justify-between"><h1>AI Routing</h1> <TbRefresh /></div>}
      {providerArray?.length > 0 && <div
        style={{ width: "95%", overflowY:"scroll",padding: "15px", display: "flex", flexDirection: "column",  paddingTop:"10px", gap:"10px" }}
      >
        {providerArray?.map((data, index) => (
          <div key={index}>
            <RouteCard data={data} index={index} />
        </div>
        ))}
      </div>}
    </div>
  );
}