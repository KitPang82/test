import { Grid3x3, Minus, Plus, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import {
  evalAt,
  formatTick,
  niceStep,
  panBy,
  plotMargins,
  readPalette,
  sampleCurve,
  tickValues,
  zoomAt,
  type Palette,
  type View,
} from "@/lib/plot";

export type DrawnFn = {
  id: string;
  color: string;
  eval: ((x: number) => number) | null;
};

type PlotStageProps = {
  view: View;
  grid: boolean;
  functions: DrawnFn[];
  onViewChange: (view: View) => void;
  onPlotSize: (plotW: number, plotH: number) => void;
  onProbe: (probe: { x: number; y: number } | null) => void;
  onToggleGrid: () => void;
  onReset: () => void;
};

type Drag =
  | {
      kind: "pan";
      pointerId: number;
      x: number;
      y: number;
      moved: boolean;
      view: View;
      pointerType: string;
    }
  | {
      kind: "pinch";
      view: View;
      startDist: number;
      anchorX: number;
      anchorY: number;
    };

export function PlotStage({
  view,
  grid,
  functions,
  onViewChange,
  onPlotSize,
  onProbe,
  onToggleGrid,
  onReset,
}: PlotStageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewRef = useRef(view);
  const fnsRef = useRef(functions);
  const gridRef = useRef(grid);
  const probeRef = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const [dragging, setDragging] = useState(false);
  const [palette, setPalette] = useState<Palette | null>(null);
  const paletteRef = useRef<Palette | null>(null);

  viewRef.current = view;
  fnsRef.current = functions;
  gridRef.current = grid;

  useEffect(() => {
    const next = readPalette();
    paletteRef.current = next;
    setPalette(next);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const publish = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      const m = plotMargins(width);
      onPlotSize(width - m.left - m.right, height - m.top - m.bottom);
      draw();
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onPlotSize]);

  useEffect(() => {
    draw();
  }, [view, functions, grid, palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const local = localPoint(canvas, event.clientX, event.clientY);
      const box = plotBox(canvas);
      if (!box || !inside(local, box)) return;
      let dy = event.deltaY;
      if (event.deltaMode === 1) dy *= 16;
      if (event.deltaMode === 2) dy *= 40;
      const factor = Math.min(1.35, Math.max(0.74, Math.exp(dy * 0.0016)));
      const anchor = toWorld(local, box, viewRef.current);
      const fx = (local.x - box.x) / box.w;
      const fy = (local.y - box.y) / box.h;
      onViewChange(zoomAt(viewRef.current, factor, anchor.x, anchor.y, fx, fy));
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [onViewChange]);

  function draw() {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const colors = paletteRef.current;
    if (!canvas || !wrap || !colors) return;
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;
    if (width < 8 || height < 8) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const bitmapW = Math.max(1, Math.round(width * dpr));
    const bitmapH = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== bitmapW || canvas.height !== bitmapH) {
      canvas.width = bitmapW;
      canvas.height = bitmapH;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const m = plotMargins(width);
    const box = { x: m.left, y: m.top, w: width - m.left - m.right, h: height - m.top - m.bottom };
    if (box.w < 8 || box.h < 8) return;
    const v = viewRef.current;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = colors.paper;
    ctx.fillRect(0, 0, width, height);

    const xSpan = v.xMax - v.xMin;
    const ySpan = v.yMax - v.yMin;
    const xStep = niceStep(xSpan, Math.max(2, box.w / 92));
    const yStep = niceStep(ySpan, Math.max(2, box.h / 64));
    const xTicks = tickValues(v.xMin, v.xMax, xStep);
    const yTicks = tickValues(v.yMin, v.yMax, yStep);

    const xToPx = (x: number) => box.x + ((x - v.xMin) / xSpan) * box.w;
    const yToPx = (y: number) => box.y + ((v.yMax - y) / ySpan) * box.h;

    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.w, box.h);
    ctx.clip();

    if (gridRef.current) {
      const minorX = xStep / 5;
      if ((minorX / xSpan) * box.w >= 8) {
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const value of tickValues(v.xMin, v.xMax, minorX)) {
          const px = crisp(xToPx(value));
          ctx.moveTo(px, box.y);
          ctx.lineTo(px, box.y + box.h);
        }
        ctx.stroke();
      }
      const minorY = yStep / 5;
      if ((minorY / ySpan) * box.h >= 8) {
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (const value of tickValues(v.yMin, v.yMax, minorY)) {
          const py = crisp(yToPx(value));
          ctx.moveTo(box.x, py);
          ctx.lineTo(box.x + box.w, py);
        }
        ctx.stroke();
      }
      ctx.strokeStyle = colors.gridStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const value of xTicks) {
        const px = crisp(xToPx(value));
        ctx.moveTo(px, box.y);
        ctx.lineTo(px, box.y + box.h);
      }
      for (const value of yTicks) {
        const py = crisp(yToPx(value));
        ctx.moveTo(box.x, py);
        ctx.lineTo(box.x + box.w, py);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = colors.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (v.yMin < 0 && v.yMax > 0) {
      const py = crisp(yToPx(0));
      ctx.moveTo(box.x, py);
      ctx.lineTo(box.x + box.w, py);
    }
    if (v.xMin < 0 && v.xMax > 0) {
      const px = crisp(xToPx(0));
      ctx.moveTo(px, box.y);
      ctx.lineTo(px, box.y + box.h);
    }
    ctx.stroke();

    for (const item of fnsRef.current) {
      if (!item.eval) continue;
      const segments = sampleCurve(item.eval, v, box.w);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2.25;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (const segment of segments) {
        if (segment.length === 1) {
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(xToPx(segment[0].x), yToPx(segment[0].y), 2.2, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }
        ctx.beginPath();
        segment.forEach((point, index) => {
          const px = xToPx(point.x);
          const py = yToPx(point.y);
          if (index === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
    }

    const probe = probeRef.current;
    if (probe && probe.x >= v.xMin && probe.x <= v.xMax && probe.y >= v.yMin && probe.y <= v.yMax) {
      const px = xToPx(probe.x);
      const py = yToPx(probe.y);
      ctx.save();
      ctx.strokeStyle = colors.axis;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(crisp(px), box.y);
      ctx.lineTo(crisp(px), box.y + box.h);
      ctx.moveTo(box.x, crisp(py));
      ctx.lineTo(box.x + box.w, crisp(py));
      ctx.stroke();
      ctx.restore();

      for (const item of fnsRef.current) {
        if (!item.eval) continue;
        const y = evalAt(item.eval, probe.x);
        if (!Number.isFinite(y)) continue;
        const dotY = yToPx(y);
        if (dotY < box.y - 2 || dotY > box.y + box.h + 2) continue;
        ctx.beginPath();
        ctx.fillStyle = colors.paper;
        ctx.arc(px, dotY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = item.color;
        ctx.arc(px, dotY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    ctx.strokeStyle = colors.gridStrong;
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);

    ctx.font = `12px "IBM Plex Mono", ui-monospace, monospace`;
    ctx.fillStyle = colors.tick;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    let lastLabel = -Infinity;
    for (const value of xTicks) {
      const px = xToPx(value);
      if (px < box.x + 12 || px > box.x + box.w - 28) continue;
      if (px - lastLabel < 46) continue;
      ctx.fillText(formatTick(value, xStep), px, box.y + box.h + 8);
      lastLabel = px;
    }

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    lastLabel = -Infinity;
    for (const value of yTicks) {
      const py = yToPx(value);
      if (py < box.y + 8 || py > box.y + box.h - 8) continue;
      if (Math.abs(py - lastLabel) < 22) continue;
      ctx.fillText(formatTick(value, yStep), box.x - 8, py);
      lastLabel = py;
    }

    ctx.font = `italic 14px "IBM Plex Sans", "Noto Sans SC", sans-serif`;
    ctx.fillStyle = colors.ink;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("y", 8, box.y - 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("x", width - 8, height - 8);

    if (v.xMin < 0 && v.xMax > 0 && v.yMin < 0 && v.yMax > 0) {
      drawArrow(ctx, xToPx(v.xMax) - 1, yToPx(0), 0, colors.axis);
      drawArrow(ctx, xToPx(0), yToPx(v.yMax) + 1, -Math.PI / 2, colors.axis);
    }
  }

  function updateProbeFromClient(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const local = localPoint(canvas, clientX, clientY);
    const box = plotBox(canvas);
    if (!box || !inside(local, box)) {
      if (!dragRef.current) {
        probeRef.current = null;
        onProbe(null);
        draw();
      }
      return;
    }
    const world = toWorld(local, box, viewRef.current);
    probeRef.current = world;
    onProbe(world);
    draw();
  }

  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2) {
      const pts = [...pointers.current.values()];
      const box = plotBox(canvas);
      if (!box) return;
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const local = localPoint(canvas, mid.x, mid.y);
      const anchor = toWorld(local, box, viewRef.current);
      dragRef.current = {
        kind: "pinch",
        view: viewRef.current,
        startDist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        anchorX: anchor.x,
        anchorY: anchor.y,
      };
      setDragging(true);
      return;
    }
    dragRef.current = {
      kind: "pan",
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      view: viewRef.current,
      pointerType: event.pointerType,
    };
    updateProbeFromClient(event.clientX, event.clientY);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (pointers.current.has(event.pointerId)) {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    }
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (drag?.kind === "pinch" && pointers.current.size >= 2) {
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (drag.startDist < 1 || dist < 1) return;
      const box = plotBox(canvas);
      if (!box) return;
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const local = localPoint(canvas, mid.x, mid.y);
      const fx = (local.x - box.x) / box.w;
      const fy = (local.y - box.y) / box.h;
      const factor = drag.startDist / dist;
      onViewChange(zoomAt(drag.view, factor, drag.anchorX, drag.anchorY, fx, fy));
      return;
    }

    if (drag?.kind === "pan" && drag.pointerId === event.pointerId) {
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 5) {
        drag.moved = true;
        probeRef.current = null;
        onProbe(null);
        setDragging(true);
      }
      if (drag.moved) {
        const box = plotBox(canvas);
        if (!box) return;
        onViewChange(panBy(drag.view, dx, dy, box.w, box.h));
        return;
      }
    }

    if (!drag || (drag.kind === "pan" && !drag.moved)) updateProbeFromClient(event.clientX, event.clientY);
  }

  function onPointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    pointers.current.delete(event.pointerId);
    if (drag?.kind === "pan" && drag.pointerId === event.pointerId) {
      if (!drag.moved) updateProbeFromClient(event.clientX, event.clientY);
      else {
        probeRef.current = null;
        onProbe(null);
      }
      dragRef.current = null;
      setDragging(false);
      draw();
      return;
    }
    if (pointers.current.size < 2 && drag?.kind === "pinch") {
      dragRef.current = null;
      setDragging(false);
    }
    if (pointers.current.size === 0) {
      dragRef.current = null;
      setDragging(false);
    }
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="函数绘图区。拖拽平移，滚轮或双指缩放，移动光标读取坐标。"
        className={dragging ? "absolute inset-0 h-full w-full touch-none cursor-grabbing" : "absolute inset-0 h-full w-full touch-none cursor-crosshair"}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={(event) => {
          if (dragRef.current) return;
          if (event.pointerType === "mouse") {
            probeRef.current = null;
            onProbe(null);
            draw();
          }
        }}
        onContextMenu={(event) => event.preventDefault()}
      />
      <div className="view-tools shadow-sm">
        <ToolButton label="放大" onClick={() => zoomCenter(viewRef.current, 0.8, onViewChange)}>
          <Plus className="size-5" aria-hidden="true" />
        </ToolButton>
        <ToolButton label="缩小" onClick={() => zoomCenter(viewRef.current, 1.25, onViewChange)}>
          <Minus className="size-5" aria-hidden="true" />
        </ToolButton>
        <ToolButton label={grid ? "隐藏网格" : "显示网格"} pressed={grid} onClick={onToggleGrid}>
          <Grid3x3 className="size-5" aria-hidden="true" />
        </ToolButton>
        <ToolButton label="复位视图" onClick={onReset}>
          <RotateCcw className="size-5" aria-hidden="true" />
        </ToolButton>
      </div>
    </div>
  );
}

function ToolButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className={
        pressed
          ? "inline-flex size-11 items-center justify-center border-l border-border text-primary first:border-l-0 hover:bg-surface-2 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 lg:border-l-0 lg:border-t lg:first:border-t-0"
          : "inline-flex size-11 items-center justify-center border-l border-border text-fg first:border-l-0 hover:bg-surface-2 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 lg:border-l-0 lg:border-t lg:first:border-t-0"
      }
    >
      {children}
    </button>
  );
}

function zoomCenter(view: View, factor: number, onViewChange: (view: View) => void) {
  const anchorX = (view.xMin + view.xMax) / 2;
  const anchorY = (view.yMin + view.yMax) / 2;
  onViewChange(zoomAt(view, factor, anchorX, anchorY, 0.5, 0.5));
}

function plotBox(canvas: HTMLCanvasElement) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const m = plotMargins(width);
  const w = width - m.left - m.right;
  const h = height - m.top - m.bottom;
  if (w < 8 || h < 8) return null;
  return { x: m.left, y: m.top, w, h };
}

function localPoint(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  return { x: clientX - rect.left, y: clientY - rect.top };
}

function inside(point: { x: number; y: number }, box: { x: number; y: number; w: number; h: number }) {
  return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
}

function toWorld(
  point: { x: number; y: number },
  box: { x: number; y: number; w: number; h: number },
  view: View,
) {
  const x = view.xMin + ((point.x - box.x) / box.w) * (view.xMax - view.xMin);
  const y = view.yMax - ((point.y - box.y) / box.h) * (view.yMax - view.yMin);
  return { x, y };
}

function crisp(value: number) {
  return Math.round(value) + 0.5;
}

function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-8, -4);
  ctx.lineTo(-8, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
