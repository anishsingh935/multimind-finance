import { SDK  } from 'rubic-sdk'; 
import configuration from '../changeNowConfiguration';


async function calculateSolanaTrades {

    let sdk;

    try {
        sdk = await SDK.createSDK(configuration);
        const trades  = await sdk.ChangenowCrossChainTrade.getTradeInfo();

        console.log(trades);

    

    }

}
export default calculateSolanaTrades;