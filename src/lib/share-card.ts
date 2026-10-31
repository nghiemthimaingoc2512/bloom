/**
 * Renders Bloom share cards to a <canvas> using the 2D drawing API - no
 * html-to-image dependency needed. One flexible layout (eyebrow, emoji,
 * headline, wrapping stat columns, footer) covers every card kind (streak,
 * daily achievement, weekly review, Bloom Wrapped), so adding a new card
 * type is just new content, not new drawing code.
 */

const WIDTH = 1080;
const HEIGHT = 1350;
const MARGIN = 60;
const MAX_STATS_PER_ROW = 3;
// Listed first so emoji glyphs render in full color - browsers fall through
// to the next font in the stack, per character, for anything an emoji font
// doesn't cover (e.g. plain Latin text), so this is safe to combine with text.
const EMOJI_FONT_STACK = "'Segoe UI Emoji', 'Noto Color Emoji', 'Apple Color Emoji'";
// Appended after the web fonts so Latin text keeps rendering in
// Fraunces/Inter exactly as before - canvas text falls back per-glyph
// just like DOM text, so this only ever engages for CJK characters.
const CJK_SANS_FALLBACK = "'Noto Sans SC', 'Noto Sans KR', 'Noto Sans JP', sans-serif";

export interface ShareCardStat {
  label: string;
  value: string;
}

export interface ShareCardContent {
  eyebrow: string;
  emoji: string;
  headline: string;
  stats: ShareCardStat[];
}

/** Bloom's tagline, one per locale, for the share card footer - kept here
 *  (rather than threaded through every caller) since it's the only piece
 *  of card chrome that isn't already passed in via `content`. */
const FOOTER_TAGLINE: Record<string, string> = {
  en: "Grow beautifully",
  vi: "Lớn lên thật đẹp",
  zh: "美好生长",
  ko: "아름답게 성장하세요",
  ja: "美しく成長する",
};

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** Greedy word-wrap so longer text (e.g. a full quote) still fits the card -
 *  short headlines just come back as a single line, unaffected. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Shrinks a font size until `text` fits `maxWidth`, so a long stat value
 *  (e.g. a big VND amount) never overlaps its neighboring column. */
function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  toFont: (size: number) => string,
  minSize: number
): number {
  let size = startSize;
  ctx.font = toFont(size);
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = toFont(size);
  }
  return size;
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export async function renderShareCard(content: ShareCardContent, locale = "en"): Promise<HTMLCanvasElement> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Font loading state is best-effort - fall back to default fonts.
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, "#ecebe6");
  bg.addColorStop(1, "#f6f5f2");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  ctx.filter = "blur(90px)";
  ctx.fillStyle = "rgba(77, 88, 99, 0.18)";
  ctx.beginPath();
  ctx.arc(WIDTH - 60, 100, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(111, 122, 134, 0.16)";
  ctx.beginPath();
  ctx.arc(60, HEIGHT - 100, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const cardX = MARGIN;
  const cardY = 160;
  const cardW = WIDTH - MARGIN * 2;
  const cardH = HEIGHT - cardY - MARGIN;

  ctx.save();
  ctx.shadowColor = "rgba(20, 20, 20, 0.12)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 30;
  ctx.fillStyle = "rgba(255,255,255,0.94)";
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 48);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = "left";
  ctx.fillStyle = "#38424c";
  ctx.font = `700 34px ${EMOJI_FONT_STACK}, Inter, sans-serif`;
  ctx.fillText("🌸 Bloom", cardX + 8, cardY - 44);

  ctx.textAlign = "center";
  ctx.font = `140px ${EMOJI_FONT_STACK}, serif`;
  ctx.fillText(content.emoji, WIDTH / 2, cardY + 220);

  ctx.fillStyle = "#38424c";
  ctx.font = `600 30px Inter, ${CJK_SANS_FALLBACK}`;
  ctx.fillText(content.eyebrow.toUpperCase(), WIDTH / 2, cardY + 290);

  ctx.fillStyle = "#26282b";
  ctx.font = `700 58px Inter, ${CJK_SANS_FALLBACK}`;
  const maxTextWidth = cardW - 160;
  const headlineLines = wrapText(ctx, content.headline, maxTextWidth).slice(0, 6);
  const lineHeight = 72;
  const headlineStartY = cardY + 380;
  headlineLines.forEach((line, i) => ctx.fillText(line, WIDTH / 2, headlineStartY + i * lineHeight));
  const headlineEndY = headlineStartY + (headlineLines.length - 1) * lineHeight;

  if (content.stats.length > 0) {
    const rows = chunk(content.stats, MAX_STATS_PER_ROW);
    const rowHeight = 130;
    const colPadding = 36;
    const startY = headlineEndY + 140;

    rows.forEach((row, rowIndex) => {
      const colW = cardW / row.length;
      const rowY = startY + rowIndex * rowHeight;
      row.forEach((stat, i) => {
        const cx = cardX + colW * i + colW / 2;
        const available = colW - colPadding;

        const valueSize = fitFontSize(ctx, stat.value, available, 50, (s) => `700 ${s}px Inter, ${CJK_SANS_FALLBACK}`, 26);
        ctx.font = `700 ${valueSize}px Inter, ${CJK_SANS_FALLBACK}`;
        ctx.fillStyle = "#26282b";
        ctx.fillText(stat.value, cx, rowY);

        const label = stat.label.toUpperCase();
        const labelSize = fitFontSize(ctx, label, available, 22, (s) => `500 ${s}px Inter, ${CJK_SANS_FALLBACK}`, 13);
        ctx.font = `500 ${labelSize}px Inter, ${CJK_SANS_FALLBACK}`;
        ctx.fillStyle = "#6b6f74";
        ctx.fillText(label, cx, rowY + 42);
      });
    });
  }

  const tagline = FOOTER_TAGLINE[locale] ?? FOOTER_TAGLINE.en;
  ctx.fillStyle = "#6b6f74";
  ctx.font = `500 26px Inter, "Noto Sans SC", "Noto Sans KR", "Noto Sans JP", sans-serif`;
  ctx.fillText(`${tagline} · bloomdaily.com`, WIDTH / 2, cardY + cardH - 60);

  return canvas;
}
