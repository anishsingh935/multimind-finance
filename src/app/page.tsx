"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import "@rainbow-me/rainbowkit/styles.css";
// import { HttpClient } from "./http-client/HttpClient";
// const httpClient = new HttpClient("http://localhost:3000");
import { BLOCKCHAIN_NAME } from "rubic-sdk";
import CalculateTokenPrice from "./Ai-Routing/GetPrice";
import { ethers } from "ethers";
import { TbRefresh } from "react-icons/tb";
import { AiOutlineSwap } from "react-icons/ai";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import calculateTrades from "./Ai-Routing/Trades";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import RouteCard from "@/components/route-card";

export const imageArray = [
  "https://app.rubic.exchange/assets/images/icons/providers/bridge/symbiosis.png",
  "https://app.rubic.exchange/assets/images/icons/providers/bridge/lifuel.png",
  "https://app.rubic.exchange/assets/images/icons/providers/bridge/lifi.svg",
  "https://app.rubic.exchange/assets/images/icons/providers/bridge/optimism-gateway.svg",
  "https://app.rubic.exchange/assets/images/icons/providers/bridge/cbridge.svg",
  "https://app.rubic.exchange/assets/images/icons/providers/bridge/avalanche-bridge.svg",
];
// type BLOCKCHAIN_NAME = {
//   ETHEREUM: string;
//   POLYGON: string;
//   // Add other blockchain names as needed
// };
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

// Update the CoinData interface using Chain type
interface CoinData {
  [x: string]: any;
  chains?: Chain[];
}
interface Token {
  name: string;
  image: string;
}

