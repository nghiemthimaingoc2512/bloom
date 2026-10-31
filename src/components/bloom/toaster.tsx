"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useBloomStore } from "@/lib/store";

export function Toaster() {
  const toast = useBloomStore((s) => s.toast);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 bg-ink text-cream text-base font-medium px-5 py-3 rounded-full shadow-xl shadow-black/20 z-50 max-w-[90vw] text-center"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
