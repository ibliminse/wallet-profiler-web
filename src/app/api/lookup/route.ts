import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { join } from "path";
import type { WalletProfile } from "@/types/wallet";

const execAsync = promisify(exec);

// External API URL for production (Railway)
const PROFILER_API_URL = process.env.PROFILER_API_URL;

/**
 * Fetch profile from external API (production mode)
 */
async function fetchFromExternalAPI(
  address: string,
  chain?: string,
  refresh: boolean = false
): Promise<any> {
  const params = new URLSearchParams({ address });
  if (chain) params.set("chain", chain);
  if (refresh) params.set("refresh", "true");

  const url = `${PROFILER_API_URL}/api/lookup?${params.toString()}`;
  console.log("Fetching from external API:", url);

  const response = await fetch(url, {
    headers: { "Accept": "application/json" },
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API returned ${response.status}`);
  }

  return response.json();
}

/**
 * Get the profiler directory path
 */
function getProfilerPath(): string {
  if (process.env.PROFILER_PATH) {
    return process.env.PROFILER_PATH;
  }
  const relativePath = join(process.cwd(), "..", "wallet-identity-profiler");
  return relativePath;
}

/**
 * Execute Python profiler CLI and get JSON output (local development mode)
 */
async function executeProfiler(
  address: string,
  chain?: string,
  refresh: boolean = false
): Promise<WalletProfile> {
  const baseArgs = [address, "--json", "--quiet"];

  if (chain) {
    baseArgs.push("--chain", chain);
  }

  if (refresh) {
    baseArgs.push("--refresh");
  }

  let command = `profiler lookup ${baseArgs.join(" ")}`;
  let options: { cwd?: string; maxBuffer: number; timeout: number } = {
    maxBuffer: 10 * 1024 * 1024,
    timeout: 120000,
  };

  try {
    const { stdout, stderr } = await execAsync(command, options);

    if (stderr && !stderr.includes("Looking up")) {
      console.warn("Profiler stderr:", stderr);
    }

    const jsonData = parseProfilerOutput(stdout);
    return jsonData as WalletProfile;
  } catch (error: any) {
    if (error.code === "ENOENT" || error.message.includes("profiler: command not found")) {
      console.log("Profiler command not found, trying Python module...");

      const profilerPath = getProfilerPath();
      command = `python3 -m src.main lookup ${baseArgs.join(" ")}`;
      options.cwd = profilerPath;

      try {
        const { stdout, stderr } = await execAsync(command, options);

        if (stderr && !stderr.includes("Looking up")) {
          console.warn("Profiler stderr:", stderr);
        }

        const jsonData = parseProfilerOutput(stdout);
        return jsonData as WalletProfile;
      } catch (pythonError: any) {
        console.error("Python module execution error:", pythonError);
        throw new Error(
          `Failed to execute profiler. Make sure python3 is installed and the profiler is available at: ${profilerPath}`
        );
      }
    }

    if (error.code === "ETIMEDOUT" || error.signal === "SIGTERM") {
      throw new Error("Profiler request timed out. Please try again.");
    }

    const errorMessage = error.stderr || error.message || "Unknown error occurred";
    throw new Error(`Profiler error: ${errorMessage}`);
  }
}

/**
 * Parse JSON output from profiler command
 */
function parseProfilerOutput(stdout: string): any {
  try {
    const jsonMatch = stdout.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(stdout.trim());
  } catch (parseError) {
    console.error("Failed to parse JSON:", stdout);
    throw new Error(`Failed to parse profiler output: ${parseError}`);
  }
}

/**
 * Transform raw profile data to frontend format
 */
function transformProfile(profile: any) {
  const onChain = profile.on_chain || {};
  const primaryDomain = profile.domains?.find((d: any) => d.is_primary)?.domain
    || profile.domains?.[0]?.domain
    || null;

  const chains = (onChain.chains_active || []).map((c: any) => ({
    chain: c.chain,
    txCount: c.tx_count || 0,
    balanceUsd: c.balance_usd || 0,
  }));

  const nfts = (onChain.notable_collections || []).map((name: string) => ({
    name,
    count: 1,
  }));

  const socialLinks = (profile.social_links || []).map((link: any) => ({
    platform: typeof link.platform === 'string' ? link.platform : link.platform?.value || 'unknown',
    handle: link.handle,
    url: link.url,
  }));

  return {
    address: profile.address,
    ensName: primaryDomain,
    labels: profile.labels || [],
    chains,
    totalBalanceUsd: onChain.total_balance_usd || 0,
    totalTxCount: onChain.tx_count || 0,
    tokens: [],
    nfts,
    transactions: [],
    socialLinks,
    tokenCount: onChain.token_count || 0,
    nftCount: onChain.nft_count || 0,
    walletAgeDays: onChain.wallet_age_days || 0,
    defiProtocols: onChain.defi_protocols || [],
    firstTxDate: onChain.first_tx_date,
    lastTxDate: onChain.last_tx_date,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const chain = searchParams.get("chain") || undefined;
  const refresh = searchParams.get("refresh") === "true";

  if (!address) {
    return NextResponse.json(
      { error: "Address parameter is required" },
      { status: 400 }
    );
  }

  if (!address.match(/^(0x[a-fA-F0-9]{40}|[A-Za-z0-9]{32,44}|[\w-]+\.(eth|sol|crypto|nft|wallet|blockchain|x|bitcoin|dao|888))$/)) {
    return NextResponse.json(
      { error: "Invalid address or domain format" },
      { status: 400 }
    );
  }

  try {
    let profile: any;

    // Use external API if configured (production), otherwise use local CLI
    if (PROFILER_API_URL) {
      console.log("Using external API mode");
      profile = await fetchFromExternalAPI(address, chain, refresh);
    } else {
      console.log("Using local CLI mode");
      profile = await executeProfiler(address, chain, refresh);
    }

    const response = transformProfile(profile);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to fetch wallet profile",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
