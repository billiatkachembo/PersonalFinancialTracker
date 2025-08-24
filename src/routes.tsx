import React, { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Create simple fallback components for missing ones
const Spinner = () => <div>Loading...</div>;
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const NotFound = () => <div>Page not found</div>;

// Lazy load pages with error handling
const Home = lazy(() => import('./pages/Index').catch(() => ({ default: () => <div>Home Page</div> })));
const Settings = lazy(() => import('./pages/Settings').catch(() => ({ default: () => <div>Settings Page</div> })));
const Profile = lazy(() => import('./pages/Profile').catch(() => ({ default: () => <div>Profile Page</div> })));

// Layout for Settings nested routes
const SettingsLayout = () => (
  <div>
    <h1>Settings</h1>
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