import React, { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Spinner from './components/Spinner';
import ErrorBoundary from './components/ErrorBoundary'; // create this for global errors
import NotFound from './pages/NotFound';
import { useToast } from "@/hooks/use-toast";


// Lazy load pages
const Home = lazy(() => import('./pages/Index'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

// Layout for Settings nested routes
const SettingsLayout = () => (
  <div>
    <h1>Settings</h1>
    {/* Insert sidebar/nav here if you want */}
    <Outlet />
  </div>
);

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="settings" element={<SettingsLayout />}>
            <Route index element={<Settings onUnlock={function (): void {
              throw new Error('Function not implemented.');
            } } />} />
            {/* other nested settings routes can go here */}
          </Route>

          <Route path="profile" element={<Profile onUnlock={function (): void {
            throw new Error('Function not implemented.');
          } } />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

