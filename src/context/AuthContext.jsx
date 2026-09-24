/**
 * ==============================================================================
 * AUTHENTICATION CONTEXT & STATE MANAGEMENT
 * 
 * Class Presentation Guide:
 * - [Rubric: Context API] Demonstrates global state management without prop drilling
 * - [Rubric: Custom Hook] Exports useAuth() for clean, safe consumer access
 * - [Rubric: API Integration] Integrates with Supabase Auth (sessions, login, signup)
 * ==============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

// 1. Create the Context object
const AuthContext = createContext();

// 2. Custom Hook to easily consume the AuthContext anywhere in the component tree
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 3. Provider Component that wraps the application
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // [Rubric: React Hook - useEffect] Restore existing session on initial load
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.display_name || session.user.email.split('@')[0],
            });
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    // [Rubric: Event Subscription] Listen in real-time to login, logout, and token refresh events
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.display_name || session.user.email.split('@')[0],
          });
        } else {
          setUser(null);
        }
      });

      // Cleanup listener on unmount
      return () => {
        mounted = false;
        subscription?.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  // [Rubric: API Integration - Supabase Auth Sign Up]
  const signUp = async (email, password, displayName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const newUser = {
          id: data.user.id,
          email: data.user.email,
          name: displayName || email.split('@')[0],
        };

        // Maintain database integrity: ensure user exists in public.profiles table
        await supabase.from('profiles').upsert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        });

        setUser(newUser);
        return { success: true, user: newUser };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to create account.' };
    }
  };

  // [Rubric: API Integration - Supabase Auth Sign In]
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const loggedInUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.display_name || data.user.email.split('@')[0],
        };

        // Maintain database integrity: ensure user exists in public.profiles table
        await supabase.from('profiles').upsert({
          id: loggedInUser.id,
          name: loggedInUser.name,
          email: loggedInUser.email,
        });

        setUser(loggedInUser);
        return { success: true, user: loggedInUser };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password.' };
    }
  };

  // [Rubric: API Integration - Supabase Auth Sign Out]
  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    // Expose authentication state and action functions to all child components
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
