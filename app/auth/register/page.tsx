"use client";

import type React from "react";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { signUpWithEmail } from "@/lib/auth";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User } from "lucide-react";

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error } = await signUpWithEmail(
        formData.email,
        formData.password,
        formData.fullName.trim(),
      );

      if (error) throw error;

      // Redirect to login page
      router.push("/auth/login");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-linear-to-br from-blue-200/20 to-indigo-200/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-linear-to-br from-blue-100/30 to-purple-100/30 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-2 font-medium text-gray-600 transition-colors hover:text-[#3498db]"
        >
          <ArrowLeft
            size={18}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#2c3e50] to-[#3498db] text-xl font-bold text-white shadow-lg">
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 10 2 7.79 2 6 3.79 6 6c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM10 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#2c3e50]">TechSupply</h1>
            <p className="text-sm text-gray-500">Premium Tech Store</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-gray-200/50 bg-white/95 p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-[#2C3E50]">
              Create Account
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of satisfied customers
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-red-700">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#2C3E50]">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-4 pr-4 pl-12 text-base text-[#2C3E50] placeholder-gray-400 transition-all hover:border-gray-300 focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#2C3E50]">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-4 pr-4 pl-12 text-base text-[#2C3E50] placeholder-gray-400 transition-all hover:border-gray-300 focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#2C3E50]">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-4 pr-12 pl-12 text-base text-[#2C3E50] placeholder-gray-400 transition-all hover:border-gray-300 focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-[#3498db]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#2C3E50]">
                Confirm Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full rounded-xl border-2 border-gray-200 bg-white py-4 pr-12 pl-12 text-base text-[#2C3E50] placeholder-gray-400 transition-all hover:border-gray-300 focus:border-[#3498db] focus:ring-2 focus:ring-[#3498db]/20 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-[#3498db]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 w-full transform rounded-xl bg-linear-to-r from-[#3498db] to-[#2980b9] py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-[#2980b9] hover:to-[#1f4e79] hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 border-t border-gray-100 pt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-[#3498db] transition-colors hover:text-[#2980b9] hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>© 2024 TechSupply. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
