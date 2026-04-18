/**
 * CrisisLens App — React Router + React Query Provider.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './layouts/DashboardLayout';
import HomePage from './pages/HomePage';
import RiskMonitorPage from './pages/RiskMonitorPage';
import AlertsPage from './pages/AlertsPage';
import WorldMapPage from './pages/WorldMapPage';
import CrossMarketPage from './pages/CrossMarketPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 30_000, // Poll every 30s
      staleTime: 15_000,
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/risk" element={<RiskMonitorPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/map" element={<WorldMapPage />} />
            <Route path="/cross-market" element={<CrossMarketPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
