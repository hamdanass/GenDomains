import React, { useState, useEffect, useRef } from 'react';
import { UserCircle2, Copy, Check, LogOut, ChevronDown } from 'lucide-react';

const truncate = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

export default function WalletButton({ walletAddress, onConnect, onDisconnect, onAccountChange }) {
  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Listen for MetaMask account/network changes ── */
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        // User disconnected from extension
        onDisconnect();
      } else if (accounts[0] !== walletAddress) {
        // User switched account
        onAccountChange(accounts[0]);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  }, [walletAddress, onDisconnect, onAccountChange]);

  /* ── Copy address ── */
  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  /* ── Disconnect ── */
  const handleDisconnect = () => {
    setOpen(false);
    onDisconnect();
  };

  /* ══════════════════════════════════════════════════
     DISCONNECTED STATE
  ══════════════════════════════════════════════════ */
  if (!walletAddress) {
    return (
      <button
        onClick={onConnect}
        style={{
          padding: '8px 20px',
          border: '1px solid rgba(16,185,129,0.6)',
          color: '#10b981',
          borderRadius: 999,
          background: 'transparent',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          letterSpacing: '0.01em',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(16,185,129,0.08)';
          e.currentTarget.style.boxShadow = '0 0 16px rgba(16,185,129,0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <UserCircle2 size={15} />
        Connect Wallet
      </button>
    );
  }

  /* ══════════════════════════════════════════════════
     CONNECTED STATE — Avatar + Dropdown
  ══════════════════════════════════════════════════ */
  return (
    <div ref={dropdownRef} style={{ position: 'relative', zIndex: 60 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 14px 7px 8px',
          borderRadius: 999,
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.35)',
          color: '#10b981',
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: open ? '0 0 20px rgba(16,185,129,0.25)' : 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(16,185,129,0.25)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Avatar circle */}
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 8px rgba(16,185,129,0.5)',
        }}>
          <UserCircle2 size={15} color="#000" strokeWidth={2.5} />
        </div>

        {/* Truncated address */}
        <span style={{ fontFamily: 'monospace', letterSpacing: '0.02em' }}>
          {truncate(walletAddress)}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={13}
          style={{
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          minWidth: 210,
          background: 'rgba(4, 0, 14, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 14,
          boxShadow: '0 0 30px rgba(16,185,129,0.15), 0 16px 40px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          animation: 'dropIn 0.18s ease',
        }}>
          {/* Address header */}
          <div style={{
            padding: '12px 16px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 11, color: '#4b5563', fontWeight: 500, marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Connected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#e2e8f0' }}>
                {truncate(walletAddress)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: '6px 6px' }}>
            {/* Copy Address */}
            <button
              onClick={handleCopy}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px',
                borderRadius: 9,
                background: 'transparent',
                border: 'none',
                color: copied ? '#10b981' : '#94a3b8',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = copied ? '#10b981' : '#94a3b8'; }}
            >
              {copied ? <Check size={15} style={{ color: '#10b981' }} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy Address'}
            </button>

            {/* Disconnect */}
            <button
              onClick={handleDisconnect}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px',
                borderRadius: 9,
                background: 'transparent',
                border: 'none',
                color: '#f87171',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#fca5a5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f87171'; }}
            >
              <LogOut size={15} />
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Dropdown animation */}
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
