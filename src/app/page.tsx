"use client";

import { useState } from "react";
import { Search, Wallet, Activity, Image, Loader2, ExternalLink, Copy, Check, Users, Globe, Twitter, Github, Coins, ArrowUpRight, ArrowDownLeft, BarChart3, CreditCard, RefreshCw } from "lucide-react";

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
  symbol?: string;
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

// Main tabs
type MainTab = "transactions" | "token-transfers" | "nft-transfers" | "analytics" | "assets";

// Assets sub-tabs
type AssetsTab = "portfolio" | "tokens" | "nfts";

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

function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  const percent = (value / total) * 100;
  if (percent < 1) return "<1%";
  return `${percent.toFixed(0)}%`;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("assets");
  const [assetsTab, setAssetsTab] = useState<AssetsTab>("portfolio");

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

  // Filter transactions by type
  const tokenTransfers = profile?.transactions?.filter(tx =>
    tx.method?.toLowerCase().includes("transfer") ||
    tx.method?.toLowerCase().includes("swap")
  ) || [];

  const nftTransfers = profile?.transactions?.filter(tx =>
    tx.method?.toLowerCase().includes("nft") ||
    tx.method?.toLowerCase().includes("mint") ||
    tx.method?.toLowerCase().includes("safe")
  ) || [];

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
              Discover on-chain activity, token holdings, and wallet insights across 48+ chains
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
              onClick={() => setQuery("lcamichael.eth")}
              className="text-sm text-purple-400 hover:text-purple-300 transition mx-2"
            >
              lcamichael.eth
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
                {/* Social Links inline */}
                {profile.socialLinks && profile.socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {profile.socialLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
                      >
                        {link.platform === 'twitter' && <Twitter className="w-4 h-4 text-blue-400" />}
                        {link.platform === 'github' && <Github className="w-4 h-4" />}
                        {link.platform === 'website' && <Globe className="w-4 h-4 text-green-400" />}
                        {!['twitter', 'github', 'website'].includes(link.platform) && <Users className="w-4 h-4 text-purple-400" />}
                        <span>{link.handle}</span>
                      </a>
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

          {/* Main Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-4">
            <button
              onClick={() => setMainTab("transactions")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mainTab === "transactions"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Transactions
              </span>
            </button>
            <button
              onClick={() => setMainTab("token-transfers")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mainTab === "token-transfers"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Token Transfers
              </span>
            </button>
            <button
              onClick={() => setMainTab("nft-transfers")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mainTab === "nft-transfers"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                NFT Transfers
              </span>
            </button>
            <button
              onClick={() => setMainTab("analytics")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mainTab === "analytics"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </span>
            </button>
            <button
              onClick={() => setMainTab("assets")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mainTab === "assets"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Assets
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-gray-900/50 backdrop-blur border border-white/10 rounded-2xl p-6">

            {/* Transactions Tab */}
            {mainTab === "transactions" && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-400" />
                  All Transactions
                </h3>
                {profile.transactions && profile.transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                          <th className="pb-3 pr-4">Date</th>
                          <th className="pb-3 pr-4">Method</th>
                          <th className="pb-3 pr-4">Direction</th>
                          <th className="pb-3 pr-4">Value</th>
                          <th className="pb-3 pr-4">To</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.transactions.map((tx, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 pr-4 text-gray-400 text-sm">{tx.date}</td>
                            <td className="py-3 pr-4">
                              <span className="px-2 py-1 bg-white/10 rounded text-sm text-white">
                                {tx.method}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              {tx.direction === "IN" ? (
                                <span className="flex items-center gap-1 text-green-400">
                                  <ArrowDownLeft className="w-4 h-4" /> IN
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-400">
                                  <ArrowUpRight className="w-4 h-4" /> OUT
                                </span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-white">
                              {tx.valueEth > 0 ? `${tx.valueEth.toFixed(4)} ETH` : "-"}
                            </td>
                            <td className="py-3 pr-4 text-gray-400 font-mono text-sm">
                              {tx.to ? shortenAddress(tx.to) : "-"}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                tx.status === "OK" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No transactions found</p>
                )}
              </div>
            )}

            {/* Token Transfers Tab */}
            {mainTab === "token-transfers" && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  Token Transfers (ERC-20)
                </h3>
                {tokenTransfers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                          <th className="pb-3 pr-4">Date</th>
                          <th className="pb-3 pr-4">Method</th>
                          <th className="pb-3 pr-4">Direction</th>
                          <th className="pb-3 pr-4">Value</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tokenTransfers.map((tx, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 pr-4 text-gray-400 text-sm">{tx.date}</td>
                            <td className="py-3 pr-4">
                              <span className="px-2 py-1 bg-yellow-500/20 rounded text-sm text-yellow-400">
                                {tx.method}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              {tx.direction === "IN" ? (
                                <span className="flex items-center gap-1 text-green-400">
                                  <ArrowDownLeft className="w-4 h-4" /> IN
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-400">
                                  <ArrowUpRight className="w-4 h-4" /> OUT
                                </span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-white">
                              {tx.valueEth > 0 ? `${tx.valueEth.toFixed(4)} ETH` : "-"}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                tx.status === "OK" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No token transfers found</p>
                )}
              </div>
            )}

            {/* NFT Transfers Tab */}
            {mainTab === "nft-transfers" && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-pink-400" />
                  NFT Transfers
                </h3>
                {nftTransfers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                          <th className="pb-3 pr-4">Date</th>
                          <th className="pb-3 pr-4">Method</th>
                          <th className="pb-3 pr-4">Direction</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nftTransfers.map((tx, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 pr-4 text-gray-400 text-sm">{tx.date}</td>
                            <td className="py-3 pr-4">
                              <span className="px-2 py-1 bg-pink-500/20 rounded text-sm text-pink-400">
                                {tx.method}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              {tx.direction === "IN" ? (
                                <span className="flex items-center gap-1 text-green-400">
                                  <ArrowDownLeft className="w-4 h-4" /> IN
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-400">
                                  <ArrowUpRight className="w-4 h-4" /> OUT
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                tx.status === "OK" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No NFT transfers found</p>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {mainTab === "analytics" && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Wallet Analytics
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Wallet Age */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Wallet Age</div>
                    <div className="text-2xl font-bold text-white">
                      {profile.walletAgeDays > 365
                        ? `${(profile.walletAgeDays / 365).toFixed(1)} years`
                        : `${profile.walletAgeDays} days`
                      }
                    </div>
                  </div>

                  {/* Total Transactions */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Total Transactions</div>
                    <div className="text-2xl font-bold text-white">{profile.totalTxCount.toLocaleString()}</div>
                  </div>

                  {/* Active Chains */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Active Chains</div>
                    <div className="text-2xl font-bold text-white">{profile.chains.length}</div>
                  </div>

                  {/* Token Count */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Token Types Held</div>
                    <div className="text-2xl font-bold text-white">{profile.tokenCount || profile.tokens?.length || 0}</div>
                  </div>

                  {/* NFT Count */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">NFT Collections</div>
                    <div className="text-2xl font-bold text-white">{profile.nftCount || profile.nfts?.length || 0}</div>
                  </div>

                  {/* DeFi Protocols */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">DeFi Protocols Used</div>
                    <div className="text-2xl font-bold text-white">{profile.defiProtocols?.length || 0}</div>
                  </div>
                </div>

                {/* DeFi Protocols List */}
                {profile.defiProtocols && profile.defiProtocols.length > 0 && (
                  <div className="mt-6">
                    <div className="text-gray-400 text-sm mb-3">DeFi Protocols Interacted</div>
                    <div className="flex flex-wrap gap-2">
                      {profile.defiProtocols.map((protocol, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                          {protocol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Assets Tab */}
            {mainTab === "assets" && (
              <div>
                {/* Assets Sub-tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setAssetsTab("portfolio")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      assetsTab === "portfolio"
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Multichain Portfolio
                  </button>
                  <button
                    onClick={() => setAssetsTab("tokens")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      assetsTab === "tokens"
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Tokens
                  </button>
                  <button
                    onClick={() => setAssetsTab("nfts")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      assetsTab === "nfts"
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    NFTs
                  </button>
                </div>

                {/* Portfolio View */}
                {assetsTab === "portfolio" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        Multichain Portfolio | {profile.chains.length} Chains
                      </h3>
                      <div className="text-sm text-gray-400">
                        Total: {formatNumber(profile.totalBalanceUsd)}
                      </div>
                    </div>
                    {profile.chains.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {profile.chains
                          .sort((a, b) => b.balanceUsd - a.balanceUsd)
                          .map((chain) => (
                          <div
                            key={chain.chain}
                            className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-2 h-2 rounded-full bg-purple-400" />
                              <span className="text-white capitalize font-medium text-sm truncate">
                                {chain.chain}
                              </span>
                              <span className="text-gray-500 text-xs">({chain.txCount})</span>
                            </div>
                            <div className="text-white font-bold">
                              {formatNumber(chain.balanceUsd)}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {formatPercent(chain.balanceUsd, profile.totalBalanceUsd)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No chain activity found</p>
                    )}
                  </div>
                )}

                {/* Tokens View */}
                {assetsTab === "tokens" && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      Token Holdings
                    </h3>
                    {profile.tokens && profile.tokens.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                              <th className="pb-3 pr-4">Token</th>
                              <th className="pb-3 pr-4">Balance</th>
                              <th className="pb-3">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profile.tokens
                              .sort((a, b) => b.valueUsd - a.valueUsd)
                              .map((token, i) => (
                              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                <td className="py-3 pr-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                      {token.symbol.slice(0, 2)}
                                    </div>
                                    <div>
                                      <div className="text-white font-medium">{token.symbol}</div>
                                      <div className="text-gray-400 text-sm truncate max-w-[200px]">{token.name}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 pr-4 text-white font-mono">
                                  {formatBalance(token.balance)}
                                </td>
                                <td className="py-3 text-white">
                                  {token.valueUsd > 0 ? formatNumber(token.valueUsd) : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No tokens found</p>
                    )}
                  </div>
                )}

                {/* NFTs View */}
                {assetsTab === "nfts" && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Image className="w-5 h-5 text-pink-400" />
                      NFT Collections
                    </h3>
                    {profile.nfts && profile.nfts.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {profile.nfts.map((nft, i) => (
                          <div
                            key={i}
                            className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition"
                          >
                            <div className="aspect-square bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg mb-3 flex items-center justify-center">
                              <Image className="w-12 h-12 text-pink-400/50" />
                            </div>
                            <div className="text-white font-medium truncate">{nft.name}</div>
                            {nft.symbol && (
                              <div className="text-gray-400 text-sm">{nft.symbol}</div>
                            )}
                            <div className="text-gray-500 text-sm mt-1">{nft.count} items</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No NFTs found</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            Data powered by Blockscout API | 48+ chains supported
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
