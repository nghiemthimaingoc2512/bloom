"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/field";
import { useBloomStore } from "@/lib/store";
import { BloomLogo } from "./logo";

export function FeedbackDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const t = useTranslations("feedback");
  const submitFeedback = useBloomStore((s) => s.submitFeedback);

  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [liked, setLiked] = React.useState("");
  const [confusing, setConfusing] = React.useState("");
  const [featureRequest, setFeatureRequest] = React.useState("");
  const [bug, setBug] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      // Wait for the close animation before wiping the form, so the
      // dialog never visibly flashes back to blank while it's closing.
      setTimeout(() => {
        setRating(0);
        setHoverRating(0);
        setLiked("");
        setConfusing("");
        setFeatureRequest("");
        setBug("");
        setEmail("");
        setSubmitted(false);
      }, 200);
    }
  }

  function submit() {
    if (rating === 0) return;
    submitFeedback({ rating, liked, confusing, featureRequest, bug, email });
    setSubmitted(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {submitted ? (
          <div className="text-center py-6 space-y-2">
            <BloomLogo size={56} className="mx-auto" />
            <div className="font-display text-base font-medium">{t("thankYouTitle")}</div>
            <p className="text-base text-ink-soft">{t("thankYouBody")}</p>
            <button
              onClick={() => handleOpenChange(false)}
              className="btn-primary px-5 py-2.5 rounded-full text-base font-medium mt-4"
            >
              {t("close")}
            </button>
          </div>
        ) : (
          <>
            <DialogTitle className="text-xl font-display font-semibold mb-1">{t("title")}</DialogTitle>
            <p className="text-base text-ink-soft mb-5">{t("subtitle")}</p>
            <div className="space-y-4">
              <div>
                <Label>{t("ratingLabel")}</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${n}`}
                      className="p-0.5"
                    >
                      <Star
                        size={22}
                        className={(hoverRating || rating) >= n ? "fill-rose text-rose" : "text-petal"}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>{t("likedLabel")}</Label>
                <Textarea rows={2} value={liked} onChange={(e) => setLiked(e.target.value)} placeholder={t("likedPlaceholder")} />
              </div>
              <div>
                <Label>{t("confusingLabel")}</Label>
                <Textarea
                  rows={2}
                  value={confusing}
                  onChange={(e) => setConfusing(e.target.value)}
                  placeholder={t("confusingPlaceholder")}
                />
              </div>
              <div>
                <Label>{t("featureLabel")}</Label>
                <Textarea
                  rows={2}
                  value={featureRequest}
                  onChange={(e) => setFeatureRequest(e.target.value)}
                  placeholder={t("featurePlaceholder")}
                />
              </div>
              <div>
                <Label>{t("bugLabel")}</Label>
                <Textarea rows={2} value={bug} onChange={(e) => setBug(e.target.value)} placeholder={t("bugPlaceholder")} />
              </div>
              <div>
                <Label>{t("emailLabel")}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("emailPlaceholder")} />
                <p className="text-sm text-ink-soft mt-1">{t("emailHint")}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => handleOpenChange(false)} className="btn-secondary px-4 py-2.5 rounded-full text-base font-medium">
                {t("cancel")}
              </button>
              <button
                onClick={submit}
                disabled={rating === 0}
                className="btn-primary px-5 py-2.5 rounded-full text-base font-medium"
              >
                {t("submit")}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
