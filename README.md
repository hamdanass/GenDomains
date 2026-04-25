# GenDomains 🌐

A decentralized domain name registration dApp built on the **GenLayer** network. Register your unique `.gen` identity — fully on-chain, permanently yours.

![GenLayer](https://img.shields.io/badge/Network-GenLayer%20Studionet-blueviolet)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- 🔍 **Real-time availability check** — debounced `get_owner()` query as you type
- ✅ / ❌ **Instant status feedback** — Emerald Green (available) or Crimson Red (taken)
- 👛 **Wallet integration** — connect, disconnect, account switching via MetaMask
- 📋 **Profile dropdown** — copy address, disconnect, live portfolio view
- 🌐 **Ecosystem links** — logo tooltip with faucet, docs, Discord, GitHub
- 🐱 **Custom background** — robot cat mascot with theme-blended UI
- 🔒 **On-chain security** — `UserError` on duplicate registration attempt

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/hamdanass/GenDomains.git
cd GenDomains
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your values if needed
```

### 4. Run locally
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔧 Smart Contract

**Network:** GenLayer Studionet  
**Contract:** `contract_v0.2.18.py`  
**Address:** `0xf2035AC0337F8aBF70D49A5Da0990BF5a0711ee7`

### Key Functions

| Function | Type | Description |
|---|---|---|
| `register(name, years)` | write | Register a `.gen` domain |
| `get_owner(name)` | view | Returns owner address or `"None"` |
| `get_user_domains(address)` | view | Returns all domains owned by address |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 + Custom CSS |
| Animations | Framer Motion |
| Blockchain | GenLayer JS SDK |
| Smart Contract | GenLayer Python VM (GenVM) |
| Wallet | MetaMask (EIP-3326) |

---

## 🔐 Security

- `.env` is blocked by `.gitignore` — never committed
- No private keys in source code
- All contract interaction uses read-only clients for view functions
- Write operations require explicit wallet signature

---

## 📁 Project Structure

```
src/
├── App.jsx                    # Main app + state management
├── ContractIntegration.js     # GenLayer SDK logic
├── index.css                  # Design system tokens
└── components/
    ├── GenDomainsLogo.jsx     # Interactive logo with ecosystem tooltip
    ├── WalletButton.jsx       # Connect/Disconnect profile dropdown
    └── ui/
        └── tooltip.jsx        # Radix UI tooltip wrapper
contract_v0.2.18.py            # Latest deployed GenVM contract
.env.example                   # Environment variable template
```

---

## 🌍 Links

- [GenLayer Studio](https://studio.genlayer.com)
- [GenLayer Docs](https://www.genlayer.com)
- [Testnet Faucet](https://testnet-faucet.genlayer.foundation)
- [Twitter](https://x.com/ham_dan1999)
- [GitHub](https://github.com/hamdanass)

---

*Built with ❤️ on GenLayer*
