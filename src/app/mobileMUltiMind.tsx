"use client";
import Image from "next/image";
import { useEffect, useState, CSSProperties } from "react";
import axios from "axios";

import "@rainbow-me/rainbowkit/styles.css";
import { Button } from "@/components/ui/button";
import {
  BLOCKCHAIN_NAME,
  CrossChainTrade,
  OnChainTrade,
  SDK,
  WalletProvider,
  CHAIN_TYPE,
  Configuration,
} from "rubic-sdk";
import { ethers } from "ethers";
import { TbRefresh } from "react-icons/tb";
import { AiOutlineSwap } from "react-icons/ai";
// import CircleImage from "@/app/CircleImage.svg";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "wagmi";
import RouteCard from "@/components/route-card";
import DialogModal from "@/components/dialog-modal";
import configuration from "./rubic";
import { Alchemy, Network } from "alchemy-sdk";
import SkeletonSection from "@/components/skeleton-section";
import ScaleLoader from "react-spinners/ScaleLoader";
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
interface apiKey { }

export default function MobileHome() {
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
  const numberOfSkeletons = 4;
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
  const [showAirouting, setShowAirouting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recieverAddress, setRecieverAddress] = useState<string>("");

  const getAlchemyConfig = (blockchainName: any) => {
    const apiKeyMapping: any = {
      Ethereum: "R0XpsJFtNE8vdpN3eZpRfWh5TzBfFFsU",
      Polygon: "6mwmXKoYNk2dqMEqePtoptLbRDaIhQyP",
    };
    const networkMapping: any = {
      Ethereum: Network.ETH_MAINNET,
      Polygon: Network.MATIC_MAINNET,
    };
    return {
      apiKey: apiKeyMapping[blockchainName],
      network: networkMapping[blockchainName],
    };
  };

  const fetchTokenBalance = async (
    address: any,
    tokenAddress: any,
    blockchain: any
  ) => {
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

  async function fetchTrades() {
    try {
      if (fromData?.token && toData?.token && fromData?.amount) {
        console.log("fromData in fetchTrades", typeof fromData.token);
        console.log("toData in fetchTrades", typeof toData.token);
        const blockchainFrom = fromData.token.toUpperCase() as MyBlockchainName;
        const blockchainTo = toData.token.toUpperCase() as MyBlockchainName;
        console.log(blockchainFrom);
        console.log(blockchainTo);
        setShowAirouting(true);
        setProviderArray([]);
        const result = await calculateTrades(
          blockchainFrom,
          fromData.tokenAddress,
          blockchainTo,
          toData.tokenAddress,
          fromData.amount
        );

        console.log("Result = ", result);
        setProviderArray(result);
        configureWallet();
      }
    } catch (error) {
      console.error("Error fetching trades:", error);
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

  const calculateToAmount = async () => {
    try {
      // debugger
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

  const configureWallet = async () => {
    if (isConnected && address) {
      const walletProvider: any = {
        [CHAIN_TYPE.EVM]: {
          address,
          core: window.ethereum,
        },
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
    console.log(toData?.token);
    if (isConnected) {
      setRecieverAddress(address?.toString() || "");
    }
    if (toData?.token === "Solana" || fromData?.token === "Solana") {
      setRecieverAddress("");
    }
  }, [isConnected, toData, fromData, address])

  // useEffect(() => {
  //   if (fromData.tokenAddress && address && isConnected && fromData.amount > 0 && toData.tokenAddress) {
  //     fetchTokenBalance(address, fromData.tokenAddress, fromData.token)
  //       .then((balance:any) => {
  //         if (parseFloat(balance) >= fromData.amount) {
  //           performSwap(TradeClicked);
  //         } else {
  //           alert(`Insufficient Balance for Transaction`);
  //           console.log("Insufficient Balance");
  //         }
  //       })
  //       .catch(error => console.error(error));
  //   }
  // }, [TradeClicked, fromData]);

  useEffect(() => {
    if (
      fromData.tokenAddress &&
      address &&
      isConnected &&
      fromData.amount > 0 &&
      toData.tokenAddress
    ) {
      setLoading(true);
      performSwap(TradeClicked);
    } else if (!isConnected && fromData.amount > 0 && fromData.tokenAddress) {
      alert("Please Connect Your Wallet");
    }
  }, [TradeClicked]);

  const performSwap = async (bestTrade: any) => {
    console.log(bestTrade.trade);
    try {
      const trade = bestTrade.trade as CrossChainTrade | OnChainTrade;

      const receipt = trade
        .swap({
          onConfirm: (hash: any) => console.log("Transaction Hash:", hash),
        })
        .then((hash) => {
          console.log("swap function called success");
          alert(`Transaction was successfull ${hash}`);
          console.log(hash);
          setLoading(false);
        })
        .catch((err) => {
          console.log("Swap function called failed");
          console.error(err);
          alert(`Swap Transaction failed`);
          setLoading(false);

        });
      console.log("Trade executed:", receipt);
    } catch (error) {
      console.error("Error executing trade:", error);
      setLoading(false);
    }
  };
  const validNumber = new RegExp(/^\d*\.?\d*$/);
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let amount = e.target.value;
    amount = String(amount);
    amount = amount.replace(/,/g, ".");
    console.log(amount);
    if (validNumber.test(amount)) {
      setFromData({ ...fromData, amount: Number(amount) });
    } else {
      e.target.value = fromData.amount.toString();
    }
  };
  const override: CSSProperties = {
    display: "flex",
    justifyItems: "center",
    alignItems: "center",
    margin: "0 auto",
    borderColor: "white",
    marginTop: "20vh",
  };

  return (
    <div
      className="w-full flex-col items-self-center justify-center h-full overflow-y-scroll "
    >
      <nav className="flex w-full justify-between items-center px-6 mt-2">
        <Image
          src="/png/MUFI.png"
          width={60}
          height={60}
          alt="navicon"
          className=" object-cover"
        />
        <CheckBalance
          tokenAddress={fromData.tokenAddress}
          fromAmount={fromData.amount}
          location={"top"}
        />
      </nav>
      <div
        className=" h-[80vh] mt-[5vh] mx-4 bg-[#18181B] flex-col p-[10px] rounded-[20px] pt-[10px] flex justify-center items-center"
      >
        <div
          style={{ fontSize: "20px", fontWeight: "600" }}
          className="w-full flex px-5 py-2 justify-between text-white"
        >
          <h1>MultiMind Finance</h1> 
        </div>
        <div className="border-[1px] border-[#27272A]"></div>
        <div>
          <div
            className="w-full h-[90%] flex flex-col justify-between gap-[10px] px-[20px] py-[20px] mt-[2px] items-center"
          >
            <div
              className="w-full h-[200px] bg-[#18181B] border-[1px] text-white border-[#3F3F46] rounded-[24px] flex-col justify-center gap-[11px] p-[20px]"
            >
              <div
                className="flex items-center gap-[22px] h-[40%]"
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
                    <div className="flex-col">
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
                  className="flex-cols justify-center items-start mt-[-15px]"

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
                  type={"from"}
                  showAccordion={showAccordion1}
                  setShowAccordion={setShowAccordion1}
                />
              )}

              <input
                type="number"
                placeholder="Enter an Amount"
                className="bg-[#52525B] border-2 text-neutral-400 w-[100%] h-[40%] px-[16px] py-[12px] flex bg-transparent text-2xl border-none focus:border-none float-right rounded-[22px]"
                value={fromData.amount}
                step="0.01"
                onInput={handleInput}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "row", gap: "2px" }}>
              <Image
                src="/CircleImage.svg"
                alt="arrow"
                width={50}
                height={50}
                className="rounded-full mt-2"
              />
              {/* <AiOutlineSwap className="text-3xl rounded-full mr-1 border-2 " /> */}
            </div>

            <div
              className="w-full h-[200px] text-white bg-[#18181B] border-[1px] border-[#3F3F46] rounded-[24px] flex-col justify-center gap-[11px] p-[20px]"
            >
              <div
                className="h-[40%] flex items-center gap-[22px] text-white"
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
                  className="flex-col justify-center items-start mt-[-15px]"

                >
                  <span className="font-bold text-lg">
                    {" "}
                    {toData?.token ? toData?.token : "Coin name"}{" "}
                  </span>
                  <span className="font-normal text-xl text-[#52525B]">
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
                  type={"to"}
                  showAccordion={showAccordion2}
                  setShowAccordion={setShowAccordion2}
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
            className="w-full flex justify-center items-center z-0"
          >
            <input
              type="text"
              value={recieverAddress}
              onChange={(e) => {
                setRecieverAddress(e.target.value);
                console.log(recieverAddress);

              }}
              placeholder="Wallet Address"
              className="placeholder:text-[18px] text-[18px] bg-[#52525B] border-2 text-neutral-400 w-[100%] h-[40%] px-[16px] py-[12px] flex bg-transparent text-2xl focus:border-none float-right rounded-[22px]"
            />
            {/* <CheckBalance
              location="bottom"
              tokenAddress={fromData.tokenAddress}
              fromAmount={fromData.amount}
            /> */}
          </div>
        </div>
      </div>
      {showAirouting && (
        <div
          className="flex justify-between mx-4 text-[20px] text-white mt-[29vh] px-[20px] py-[15px]  bg-[#18181b] rounded-t-[24px]"
        >
          <h1>AI Routing</h1> <TbRefresh
            onClick={fetchTrades}
            className={`${providerArray != null ? "cursor-pointer" : "cursor-wait"
              } active:animate-spin`}
          />
        </div>
      )}
      {showAirouting && (
        <div
          className=" h-[50vh] mx-4 p-[15px] bg-[#18181b] rounded-b-[30px] overflow-y-scroll pt-[10px] gap-y-[10px] space-y-2"
        >
          {providerArray?.length > 0 ? (
            providerArray?.map((data, index) =>
              data.dexName !== "rango" && <div key={index}>
                <RouteCard
                  data={data}
                  index={index}
                  setTradeClicked={setTradeClicked}
                />
              </div>)
          ) : (
            <>
              {[...Array(numberOfSkeletons)].map((_, index) => (
                <div key={index}>
                  <SkeletonSection index={index} />
                </div>
              ))}
            </>
          )}
        </div>
      )}
      {loading && (
        <ScaleLoader
          className="overlay"
          color="#36d7b7"
          style={{
            position: "absolute",
            top: "0",
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: "999",
          }}
        />
      )}
    </div>

  );
}
