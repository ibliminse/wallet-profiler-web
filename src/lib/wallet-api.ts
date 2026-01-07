import type { WalletProfile } from "@/types/wallet";

export interface LookupOptions {
  address: string;
  chain?: "ethereum" | "solana" | "polygon" | "arbitrum" | "optimism" | "base";
  refresh?: boolean;
}

/**
 * Lookup wallet profile from the API
 * 
 * @example
 * ```ts
 * const profile = await lookupWallet({
 *   address: "0x123...",
 *   chain: "ethereum",
 *   refresh: false
 * });
 * ```
 */
export async function lookupWallet(options: LookupOptions): Promise<WalletProfile> {
  const { address, chain, refresh = false } = options;

  const params = new URLSearchParams({
    address,
    ...(chain && { chain }),
    ...(refresh && { refresh: "true" }),
  });

  const response = await fetch(`/api/lookup?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
