import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavigationSidebar from './components/NavigationSidebar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import DiscoverPage from './pages/DiscoverPage';

const App = () => {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <NavigationSidebar />
        <main className="page-content">
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
