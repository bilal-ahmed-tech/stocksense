import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./guards";
import { GuestRoute } from "./guards";
import AppLayout from "@/components/layout/AppLayout";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Portfolio from "@/pages/Portfolio";
import Watchlist from "@/pages/Watchlist";
import Alerts from "@/pages/Alerts";
import Settings from "@/pages/Settings";
import StockDetail from "@/pages/StockDetail";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <Login />
      </GuestRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <Register />
      </GuestRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "portfolio", element: <Portfolio /> },
      { path: "watchlist", element: <Watchlist /> },
      { path: "alerts", element: <Alerts /> },
      { path: "settings", element: <Settings /> },
      { path: "stocks/:symbol", element: <StockDetail /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
