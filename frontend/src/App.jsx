import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, NavLink } from 'react-router-dom';
import NavigationSidebar from './components/NavigationSidebar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';

const NavigationHeader = () => {
  const location = useLocation();
  const breadcrumbLabels = {
    '/': 'Home',
    '/home': 'Home',
    '/profile': 'Profile',
    '/discover': 'Discover'
  };

  const activeLabel = breadcrumbLabels[location.pathname] ?? 'Home';

  return (
    <div className="navigation-header">
      <div className="breadcrumb-group">
        <span className="breadcrumb">Dashboard</span>
        <img src="/SVG/chevron-right.svg" alt="Navigation separator" />
        <span className="breadcrumb active">{activeLabel}</span>
      </div>
      <NavLink to="/profile" className="profile-link">
        <img src="/SVG/profile.svg" alt="Profile icon" />
        <span>Welcome, User</span>
      </NavLink>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <NavigationSidebar />
        <main className="page-content">
          <NavigationHeader />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
