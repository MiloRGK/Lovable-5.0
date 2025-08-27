// Convert a hex color to HSL string "h s% l%" for CSS var injection.
export function hexToHslString(hex: string): string {
  const m = hex.replace("#", "");
  const bigint = parseInt(m, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Inject CSS variables at runtime (client side) so each project can have its own theme
 * without rebuilding Tailwind.
 */
export function applyProjectTheme({ brandColor, font }: { brandColor?: string; font?: string }) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (brandColor) {
    root.style.setProperty("--brand", hexToHslString(brandColor));
  }
  if (font) {
    root.style.setProperty("--font-brand", font);
  }
}