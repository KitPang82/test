export type View = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type Margins = { left: number; right: number; top: number; bottom: number };

export type PlotPoint = { x: number; y: number };

export type Segment = PlotPoint[];

const MIN_SPAN = 1e-4;
const MAX_SPAN = 1e5;

export function plotMargins(cssWidth: number): Margins {
  if (cssWidth < 520) return { left: 48, right: 12, top: 22, bottom: 34 };
  return { left: 58, right: 16, top: 22, bottom: 38 };
}

export function defaultView(plotW: number, plotH: number): View {
  return fitSquare({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 }, plotW, plotH);
}

export function fitSquare(view: View, plotW: number, plotH: number): View {
  if (plotW < 8 || plotH < 8) return view;
  const xSpan = view.xMax - view.xMin;
  if (!(xSpan > 0)) return view;
  const ySpan = xSpan * (plotH / plotW);
  const cy = (view.yMin + view.yMax) / 2;
  const next: View = {
    xMin: view.xMin,
    xMax: view.xMax,
    yMin: cy - ySpan / 2,
    yMax: cy + ySpan / 2,
  };
  if (
    Math.abs(next.yMin - view.yMin) < xSpan * 1e-4 &&
    Math.abs(next.yMax - view.yMax) < xSpan * 1e-4
  ) {
    return view;
  }
  return next;
}

export function clampView(view: View): View {
  let xSpan = view.xMax - view.xMin;
  let ySpan = view.yMax - view.yMin;
  if (!(xSpan > 0) || !(ySpan > 0)) {
    return { xMin: -10, xMax: 10, yMin: -6, yMax: 6 };
  }
  const cx = (view.xMin + view.xMax) / 2;
  const cy = (view.yMin + view.yMax) / 2;
  xSpan = Math.min(MAX_SPAN, Math.max(MIN_SPAN, xSpan));
  ySpan = Math.min(MAX_SPAN, Math.max(MIN_SPAN, ySpan));
  return {
    xMin: cx - xSpan / 2,
    xMax: cx + xSpan / 2,
    yMin: cy - ySpan / 2,
    yMax: cy + ySpan / 2,
  };
}

export function zoomAt(view: View, factor: number, anchorX: number, anchorY: number, fx: number, fy: number): View {
  const safe = Math.min(8, Math.max(0.125, factor));
  const xSpan = (view.xMax - view.xMin) * safe;
  const ySpan = (view.yMax - view.yMin) * safe;
  const xMin = anchorX - fx * xSpan;
  const yMax = anchorY + fy * ySpan;
  return clampView({ xMin, xMax: xMin + xSpan, yMin: yMax - ySpan, yMax });
}

export function panBy(view: View, dxPx: number, dyPx: number, plotW: number, plotH: number): View {
  if (plotW < 8 || plotH < 8) return view;
  const xSpan = view.xMax - view.xMin;
  const ySpan = view.yMax - view.yMin;
  const dx = (-dxPx / plotW) * xSpan;
  const dy = (dyPx / plotH) * ySpan;
  return {
    xMin: view.xMin + dx,
    xMax: view.xMax + dx,
    yMin: view.yMin + dy,
    yMax: view.yMax + dy,
  };
}

export function niceStep(span: number, target: number): number {
  const rough = span / Math.max(1, target);
  if (!(rough > 0) || !Number.isFinite(rough)) return 1;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const n = rough / pow;
  const nice = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return nice * pow;
}

export function tickValues(min: number, max: number, step: number): number[] {
  if (!(step > 0) || !(max > min)) return [];
  const start = Math.ceil(min / step - 1e-8) * step;
  const values: number[] = [];
  const limit = Math.ceil((max - start) / step);
  for (let i = 0; i <= limit + 1; i++) {
    const v = start + i * step;
    if (v > max + step * 1e-6) break;
    if (v < min - step * 1e-6) continue;
    values.push(Number(v.toPrecision(12)));
  }
  return values;
}

export function formatTick(value: number, step: number): string {
  if (!Number.isFinite(value)) return "";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e5 || (abs < 1e-4 && step < 1e-4))) {
    return value
      .toExponential(0)
      .replace(/\.?0+e/, "e")
      .replace("e+", "e");
  }
  const decimals = Math.min(6, Math.max(0, -Math.floor(Math.log10(step) + 1e-9)));
  let s = value.toFixed(decimals);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  if (s === "-0") s = "0";
  return s;
}

