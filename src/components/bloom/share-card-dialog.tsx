"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { renderShareCard, type ShareCardContent } from "@/lib/share-card";

export function ShareCardDialog({
  open,
  onOpenChange,
  content,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  content: ShareCardContent | null;
}) {
  const t = useTranslations("share");
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [copyStatus, setCopyStatus] = React.useState<"idle" | "copied" | "error">("idle");
  // Native Web Share support is a static browser capability, so a lazy
  // initializer (evaluated once, on the client) is enough - no effect needed.
  const [canNativeShare] = React.useState(
    () => typeof navigator !== "undefined" && typeof navigator.share === "function"
  );

  React.useEffect(() => {
    if (!open || !content) return;
    let cancelled = false;
    renderShareCard(content).then((canvas) => {
      if (cancelled) return;
      canvasRef.current = canvas;
      setDataUrl(canvas.toDataURL("image/png"));
    });
    return () => {
      cancelled = true;
    };
  }, [open, content]);

  function toBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve(null);
        return;
      }
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  async function handleCopy() {
    try {
      const blob = await toBlob();
      if (!blob) throw new Error("no image");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    } finally {
      setTimeout(() => setCopyStatus("idle"), 2200);
    }
  }

  function handleDownload() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "bloom-share-card.png";
    a.click();
  }

  async function handleShare() {
    const blob = await toBlob();
    if (!blob) return;
    const file = new File([blob], "bloom-share-card.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Bloom" });
      } catch {
        // User cancelled the native share sheet - nothing to do.
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className="text-lg font-display font-medium mb-4">{t("title")}</DialogTitle>
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- this is a generated data: URL, not an optimizable remote asset
          <img src={dataUrl} alt="" className="w-full rounded-2xl border border-petal/50 mb-4" />
        ) : (
          <div className="w-full aspect-[4/5] rounded-2xl bg-blush/40 animate-pulse mb-4" />
        )}
        <div className="flex flex-wrap gap-2 justify-end">
          {canNativeShare && (
            <button onClick={handleShare} className="btn-secondary px-4 py-2 rounded-full text-sm font-medium">
              {t("share")}
            </button>
          )}
          <button onClick={handleCopy} className="btn-secondary px-4 py-2 rounded-full text-sm font-medium">
            {copyStatus === "copied" ? t("copied") : copyStatus === "error" ? t("copyFailed") : t("copyImage")}
          </button>
          <button onClick={handleDownload} className="btn-primary px-4 py-2 rounded-full text-sm font-medium">
            {t("download")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
