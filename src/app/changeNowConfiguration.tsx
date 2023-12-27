import { BigNumber } from "ethers";
import { ChangenowTrade , ChangenowCrossChainSupportedBlockchain ,Configuration  } from "rubic-sdk";
import { ProviderAddress } from "rubic-sdk";


const  fromPriceTOkenAmount : ChangenowCrossChainSupportedBlockchain = ; 
const  toPriceTOkenAmount : ChangenowCrossChainSupportedBlockchain = ; 
const toTokenAmountMin : BigNumber = ;
const ChangenowCurrency : any = ;
const FeeInfo : any  = ;
const GasData : any = ;

export const configuration = {
    ChangenowTrade: {
        from: fromPriceTOkenAmount,
        to: toPriceTOkenAmount,
        toTokenAmountMin: ,
        fromCurrency: ChangenowCurrency,
        toCurrency: ChangenowCurrency,
        feeInfo: FeeInfo,
        gasData: GasData,
        onChainTrade: null,
    },
    ProviderAddress: "0xA7a4CC554052386B492760AC43c1e5d0BDeb1667",
    routePath : [] ,
  };
  
  
  export default configuration;