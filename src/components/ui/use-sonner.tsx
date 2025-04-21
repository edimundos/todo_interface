"use client";

import { toast as sonnerToast } from "sonner";

type Variant = "default" | "destructive";

interface ToastParams {
  title: string;
  description?: string;
  variant?: Variant;
  duration?: number;
}

type ToastOptions = {
  duration?: number;

};

export function useToast() {
  function toast({
    title,
    description,
    variant = "default",
    duration = 4000,
  }: ToastParams) {
    const opts: ToastOptions = { duration };
    const message = description ? `${title}: ${description}` : title;
    if (variant === "destructive") {
      sonnerToast.error(message, opts);
    } else {
      sonnerToast.success(message, opts);
    }
  }
  return { toast };
}
