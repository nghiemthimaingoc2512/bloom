"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-ink/25 backdrop-blur-sm z-50 animate-[fade-in_0.2s_ease-out]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
          "w-[92vw] max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl p-7",
          "bg-surface border border-petal/50 shadow-[0_32px_80px_-24px_rgba(20,20,20,0.35)]",
          "dark:bg-night-card dark:border-white/10",
          "animate-[dialog-in_0.2s_ease-out]",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-6 right-6 text-ink-soft hover:text-rose-deep transition-colors">
          <X size={18} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
