import Image from "next/image";
import React from "react";
import "./cardstyle.css"

type Props = {
  data: any;
  index: number;
  setTradeClicked: React.Dispatch<React.SetStateAction<any[]>>;
};

const imageArray =[
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/symbiosis.png',
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/lifuel.png',
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/lifi.svg',
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/optimism-gateway.svg',
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/cbridge.svg',
  'https://app.rubic.exchange/assets/images/icons/providers/bridge/avalanche-bridge.svg'
]

const RouteCard = ({ data, index , setTradeClicked }: Props) => {
  const handleTradeClick = () => {
    console.log(data)
    setTradeClicked(data);
    console.log("data saved")
  };
  return (
    <div className="cardWidth bg-[#27272a] rounded-[16px] " style={{cursor:"pointer"}} onClick={handleTradeClick}>
      {index === 0 && (
        <Image
          alt="bar"
          src="/bar.png"
          width={280}
          height={30}
          className="mb-2"
          style={{width:"100%"}}
        />
      )}
      <div className="flex flex-col gap-3 py-3 pb-4 px-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            {imageArray.length > 0 && <Image src={imageArray[index]} alt="icon" width={24} height={24}  />}
            <p className="text-white text-[14px] capitalize leading-[20px] font-[400]">
              {data?.dexName}
            </p>
          </div>
          {index === 0 && (
            <p className="text-[#FF7539] text-[14px] leading-[20px] font-[500]">
              Best
            </p>
          )}
        </div>
        <div className="flex gap-2 pb-3 items-center justify-between border-b border-zinc-700">
          <p>{data?.tokenAmount}</p>
          <p className="text-[#71717A] text-[14px] font-[400]">~{data?.tokenAmount}{data?.tokenSymbol === "USDT" ? "$" : data?.tokenSymbol}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <Image src="/timer.png" alt="icon" width={12} height={12} />
            <p className="text-[#A1A1AA] text-[14px] font-[400]">1m</p>
          </div>
          <div className="flex gap-2 items-center">
            <Image src="/fuel.png" alt="icon" width={12} height={12} />
            <p className="text-[#A1A1AA] text-[14px] font-[400]">~{data?.protocolFee}$</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteCard;
