"use client";

import type React from "react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { signInWithEmail } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Shield } from "lucide-react";

function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data: authData, error } = await signInWithEmail(
        formData.email,
        formData.password,
      );

      if (error) throw error;

      // Check if user is admin
      if (authData?.user) {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", authData.user.id)
          .single();

        if (profile?.is_admin) {
          router.push("/admin");
          return;
        } else {
          // If not admin, sign out and show error
          await supabase.auth.signOut();
          throw new Error("Access denied. Admin privileges required.");
        }
      } else {
        throw new Error("Authentication failed.");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
      toast({
        title: "Admin Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 p-4">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-2 font-medium text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft
            size={18}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-700 text-xl font-bold text-white shadow-lg">
            <Shield className="h-7 w-7 text-blue-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-sm text-gray-400">Restricted Access</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-gray-800 bg-gray-900/95 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-lg text-gray-400">Sign in to admin dashboard</p>
          </div>

          {error && (
            <div className="mb-8 rounded-xl border border-red-900/50 bg-red-900/20 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-red-400">
                <svg
                  className="h-4 w-4 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Email Field */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail size={20} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 py-4 pr-4 pl-12 text-base text-white placeholder-gray-500 transition-all hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock size={20} className="text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full rounded-xl border-2 border-gray-700 bg-gray-800 py-4 pr-12 pl-12 text-base text-white placeholder-gray-500 transition-all hover:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 transition-colors hover:text-blue-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 w-full transform rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-blue-500 hover:to-blue-600 hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Verifying...
                </div>
              ) : (
                "Access Dashboard"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Authorized personnel only.</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
          <div className="text-gray-400">Loading...</div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
