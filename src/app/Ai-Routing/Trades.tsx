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
            
            trades.forEach(trade  => {
                console.log( trade.feeInfo?.rubicProxy?.fixedFee?.amount?.toFormat(3));
                console.log(trade.to?.symbol);
                console.log(trade.to?.tokenAmount?.toFormat(3));
                    const providerObj: any = {
                        dexName: trade.type, // Assuming trade type is accessible
                        protocolFee: trade.feeInfo?.rubicProxy?.fixedFee?.amount?.toFormat(3),
                        tokenSymbol: trade.to?.symbol,
                        tokenAmount: trade.to?.tokenAmount?.toFormat(3),
                        estimatedTime: "Unavailable",
                        tokenUriLink: "Unavailable",
                        trade: trade
                    };
                    providerArray.push(providerObj);
                });
            }
            else {
            const wrappedTrades = await sdk.crossChainManager.calculateTrade(
                { blockchain: BLOCKCHAIN_NAME[fromBlockchain], address: fromTokenAddress },
                fromAmount,
                { blockchain: BLOCKCHAIN_NAME[toBlockchain], address: toTokenAddress }
            );

            wrappedTrades.forEach(wrappedTrade => {
                if (wrappedTrade.error) {
                    console.log(`error: ${wrappedTrade.error}`);
                } else {
                    const providerObj: any = {
                        dexName: wrappedTrade.tradeType,
                        protocolFee: wrappedTrade.trade.feeInfo?.rubicProxy?.fixedFee?.amount?.toFormat(3),
                        tokenSymbol: wrappedTrade.trade.to?.symbol,
                        tokenAmount: wrappedTrade.trade.to?.tokenAmount?.toFormat(3),
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
