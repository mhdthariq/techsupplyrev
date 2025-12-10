"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function VerifyContent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Email Verified!
        </h1>
        <p className="mb-8 text-gray-600">
          Your email address has been successfully verified. You can now access
          all features of your account.
        </p>

        <Link
          href="/auth/login"
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:from-blue-500 hover:to-blue-600 hover:shadow-lg active:scale-95"
        >
          Proceed to Login
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
