import axios from "axios";

export interface TokenInfo {
  chainId: string;
  dexId: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
}

type TokenPrice = TokenInfo[];

export class DexScreenerAPI {
  private readonly baseUrl = "https://api.dexscreener.com/tokens/v1";

  public async getTokenPrice(
    chainId: string,
    tokenAddress: string
  ): Promise<TokenPrice> {
    try {
      const { data } = await axios.get<TokenPrice>(
        `${this.baseUrl}/${chainId}/${tokenAddress}`
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to fetch token price"
        );
      }
      throw error;
    }
  }
}
