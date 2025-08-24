import React, { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Spinner from './components/Spinner';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';

// Lazy load pages
const Home = lazy(() => import('./pages/Index'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));

// Layout for Settings nested routes
const SettingsLayout: React.FC = () => (
  <div>
    <h1>Settings</h1>
    {/* Optional sidebar/nav */}
    <Outlet />
  </div>
);

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Home page */}
          <Route path="/" element={<Home />} />

          {/* Settings nested routes */}
          <Route path="settings" element={<SettingsLayout />}>
            <Route
              index
              element={
                <Settings
                  onUnlock={() => {
                    console.warn('onUnlock not implemented yet.');
                  }}
                />
              }
            />
            {/* Add more nested settings routes here if needed */}
          </Route>

          {/* Profile page */}
          <Route
            path="profile"
            element={
              <Profile
                onUnlock={() => {
                  console.warn('onUnlock not implemented yet.');
                }}
              />
            }
          />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
