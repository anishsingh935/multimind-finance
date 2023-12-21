import { BLOCKCHAIN_NAME, EvmCrossChainTrade , PriceToken } from 'rubic-sdk';
import configuration from '../rubic';
import { SDK } from 'rubic-sdk';


async function CalculateTokenPrice(address : string , blockchain : BLOCKCHAIN_NAME) {

    try {
        const sdk = await SDK.createSDK(configuration);
        const token = await PriceToken.createToken({ 
          blockchain,
          address
        });
        const priceString = token.price.toString();
        console.log("Token Price:", priceString);
        return token.price;
      } catch (error) {
        console.error("Error in fetching token price:", error);
      }
}

export default CalculateTokenPrice;

