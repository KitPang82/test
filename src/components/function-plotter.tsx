import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlotStage, type DrawnFn } from "@/components/plot-stage";
import { compile } from "@/lib/expr";
import { defaultView, evalAt, fitSquare, formatNum, readSeriesColors, SERIES_FALLBACK, zoomAt, type View } from "@/lib/plot";
import { cn } from "@/lib/utils";

type FnItem = {
  id: string;
  expr: string;
  visible: boolean;
  colorIndex: number;
};

type Example = { id: string; name: string; exprs: string[] };

const STORAGE_KEY = "hanshu-tuban.v1";
const MAX_FNS = 8;

const EXAMPLES: Example[] = [
  { id: "trig", name: "正余弦", exprs: ["sin(x)", "cos(x)"] },
  { id: "taylor", name: "泰勒近似", exprs: ["sin(x)", "x", "x - x^3/6"] },
  { id: "quad", name: "抛物线", exprs: ["0.25*x^2"] },
  { id: "cubic", name: "三次曲线", exprs: ["0.08*x^3 - 0.8*x"] },
  { id: "gauss", name: "高斯", exprs: ["exp(-x^2/2)"] },
  { id: "damp", name: "阻尼振荡", exprs: ["exp(-0.12*abs(x))*cos(2*x)"] },
  { id: "sinc", name: "采样函数", exprs: ["sin(x)/x"] },
  { id: "hyper", name: "反比例", exprs: ["1/x"] },
];

const DEFAULT_ITEMS: FnItem[] = [
  { id: "f1", expr: "sin(x)", visible: true, colorIndex: 0 },
  { id: "f2", expr: "cos(x)", visible: true, colorIndex: 1 },
];

