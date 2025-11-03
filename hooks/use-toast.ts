"use client";

import { toast } from "sonner";

export interface ToastActionElement {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
}

// Wrapper that uses sonner methods with proper variant mapping for the UI component
function toastFunction({
  title,
  description,
  action,
  variant = "default",
}: ToastProps) {
  const message = title || description || "Notification";

  const options: {
    description?: string;
    action?: ToastActionElement;
  } = {};

  if (title && description) {
    options.description = description;
  }
  if (action) {
    options.action = action;
  }

  // Map variants to appropriate sonner methods that work with our Toaster icons
  switch (variant) {
    case "destructive":
      return toast.error(message, options);
    case "success":
      return toast.success(message, options);
    case "warning":
      return toast.warning(message, options);
    case "info":
      return toast.info(message, options);
    default:
      return toast.success(message, options);
  }
}

export function useToast() {
  return {
    toast: toastFunction,
    dismiss: toast.dismiss,
  };
}

export { toastFunction as toast };
