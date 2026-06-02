import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

// Mock component boundaries for initial foundation
const DashboardView = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold font-display tracking-tight text-white">
      Dashboard Overview
    </h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {['Total Sales', 'Active Tables', 'Pending Tickets', 'Staff On-Shift'].map(
        (cardName, idx) => (
          <div key={idx} className="glass-card p-6 rounded-lg">
            <p className="text-sm text-muted-foreground font-sans">{cardName}</p>
            <p className="text-4xl font-semibold font-display text-primary mt-2">--</p>
          </div>
        ),
      )}
    </div>
  </div>
);

const TablesView = () => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold font-display tracking-tight text-white">Floor Plan Grid</h1>
    <div className="glass-panel p-8 rounded-lg min-h-[400px] flex items-center justify-center">
      <p className="text-muted-foreground font-sans">
        Active interactive layout blueprint will render here.
      </p>
    </div>
  </div>
);

const LoginView = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="glass-panel w-full max-w-md p-8 rounded-lg space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-extrabold font-display tracking-tight text-white">
          Oven Xpress
        </h2>
        <p className="text-muted-foreground font-sans">Authenticate to access the workspace</p>
      </div>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="staff@ovenxpress.com"
            className="w-full bg-secondary border border-border px-4 py-3 rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Secret Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full bg-secondary border border-border px-4 py-3 rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold font-display py-3 rounded-lg shadow-lg hover:shadow-primary/20 transition-all duration-300">
          Unlock Terminal
        </button>
      </form>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />

        {/* Core Authorized Shell */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardView />} />
          <Route path="tables" element={<TablesView />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
