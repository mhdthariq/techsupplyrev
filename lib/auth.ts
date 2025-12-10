"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  provider?: string;
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Email sign in error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message || "Invalid email or password",
      });
      return { data: null, error };
    }

    toast({
      variant: "success",
      title: "Welcome back!",
      description: "You have successfully signed in.",
    });

    // Trigger auth state change for cart merge
    window.dispatchEvent(new Event("authStateChanged"));

    return { data, error: null };
  } catch (error) {
    console.error("Email sign in error:", error);
    const authError: AuthError = {
      message: "An unexpected error occurred during sign in",
    };
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: authError.message,
    });
    return { data: null, error: authError };
  }
}

// Sign up with email and password
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName?: string,
) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          display_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    });

    if (error) {
      console.error("Email sign up error:", error);
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: error.message || "Failed to create account",
      });
      return { data: null, error };
    }

    if (data.user && !data.session) {
      toast({
        variant: "info",
        title: "Check your email",
        description:
          "We sent you a confirmation link to complete your registration.",
      });
    } else {
      toast({
        variant: "success",
        title: "Account created!",
        description: "Welcome to TechSupply Co.",
      });

      // Trigger auth state change for cart merge
      window.dispatchEvent(new Event("authStateChanged"));
    }

    return { data, error: null };
  } catch (error) {
    console.error("Email sign up error:", error);
    const authError: AuthError = {
      message: "An unexpected error occurred during registration",
    };
    toast({
      variant: "destructive",
      title: "Registration Error",
      description: authError.message,
    });
    return { data: null, error: authError };
  }
}

// Sign out
export async function signOut() {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      toast({
        variant: "destructive",
        title: "Sign Out Error",
        description: error.message || "Failed to sign out",
      });
      return { error };
    }

    toast({
      variant: "success",
      title: "Goodbye!",
      description: "You have been signed out successfully.",
    });

    return { error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    const authError: AuthError = {
      message: "An unexpected error occurred during sign out",
    };
    toast({
      variant: "destructive",
      title: "Sign Out Error",
      description: authError.message,
    });
    return { error: authError };
  }
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      avatar_url: user.user_metadata?.avatar_url || "",
      provider: user.app_metadata?.provider || "email",
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// Reset password
export async function resetPassword(email: string) {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error("Reset password error:", error);
      toast({
        variant: "destructive",
        title: "Reset Password Error",
        description: error.message || "Failed to send reset password email",
      });
      return { error };
    }

    toast({
      variant: "success",
      title: "Reset link sent!",
      description: "Check your email for password reset instructions.",
    });

    return { error: null };
  } catch (error) {
    console.error("Reset password error:", error);
    const authError: AuthError = {
      message: "An unexpected error occurred while sending reset email",
    };
    toast({
      variant: "destructive",
      title: "Reset Password Error",
      description: authError.message,
    });
    return { error: authError };
  }
}

// Update password
export async function updatePassword(newPassword: string) {
  const supabase = createClient();

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Update password error:", error);
      toast({
        variant: "destructive",
        title: "Update Password Error",
        description: error.message || "Failed to update password",
      });
      return { error };
    }

    toast({
      variant: "success",
      title: "Password updated!",
      description: "Your password has been successfully updated.",
    });

    return { error: null };
  } catch (error) {
    console.error("Update password error:", error);
    const authError: AuthError = {
      message: "An unexpected error occurred while updating password",
    };
    toast({
      variant: "destructive",
      title: "Update Password Error",
      description: authError.message,
    });
    return { error: authError };
  }
}

// Auth state change listener
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const supabase = createClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || "",
        name:
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          "",
        avatar_url: session.user.user_metadata?.avatar_url || "",
        provider: session.user.app_metadata?.provider || "email",
      };
      callback(user);
    } else {
      callback(null);
    }
  });

  return () => subscription.unsubscribe();
}