export default function Home() {
  const [isBalance, setIsBalance] = useState(false);

  const [fromData, setFromData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: "",
  });

  const [toData, setToData] = useState({
    token: "",
    network: "",
    amount: 0,
    tokenAddress: "",
  });

  useEffect(() => {
    console.log("TO Data changed");
    console.log(toData);
  }, [toData]);
  useEffect(() => {
    console.log("From Data changed");
    console.log(fromData);
  }, [fromData]);

  const { isConnected, address } = useAccount();
  const [showAccordion1, setShowAccordion1] = useState(false);
  const [showAccordion2, setShowAccordion2] = useState(false);
  const [coinData, setCoinData] = useState<CoinData>({ chains: [] });
  const [selectedToken1, setSelectedToken1] = useState<Token | null>(null);
  const [selectedToken2, setSelectedToken2] = useState<Token | null>(null);
  const [value, setValue] = useState<any[]>([]);
  const [walletClicked, setWalletClicked] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [providerArray, setProviderArray] = useState<any[]>([]); // Assuming any[] for providerArray, adjust as per your data
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const fromBlockchain = BLOCKCHAIN_NAME.ETHEREUM;
  const fromTokenAddress = "0x0000000000000000000000000000000000000000"; // ETH
  const toBlockchain = BLOCKCHAIN_NAME.POLYGON;
  const toTokenAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"; // USDT
  const fromAmount = 1;

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await axios.get("https://li.quest/v1/chains");
        const temp = response?.data?.chains?.filter(
          (res: any) =>
            res?.name === "Ethereum" ||
            res?.name === "Optimism" ||
            res?.name === "Polygon" ||
            res?.name === "Avalanche"
        );
        setCoinData(temp);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCoinData();
  }, []);

  async function fetchTrades() {
    try {
      const result = await calculateTrades(
        fromBlockchain,
        fromTokenAddress,
        toBlockchain,
        toTokenAddress,
        fromAmount
      );
      setProviderArray(result);
    } catch (error) {
      console.error("Error fetching trades:", error);
    }
  }

  function getBlockchainName(networkName: any) {
    switch (networkName.toLowerCase()) {
      case "ethereum":
        return BLOCKCHAIN_NAME.ETHEREUM;
      case "polygon":
        return BLOCKCHAIN_NAME.POLYGON;
      case "optimism":
        return BLOCKCHAIN_NAME.OPTIMISM;
      case "avalanche":
        return BLOCKCHAIN_NAME.AVALANCHE;
      default:
        throw new Error(`Unsupported network: ${networkName}`);
    }
  }

  const calculateToAmount = async () => {
    try {
      const blockchainFrom = getBlockchainName(fromData.token);
      const blockchainTo = getBlockchainName(toData.token);

      const USDPriceFromToken = await CalculateTokenPrice(
        fromData.tokenAddress,
        blockchainFrom
      );
      console.log("USD PRICE for TOKEN1 ",USDPriceFromToken)
      const USDPriceToToken = await CalculateTokenPrice(
        toData.tokenAddress,
        blockchainTo
        );
        console.log("USD PRICE for TOKEN1 ",USDPriceToToken)

      const amountInUSD = fromData.amount * USDPriceFromToken.toNumber();
      const toAmount = amountInUSD / USDPriceToToken.toNumber();
      console.log(toAmount);

      setToData({ ...toData, amount: toAmount });
    } catch (error) {
      console.error("Error in calculating toToken amount:", error);
    }
  };

  useEffect(() => {
    if (fromData.tokenAddress && toData.tokenAddress && fromData.amount) {
      calculateToAmount();
    }
  }, [fromData.tokenAddress, toData.tokenAddress, fromData.amount]);
  

  const RequiredBalance = async (
    tokenAddress: string,
    forAmount: number,
    setWalletClicked: (value: boolean) => void,
    setIsBalance: (value: boolean) => void
  ) => {
    setWalletClicked(true);
    try {
      const ERC20_ABI = [
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function",
        },
      ];

      if (!provider) {
        console.error("Ethereum provider not found.");
        return;
      }

      const signer = provider.getSigner();
      const account = await signer.getAddress();

      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        signer
      );
      const balance = await tokenContract.balanceOf(account);

      const formattedBalance = ethers.utils.formatUnits(balance, "ether");
      if (parseFloat(formattedBalance) >= forAmount) {
        setIsBalance(true);
      } else {
        setIsBalance(false);
      }
    } catch (error) {
      console.error("Error checking balance:", error);
      setIsBalance(false);
    }
  };

  useEffect(() => {
    async function loadEthereumProvider() {
      if (window.ethereum) {
        try {
          const ethProvider = new ethers.providers.Web3Provider(
            window.ethereum
          );
          const signer = ethProvider.getSigner();
          const acc = await signer.getAddress();
          setProvider(ethProvider);
          setAccount(acc);
        } catch (error) {
          console.error("Error loading Ethereum provider:", error);
        }
      } else {
        console.error("Ethereum provider (window.ethereum) not found.");
      }
    }

    loadEthereumProvider();
  }, []);

  const handleNetworkRender = async (tokenName: any, type: any) => {
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
  const handleNetworkset = (value: any, networkValue: any) => {
    setToData({
      ...toData,
      network: value,
      tokenAddress: networkValue?.address,
    });
  };
  const handleNetworkset1 = (value: any, networkValue: any) => {
    setFromData({
      ...fromData,
      network: value,
      tokenAddress: networkValue?.address,
    });
  };

  // useEffect(() => {
  //   if (fromData?.network) {
  //     console.log("fromData Network", fromData.network);
  //     const timer = setTimeout(async () => {
  //       try {
  //         const coingeckoApi = new CoingeckoApi(httpClient);
  //         const convertedValue: any = await coingeckoApi.convertTokenValue(
  //           fromData?.network
  //         );
  //         const tempValue = fromData?.network.toLowerCase();
  //         console.log("tempValue", tempValue);
  //         setConvertedAmount(convertedValue[tempValue]["usd"]);
  //         console.log(convertedValue[tempValue]["usd"]);
  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //       }
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [fromData?.network]);

  // useEffect(() => {
  //   if (convertedAmount && toData?.network) {
  //     console.log("Printing the converted amount", convertedAmount);
  //     console.log("Value being passed toData.network", toData.network);

  //     const timer = setTimeout(async () => {
  //       try {
  //         const coingeckoApi = new CoingeckoApi(httpClient);
  //         const convertedValue: any = await coingeckoApi.convertTokenValue(
  //           toData?.network
  //         );
  //         const tempValue: any = toData?.network.toLowerCase();
  //         const amountInUSD = fromData?.amount * convertedAmount;
  //         const amountInTargetToken =
  //           amountInUSD / convertedValue[tempValue]["usd"];
  //         console.log(amountInTargetToken);
  //         setToData({ ...toData, amount: amountInTargetToken });
  //         fetchTrades();
  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //       }
  //     }, 3000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [convertedAmount, toData?.network]);

  useEffect(() => {
    console.log("Prinintng isBalance", isBalance);
  }, [isBalance]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        background: "black",
        color: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
      className="relative"
    >
      <Image
        src="/bg.png"
        alt="bg"
        width={100}
        height={100}
        className="absolute top-0 left-0 w-full h-full"
      />
      <div
        style={{
          marginTop: "9vh",
          width: "40%",
          height: "280px",
          background: "#3b3d4f",
          borderRadius: "20px",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          paddingTop: "10px",
          zIndex: 10,
        }}
      >
        <div
          style={{ fontSize: "20px", fontWeight: "600" }}
          className="w-full flex px-5 justify-between"
        >
          <h1>MultiMind Finance</h1> <TbRefresh />
        </div>
        <div
          style={{
            background: "#222331",
            height: "90%",
            width: "100%",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            padding: "20px",
            alignItems: "center",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              width: "46%",
              height: "130px",
              borderRadius: "10px",
              padding: "2px",
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="bg-transparent text-white hover:bg-transparent hover:text-white"
                  onClick={() => setShowAccordion1(!showAccordion1)}
                >
                  {selectedToken1?.image ? (
                    <Image
                      src={selectedToken1.image}
                      alt="bt-image"
                      width={50}
                      height={50}
                      className="rounded-xl mr-4 "
                    />
                  ) : (
                    <Image
                      src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                      alt="bt-image"
                      width={50}
                      height={50}
                      className="rounded-xl mr-4"
                    />
                  )}
                  <div className="flex-cols text-start">
                    <span className="font-normal text-md">
                      {" "}
                      {fromData?.token ? fromData?.token : "Coin name"}{" "}
                    </span>
                    <br />
                    <span className="font-bold text-lg">
                      {" "}
                      {fromData?.network
                        ? fromData?.network
                        : "Network name"}{" "}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              {showAccordion1 && coinData ? (
                <Accordion
                  type="single"
                  collapsible
                  className="w-full h-80 overflow-y-auto text-md no-scrollbar rounded-sm bg-[#0E111C] px-4 rounded-md mt-2 z-9 relative"
                  style={{ position: "relative", zIndex: 9 }}
                >
                  {coinData?.map((coin: any) => (
                    <AccordionItem key={coin?.id} value={coin?.id}>
                      <AccordionTrigger
                        onClick={() => handleNetworkRender(coin?.name, "from")}
                      >
                        <Image
                          src={coin?.logoURI}
                          alt={coin?.name}
                          width={25}
                          height={25}
                          className="rounded-md"
                        />
                        {coin?.name}
                      </AccordionTrigger>
                      <AccordionContent className="text-start text-decoration list-none">
                        <li
                          onClick={() => {
                            handleTokenSelection1(coin?.name, coin?.logoURI);
                          }}
                        >
                          {value?.map((network: any, index: any) => (
                            <div
                              key={index}
                              className="flex justify-between space-y-2 space-x-3 hover:bg-black px-1 my-1 p-1 rounded-sm"
                              onClick={() => {
                                console.log("SelectedNetwork", network);
                                handleNetworkset1(network?.name, network);
                              }}
                            >
                              <Image
                                src={network?.image}
                                width={30}
                                height={30}
                                alt="values"
                                className="rounded-full "
                              />
                              <span className="text-md">{network?.symbol}</span>
                            </div>
                          ))}
                        </li>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Input
                  type="number"
                  placeholder="Enter an Amount"
                  className="amount-comp text-neutral-400 w-full flex mt-10 bg-transparent text-2xl border-none focus:border-none float-right"
                  value={fromData?.amount}
                  onChange={(e) =>
                    setFromData({
                      ...fromData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                />
              )}
            </DropdownMenu>
          </div>

          <div style={{ display: "flex", flexDirection: "row", gap: "2px" }}>
            <AiOutlineSwap className="text-3xl rounded-full mr-1 border-2 " />
          </div>

          <div
            style={{
              width: "46%",
              height: "130px",
              borderRadius: "10px",
              padding: "2px",
            }}
          >
            {/* Dropdown 2 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="float-right">
                <Button
                  variant="ghost"
                  className="bg-transparent text-white hover:bg-transparent hover:text-white"
                  onClick={() => setShowAccordion2(!showAccordion2)}
                >
                  {selectedToken2?.image ? (
                    <Image
                      src={selectedToken2.image}
                      alt="bt-image"
                      width={50}
                      height={50}
                      className="rounded-xl mr-4"
                    />
                  ) : (
                    <Image
                      src="https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg"
                      alt="bt-image"
                      width={50}
                      height={50}
                      className="rounded-xl mr-4"
                    />
                  )}
                  <div className="flex-cols text-start">
                    <span className="font-normal text-md">
                      {" "}
                      {toData?.token ? toData?.token : "Coin name"}{" "}
                    </span>
                    <br />
                    <span className="font-bold text-lg">
                      {" "}
                      {toData?.network ? toData?.network : "Network name"}{" "}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              {showAccordion2 && coinData ? (
                <Accordion
                  type="single"
                  collapsible
                  className="w-full h-80 overflow-y-auto text-md no-scrollbar rounded-sm bg-[#0E111C] px-4 rounded-md  z-9 relative"
                  style={{
                    position: "relative",
                    zIndex: 9,
                    marginTop: "60px",
                  }}
                >
                  {coinData?.map((coin: any) => (
                    <AccordionItem key={coin?.id} value={coin?.id}>
                      <AccordionTrigger
                        onClick={() => {
                          console.log("coinsData", coin);
                          handleNetworkRender(coin?.name, "to");
                        }}
                      >
                        <Image
                          src={coin?.logoURI}
                          alt={coin?.name}
                          width={25}
                          height={25}
                          className="rounded-md"
                        />
                        {coin?.name}
                      </AccordionTrigger>
                      <AccordionContent className="text-start text-decoration list-none">
                        <li
                          onClick={() =>
                            handleTokenSelection2(coin?.name, coin?.logoURI)
                          }
                        >
                          {value?.map((network: any, index: any) => (
                            <div
                              key={index}
                              className="flex justify-between space-y-2 space-x-3 hover:bg-black px-1 my-1 p-1 rounded-sm"
                              onClick={() =>
                                handleNetworkset(network?.name, network)
                              }
                            >
                              <Image
                                src={network?.image}
                                width={30}
                                height={30}
                                alt="values"
                                className="rounded-full "
                              />
                              <span className="text-md">{network?.symbol}</span>
                            </div>
                          ))}
                        </li>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <Input
                  type="number"
                  value={toData?.amount}
                  disabled
                  className="amount-comp text-neutral-400 w-full flex mt-10 bg-transparent text-2xl border-none focus:shadow-none float-right text-right"
                />
              )}
            </DropdownMenu>
          </div>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "10px",
            zIndex: 0,
          }}
          onClick={() =>
            RequiredBalance(
              fromData?.tokenAddress,
              fromData?.amount,
              setWalletClicked,
              setIsBalance
            )
          }
        >
          <ConnectButton
            label={
              walletClicked
                ? isBalance
                  ? "Insufficient Balance"
                  : "Exchange Now"
                : "Connect Wallet"
            }
          />
        </div>
        {providerArray?.length > 0 && (
          <div
            style={{
              fontSize: "20px",
              width: "577px",
              fontWeight: "600",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              background: "#18181B",
              padding: "15px 33px",
              marginLeft: "-16px",
              marginTop: "26px",
            }}
            className="w-full flex px-5 justify-between"
          >
            <h1>AI Routing</h1> <TbRefresh />
          </div>
        )}
      </div>
      {providerArray?.length > 0 && (
        <div
          style={{
            marginTop: "9vh",
            width: "40%",
            overflowX: "scroll",
            background: "#18181B",
            padding: "15px",
            display: "flex",
            paddingTop: "10px",
            paddingBottom: "30px",
            gap: "10px",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
            zIndex: 10,
          }}
        >
          <div className="flex gap-2" style={{ overflowX: "scroll" }}>
            {providerArray?.map((data, index) => (
              // <div
              //   key={index}
              //   style={{
              //     background: "#222331",
              //     width: "280px",
              //     height: "90%",
              //     borderRadius: "20px",
              //     display: "flex",
              //     flexDirection: "column",
              //     justifyContent: "space-between",
              //     padding: "20px",
              //     marginTop: "10px",
              //     flex: "1 1 100px",
              //   }}
              // >
              //   <div
              //     style={{
              //       display: "flex",
              //       flexDirection: "row",
              //       width: "100%",
              //       justifyContent: "space-between",
              //       alignItems: "center",
              //       paddingBottom: "14px",
              //       borderBottom: "1px solid #ffffff38",
              //     }}
              //   >
              //     <div
              //       className="font-normal text-md"
              //       style={{ display: "flex", gap: "4px", alignItems: "center" }}
              //     >
              //       <Image
              //         width={25}
              //         height={25}
              //         src={imageArray[index]}
              //         alt="token"
              //         style={{ height: "30px", borderRadius: "50%" }}
              //       />{" "}
              //       {data?.dexName}{" "}
              //     </div>
              //     <div
              //       style={{
              //         fontSize: "14px",
              //         fontWeight: "400",
              //         color: "white",
              //       }}
              //     >
              //       {" "}
              //       ~{data?.tokenAmount}{" "}
              //       {data?.tokenSymbol === "USDT" ? "$" : data?.tokenSymbol}{" "}
              //     </div>
              //   </div>
              //   <div
              //     style={{
              //       display: "flex",
              //       flexDirection: "row",
              //       width: "100%",
              //       justifyContent: "space-between",
              //       alignItems: "center",
              //     }}
              //   >
              //     <div
              //       className="font-normal text-md"
              //       style={{ display: "flex", gap: "4px", alignItems: "center" }}
              //     >
              //       <Image
              //         width={25}
              //         height={25}
              //         src="https://app.rubic.exchange/assets/images/icons/money.svg"
              //         alt="protocol fees"
              //         style={{ height: "20px" }}
              //       />{" "}
              //       ~{data?.protocolFee}{" "}
              //     </div>
              //     <div
              //       className="font-normal text-md"
              //       style={{ display: "flex", gap: "4px", alignItems: "center" }}
              //     >
              //       <Image
              //         width={25}
              //         height={25}
              //         src="https://app.rubic.exchange/assets/images/icons/time.svg"
              //         alt="protocol fees"
              //         style={{ height: "17px" }}
              //       />{" "}
              //       3M{" "}
              //     </div>
              //   </div>
              // </div>
              <div key={index}>
                <RouteCard data={data} index={index} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
