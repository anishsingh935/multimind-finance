import { BLOCKCHAIN_NAME, EvmCrossChainTrade, EvmOnChainTrade, OnChainTrade } from 'rubic-sdk';
import configuration from '../rubic';
import { SDK  } from 'rubic-sdk';

type MyBlockchainName = 'ETHEREUM' | 'POLYGON' | 'AVALANCHE' | 'SOLANA';

async function calculateCrossChainTrades(fromBlockchain: MyBlockchainName, fromTokenAddress: any, toBlockchain: MyBlockchainName, toTokenAddress: any, fromAmount: any) {
    let sdk;
    const providerArray: any = [];

    try {
        sdk = await SDK.createSDK(configuration);

        // Check if it's an on-chain trade (same blockchain) or cross-chain trade
        if (fromBlockchain === toBlockchain) {
            // On-chain trade
            const trades  = await sdk.onChainManager.calculateTrade(
                { blockchain: BLOCKCHAIN_NAME[fromBlockchain], address: fromTokenAddress },
                fromAmount,
                toTokenAddress
            );
            debugger;

            trades.forEach((trade) => {
                console.log(trade);
            
                if ('feeInfo' in trade && trade.feeInfo && 'fixedFee' in trade.feeInfo && trade.feeInfo.fixedFee) {
                    // Check if 'error' property exists if needed
                    if ('error' in trade && trade.error) {
                        console.log(`error: ${trade.error}`);
                    } else {
                        const fixedFeeAmount = (trade.feeInfo.fixedFee as { amount?: any }).amount;
            
                        if (fixedFeeAmount) {
                            const providerObj: any = {
                                dexName: trade.type, // Assuming trade type is accessible
                                protocolFee: fixedFeeAmount.toFormat(3),
                                tokenSymbol: trade.to?.symbol,
                                tokenAmount: trade.to?.tokenAmount?.toFormat(3),
                                estimatedTime: "Unavailable",
                                tokenUriLink: "Unavailable",
                                trade: trade,
                            };
                            providerArray.push(providerObj);
                        } else {
                            // Handle the case where 'amount' does not exist in fixedFee
                            console.log("Amount information not available for fixed fee in this trade");
                        }
                    }
                } else {
                    // Handle the case where 'feeInfo' or 'fixedFee' does not exist
                    console.log("Fee information or fixed fee not available for this trade");
                }
            });
            
            
            
                       
        } else {
            // Cross-chain trade
            const wrappedTrades = await sdk.crossChainManager.calculateTrade(
                { blockchain: BLOCKCHAIN_NAME[fromBlockchain], address: fromTokenAddress },
                fromAmount,
                { blockchain: BLOCKCHAIN_NAME[toBlockchain], address: toTokenAddress }
            );

            wrappedTrades.forEach(wrappedTrade => {
                console.log("WrappedTrade",wrappedTrade.trade);
                if (wrappedTrade.error) {
                    console.error(`error: ${wrappedTrade.error}`);
                } else {
                    const providerObj: any = {
                        dexName: wrappedTrade.tradeType,
                        protocolFee: wrappedTrade.trade?.feeInfo?.rubicProxy?.fixedFee?.amount?.toFormat(3),
                        tokenSymbol: wrappedTrade.trade?.to?.symbol,
                        tokenAmount: wrappedTrade.trade?.to?.tokenAmount?.toFormat(3),
                        estimatedTime: "Unavailable",
                        tokenUriLink: "Unavailable",
                        trade: wrappedTrade.trade
                    };
                    providerArray.push(providerObj);
                }
            });
            
        }

        console.log(providerArray);
        return providerArray;

    } catch (error) {
        console.error("Error in Rubic SDK operation:", error);
    }
}

export default calculateCrossChainTrades;
