"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5" />,
        info: <InfoIcon className="size-5" />,
        warning: <TriangleAlertIcon className="size-5" />,
        error: <OctagonXIcon className="size-5" />,
        loading: <Loader2Icon className="size-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#2C3E50] group-[.toaster]:border-0 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:min-h-[64px] group-[.toaster]:backdrop-blur-md group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3 group-[.toaster]:transform group-[.toaster]:transition-all group-[.toaster]:duration-300 group-[.toaster]:ease-out",
          title:
            "group-[.toast]:text-[#2C3E50] group-[.toast]:font-bold group-[.toast]:text-sm group-[.toast]:leading-tight group-[.toast]:m-0",
          description:
            "group-[.toast]:text-gray-600 group-[.toast]:text-xs group-[.toast]:leading-relaxed group-[.toast]:mt-1 group-[.toast]:m-0",
          actionButton:
            "group-[.toast]:bg-[#3498DB] group-[.toast]:text-white group-[.toast]:font-semibold group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:rounded-lg group-[.toast]:text-sm group-[.toast]:hover:bg-[#2980B9] group-[.toast]:transition-colors group-[.toast]:duration-200 group-[.toast]:border-0 group-[.toast]:cursor-pointer group-[.toast]:ml-2",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-[#2C3E50] group-[.toast]:font-medium group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:rounded-lg group-[.toast]:text-sm group-[.toast]:hover:bg-gray-200 group-[.toast]:transition-colors group-[.toast]:duration-200 group-[.toast]:border-0 group-[.toast]:cursor-pointer",
          closeButton: "group-[.toast]:hidden",
          error:
            "group-[.toaster]:bg-white group-[.toaster]:border-l-4 group-[.toaster]:border-red-500",
          success:
            "group-[.toaster]:bg-white group-[.toaster]:border-l-4 group-[.toaster]:border-green-500",
          warning:
            "group-[.toaster]:bg-white group-[.toaster]:border-l-4 group-[.toaster]:border-amber-500",
          info: "group-[.toaster]:bg-white group-[.toaster]:border-l-4 group-[.toaster]:border-[#3498DB]",
          loading:
            "group-[.toaster]:bg-white group-[.toaster]:border-l-4 group-[.toaster]:border-gray-400",
          icon: "group-[.toast]:w-10 group-[.toast]:h-10 group-[.toast]:rounded-full group-[.toast]:flex group-[.toast]:items-center group-[.toast]:justify-center group-[.toast]:shrink-0",
          content:
            "group-[.toast]:flex-1 group-[.toast]:flex group-[.toast]:flex-col group-[.toast]:justify-center group-[.toast]:pr-4",
        },
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#2C3E50",
          "--normal-border": "transparent",
          "--border-radius": "16px",
          "--success-bg": "#10b981",
          "--success-text": "#ffffff",
          "--error-bg": "#ef4444",
          "--error-text": "#ffffff",
          "--warning-bg": "#f59e0b",
          "--warning-text": "#ffffff",
          "--info-bg": "#3498DB",
          "--info-text": "#ffffff",
          "--loading-bg": "#6b7280",
          "--loading-text": "#ffffff",
          "--toast-shadow":
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          "--toast-success-shadow":
            "0 20px 25px -5px rgba(16, 185, 129, 0.3), 0 10px 10px -5px rgba(16, 185, 129, 0.1)",
          "--toast-error-shadow":
            "0 20px 25px -5px rgba(239, 68, 68, 0.3), 0 10px 10px -5px rgba(239, 68, 68, 0.1)",
          "--toast-warning-shadow":
            "0 20px 25px -5px rgba(245, 158, 11, 0.3), 0 10px 10px -5px rgba(245, 158, 11, 0.1)",
          "--toast-info-shadow":
            "0 20px 25px -5px rgba(52, 152, 219, 0.3), 0 10px 10px -5px rgba(52, 152, 219, 0.1)",
        } as React.CSSProperties
      }
      position="top-center"
      expand={true}
      richColors={false}
      closeButton={false}
      duration={4000}
      gap={12}
      offset={24}
      visibleToasts={5}
      {...props}
    />
  );
};

export { Toaster };
