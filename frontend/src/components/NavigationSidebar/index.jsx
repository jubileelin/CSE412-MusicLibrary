import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/home', label: 'Home' },
  { path: '/profile', label: 'Profile' },
  { path: '/discover', label: 'Discover' }
];

const NavigationSidebar = () => (
  <nav className="navigation-sidebar">
    <div className=" sidebar-brand">
      <h1 className="">Music Library</h1>
      <span>Navigation</span>
    </div>
    <ul>
      {navItems.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default NavigationSidebar;
