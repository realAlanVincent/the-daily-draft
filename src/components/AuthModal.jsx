/**
 * ==============================================================================
 * AUTHENTICATION MODAL DIALOG
 * 
 * Class Presentation Guide:
 * - [Rubric: Form Handling & Validation] Controlled email/password fields with submit handling
 * - [Rubric: Conditional Rendering] Toggles between Sign In and Sign Up form views
 * - [Rubric: Context Integration] Calls auth methods (signIn, signUp) from AuthContext
 * - [Rubric: Error State Handling] Renders friendly error alert banner when login fails
 * ==============================================================================
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconClose } from './Icons';

export default function AuthModal({ isOpen, onClose, initialNotice = '' }) {
  // [Rubric: Context Hook] Consume authentication functions
  const { signIn, signUp } = useAuth();

  // Local Form State
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Return null if modal is closed (Early Return pattern)
  if (!isOpen) return null;

  // [Rubric: Form Handling & API Authentication]
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setError(res.error || 'Failed to sign in.');
          setLoading(false);
          return;
        }
      } else {
        const res = await signUp(email, password, displayName);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
          setLoading(false);
          return;
        }
      }
      onClose(); // Close dialog on successful authentication
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Overlay with backdrop blur; clicking outside closes modal
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation prevents clicks inside the modal card from closing it */}
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button className="icon-btn" onClick={onClose} title="Close" aria-label="Close">
            <IconClose size={15} />
          </button>
        </div>

        {/* Notice Banner (e.g. "Please sign in to write an article") */}
        {initialNotice && (
          <div className="modal-notice-banner">
            {initialNotice}
          </div>
        )}

        {/* [Rubric: Error State Handling] Displays authentication errors */}
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {/* [Rubric: Controlled Form Inputs] */}
        <form onSubmit={handleSubmit}>
          {/* Display Name field only in Sign Up mode */}
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                placeholder="e.g. Maya Lin"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password (min 6 characters) */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="cta-btn"
            style={{ width: '100%', height: '38px', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* [Rubric: Conditional Mode Switcher] Toggle between login and registration */}
        <div className="auth-switch-row">
          {mode === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => { setMode('signup'); setError(''); }}
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                className="link-btn"
                onClick={() => { setMode('signin'); setError(''); }}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
