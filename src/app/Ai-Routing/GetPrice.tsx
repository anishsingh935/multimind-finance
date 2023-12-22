import { BLOCKCHAIN_NAME, PriceToken } from "rubic-sdk";
import configuration from "../rubic";
import { SDK } from "rubic-sdk";
import Moralis from "moralis";
import { ethers } from "ethers";
type MyBlockchainName = "ETHEREUM" | "POLYGON" | "AVALANCHE" | "SOLANA";

// const DECIMAL_FACTOR = ethers.constants.WeiPerEther;

async function CalculateTokenPrice(
  address: string,
  blockchain: MyBlockchainName
) {
    const token: PriceToken = await PriceToken.createToken({ 
        blockchain: BLOCKCHAIN_NAME.ETHEREUM,
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7'
    });
    
    console.log(token.price);
  
    }catch (error) {
    console.error("Error in fetching token price:", error);
  }

export default CalculateTokenPrice;
