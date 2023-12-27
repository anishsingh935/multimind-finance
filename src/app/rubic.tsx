import { Configuration, BLOCKCHAIN_NAME  } from 'rubic-sdk';

export const configuration: Configuration = {
  rpcProviders: {
    [BLOCKCHAIN_NAME.ETHEREUM]: {
      rpcList: ['https://eth-mainnet.g.alchemy.com/v2/R0XpsJFtNE8vdpN3eZpRfWh5TzBfFFsU']
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
      rpcList: ['https://polygon-mainnet.g.alchemy.com/v2/6mwmXKoYNk2dqMEqePtoptLbRDaIhQyP']
    },
    // [BLOCKCHAIN_NAME.OPTIMISM]: {
    //   rpcList: ['https://opt-mainnet.g.alchemy.com/v2/wfELaT_vmriA39wmXvoeXoEEjtN6WbnC']
    // },
    // [BLOCKCHAIN_NAME.ARBITRUM]: {
    //   rpcList: ['https://arb-mainnet.g.alchemy.com/v2/aSfnUj8zFx38R31he8icFmBHPa_tl_ca']
    // },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
      rpcList: ['https://api.avax.network/ext/bc/C/rpc']
    },
    [BLOCKCHAIN_NAME.SOLANA]: {
      rpcList: ['https://solana-mainnet.g.alchemy.com/v2/stOJdVWT4BjrMBe_8TWlsOaiYl9HgAS5']
    },
  },
  providerAddress: {
    [BLOCKCHAIN_NAME.ETHEREUM as keyof typeof BLOCKCHAIN_NAME]: {
      crossChain: '0xA7a4CC554052386B492760AC43c1e5d0BDeb1667', 
      onChain: '0xA7a4CC554052386B492760AC43c1e5d0BDeb1667' 
    },
  }
};


export default configuration;
