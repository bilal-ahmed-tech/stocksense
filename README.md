# 📈 StockSense

A full-stack real-time stock portfolio tracker and simulator built with React 19, Node.js, and MongoDB — featuring live price updates via Socket.io, virtual trading, price alerts, and deep portfolio analytics.

🔗 **Live Demo:** [stocksense-navy.vercel.app](https://stocksense-navy.vercel.app)
💻 **Backend:** [stocksense-production-9daf.up.railway.app](https://stocksense-production-9daf.up.railway.app/health)

---

## ✨ Features

### 📊 Dashboard & Analytics
- Live portfolio value calculated from real-time Finnhub prices
- Real P&L and percentage gain/loss updated every 60 seconds
- Portfolio performance chart built from transaction history replay
- Asset allocation donut chart by holding weight
- Watchlist panel with live prices
- Recent transactions summary
- Skeleton loaders on all async states — no layout shift

### 💼 Portfolio Management
- Holdings table with sort by any column (symbol, shares, avg cost, price, P&L, value)
- Filter holdings by All / Gainers / Losers
- Batched quote fetching — no per-row API calls, zero duplicate requests
- Mobile card layout below xl breakpoint
- Desktop table only shows at xl+ to prevent sidebar overflow at 1000–1280px
- Horizontal scroll on mobile with hidden scrollbar

### 📉 Stock Detail
- Live price with change and percentage
- Interactive price chart with 1D / 1W / 1M / 1Y timeframes
- Key statistics — open, high, low, volume, 52W high/low, market cap, P/E ratio
- Latest company news with source and publish date
- Add to watchlist and Trade buttons
- Stock Detail requires login — intentional to prevent API quota exhaustion

### 🔄 Virtual Trading
- Buy and sell stocks with virtual balance ($100,000 starting balance)
- TradeModal — mobile bottom sheet + desktop centered modal
- Manual focus trap, body scroll lock, stepper with quick-pick buttons (1, 5, 10, 25 shares)
- Balance after trade preview before confirming
- Optimistic-style UX — modal closes instantly on success

### 👁️ Watchlist
- Add stocks via debounced search dropdown (Cmd+K shortcut)
- Live prices update via Socket.io every 60 seconds
- Remove from watchlist with one click
- Click any stock to go to Stock Detail

### 🔔 Price Alerts
- Create alerts for any stock — above or below a target price
- Toggle alerts active / paused without deleting
- Email notification sent via Nodemailer when alert triggers
- Triggered alerts section with timestamp
- Socket event emitted to client when alert fires

### ⚙️ Settings
- Update display name
- Avatar upload with in-browser crop and zoom via react-easy-crop
- Cloudinary storage — auto WebP, fast CDN delivery
- Change password with current password verification
- Reset virtual balance to $100,000
- Delete account with all associated data

### 👤 Authentication
- Register with bcrypt password hashing
- Login with JWT access token (15min) + refresh token (7d httpOnly cookie)
- Auto token refresh on 401 via axios interceptor — transparent to user
- Page refresh auth restoration via `useAuthInit` — no flash of logged-out state
- Logout clears cookie + Redux state + React Query cache + socket disconnect
- Guest and protected route guards

### 📡 Real-time
- Socket.io server + client with JWT auth on handshake
- Price poller runs every 60s — fetches all symbols across all active users in parallel
- Emits `price:update` → React Query cache invalidated → UI updates without refresh
- Emits `alert:triggered` → Redux notification dispatched → toast shown
- Socket connects only when authenticated, disconnects on logout

### 🛡️ Security
- `express-rate-limit` on register and login (10 req / 15 min)
- Separate limit on refresh endpoint (20 req / 5 min)
- Access token stored in Redux memory only — never localStorage
- Refresh token in httpOnly cookie only — never accessible to JavaScript
- CORS configured for cross-domain production with `sameSite: "none"` + `secure: true`
- `trust proxy` enabled for accurate IP detection behind Railway reverse proxy
- Zod validation on all incoming server requests

### ♿ Accessibility
- Semantic HTML throughout — nav, main, section, article, aside, header, footer
- `focus-visible` on all interactive elements
- `aria-label` on all icon-only buttons
- `aria-hidden="true"` on decorative icons
- `aria-live="polite"` on live price in TradeModal
- `role="dialog"` + `aria-modal="true"` on TradeModal
- `role="tablist"` + `role="tab"` on Portfolio tabs
- `role="alert"` on error messages
- Manual focus trap in TradeModal

### 📱 Responsive Design
- Mobile-first layout with Tailwind CSS v4
- Sidebar swipe-to-close on mobile (60px threshold) with backdrop overlay
- Auto-close sidebar on navigation link click
- Holdings table switches to card layout below xl breakpoint
- Stacked header on mobile, row on sm+
- Full-width tabs on mobile, auto-width on sm+

---

## 🛠️ Built With

### Frontend
- **React 19** (Vite) — UI library with fast HMR
- **React Router v7** — client-side routing with protected routes
- **TypeScript** (strict, zero `any` types) — type-safe development
- **Tailwind CSS v4** — utility-first styling with `@theme` block, no config file
- **Recharts** — portfolio area chart and allocation donut chart
- **Lucide React** — consistent icon set at `strokeWidth={1.5}`
- **Sonner** — toast notifications
- **date-fns** — date formatting
- **Zod** — client-side form validation

### State Management
- **Redux Toolkit** — auth state only (`user`, `isAuthenticated`, `accessToken`)
- **TanStack Query v5** — all server data fetching, caching, and mutations
- **Zustand** — UI state only (sidebar, modals, chart timeframe, table filters)

### Backend
- **Node.js + Express** — REST API server
- **MongoDB + Mongoose** — database with TypeScript interfaces on every model
- **JWT** — access token (15min) in memory + refresh token (7d) in httpOnly cookie
- **Socket.io** — real-time price updates and alert triggers
- **bcryptjs** — password hashing
- **Nodemailer** — price alert emails
- **Zod** — server-side request validation
- **express-rate-limit** — brute force protection on auth endpoints
- **Cloudinary + Multer** — avatar upload, crop, delete

### External APIs
- **Finnhub** — real-time stock quotes, search, company news (60 req/min free tier)
- **Alpha Vantage** — historical chart data (25 req/day free tier, heavily cached)

### Deployment
- **Vercel** — frontend with SPA rewrite rules
- **Railway** — backend with production env vars
- **MongoDB Atlas** — M0 free cluster

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database or MongoDB Atlas account
- Finnhub API key — [finnhub.io](https://finnhub.io) (free)
- Alpha Vantage API key — [alphavantage.co](https://www.alphavantage.co) (free)
- Cloudinary account — [cloudinary.com](https://cloudinary.com) (free)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/stocksense
cd stocksense
```

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

**`server/.env`**
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your_access_secret_min_16_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_16_chars
FINNHUB_API_KEY=your_finnhub_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
NODEMAILER_USER=your_email@gmail.com
NODEMAILER_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running Locally

```bash
# Terminal 1 — Server
cd server
npm run dev

# Terminal 2 — Client
cd client
npm run dev
```

- Client: [http://localhost:5173](http://localhost:5173)
- Server: [http://localhost:5000](http://localhost:5000)
- Health check: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🔑 API Routes

### Auth `/api/auth`
| Method | Path | Rate Limited |
|--------|------|-------------|
| POST | /register | Yes (10 / 15 min) |
| POST | /login | Yes (10 / 15 min) |
| POST | /refresh | Yes (20 / 5 min) |
| POST | /logout | No |
| GET | /me | No |
| PATCH | /me | No |
| PATCH | /me/password | No |
| POST | /me/reset-balance | No |
| DELETE | /me | No |

### Portfolio `/api/portfolio`
| Method | Path | Description |
|--------|------|-------------|
| GET | / | Get portfolio with holdings |
| POST | /buy | Buy stock |
| POST | /sell | Sell stock |
| GET | /history | Transaction history |
| GET | /performance | Performance chart + P&L |

### Stocks `/api/stocks`
| Method | Path | Description |
|--------|------|-------------|
| GET | /search?q= | Search stocks |
| GET | /:symbol | Get live quote + company info |
| GET | /:symbol/chart?range= | Price chart (1D/1W/1M/1Y) |
| GET | /:symbol/news | Latest company news |

### Watchlist `/api/watchlist`
| Method | Path | Description |
|--------|------|-------------|
| GET | / | Get watchlist symbols |
| POST | /:symbol | Add symbol |
| DELETE | /:symbol | Remove symbol |

### Alerts `/api/alerts`
| Method | Path | Description |
|--------|------|-------------|
| GET | / | Get all alerts |
| POST | / | Create alert |
| PATCH | /:id/toggle | Toggle active / paused |
| DELETE | /:id | Delete alert |

### Upload `/api/upload`
| Method | Path | Description |
|--------|------|-------------|
| POST | /avatar | Upload avatar to Cloudinary |
| DELETE | /avatar | Delete avatar from Cloudinary |

---

## 🧠 Architecture

### State Management Rules
```
Redux Toolkit   → who is logged in, what notifications are pending
TanStack Query  → anything fetched from the server
Zustand         → anything that only affects UI (sidebar, modals, filters)
```

### Auth Flow
```
Register  → bcrypt hash → create user → access token + refresh token cookie
Login     → verify password → access token (15min) + refresh token (7d httpOnly cookie)
Request   → axios attaches Bearer token from Redux
401       → axios interceptor calls /auth/refresh automatically → retry original request
Refresh   → server reads httpOnly cookie → issues new access token
Logout    → clear cookie + Redux + React Query cache + disconnect socket
```

### Real-time Flow
```
Server boots → pricePoller starts (every 60s)
Poller       → fetches all symbols from watchlists + portfolios across all users (parallel)
Results      → cached in memory (1 min TTL)
Socket emit  → price:update → React Query invalidated → UI updates
Alert check  → if price crosses target → email sent + alert:triggered emitted
```

### Dual API Strategy
```
Finnhub        → quotes, search, news     (60 req/min — handles live data)
Alpha Vantage  → chart/candle data only   (25 req/day — cached aggressively)
```
Both services are fully intact and independently swappable. To switch chart provider, replace `getStockChart` in `alphaVantage.service.ts` and update the import in `stock.controller.ts`.

---

## 📁 Project Structure

```
stocksense/
├── client/                          ← React app (Vite)
│   └── src/
│       ├── app/store.ts             ← Redux store
│       ├── features/
│       │   ├── auth/authSlice.ts
│       │   └── notifications/notificationsSlice.ts
│       ├── stores/                  ← Zustand stores
│       │   ├── useUIStore.ts
│       │   ├── useChartStore.ts
│       │   └── useFilterStore.ts
│       ├── hooks/                   ← TanStack Query hooks
│       │   ├── usePortfolio.ts
│       │   ├── useTransactions.ts
│       │   ├── usePerformance.ts
│       │   ├── useStock.ts
│       │   ├── useStockQuotes.ts    ← batched quote fetching
│       │   ├── useStockChart.ts
│       │   ├── useStockNews.ts
│       │   ├── useStockSearch.ts
│       │   ├── useWatchlist.ts
│       │   ├── useAlerts.ts
│       │   ├── useTradeStock.ts
│       │   ├── useAuthInit.ts       ← restores auth on page refresh
│       │   └── useSocket.ts
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── AppLayout.tsx
│       │   │   └── ScrollToTop.tsx
│       │   ├── ui/
│       │   │   ├── ErrorCard.tsx
│       │   │   ├── ErrorBoundary.tsx
│       │   │   └── AvatarUploadModal.tsx
│       │   ├── portfolio/
│       │   │   └── TradeModal.tsx
│       │   └── stock/
│       │       └── StockSearch.tsx
│       ├── pages/
│       │   ├── Landing.tsx
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Portfolio.tsx
│       │   ├── StockDetail.tsx
│       │   ├── Watchlist.tsx
│       │   ├── Alerts.tsx
│       │   ├── Settings.tsx
│       │   └── NotFound.tsx
│       ├── lib/
│       │   ├── axios.ts             ← axios instance + auto refresh interceptor
│       │   ├── queryClient.ts
│       │   ├── socket.ts
│       │   └── formatters.ts
│       └── types/index.ts
│
└── server/                          ← Node.js + Express
    └── src/
        ├── config/
        │   ├── db.ts
        │   ├── env.ts               ← Zod env validation
        │   └── socket.ts            ← Socket.io + JWT auth on handshake
        ├── models/
        │   ├── User.ts
        │   ├── Portfolio.ts
        │   ├── Transaction.ts
        │   ├── Watchlist.ts
        │   └── Alert.ts
        ├── routes/
        │   ├── auth.routes.ts
        │   ├── portfolio.routes.ts
        │   ├── stock.routes.ts
        │   ├── watchlist.routes.ts
        │   ├── alert.routes.ts
        │   └── upload.routes.ts
        ├── controllers/
        │   ├── auth.controller.ts
        │   ├── portfolio.controller.ts
        │   ├── stock.controller.ts
        │   ├── watchlist.controller.ts
        │   ├── alert.controller.ts
        │   └── upload.controller.ts
        ├── middleware/
        │   ├── auth.middleware.ts
        │   ├── rateLimit.ts
        │   └── errorHandler.ts
        └── services/
            ├── auth.service.ts
            ├── portfolio.service.ts
            ├── finnhub.service.ts   ← quotes, search, news
            ├── alphaVantage.service.ts ← chart data only
            ├── watchlist.service.ts
            ├── alert.service.ts
            ├── upload.service.ts
            ├── pricePoller.ts       ← parallel price fetching + alert checks
            └── email.service.ts
```

---

## ⚠️ Known Limitations

- **Alpha Vantage free tier** — 25 requests/day for chart data. Server caches responses aggressively (5 min for charts) to minimize usage. Get a fresh API key at alphavantage.co if quota is exhausted.
- **Finnhub free tier** — 60 req/min for quotes/search/news. Candle data (charts) requires a paid plan — this is why Alpha Vantage handles charts.
- **Virtual portfolio only** — no real money, no brokerage integration.
- **Price alerts via email only** — no push notifications or SMS.
- **Stock Detail requires login** — intentional to prevent anonymous users from exhausting API quota.
- **No mobile app** — web only, fully responsive.

---

## 🔧 Available Scripts

### Server
```bash
npm run dev      # Start with ts-node-dev (hot reload)
npm run build    # Compile TypeScript
npm start        # Run compiled JS
```

### Client
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 📝 License

MIT License

*Built to showcase React 19, TypeScript, TanStack Query, Redux Toolkit, Zustand, Socket.io, Node.js, MongoDB, and JWT authentication in a production-ready full-stack application.*