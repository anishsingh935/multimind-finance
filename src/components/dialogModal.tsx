import React, { useState } from 'react';
import { Input } from './ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

function DialogModal({
  coinData,
  handleNetworkRender,
  handleTokenSelection,
  value,
  handleNetworkset,
  type,
}:{coinData:any,
  handleNetworkRender:Function,
  handleTokenSelection:Function,
  value:any,
  handleNetworkset:Function,
  type:any})
  {
    const [searchInput,setSearchInput] = useState("");
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="w-full max-w-[664px] max-h-[595px] rounded-lg flex flex-col gap-6 p-6" style={{
        background:"var(--Dark-90, #18181B)",
        borderRadius:"24px",
        border:"2px solid var(--Dark-80, #27272A)" 
      }}>
        <div className="flex flex-col items-center text-start">
          <span className="text-2xl text-white font-bold mb-4 ">Networks</span>
          <div className="w-full">
            <Input
              placeholder="Search"
              className="w-full h-10 px-4 rounded-lg bg-[#27272A] text-white"
              // onChange={(e:any) => DisplayTokenDetails(e.target.value)}
              onChange={(e:any) => {
                setSearchInput(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="flex-1">
          <Accordion
            type="single"
            collapsible
            className="w-full text-md no-scrollbar rounded-md relative"

          >
            {coinData?.map((coin:any) => (
              <AccordionItem key={coin?.id} value={coin?.id} className="border-b-0">
                <AccordionTrigger
                  onClick={() => handleNetworkRender(coin?.name, type)}
                  className="flex items-center px-4 py-2 text-white"
                >
                  <Image src={coin?.logoURI} alt={coin?.name} width={48} height={48} className="rounded-full" />
                  <h1 className="ml-4">{coin?.name}</h1>
                </AccordionTrigger>
                <div style={{borderRadius:"16px",margin:"10px 15px",background:"var(--Dark-80, #27272A)",border:"1px solid var(--Dark-70, #3F3F46)", padding:"0px 15px"}}>
                  <AccordionContent className="text-start list-none h-32 overflow-y-auto ml-0 no-scrollbar border-2xl">
                    {(value)?.map((network:any, index:any) => (
                      <div
                        key={index}
                        className="flex items-center px-2 my-1  cursor-pointer"
                        onClick={() => {
                          handleTokenSelection(coin?.name, coin?.logoURI) 
                          handleNetworkset(network?.name, network, network?.image);
                        }}
                        style={{borderRadius:"35px"}}
                      >
                        <Image src={network?.image} width={30} height={30} alt="values" className="rounded-full mr-4" />
                        <div className="flex flex-col">
                          <span className="text-neutral-400">{coin?.name}</span>
                          <span className="text-md">{network?.symbol}</span>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export default DialogModal;