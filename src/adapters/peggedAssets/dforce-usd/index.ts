const sdk = require("@defillama/sdk");
import { sumSingleBalance } from "../helper/generalUtil";
import {
  bridgedSupply,
} from "../helper/getSupply";
import {
  ChainBlocks,
  PeggedIssuanceAdapter,
  Balances,
} from "../peggedAsset.type";

type ChainContracts = {
  [chain: string]: {
    [contract: string]: string[];
  };
};

const chainContracts: ChainContracts = {
  ethereum: {
    issued: ["0x0a5E677a6A24b2F1A2Bf4F3bFfC443231d2fDEc8"],
  },
  polygon: {
    issued: ["0xCf66EB3D546F0415b368d98A95EAF56DeD7aA752"],
  },
  bsc: {
    issued: ["0xb5102cee1528ce2c760893034a4603663495fd72"],
  },
  avax: {
    issued: ["0x853ea32391AaA14c112C645FD20BA389aB25C5e0"],
  },
  kava: {
    issued: ["0xDb0E1e86B01c4ad25241b1843E407Efc4D615248"],
  },
  arbitrum: {
    bridgedFromETH: ["0x641441c631e2f909700d2f41fd87f0aa6a6b4edb"],
  },
  optimism: {
    bridgedFromETH: ["0xbfD291DA8A403DAAF7e5E9DC1ec0aCEaCd4848B9"],
  },
};

async function chainMinted(chain: string, decimals: number) {
  return async function (
    _timestamp: number,
    _ethBlock: number,
    _chainBlocks: ChainBlocks
  ) {
    let balances = {} as Balances;
    for (let issued of chainContracts[chain].issued) {
      const totalSupply = (
        await sdk.api.abi.call({
          abi: "erc20:totalSupply",
          target: issued,
          block: _chainBlocks[chain],
          chain: chain,
        })
      ).output;

      sumSingleBalance(
        balances,
        "peggedUSD",
        totalSupply / 10 ** decimals,
        "issued",
        false
      );
    }
    return balances;
  };
}

const adapter: PeggedIssuanceAdapter = {
  ethereum: {
    minted: chainMinted("ethereum", 18),
    unreleased: async () => ({}),
  },
  polygon: {
    minted: chainMinted("polygon", 18),
    unreleased: async () => ({}),
  },
  bsc: {
    minted: chainMinted("bsc", 18),
    unreleased: async () => ({}),
  },
  avalanche: {
    minted: chainMinted("avax", 18),
    unreleased: async () => ({}),
  },
  kava: {
    minted: chainMinted("kava", 18),
    unreleased: async () => ({}),
  },
  optimism: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "optimism",
      18,
      chainContracts.optimism.bridgedFromETH,
      "optimism",
      "Ethereum"
    ),
  },
  arbitrum: {
    minted: async () => ({}),
    unreleased: async () => ({}),
    ethereum: bridgedSupply(
      "arbitrum",
      18,
      chainContracts.arbitrum.bridgedFromETH,
      "arbitrum",
      "Ethereum"
    ),
  },
};

export default adapter;
