"use client";

import { useState } from "react";
import { Search, Wallet, Activity, Image, Loader2, ExternalLink, Copy, Check, Users, Globe, Twitter, Github, Calendar, Zap, Coins, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface ChainActivity {
  chain: string;
  txCount: number;
  balanceUsd: number;
}

interface TokenHolding {
  symbol: string;
  name: string;
  balance: number;
  valueUsd: number;
}

interface NFTHolding {
  name: string;
  count: number;
}

interface Transaction {
  date: string;
  method: string;
  valueEth: number;
  to: string;
  direction: string;
  status: string;
}

interface SocialLink {
  platform: string;
  handle: string;
  url?: string;
}

interface WalletProfile {
  address: string;
  ensName: string | null;
  labels: string[];
  chains: ChainActivity[];
  totalBalanceUsd: number;
  totalTxCount: number;
  tokens: TokenHolding[];
  nfts: NFTHolding[];
  transactions: Transaction[];
  socialLinks: SocialLink[];
  tokenCount: number;
  nftCount: number;
  walletAgeDays: number;
  defiProtocols: string[];
}

const LABEL_COLORS: Record<string, string> = {
  "Whale": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Mini Whale": "bg-purple-400/20 text-purple-200 border-purple-400/30",
  "Power User": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Active": "bg-blue-400/20 text-blue-200 border-blue-400/30",
  "NFT Collector": "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "NFT Holder": "bg-pink-400/20 text-pink-200 border-pink-400/30",
  "Multi-Chain Degen": "bg-green-500/20 text-green-300 border-green-500/30",
  "Multi-Chain User": "bg-green-400/20 text-green-200 border-green-400/30",
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function formatBalance(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  if (num >= 1) return num.toFixed(2);
  if (num >= 0.0001) return num.toFixed(4);
  return num.toExponential(2);
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const res = await fetch(`/api/lookup?address=${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch wallet data");
        return;
      }

      setProfile(data);
    } catch {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    if (profile?.address) {
      await navigator.clipboard.writeText(profile.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20" />
        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
              <Wallet className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Multi-Chain Wallet Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Wallet Profiler
            </h1>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Discover on-chain activity, token holdings, and wallet insights across 10+ chains
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-50 group-hover:opacity-75 blur transition" />
              <div className="relative flex items-center bg-gray-900 rounded-xl">
                <Search className="w-5 h-5 text-gray-500 ml-4" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter wallet address or ENS name..."
                  className="flex-1 bg-transparent px-4 py-4 text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="m-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Example addresses */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">Try: </span>
            <button
              onClick={() => setQuery("vitalik.eth")}
              className="text-sm text-purple-400 hover:text-purple-300 transition mx-2"
            >
              vitalik.eth
            </button>
            <button
              onClick={() => setQuery("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")}
              className="text-sm text-purple-400 hover:text-purple-300 transition mx-2"
            >
              {shortenAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-center">
            {error}
          </div>
        </div>
      )}

      {/* Results */}
      {profile && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          {/* Profile Header */}
          <div className="bg-gray-900/50 backdrop-blur border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {profile.ensName && (
                    <h2 className="text-2xl font-bold text-white">{profile.ensName}</h2>
                  )}
                  <button
                    onClick={copyAddress}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition font-mono text-sm bg-white/5 px-3 py-1.5 rounded-lg"
                  >
                    {shortenAddress(profile.address)}
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={`https://etherscan.io/address/${profile.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                {/* Labels */}
                {profile.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.labels.map((label) => (
                      <span
                        key={label}
                        className={`px-3 py-1 text-sm rounded-full border ${LABEL_COLORS[label] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatNumber(profile.totalBalanceUsd)}</div>
                  <div className="text-sm text-gray-400">Total Balance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.totalTxCount.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.chains.length}</div>
                  <div className="text-sm text-gray-400">Chains</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Chain Activity */}
            <div className="bg-gray-900/50 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Chain Activity</h3>
              </div>
              {profile.chains.length > 0 ? (
                <div className="space-y-3">
                  {profile.chains.map((chain) => (
                    <div key={chain.chain} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-white capitalize">{chain.chain}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white">{chain.txCount.toLocaleString()} txns</div>
                        <div className="text-sm text-gray-400">{formatNumber(chain.balanceUsd)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No chain activity found</p>
              )}
            </div>

            {/* Social Links */}
            <div className="bg-gray-900/50 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Social & Identity</h3>
              </div>
              {profile.socialLinks && profile.socialLinks.length > 0 ? (
                <div className="space-y-3">
                  {profile.socialLinks.map((link, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        {link.platform === 'twitter' && <Twitter className="w-4 h-4 text-blue-400" />}
                        {link.platform === 'github' && <Github className="w-4 h-4 text-gray-400" />}
                        {link.platform === 'website' && <Globe className="w-4 h-4 text-green-400" />}
                        {!['twitter', 'github', 'website'].includes(link.platform) && <Users className="w-4 h-4 text-purple-400" />}
                        <span className="text-white capitalize">{link.platform}</span>
                      </div>
                      {link.url ? (
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition text-sm truncate max-w-[200px]">
                          {link.handle}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm truncate max-w-[200px]">{link.handle}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No social links found</p>
              )}
            </div>

            {/* NFT Holdings */}
            <div className="bg-gray-900/50 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Image className="w-5 h-5 text-pink-400" />
                <h3 className="text-lg font-semibold text-white">NFT Collections</h3>
              </div>
              {profile.nfts.length > 0 ? (
                <div className="space-y-3">
                  {profile.nfts.map((nft, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-white">{nft.name}</span>
                      <span className="text-gray-400">{nft.count} items</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No NFTs found</p>
              )}
            </div>

            {/* Token Holdings */}
            <div className="bg-gray-900/50 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Token Holdings</h3>
              </div>
              {profile.tokens && profile.tokens.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {profile.tokens.map((token, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <div className="text-white font-medium">{token.symbol}</div>
                        <div className="text-sm text-gray-400 truncate max-w-[150px]">{token.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white">{formatBalance(token.balance)}</div>
                        {token.valueUsd > 0 && (
                          <div className="text-sm text-gray-400">{formatNumber(token.valueUsd)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tokens found</p>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-900/50 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ArrowUpRight className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
              </div>
              {profile.transactions && profile.transactions.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {profile.transactions.slice(0, 10).map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        {tx.direction === "IN" ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        )}
                        <div>
                          <div className="text-white text-sm">{tx.method}</div>
                          <div className="text-xs text-gray-400">{tx.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {tx.valueEth > 0 && (
                          <div className={`text-sm ${tx.direction === "IN" ? "text-green-400" : "text-red-400"}`}>
                            {tx.direction === "IN" ? "+" : "-"}{tx.valueEth.toFixed(4)} ETH
                          </div>
                        )}
                        <div className={`text-xs ${tx.status === "OK" ? "text-gray-400" : "text-red-400"}`}>
                          {tx.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No transactions found</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            Data powered by Blockscout API
          </div>
        </div>
      )}

      {/* Empty State */}
      {!profile && !loading && !error && (
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="text-gray-600">
            <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Enter a wallet address or ENS name to get started</p>
          </div>
        </div>
      )}
    </main>
  );
}
