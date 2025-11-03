"use client";

import * as React from "react";
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const toast = {
  success: (message: string, data?: ToastProps) => {
    return sonnerToast.success(message, {
      description: data?.description,
      action: data?.action,
    });
  },
  error: (message: string, data?: ToastProps) => {
    return sonnerToast.error(message, {
      description: data?.description,
      action: data?.action,
    });
  },
  info: (message: string, data?: ToastProps) => {
    return sonnerToast.info(message, {
      description: data?.description,
      action: data?.action,
    });
  },
  warning: (message: string, data?: ToastProps) => {
    return sonnerToast.warning(message, {
      description: data?.description,
      action: data?.action,
    });
  },
  loading: (message: string, data?: ToastProps) => {
    return sonnerToast.loading(message, {
      description: data?.description,
      action: data?.action,
    });
  },
  promise: <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
  ) => {
    return sonnerToast.promise(promise, msgs);
  },
  custom: (jsx: (id: string | number) => React.ReactElement) => {
    return sonnerToast.custom(jsx);
  },
  dismiss: (id?: string | number) => {
    return sonnerToast.dismiss(id);
  },
};

export function useToast() {
  return {
    toast,
    dismiss: toast.dismiss,
  };
}
