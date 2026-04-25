import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionStatus } from 'genlayer-js/types';

// ── v0.2.16 contract ──────────────────────────────
const CONTRACT_ADDRESS = '0xf2035AC0337F8aBF70D49A5Da0990BF5a0711ee7'; // v0.2.18 ✅

// GenLayer Studionet chain config
const STUDIONET_CHAIN = {
  chainId: '0xF22F',           // 61999
  chainName: 'Genlayer Studio Network',
  nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
  rpcUrls: ['https://studio.genlayer.com/api'],
  blockExplorerUrls: [],
};

// ── Read client (no wallet needed) ───────────────
const getReadClient = () => createClient({ chain: studionet });

// ── Write client (wallet required) ───────────────
const getWriteClient = (address) =>
  createClient({ chain: studionet, account: address, provider: window.ethereum });

/* ─────────────────────────────────────────────────
   connectWalletAndSwitchNetwork
   Uses raw EIP-3326 calls to avoid wallet_getSnaps
───────────────────────────────────────────────── */
export const connectWalletAndSwitchNetwork = async () => {
  if (!window.ethereum) throw new Error('No Web3 wallet detected.');

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const address = accounts[0];

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: STUDIONET_CHAIN.chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902 || switchError.code === -32603) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [STUDIONET_CHAIN],
      });
    } else {
      throw switchError;
    }
  }

  return address;
};

/* ─────────────────────────────────────────────────
   getDomainOwner
   v0.2.16: returns "None" when domain is free,
   or "0xOwner|expiry" when taken.
   Returns:
     null   → available (safe to register)
     string → taken (the owner address)
───────────────────────────────────────────────── */
export const getDomainOwner = async (name) => {
  try {
    const result = await getReadClient().readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_owner',
      args: [name.toLowerCase()],
    });

    // v0.2.16 returns the string "None" for unregistered domains
    if (!result || result === 'None' || result.toLowerCase().includes('not found')) {
      return null; // available
    }

    // result = "0xOwner|expiry" — extract just the address
    return result.includes('|') ? result.split('|')[0] : result;
  } catch (err) {
    console.warn('getDomainOwner error:', err);
    return null; // fail-open → show as available
  }
};

/* ─────────────────────────────────────────────────
   getUserDomains
   v0.2.16: returns DynArray[str] → JS string[]
   No .split() needed — already a proper array.
───────────────────────────────────────────────── */
export const getUserDomains = async (address) => {
  try {
    const result = await getReadClient().readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_user_domains',
      args: [address],
    });

    if (!result) return [];
    // Contract returns list[str] via .split(",") — SDK may return array or string
    const arr = Array.isArray(result)
      ? result
      : String(result).split(',').filter(Boolean);
    return arr.map((d) => (d.trim().endsWith('.gen') ? d.trim() : `${d.trim()}.gen`));
  } catch (err) {
    console.warn('getUserDomains error:', err);
    return [];
  }
};

/* ─────────────────────────────────────────────────
   registerDomain
   v0.2.16: register(name, years)
   Throws gl.vm.UserError("Domain already taken")
   on conflict — caught and re-thrown with a
   user-friendly message.
───────────────────────────────────────────────── */
export const registerDomain = async (name, years = 1) => {
  if (!window.ethereum) throw new Error('Wallet not connected.');

  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (!accounts?.length) throw new Error('Wallet not connected.');

  const writeClient = getWriteClient(accounts[0]);

  try {
    const txHash = await writeClient.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'register',
      args: [name.toLowerCase(), 1],  // years as plain int — GenVM handles u64 conversion
      value: 0n,
    });

    const receipt = await writeClient.waitForTransactionReceipt({
      hash: txHash,
      status: TransactionStatus.FINALIZED,
    });

    return receipt;
  } catch (err) {
    // Handle UserError("Domain already taken") from GenVM
    const msg = err?.message || String(err);
    if (msg.includes('already taken') || msg.includes('UserError')) {
      throw new Error('Domain already taken on-chain.');
    }
    throw err;
  }
};