export function FunctionPlotter() {
  const [items, setItems] = useState<FnItem[]>(DEFAULT_ITEMS);
  const [grid, setGrid] = useState(true);
  const [degrees, setDegrees] = useState(false);
  const [view, setView] = useState<View>({ xMin: -10, xMax: 10, yMin: -6, yMax: 6 });
  const [probe, setProbe] = useState<{ x: number; y: number } | null>(null);
  const [plotPx, setPlotPx] = useState({ w: 0, h: 0 });
  const [colors, setColors] = useState<string[]>(SERIES_FALLBACK);
  const [focusId, setFocusId] = useState<string | null>(null);
  const seq = useRef(2);
  const skipSave = useRef(true);

  useEffect(() => {
    setColors(readSeriesColors());
  }, []);

  useEffect(() => {
    const saved = loadPersisted();
    if (!saved) return;
    setItems(saved.items);
    setGrid(saved.grid);
    setDegrees(saved.degrees);
    const maxId = saved.items.reduce((max, item) => {
      const n = Number(item.id.replace(/\D/g, ""));
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 2);
    seq.current = Math.max(seq.current, maxId);
  }, []);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, grid, degrees }));
    } catch {
      /* ignore quota / private mode */
    }
  }, [items, grid, degrees]);

  useEffect(() => {
    if (!focusId) return;
    document.getElementById(`expr-${focusId}`)?.focus();
    setFocusId(null);
  }, [focusId, items]);

  const compiled = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        color: colors[item.colorIndex % colors.length] ?? SERIES_FALLBACK[0],
        ...compile(item.expr, degrees),
      })),
    [items, degrees, colors],
  );

  const drawn: DrawnFn[] = useMemo(
    () =>
      compiled
        .filter((item) => item.visible && item.eval)
        .map((item) => ({ id: item.id, color: item.color, eval: item.eval })),
    [compiled],
  );

  const anyCurve = drawn.length > 0;

  const onPlotSize = useCallback((w: number, h: number) => {
    setPlotPx((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    setView((current) => fitSquare(current, w, h));
  }, []);

  const resetView = useCallback(() => {
    setView(defaultView(plotPx.w, plotPx.h));
    setProbe(null);
  }, [plotPx.h, plotPx.w]);

  const toggleGrid = useCallback(() => setGrid((value) => !value), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setView((current) => zoomAboutCenter(current, 0.8));
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        setView((current) => zoomAboutCenter(current, 1.25));
      } else if (event.key === "0") {
        resetView();
      } else if (event.key === "g" || event.key === "G") {
        toggleGrid();
      } else if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        setView((current) => {
          const fraction = 0.12;
          const signX = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
          const signY = event.key === "ArrowDown" ? -1 : event.key === "ArrowUp" ? 1 : 0;
          const xSpan = current.xMax - current.xMin;
          const ySpan = current.yMax - current.yMin;
          const dx = signX * xSpan * fraction;
          const dy = signY * ySpan * fraction;
          return {
            xMin: current.xMin + dx,
            xMax: current.xMax + dx,
            yMin: current.yMin + dy,
            yMax: current.yMax + dy,
          };
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetView, toggleGrid]);

  function updateExpr(id: string, expr: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, expr } : item)));
  }

  function toggleVisible(id: string) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item)),
    );
  }

  function removeItem(id: string) {
    setItems((current) => {
      if (current.length === 1) {
        return current.map((item) => (item.id === id ? { ...item, expr: "" } : item));
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function addItem() {
    if (items.length >= MAX_FNS) return;
    const id = nextId(seq);
    const colorIndex = (Math.max(-1, ...items.map((item) => item.colorIndex)) + 1) % colors.length;
    setItems((current) => [...current, { id, expr: "", visible: true, colorIndex }]);
    setFocusId(id);
  }

  function applyExample(example: Example) {
    seq.current += example.exprs.length;
    const base = seq.current - example.exprs.length + 1;
    setItems(
      example.exprs.map((expr, index) => ({
        id: `f${base + index}`,
        expr,
        visible: true,
        colorIndex: index % colors.length,
      })),
    );
    resetView();
  }

  const activeExample = EXAMPLES.find((example) => sameExprs(items, example))?.id ?? null;

  return (
    <main className="app-shell">
      <section className="relative min-h-0 bg-paper" aria-label="绘图区">
        <PlotStage
          view={view}
          grid={grid}
          functions={drawn}
          onViewChange={setView}
          onPlotSize={onPlotSize}
          onProbe={setProbe}
          onToggleGrid={toggleGrid}
          onReset={resetView}
        />
        {!anyCurve ? (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center px-16 text-center text-sm text-balance text-ink/70">
            输入函数，或选择一个示例开始绘制
          </p>
        ) : null}
        <Readout
          overlay
          className="absolute top-3 left-16 z-10 max-w-56"
          probe={probe}
          rows={compiled}
          degrees={degrees}
        />
      </section>

      <aside className="pad-safe-b min-h-0 overflow-y-auto border-t border-border bg-bg lg:border-t-0 lg:border-l">
        <div className="flex flex-col gap-5 p-4">
          <header>
            <p className="text-xs font-medium tracking-wide text-muted">坐标绘图</p>
            <h1 className="text-xl font-semibold text-balance text-fg">函数图板</h1>
            <div className="mt-2 h-px w-10 bg-primary" />
            <p className="mt-2 text-sm text-pretty text-muted">
              拖拽平移，滚轮或双指缩放。把光标移到图上，或轻点图面，读取坐标和函数值。
            </p>
          </header>

          <section className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-medium text-fg">函数</h2>
              <p className="font-mono text-xs text-muted tabular-nums">
                {compiled.filter((item) => item.visible && item.eval).length}/{items.length}
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {compiled.map((item, index) => (
                <li key={item.id} className="rounded-lg border border-border bg-surface p-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <label className="sr-only" htmlFor={`expr-${item.id}`}>
                      第 {index + 1} 条函数
                    </label>
                    <div
                      className={cn(
                        "flex h-11 min-w-0 flex-1 items-center rounded-md border bg-bg px-2.5 focus-within:border-primary",
                        item.error ? "border-danger" : "border-border",
                      )}
                    >
                      <span className="shrink-0 pr-2 font-mono text-sm text-muted">y =</span>
                      <input
                        id={`expr-${item.id}`}
                        value={item.expr}
                        onChange={(event) => updateExpr(item.id, event.target.value)}
                        placeholder="sin(x)"
                        maxLength={200}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        autoComplete="off"
                        aria-invalid={item.error ? true : undefined}
                        aria-describedby={item.error ? `err-${item.id}` : undefined}
                        className="h-full w-full min-w-0 bg-transparent font-mono text-base text-fg outline-none placeholder:text-muted"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={item.visible ? "隐藏这条曲线" : "显示这条曲线"}
                      aria-pressed={item.visible}
                      onClick={() => toggleVisible(item.id)}
                    >
                      {item.visible ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="删除这条函数" onClick={() => removeItem(item.id)}>
                      <Trash2 className="size-5" />
                    </Button>
                  </div>
                  {item.error ? (
                    <p id={`err-${item.id}`} role="alert" className="mt-1 pl-4 text-sm text-pretty text-danger">
                      {item.error}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            <Button variant="primary" onClick={addItem} disabled={items.length >= MAX_FNS}>
              <Plus className="size-4" aria-hidden="true" />
              添加函数
            </Button>
            {items.length >= MAX_FNS ? <p className="text-xs text-muted">最多同时绘制 {MAX_FNS} 条曲线。</p> : null}
            <p className="text-sm text-pretty text-muted">
              支持 y = sin(x)、2x、x^2、|x|、sqrt、ln、log。log 是常用对数。无效公式会标出原因，且不会画进图里。
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-fg">示例</h2>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  aria-pressed={activeExample === example.id}
                  onClick={() => applyExample(example)}
                  className={cn(
                    "h-11 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
                    activeExample === example.id
                      ? "border-primary bg-primary/15 text-fg"
                      : "border-border bg-surface text-fg hover:bg-surface-2",
                  )}
                >
                  {example.name}
                </button>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-fg">视图</h2>
            <div className="grid h-11 grid-cols-2 rounded-md border border-border bg-surface p-1">
              <button
                type="button"
                aria-pressed={!degrees}
                onClick={() => setDegrees(false)}
                className={cn(
                  "h-full rounded-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
                  !degrees ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
                )}
              >
                弧度
              </button>
              <button
                type="button"
                aria-pressed={degrees}
                onClick={() => setDegrees(true)}
                className={cn(
                  "h-full rounded-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
                  degrees ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
                )}
              >
                角度
              </button>
            </div>
            <p className="font-mono text-xs text-muted tabular-nums">
              x [{formatNum(view.xMin)}, {formatNum(view.xMax)}]
            </p>
            <p className="font-mono text-xs text-muted tabular-nums">
              y [{formatNum(view.yMin)}, {formatNum(view.yMax)}]
            </p>
            <div className="flex gap-2">
              <Button variant={grid ? "primary" : "outline"} className="flex-1" aria-pressed={grid} onClick={toggleGrid}>
                {grid ? "网格开" : "网格关"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={resetView}>
                复位视图
              </Button>
            </div>
            <p className="text-xs text-muted">键盘：方向键平移，+ / − 缩放，0 复位，G 切换网格。</p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-fg">读数</h2>
            <Readout probe={probe} rows={compiled} degrees={degrees} />
          </section>
        </div>
      </aside>
    </main>
  );
}

function Readout({
  probe,
  rows,
  degrees,
  overlay = false,
  className,
}: {
  probe: { x: number; y: number } | null;
  rows: Array<{
    id: string;
    expr: string;
    color: string;
    visible: boolean;
    error: string | null;
    empty: boolean;
    eval: ((x: number) => number) | null;
  }>;
  degrees: boolean;
  overlay?: boolean;
  className?: string;
}) {
  const active = rows.filter((row) => row.visible && !row.empty);
  if (overlay && !probe) {
    return (
      <div className={cn("rounded-lg border border-border bg-surface px-3 py-2 text-fg shadow-sm", className)}>
        <p className="text-xs text-muted">轻点图面，读取坐标和函数值</p>
      </div>
    );
  }
  return (
    <div className={cn("rounded-lg border border-border bg-surface px-3 py-2 text-fg shadow-sm", className)}>
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted">光标</p>
        <p className="font-mono text-xs text-muted">{degrees ? "DEG" : "RAD"}</p>
      </div>
      {probe ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs tabular-nums">
          <dt className="text-muted">x</dt>
          <dd className="text-right">{formatNum(probe.x)}</dd>
          <dt className="text-muted">y</dt>
          <dd className="text-right">{formatNum(probe.y)}</dd>
        </dl>
      ) : (
        <p className="text-sm text-pretty text-muted">移动光标或轻点图面</p>
      )}
      {active.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
          {active.map((row) => {
            const value = probe && row.eval && !row.error ? safeValue(row.eval, probe.x) : null;
            return (
              <li key={row.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 font-mono text-xs">
                <span className="size-2 rounded-full" style={{ backgroundColor: row.color }} aria-hidden="true" />
                <span className="truncate text-muted" title={row.expr || "空表达式"}>
                  {row.error ? "无效" : row.expr || "空"}
                </span>
                <span className="tabular-nums text-fg">{value ?? "—"}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function safeValue(fn: (x: number) => number, x: number) {
  return formatNum(evalAt(fn, x));
}

function zoomAboutCenter(view: View, factor: number): View {
  const anchorX = (view.xMin + view.xMax) / 2;
  const anchorY = (view.yMin + view.yMax) / 2;
  return zoomAt(view, factor, anchorX, anchorY, 0.5, 0.5);
}

function nextId(seq: { current: number }) {
  seq.current += 1;
  return `f${seq.current}`;
}

function sameExprs(items: FnItem[], example: Example) {
  const current = items.map((item) => item.expr.replace(/\s+/g, ""));
  const expected = example.exprs.map((expr) => expr.replace(/\s+/g, ""));
  if (current.length !== expected.length) return false;
  return current.every((expr, index) => expr === expected[index]);
}

function loadPersisted(): { items: FnItem[]; grid: boolean; degrees: boolean } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { items?: unknown; grid?: unknown; degrees?: unknown };
    if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > MAX_FNS) return null;
    const items: FnItem[] = [];
    for (const row of data.items) {
      if (!row || typeof row !== "object") return null;
      const record = row as Record<string, unknown>;
      if (typeof record.id !== "string" || typeof record.expr !== "string") return null;
      const colorIndex = typeof record.colorIndex === "number" ? record.colorIndex : items.length;
      items.push({
        id: record.id.slice(0, 32),
        expr: record.expr.slice(0, 200),
        visible: record.visible !== false,
        colorIndex: ((colorIndex % SERIES_FALLBACK.length) + SERIES_FALLBACK.length) % SERIES_FALLBACK.length,
      });
    }
    return { items, grid: data.grid !== false, degrees: data.degrees === true };
  } catch {
    return null;
  }
}
