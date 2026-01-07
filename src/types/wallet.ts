/**
 * TypeScript types matching the Python wallet-identity-profiler models
 */

export interface Chain {
  value: string;
}

export interface ConfidenceLevel {
  value: "verified" | "high" | "medium" | "low";
  score: number;
  symbol: string;
}

export interface SocialPlatform {
  value: string;
  display_name: string;
  url_template?: string;
}

export interface SocialLink {
  platform: SocialPlatform;
  handle: string;
  url?: string;
  confidence: ConfidenceLevel;
  source: string;
  verified_at?: string;
  profile_url?: string;
}

export interface DomainIdentity {
  domain: string;
  chain: Chain;
  is_primary: boolean;
  text_records: Record<string, string>;
  avatar_url?: string;
  resolved_at?: string;
}

export interface ChainActivity {
  chain: string;
  tx_count: number;
  balance_usd: number;
  last_tx_date?: string;
}

export interface OnChainStats {
  first_tx_date?: string;
  last_tx_date?: string;
  tx_count: number;
  token_count: number;
  nft_count: number;
  notable_collections: string[];
  top_interactions: string[];
  total_balance_usd: number;
  chains_active: ChainActivity[];
  defi_protocols: string[];
  wallet_age_days: number;
  gas_spent_usd: number;
}

export interface WalletProfile {
  address: string;
  chain: Chain;
  domains: DomainIdentity[];
  social_links: SocialLink[];
  labels: string[];
  on_chain: OnChainStats;
  confidence_score: number;
  resolved_at?: string;
  cached: boolean;
  primary_domain?: string;
  twitter_handle?: string;
  has_identity: boolean;
}
