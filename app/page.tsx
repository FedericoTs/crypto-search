'use client';

import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { coingeckoApi, CoinGeckoMarketData } from '@/lib/api/coingecko';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, TrendingUp, TrendingDown } from 'lucide-react';

// Stablecoin symbols to exclude
const STABLECOINS = ['usdt', 'usdc', 'busd', 'dai', 'tusd', 'usdp', 'usdd'];

interface SparklineData {
  price: number;
  time: number;
  formattedTime: string;
}

export default function Home() {
  const [topCryptos, setTopCryptos] = useState<CoinGeckoMarketData[]>([]);
  const [globalMarketData, setGlobalMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cryptos, global] = await Promise.all([
          coingeckoApi.getTopCryptos(25, true),
          coingeckoApi.getGlobalMarketData()
        ]);
        
        const filteredCryptos = cryptos.filter(
          crypto => !STABLECOINS.includes(crypto.symbol.toLowerCase())
        ).slice(0, 10);
        
        setTopCryptos(filteredCryptos);
        setGlobalMarketData(global.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  const getMarketTrend = (change: number) => {
    if (change >= 5) {
      return <Badge className="bg-green-500"><Flame className="w-4 h-4 mr-1" /> Hot</Badge>;
    } else if (change >= 2) {
      return <Badge className="bg-green-400"><TrendingUp className="w-4 h-4 mr-1" /> Rising</Badge>;
    } else if (change <= -5) {
      return <Badge variant="destructive"><TrendingDown className="w-4 h-4 mr-1" /> Dipping</Badge>;
    }
    return null;
  };

  const prepareSparklineData = (prices: number[]): SparklineData[] => {
    const now = new Date();
    return prices.map((price, index) => {
      const time = new Date(now.getTime() - (prices.length - 1 - index) * 3600 * 1000);
      return {
        price,
        time: index,
        formattedTime: time.toLocaleDateString()
      };
    });
  };

  const getYAxisDomain = (data: SparklineData[]) => {
    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1; // Add 10% padding
    return [min - padding, max + padding];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Crypto Search</h1>
        <ThemeToggle />
      </header>

      {/* Market Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Market Cap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(globalMarketData?.total_market_cap?.usd, true)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(globalMarketData?.total_volume?.usd, true)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              BTC Dominance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(globalMarketData?.market_cap_percentage?.btc)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cryptocurrencies Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px] h-10 text-xs">Rank</TableHead>
              <TableHead className="w-[250px] h-10 text-xs">Asset</TableHead>
              <TableHead className="text-right h-10 text-xs">Price</TableHead>
              <TableHead className="text-right h-10 text-xs">24h Change</TableHead>
              <TableHead className="text-right h-10 text-xs">Market Cap</TableHead>
              <TableHead className="w-[200px] h-10 text-xs">7d Chart</TableHead>
              <TableHead className="h-10 text-xs">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topCryptos.map((crypto) => {
              const sparklineData = prepareSparklineData(crypto.sparkline_in_7d.price);
              const yAxisDomain = getYAxisDomain(sparklineData);
              
              return (
                <TableRow key={crypto.id} className="h-14 hover:bg-muted/50">
                  <TableCell className="font-medium py-2">{crypto.market_cap_rank}</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <img src={crypto.image} alt={crypto.name} className="w-5 h-5" />
                      <div className="flex flex-col gap-0">
                        <div className="font-medium leading-none">{crypto.name}</div>
                        <div className="text-muted-foreground text-xs">{crypto.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium py-2">
                    {formatCurrency(crypto.current_price)}
                  </TableCell>
                  <TableCell className={`text-right py-2 ${
                    crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatPercentage(crypto.price_change_percentage_24h)}
                  </TableCell>
                  <TableCell className="text-right py-2">
                    {formatCurrency(crypto.market_cap, true)}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="h-[40px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData}>
                          <YAxis 
                            domain={yAxisDomain}
                            hide 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke={crypto.price_change_percentage_24h >= 0 ? '#22c55e' : '#ef4444'} 
                            strokeWidth={1.5}
                            dot={false}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    {getMarketTrend(crypto.price_change_percentage_24h)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
