import { Link } from "react-router-dom";
import { TrendingUp, BarChart3, Bell, PieChart, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Live Prices",
    description: "Real-time market data with smooth charts and tick-by-tick updates.",
  },
  {
    icon: TrendingUp,
    title: "Virtual Trading",
    description: "Buy and sell with $100,000 virtual capital — no real money at risk.",
  },
  {
    icon: Bell,
    title: "Price Alerts",
    description: "Get notified the moment any stock crosses your custom thresholds.",
  },
  {
    icon: PieChart,
    title: "Portfolio Analytics",
    description: "Deep insights on allocation, P&L, and performance over time.",
  },
];

const STOCKS = [
  { symbol: "NVDA", price: "$145.69", change: "+1.49%", positive: true },
  { symbol: "AAPL", price: "$186.85", change: "-2.76%", positive: false },
  { symbol: "TSLA", price: "$355.57", change: "+1.68%", positive: true },
  { symbol: "META", price: "$566.49", change: "+3.34%", positive: true },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <title>StockSense — Virtual Stock Portfolio Tracker</title>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-14 bg-black/90 backdrop-blur-xl border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <TrendingUp size={14} strokeWidth={2} className="text-white" aria-hidden="true" />
          </div>
          <span className="font-bold text-[15px] text-white tracking-tight">StockSense</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-1.5 text-sm text-white/60 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-lg"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section aria-label="Hero" className="relative flex flex-col items-center text-center px-6 pt-32 pb-8">

        {/* Subtle radial glow behind hero */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-15000 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #6366f1 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        {/* Badge */}
        <div className="relative flex items-center gap-1.5 px-3 py-1 mb-8 rounded-full border border-white/10 bg-white/4 text-xs text-white/50">
          <span className="text-yellow-400 text-[10px]" aria-hidden="true">✦</span>
          Start with $100,000 virtual balance
        </div>

        {/* Headline */}
        <h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-6 max-w-3xl">
          <span className="block text-white mb-1">Track your portfolio.</span>
          <span className="block " style={{ background: "linear-gradient(90deg, #818cf8, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Simulate trades.
          </span>
          <span className="block text-white">Master the market.</span>
        </h1>

        <p className="relative text-white/40 text-[15px] max-w-md mb-10 leading-relaxed">
          StockSense is a premium virtual trading platform with live prices,
          deep portfolio analytics, and smart price alerts — all powered by a
          clean, fast, professional interface.
        </p>

        <div className="relative flex items-center gap-3 mb-16">
          <Link
            to="/register"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Get Started
            <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Sign In
          </Link>
        </div>

        {/* Mock browser */}
        <div className="relative w-full max-w-3xl mx-auto">
          {/* Glow under browser */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 opacity-30 blur-2xl pointer-events-none"
            style={{ background: "linear-gradient(90deg, #6366f1, #a855f7)" }}
            aria-hidden="true"
          />
          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: "#111113" }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/6" style={{ background: "#18181b" }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 rounded-md text-xs text-white/25 border border-white/6" style={{ background: "#111113" }}>
                  stocksense.app/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="p-4 space-y-3">
              {/* Ticker row */}
              <div className="grid grid-cols-4 gap-2">
                {STOCKS.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="rounded-lg p-3 border border-white/6"
                    style={{ background: "#18181b" }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-bold text-white/50">
                        {stock.symbol}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${stock.positive ? "bg-emerald-400" : "bg-red-400"}`}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-sm font-bold text-white">{stock.price}</p>
                    <p className={`text-[11px] font-mono ${stock.positive ? "text-emerald-400" : "text-red-400"}`}>
                      {stock.change}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chart card */}
              <div
                className="rounded-lg p-4 border border-white/6"
                style={{ background: "#18181b" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[11px] text-white/30 mb-0.5">Portfolio performance · NVDA</p>
                    <p className="text-xl font-bold text-white">$145.69</p>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-mono font-medium">↑ +1.49%</span>
                </div>
                {/* SVG chart line */}
                <svg viewBox="0 0 580 70" className="w-full" aria-hidden="true" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,55 C30,52 50,48 80,50 C110,52 130,44 160,46 C190,48 210,40 240,38 C270,36 290,30 320,28 C350,26 370,20 400,18 C430,16 450,12 480,10 C510,8 540,9 580,8"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M0,55 C30,52 50,48 80,50 C110,52 130,44 160,46 C190,48 210,40 240,38 C270,36 290,30 320,28 C350,26 370,20 400,18 C430,16 450,12 480,10 C510,8 540,9 580,8 L580,70 L0,70 Z"
                    fill="url(#g1)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section aria-label="Features" className="px-6 py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[32px] font-black text-white mb-3 tracking-tight">
              Everything you need to trade smarter
            </h2>
            <p className="text-white/35 text-sm">
              Built for traders who want a serious tool without serious risk.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl p-5 border border-white/[0.07] hover:border-white/12 transition-colors"
                style={{ background: "#0e0e10" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "rgba(99,102,241,0.15)" }}
                >
                  <Icon size={17} strokeWidth={1.5} className="text-indigo-400" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-xs text-white/35 leading-relaxed">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        aria-label="Call to action"
        className="px-6 py-24 text-center border-t border-white/6"
      >
        <h2 className="text-[36px] font-black text-white mb-3 tracking-tight">
          Ready to test your strategy?
        </h2>
        <p className="text-white/35 text-sm mb-8">
          Open a free virtual account in seconds.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-7 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        >
          Claim $100,000
          <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-white/6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <TrendingUp size={12} strokeWidth={2} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-white">StockSense</span>
        </div>
        <p className="text-xs text-white/25">
          © 2026 StockSense. Virtual trading platform — for educational use only.
        </p>
      </footer>
    </div>
  );
}