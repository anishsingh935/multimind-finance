"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

import "@rainbow-me/rainbowkit/styles.css";
import { Button } from "@/components/ui/button";
import { BLOCKCHAIN_NAME, CrossChainTrade,OnChainTrade, SDK, WalletProvider, CHAIN_TYPE, Configuration } from "rubic-sdk";
import { ethers } from "ethers";
import { TbRefresh } from "react-icons/tb";
import { AiOutlineSwap } from "react-icons/ai";
import CircleImage from "@/app/CircleImage.svg";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckBalance } from "./Ai-Routing/check-balance";
import calculateTrades from "./Ai-Routing/Trades";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton"
import { useAccount } from "wagmi";
import RouteCard from "@/components/route-card";
import MobileHome from "./mobile-multimind";
import DialogModal from "@/components/dialog-modal";
import configuration from './rubic';
import { Alchemy, Network } from "alchemy-sdk";
import SkeletonSection from "@/components/skeleton-section";
import { ImageError } from "next/dist/server/image-optimizer";
type MyBlockchainName = "ETHEREUM" | "POLYGON" | "AVALANCHE" | "SOLANA";

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

export default function Home() {

  const [fromData, setFromData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: "",
    tokenSymbol: "",
    usdprice: "",
  });

  const [toData, setToData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: "",
    tokenSymbol: "",
    usdprice: "",
  });
  const numberOfSkeletons=4;
  const { isConnected, address } = useAccount();
  const [showAccordion1, setShowAccordion1] = useState(false);
  const [showAccordion2, setShowAccordion2] = useState(false);
  const [coinData, setCoinData] = useState<CoinData>({ chains: [] });
  const [selectedToken1, setSelectedToken1] = useState<Token | null>(null);
  const [selectedToken2, setSelectedToken2] = useState<Token | null>(null);
  const [value, setValue] = useState<any[]>([]);
  const [walletClicked, setWalletClicked] = useState(false);
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [openDilog, setOpenDilog] = useState(false);
  const [providerArray, setProviderArray] = useState<Array<any>>([]);
  const [searchInput, setSearchInput] = useState("");
  const [TradeClicked, setTradeClicked] = useState<any>();
  const [userBalance, setUserBalance] = useState<string | null>(null);
  const [showAirouting,setShowAirouting]=useState(false);


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
          name: "Solana",
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

  const getAlchemyConfig = (blockchainName:any) => {
    const apiKeyMapping:any = {
      'Ethereum': 'R0XpsJFtNE8vdpN3eZpRfWh5TzBfFFsU',
      'Polygon': '6mwmXKoYNk2dqMEqePtoptLbRDaIhQyP'
    };
    const networkMapping:any = {
      'Ethereum': Network.ETH_MAINNET,
      'Polygon': Network.MATIC_MAINNET
    };
    return {
      apiKey: apiKeyMapping[blockchainName],
      network: networkMapping[blockchainName]
    };
  };

  const fetchTokenBalance = async (address:any, tokenAddress:any, blockchain:any) => {
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
  

  async function fetchTrades() {

    try {
      if(fromData?.token && toData?.token && fromData?.amount){
        console.log("fromData in fetchTrades", typeof fromData.token);
        console.log("toData in fetchTrades", typeof toData.token);
        const blockchainFrom = fromData.token.toUpperCase() as MyBlockchainName;
        const blockchainTo = toData.token.toUpperCase() as MyBlockchainName;
        console.log(blockchainFrom);
        console.log(blockchainTo);
        setShowAirouting(true);
        const result = await calculateTrades(
          blockchainFrom,
          fromData.tokenAddress,
          blockchainTo,
          toData.tokenAddress,
          fromData.amount
        );
  
        console.log("Result = ", result);
        setProviderArray(result);
      }
      
    } catch (error) {
      console.error("Error fetching trades:", error);
    }
  }


  const calculateToAmount = async () => {
    try {
      console.log("calculate amount called");
      let USDPriceFromToken: any = fromData.usdprice;
      let USDPriceToToken: any = toData.usdprice;

      const amountInUSD: any = fromData.amount * USDPriceFromToken;
      const toAmount = amountInUSD / USDPriceToToken;

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

  const handleNetworkRender = async (tokenName: any, type: any) => {
    try {
      const res = await axios.get(
        `https://tokens.rubic.exchange/api/v1/tokens/?page=1&pageSize=200&network=${tokenName}`
      );
      console.log(res);
      if (type === "from") {
        setFromData({ ...fromData, token: tokenName });
      }
      if (type === "to") {
        setToData({ ...toData, token: tokenName });
      }
      setValue(res.data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const validNumber = new RegExp(/^\d*\.?\d*$/);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = e.target.value;

    if (validNumber.test(amount)) {
      setFromData({ ...fromData, amount: Number(amount) });
    } else {
      e.target.value = fromData.amount.toString();
    }
  };

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
        .then((balance:any) => {
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
  const handleNetworkset = (
    value: any,
    networkValue: any,
    networkSymbol: any
  ) => {
    setToData({
      ...toData,
      network: value,
      tokenAddress: networkValue?.address,
      tokenSymbol: networkSymbol,
      usdprice: networkValue.usdPrice,
    });
  };
  const handleNetworkset1 = (
    value: any,
    networkValue: any,
    networkSymbol: any
  ) => {
    setFromData({
      ...fromData,
      network: value,
      tokenAddress: networkValue?.address,
      tokenSymbol: networkSymbol,
      usdprice: networkValue.usdPrice,
    });
  };
  return (
    <>
      <div className="webView z-[10]">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "white",
            alignItems: "center",
            height: "100vh",
          }}
          className="bgImg"
        >
          <nav className="flex w-full justify-start items-start">
            <Image src="/MUFI.png" width={100} height={100} alt="navicon" className="pl-4 ml-5 mt-2 object-cover" />
            {/* <button></button> */}
          </nav>
          <div
            style={{
              zIndex: "10",
            }}
            className="mt-[-5vh] w-50% bg-[#18181B] rounded-[20px] px-[20px] flex flex-col pt-[10px] h-[45vh]"
          >
            <div
              style={{ fontSize: "20px", fontWeight: "600" }}
              className="w-full flex px-5 py-4  justify-between"
            >
              <h1>MultiMind Finance</h1> <TbRefresh />
            </div>
            <div className="border-[1px] border-[#27272A]"></div>
            <div>
              <div
                className="bg-[#18181B] rounded-[24px] flex flex-row justify-between flex-wrap p-[20px] items-center mt-[4px]"
              >
                <div
                  className="w-[45%] h-[180px] rounded-[24px] p-[20px] gap-[11px] bg-[#27272A] border-[1px] border-[#3F3F46] flex flex-col justify-center"
                >
                  <div
                    className="h-[40%] flex flex-row items-center gap-[22px]"
                  >
                    <Button
                      variant="ghost"
                      className="bg-transparent text-white hover:bg-transparent hover:text-white w-[29%] h-[137px] space-x-2"
                      onClick={() => setShowAccordion1(!showAccordion1)}
                    >
                      {selectedToken1?.image ? (
                        <div className="relative">
                          <Image
                            src={selectedToken1?.image}
                            alt="bt-image"
                            width={50}
                            height={50}
                            style={{
                              width: "50px",
                              height: "50px",
                              maxWidth: "50px",
                              borderRadius: "50%",
                            }}
                          />
                          <Image
                            src={fromData?.tokenSymbol}
                            alt="bt-image"
                            width={30}
                            height={30}
                            style={{
                              width: "30px",
                              height: "30px",
                              maxWidth: "30px",
                              borderRadius: "50%",
                              position: "relative",
                              bottom: "20px",
                              left: "25px",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className=""
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <Image
                            src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                            alt="bt-image"
                            width={50}
                            height={50}
                            style={{
                              width: "50px",
                              height: "50px",
                              maxWidth: "50px",
                              borderRadius: "50%",
                            }}
                          />
                          <Image
                            src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                            alt="bt-image"
                            width={35}
                            height={35}
                            style={{
                              width: "35px",
                              height: "35px",
                              maxWidth: "35px",
                              borderRadius: "50%",
                              position: "relative",
                              bottom: "20px",
                              left: "25px",
                            }}
                          />
                        </div>
                      )}
                    </Button>
                    <div
                    className="flex flex-col justify-center items-start mt-[-15px]"
                    >
                      <span className="font-bold text-lg">
                        {" "}
                        {fromData?.token ? fromData?.token : "Coin name"}{" "}
                      </span>
                      <span className="font-normal text-xl text-[#52525B]">
                        {" "}
                        {fromData?.network
                          ? fromData?.network
                          : "Network name"}{" "}
                      </span>
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
                    />
                  )}
                  <input
                    type="number"
                    placeholder="Enter an Amount"
                    className="bg-[#52525B] border-2 text-neutral-400 w-[100%] h-[40%] px-[16px] py-[12px] flex bg-transparent text-2xl border-none focus:border-none float-right rounded-[22px] inputclass"
                    value={fromData.amount}
                    step="0.01"
                    onInput={handleInput}
                  />
                </div>
                <div
                  style={{ display: "flex", flexDirection: "row", gap: "2px" }}
                >
                  <Image src={CircleImage} alt="arrow" width={50} height={50}  className="rounded-full mt-2" />
                  {/* <AiOutlineSwap className="text-3xl rounded-full mr-1 border-2 " /> */}
                </div>

                <div
                  className="w-[45%] h-[180px] rounded-[24px] p-[20px] gap-[11px] bg-[#27272A] border-[1px] border-[#3F3F46] flex flex-col justify-center"
                >
                  <div
                    style={{
                      height: "40%",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "22px",
                    }}
                  >
                    <Button
                      variant="ghost"
                      className="w-[29%] h-[137px] bg-transparent text-white hover:bg-transparent hover:text-white"
                      onClick={() => setShowAccordion2(!showAccordion2)}
                    >
                      {selectedToken2?.image ? (
                        <div className="relative">
                          <Image
                            src={selectedToken2?.image}
                            alt="bt-image"
                            width={50}
                            height={50}
                            style={{
                              width: "50px",
                              height: "50px",
                              maxWidth: "50px",
                              borderRadius: "50%",
                            }}
                          />
                          <Image
                            src={toData?.tokenSymbol}
                            alt="bt-image"
                            width={30}
                            height={30}
                            style={{
                              width: "30px",
                              height: "30px",
                              maxWidth: "30px",
                              borderRadius: "50%",
                              position: "relative",
                              bottom: "20px",
                              left: "25px",
                            }}
                          />
                        </div>
                      ) : (
                        <div className="relative ">
                          <Image

                            src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                            alt="bt-image"
                            width={50}
                            height={50}
                            style={{
                              width: "50px",
                              height: "50px",
                              maxWidth: "50px",
                              borderRadius: "50%",
                            }}
                          />
                          <Image
                            src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                            alt="bt-image"
                            width={35}
                            height={35}
                            style={{
                              width: "35px",
                              height: "35px",
                              maxWidth: "35px",
                              borderRadius: "50%",
                              position: "relative",
                              bottom: "20px",
                              left: "25px",
                            }}
                          />
                        </div>
                      )}
                    </Button>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        marginTop: "-15px",
                      }}
                    >
                      <span className="font-normal text-md">
                        {" "}
                        {toData?.token ? toData?.token : "Coin name"}{" "}
                      </span>
                      <span className="font-bold text-lg">
                        {" "}
                        {toData?.network
                          ? toData?.network
                          : "Network name"}{" "}
                      </span>
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
                  zIndex: 0,
                }}
                className="w-full flex justify-center items-center mt-[20px]"
              >
                <CheckBalance
                  tokenAddress={fromData.tokenAddress}
                  fromAmount={fromData.amount}
                />
              </div>
            </div>
          </div>
          { showAirouting && (
            <div
              className="flex justify-between w-[50%] text-[20px] text-white mt-[26px] px-[15px] py-[33px] border-[1px] border-[#27272A]"
            >
              <h1>AI Routing</h1> <TbRefresh />
            </div>
          )}
          {showAirouting && (
            <div
              className="w-[50%] overflow-x-scroll h-[200px] bg-[#18181b] px-[15px] flex flex-row pt-[10px] gap-[10px]"
            >
              {providerArray.length>0 ? providerArray?.map((data, index) => (
                <div key={index}>
                  <RouteCard data={data} index={index} setTradeClicked={setTradeClicked} />
                </div>
              )): (
                <>
                {[...Array(numberOfSkeletons)].map((_, index) => (
                  <div key={index}>
                    <SkeletonSection index={index} />
                  </div>
                ))}
                </>
              )
            }

            </div>
          )}
        </div>
      </div>
      <div className="mobileView mobbgImg">
        <MobileHome />
      </div>
    </>
  );
}
