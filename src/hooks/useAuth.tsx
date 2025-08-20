import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  signInWithGitHub: () => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer any additional data fetching to prevent deadlocks
          setTimeout(() => {
            toast({
              title: "Welcome back!",
              description: "You've been successfully signed in.",
            });
          }, 0);
        }
        
        if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You've been successfully signed out.",
          });
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      
      // Enhanced password validation
      if (password.length < 8) {
        const error = { message: "Password must be at least 8 characters long" };
        toast({
          variant: "destructive",
          title: "Weak password",
          description: error.message,
        });
        return { error };
      }
      
      // Sanitize inputs
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedFullName = fullName?.trim();
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: sanitizedFullName,
          }
        }
      });

      if (error) {
        // Enhanced error handling with security-focused messaging
        let errorMessage = "Registration failed. Please try again.";
        
        if (error.message.includes("User already registered")) {
          errorMessage = "An account with this email already exists. Try signing in instead.";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address.";
        } else if (error.message.includes("Password")) {
          errorMessage = "Password does not meet security requirements.";
        }
        
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: errorMessage,
        });
        return { error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your registration.",
        });
      }

      return { error: null };
    } catch (error: any) {
      // Generic error message for security
      toast({
        variant: "destructive",
        title: "Registration error",
        description: "An unexpected error occurred. Please try again later.",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Sanitize inputs
      const sanitizedEmail = email.trim().toLowerCase();
      
      // Clean up any existing auth state before new login
      const cleanupAuthState = () => {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      };
      
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        // Enhanced error handling with generic security messages
        let errorMessage = "Sign in failed. Please check your credentials.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please confirm your email address before signing in.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many sign in attempts. Please wait and try again.";
        }
        
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: errorMessage,
        });
        return { error };
      }

      if (data.user) {
        // Validate session before proceeding
        if (data.session?.access_token) {
          // Force page refresh to ensure clean state
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
        } else {
          toast({
            variant: "destructive",
            title: "Authentication error",
            description: "Session validation failed. Please try again.",
          });
          return { error: { message: "Session validation failed" } };
        }
      }

      return { error: null };
    } catch (error: any) {
      // Generic error message for security
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "An unexpected error occurred. Please try again later.",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clean up auth state first
      const cleanupAuthState = () => {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      };
      
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Sign out error:', error);
      }
      
      // Force page refresh for clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
      return { error: null };
    } catch (error: any) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGitHub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "GitHub sign in failed",
          description: error.message,
        });
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Google sign in failed",
          description: error.message,
        });
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGitHub,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};