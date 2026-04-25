import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { connectWalletAndSwitchNetwork, getDomainOwner, registerDomain, getUserDomains } from './ContractIntegration';
import { GenDomainsLogo } from './components/GenDomainsLogo';
import WalletButton from './components/WalletButton';

/* ── GitHub SVG ─────────────────────────────────── */
const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const truncate = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';

/* ══════════════════════════════════════════════════ */
export default function App() {
  const [walletAddress,  setWalletAddress]  = useState(null);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [searchStatus,   setSearchStatus]   = useState('idle');
  const [domainOwner,    setDomainOwner]    = useState(null);
  const [registerStatus, setRegisterStatus] = useState('idle');
  const [ownedDomains,   setOwnedDomains]   = useState([]);
  const [toast,          setToast]          = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── Debounced real-time availability check ── */
  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = searchQuery.trim();
      if (!q) { setSearchStatus('idle'); setDomainOwner(null); return; }

      setSearchStatus('searching');
      setDomainOwner(null);
      setRegisterStatus('idle');

      try {
        const owner = await getDomainOwner(q);
        // owner is null OR contains 'Error' = domain is free
        if (owner && typeof owner === 'string' && !owner.toLowerCase().includes('error') && !owner.toLowerCase().includes('not found')) {
          setDomainOwner(owner);
          setSearchStatus('taken');
        } else {
          setSearchStatus('available');
        }
      } catch {
        // Network error → treat as available (fail-open) or idle
        setSearchStatus('available');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleConnect = async () => {
    try {
      const addr = await connectWalletAndSwitchNetwork();
      setWalletAddress(addr);
      setToast({ type: 'success', text: 'Wallet connected!' });
      const domains = await getUserDomains(addr);
      setOwnedDomains(Array.isArray(domains) ? domains : []);
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', text: 'Failed to connect wallet.' });
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setOwnedDomains([]);
    setSearchStatus('idle');
    setSearchQuery('');
    setRegisterStatus('idle');
    // Clear any cached wallet state from localStorage
    try { localStorage.removeItem('walletAddress'); } catch {}
    setToast({ type: 'success', text: 'Wallet disconnected.' });
  };

  const handleAccountChange = async (newAddress) => {
    setWalletAddress(newAddress);
    setOwnedDomains([]);
    setRegisterStatus('idle');
    const domains = await getUserDomains(newAddress);
    setOwnedDomains(Array.isArray(domains) ? domains : []);
    setToast({ type: 'success', text: `Switched to ${newAddress.slice(0,6)}...${newAddress.slice(-4)}` });
  };

  const handleRegister = async () => {
    if (!walletAddress) { setToast({ type: 'error', text: 'Connect your wallet first.' }); return; }
    setRegisterStatus('pending');
    try {
      await registerDomain(searchQuery, 1); // years = 1 (v0.2.16 requires years param)
      setRegisterStatus('success');
      setToast({ type: 'success', text: `${searchQuery}.gen is now yours!` });
      // Refresh portfolio from chain (v0.2.16 get_user_domains returns proper array)
      const updated = await getUserDomains(walletAddress);
      setOwnedDomains(Array.isArray(updated) ? updated : [...ownedDomains, `${searchQuery}.gen`]);
      setSearchStatus('idle');
      setSearchQuery('');
    } catch (e) {
      console.error(e);
      setRegisterStatus('error');
      const msg = e?.message?.includes('already taken')
        ? 'Domain already taken on-chain.'
        : 'Transaction failed or rejected.';
      setToast({ type: 'error', text: msg });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Purple ambient glow orbs (image is set on body via CSS) */}
      <div className="bg-glow" />

      {/* ═══ HEADER ═══════════════════════════════ */}
      <header className="header">
        <GenDomainsLogo />

        <WalletButton
          walletAddress={walletAddress}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onAccountChange={handleAccountChange}
        />
      </header>

      {/* ═══ MAIN ══════════════════════════════════ */}
      <main style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        paddingTop: 60, paddingBottom: 80, paddingInline: 20,
        position: 'relative', zIndex: 1,
        textAlign: 'center',
      }}>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="hero-title">
            Claim Your <span className="accent">Domain Name</span> on<br />GenLayer
          </h1>
          <p className="hero-sub" style={{ margin: '0 auto 48px' }}>
            Secure your .gen domain. The ultimate decentralized naming service built on the GenLayer network.
          </p>
        </motion.div>

        {/* Search + result */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
        >
          {/* Pill search bar */}
          <div className="search-wrap">
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="Search for your desired .gen name"
              spellCheck={false}
            />
            <span className="search-suffix">.gen</span>
            <button className="search-btn" disabled={searchStatus === 'searching'}>
              {searchStatus === 'searching'
                ? <Loader2 size={19} className="spin" />
                : <Search size={19} />}
            </button>
          </div>

          {/* ── Result cards ── */}
          <AnimatePresence mode="wait">

            {/* CHECKING STATE */}
            {searchStatus === 'searching' && (
              <motion.div
                key="checking"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginTop: 16, color: '#6b7280', fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <Loader2 size={16} className="spin" style={{ color: '#b040fb' }} />
                Checking availability on GenLayer…
              </motion.div>
            )}

            {/* AVAILABLE STATE — Emerald Green #10b981 */}
            {searchStatus === 'available' && (
              <motion.div
                key="av"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="result-card result-available"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#10b981', flexShrink: 0,
                    boxShadow: '0 0 18px rgba(16,185,129,0.25)',
                  }}>
                    <CheckCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: '#fff' }}>{searchQuery}.gen</div>
                    <div style={{ fontSize: 13, color: '#10b981', marginTop: 3, fontWeight: 500 }}>
                      ✅ Available to register!
                    </div>
                  </div>
                </div>
                <button
                  className="btn-register"
                  onClick={handleRegister}
                  disabled={registerStatus === 'pending'}
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.45)' }}
                >
                  {registerStatus === 'pending'
                    ? <><Loader2 size={14} className="spin" />Registering…</>
                    : 'Register Now'}
                </button>
              </motion.div>
            )}

            {/* TAKEN STATE — Crimson #dc143c */}
            {searchStatus === 'taken' && (
              <motion.div
                key="tk"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="result-card result-taken"
                style={{ borderColor: 'rgba(220,20,60,0.3)', background: 'rgba(220,20,60,0.06)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(220,20,60,0.1)',
                    border: '1px solid rgba(220,20,60,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#dc143c', flexShrink: 0,
                    boxShadow: '0 0 14px rgba(220,20,60,0.2)',
                  }}>
                    <XCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: '#9ca3af' }}>{searchQuery}.gen</div>
                    <div style={{ fontSize: 13, color: '#dc143c', marginTop: 3, fontWeight: 500 }}>
                      ❌ Already Claimed
                    </div>
                    {domainOwner && (
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#4b5563', marginTop: 4 }}>
                        Owner: {truncate(domainOwner)}
                      </div>
                    )}
                  </div>
                </div>
                {/* STRICTLY DISABLED — cursor not-allowed, gray */}
                <button
                  disabled
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: '#4b5563',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, padding: '11px 22px',
                    fontWeight: 600, fontSize: 14,
                    fontFamily: 'Inter, sans-serif',
                    cursor: 'not-allowed',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    opacity: 0.6,
                  }}
                >
                  Not Available
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Portfolio (only when connected) ── */}
        <AnimatePresence>
          {walletAddress && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', maxWidth: 560, marginTop: 48, textAlign: 'left' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 3, height: 20, background: '#b040fb', borderRadius: 2, boxShadow: '0 0 8px #b040fb' }} />
                <span style={{ fontWeight: 600, fontSize: 16, color: '#f0fdf4' }}>Your Domains</span>
                <span style={{
                  marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#c084fc',
                  background: 'rgba(176,64,251,0.1)', border: '1px solid rgba(176,64,251,0.25)',
                  borderRadius: 999, padding: '2px 10px',
                }}>
                  {ownedDomains.length} owned
                </span>
              </div>

              {ownedDomains.length === 0 ? (
                <div style={{
                  border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 14,
                  padding: '28px 20px', textAlign: 'center', color: '#374151', fontSize: 14,
                }}>
                  No domains yet. Search above to claim one.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
                  {ownedDomains.map((domain, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="domain-card"
                    >
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 7px #22d3ee', marginBottom: 9 }} />
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#f0fdf4', marginBottom: 4 }}>{domain}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#374151' }}>{truncate(walletAddress)}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* ═══ FOOTER ════════════════════════════════ */}
      <footer style={{
        position: 'relative', zIndex: 1,
        padding: '20px 24px 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        {/* Bottom handle (as seen in screenshot) */}
        <div className="bottom-handle" />

        {/* Social cards */}
        <div className="social-list" style={{ marginTop: 10 }}>
          <a href="https://x.com/ham_dan1999" target="_blank" rel="noreferrer" className="social-card">
            <div className="icon-container">
              <span className="social-icon" style={{ display: 'flex', color: '#9ca3af' }}><X size={15} /></span>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1 }}>Twitter / X</div>
              <div style={{ fontSize: 11, color: '#4b5563', marginTop: 3 }}>@ham_dan1999</div>
            </div>
          </a>

          <a href="https://github.com/hamdanass" target="_blank" rel="noreferrer" className="social-card">
            <div className="icon-container">
              <span className="social-icon" style={{ display: 'flex', color: '#9ca3af' }}><GithubIcon size={15} /></span>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1 }}>GitHub</div>
              <div style={{ fontSize: 11, color: '#4b5563', marginTop: 3 }}>hamdanass</div>
            </div>
          </a>
        </div>

        <p style={{ margin: 0, fontSize: 11, color: '#1f2937' }}>© 2026 GenDomains · GenLayer Network</p>
      </footer>

      {/* ═══ TOAST ═════════════════════════════════ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}
          >
            {toast.type === 'success'
              ? <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0 }} />
              : <XCircle    size={14} style={{ color: '#ef4444', flexShrink: 0 }} />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
