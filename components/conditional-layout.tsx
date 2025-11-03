"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Routes that should not have header and footer
  const isAuthRoute = pathname?.startsWith("/auth");
  const isCheckoutRoute = pathname?.startsWith("/checkout");
  const shouldHideNavigation = isAuthRoute || isCheckoutRoute;

  return (
    <>
      {!shouldHideNavigation && <Header />}
      <main className={shouldHideNavigation ? "" : "pt-16"}>
        {children}
      </main>
      {!shouldHideNavigation && <Footer />}
    </>
  );
}
