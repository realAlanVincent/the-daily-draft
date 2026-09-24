/**
 * ==============================================================================
 * NAVBAR HEADER COMPONENT
 * 
 * Class Presentation Guide:
 * - [Rubric: Props & Component Composition] Communicates user actions via callback props
 * - [Rubric: Conditional Rendering] Displays user name badge & sign-out when authenticated,
 *   or "Sign In" button when logged out
 * - [Rubric: Context Integration] Reads active user status from AuthContext
 * ==============================================================================
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { IconSun, IconMoon, IconPen, IconLogOut, IconUser } from './Icons';

export default function Navbar({ currentTheme, onToggleTheme, onNavigateFeed, onNavigateWrite, onOpenAuth }) {
  // [Rubric: Context Hook] Consume user auth state and signOut action
  const { user, isAuthenticated, signOut } = useAuth();

  // Guard: clicking Write while logged out triggers sign-in prompt
  const handleWriteClick = () => {
    if (!isAuthenticated) {
      onOpenAuth('Please sign in to write an article.');
    } else {
      onNavigateWrite();
    }
  };

  return (
    <header className="site-header">
      {/* Brand Logo (Left): Clicking navigates back to feed view */}
      <div className="brand-wrapper" onClick={onNavigateFeed} title="The Daily Draft — Home">
        <div className="brand-dot" />
        <span className="site-logo">The Daily Draft</span>
      </div>

      {/* Right Controls Cluster */}
      <div className="nav-controls">
        {/* Theme Toggle Button (Light Mode <-> Dark Mode) */}
        <button
          className="icon-btn theme-toggle-btn"
          onClick={onToggleTheme}
          title={currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {currentTheme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
        </button>

        {/* Primary CTA: Write Article */}
        <button className="cta-btn write-btn" onClick={handleWriteClick} title="Write an Article">
          <IconPen size={13} />
          <span>Write</span>
        </button>

        {/* [Rubric: Conditional Rendering] User Account vs Sign In button */}
        {isAuthenticated ? (
          <div className="user-nav-cluster">
            <span className="account-btn" title={`Signed in as ${user.name}`}>
              <IconUser size={13} />
              <span>{user.name}</span>
            </span>
            <button
              className="icon-btn logout-btn"
              onClick={signOut}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <IconLogOut size={14} />
            </button>
          </div>
        ) : (
          <button className="account-btn sign-in-btn" onClick={() => onOpenAuth()} title="Sign In">
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
