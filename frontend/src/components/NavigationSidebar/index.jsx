import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  {
    path: '/home',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M18.05,4.818L12.29.788c-1.57-1.1-3.98-1.04-5.49.13L1.79,4.828c-1,.78-1.79,2.38-1.79,3.64v6.9c0,2.55,2.07,4.63,4.62,4.63h10.78c2.55,0,4.62-2.07,4.62-4.62v-6.78c0-1.35-.87-3.01-1.97-3.78ZM10.76,15.998c0,.41-.34.75-.75.75s-.75-.34-.75-.75v-3c0-.41.34-.75.75-.75s.75.34.75.75v3Z"
          fill="currentColor"
        />
      </svg>
    )
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 15.14 21.31" aria-hidden="true">
        <path
          d="M7.565,9.62c-.1-.01-.22-.01-.33,0-2.38-.08-4.27-2.03-4.27-4.43C2.965,2.74,4.945.75,7.405.75s4.44,1.99,4.44,4.44c-.01,2.4-1.9,4.35-4.28,4.43Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M2.565,13.31c-2.42,1.62-2.42,4.26,0,5.87,2.75,1.84,7.26,1.84,10.01,0,2.42-1.62,2.42-4.26,0-5.87-2.74-1.83-7.25-1.83-10.01,0Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    )
  },
  {
    path: '/discover',
    label: 'Discover',
    icon: (
      <svg viewBox="0 0 21.5 21.5" aria-hidden="true">
        <path
          d="M10.25,19.75c5.247,0,9.5-4.253,9.5-9.5S15.497.75,10.25.75.75,5.003.75,10.25s4.253,9.5,9.5,9.5Z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M20.75,20.75l-2-2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    )
  }
];

const NavigationSidebar = () => (
  <nav className="navigation-sidebar">
      <NavLink to="/home" className="sidebar-brand-link">
        <img src="/SVG/logo.svg" alt="Data Tunes logo" className="sidebar-logo" />
        <h1>Data Tunes</h1>
      </NavLink>
    <ul>
      {navItems.map((item) => (
        <li key={item.path}>
        <NavLink
          to={item.path}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span className="nav-icon-wrapper">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default NavigationSidebar;