export function formatNum(value: number): string {
  if (!Number.isFinite(value)) return "无定义";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e6 || abs < 1e-4)) {
    return value
      .toExponential(4)
      .replace(/(\.\d*?)0+e/, "$1e")
      .replace(/\.e/, "e")
      .replace("e+", "e");
  }
  let s = value.toFixed(6);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  if (s === "-0") s = "0";
  return s;
}

export function sampleCurve(
  fn: (x: number) => number,
  view: View,
  pixelWidth: number,
): Segment[] {
  const n = Math.max(2, Math.min(2400, Math.ceil(pixelWidth)));
  const xs = new Array<number>(n);
  const ys = new Array<number>(n);
  const dx = (view.xMax - view.xMin) / n;
  for (let i = 0; i < n; i++) {
    const x = view.xMin + (i + 0.5) * dx;
    xs[i] = x;
    let y = safeEval(fn, x);
    if (!Number.isFinite(y)) {
      const eps = dx * 0.25;
      const y1 = safeEval(fn, x + eps);
      const y2 = safeEval(fn, x - eps);
      const ySpan = view.yMax - view.yMin;
      if (
        Number.isFinite(y1) &&
        Number.isFinite(y2) &&
        Math.abs(y1 - y2) < ySpan * 0.35
      ) {
        y = (y1 + y2) / 2;
      }
    }
    ys[i] = y;
  }

  const jump = (view.yMax - view.yMin) * 0.85;
  const segments: Segment[] = [];
  let current: Segment | null = null;
  for (let i = 0; i < n; i++) {
    const y = ys[i];
    if (!Number.isFinite(y)) {
      current = null;
      continue;
    }
    if (current && Math.abs(y - current[current.length - 1].y) > jump) {
      current = null;
    }
    if (!current) {
      current = [];
      segments.push(current);
    }
    current.push({ x: xs[i], y });
  }
  return segments;
}

export function evalAt(fn: (x: number) => number, x: number): number {
  const direct = safeEval(fn, x);
  if (Number.isFinite(direct)) return direct;
  const eps = 1e-6 * Math.max(1, Math.abs(x));
  const left = safeEval(fn, x - eps);
  const right = safeEval(fn, x + eps);
  if (Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 1e-3) {
    return (left + right) / 2;
  }
  return direct;
}

function safeEval(fn: (x: number) => number, x: number): number {
  try {
    return fn(x);
  } catch {
    return NaN;
  }
}

export const SERIES_VARS = [
  "--color-s1",
  "--color-s2",
  "--color-s3",
  "--color-s4",
  "--color-s5",
  "--color-s6",
] as const;

export const SERIES_FALLBACK = ["#c2410c", "#0f6e75", "#1d4ed8", "#a16207", "#6d28d9", "#be123c"];

export function readSeriesColors(): string[] {
  if (typeof document === "undefined") return [...SERIES_FALLBACK];
  const cs = getComputedStyle(document.documentElement);
  return SERIES_VARS.map((name, i) => cs.getPropertyValue(name).trim() || SERIES_FALLBACK[i]);
}

export type Palette = {
  paper: string;
  ink: string;
  grid: string;
  gridStrong: string;
  axis: string;
  tick: string;
};

const PALETTE_FALLBACK: Palette = {
  paper: "#f3efe4",
  ink: "#1c241e",
  grid: "#e3dccb",
  gridStrong: "#cfc6b2",
  axis: "#24302a",
  tick: "#3e4a43",
};

export function readPalette(): Palette {
  if (typeof document === "undefined") return PALETTE_FALLBACK;
  const cs = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    paper: get("--color-paper", PALETTE_FALLBACK.paper),
    ink: get("--color-ink", PALETTE_FALLBACK.ink),
    grid: get("--color-grid", PALETTE_FALLBACK.grid),
    gridStrong: get("--color-grid-strong", PALETTE_FALLBACK.gridStrong),
    axis: get("--color-axis", PALETTE_FALLBACK.axis),
    tick: get("--color-tick", PALETTE_FALLBACK.tick),
  };
}
