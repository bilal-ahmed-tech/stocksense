import { Link } from "react-router-dom";
import { TrendingUp, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <title>404 Not Found — StockSense</title>
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          <TrendingUp
            size={20}
            strokeWidth={1.5}
            className="text-brand-400"
            aria-hidden="true"
          />
          <span className="font-display text-lg text-brand-400">
            StockSense
          </span>
        </div>

        <div>
          <p className="font-mono text-8xl font-bold text-surface-800 mb-4">
            404
          </p>
          <h1 className="font-display text-2xl text-surface-50 mb-2">
            Page not found
          </h1>
          <p className="text-surface-100 text-sm">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 active:scale-95 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" />
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}