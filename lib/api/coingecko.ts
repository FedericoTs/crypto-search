import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
}

export const coingeckoApi = {
  getTopCryptos: async (limit: number = 10, sparkline: boolean = true): Promise<CoinGeckoMarketData[]> => {
    try {
      const response = await axios.get(`${COINGECKO_API_URL}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: sparkline,
          locale: 'en'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top cryptos from CoinGecko:', error);
      throw error;
    }
  },

  getGlobalMarketData: async () => {
    try {
      const response = await axios.get(`${COINGECKO_API_URL}/global`);
      return response.data;
    } catch (error) {
      console.error('Error fetching global market data from CoinGecko:', error);
      throw error;
    }
  }
};
