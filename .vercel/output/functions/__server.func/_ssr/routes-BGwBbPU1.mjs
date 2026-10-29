import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Minus, c as EyeOff, i as Plus, n as Trash2, o as Grid3x3, r as RotateCcw, s as Eye } from "../_libs/lucide-react.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BGwBbPU1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:ring-2 focus-visible:ring-primary/70", {
	variants: {
		variant: {
			primary: "bg-primary text-primary-fg hover:bg-primary/90",
			ghost: "bg-transparent text-fg hover:bg-surface-2",
			outline: "border border-border bg-surface text-fg hover:bg-surface-2",
			tool: "bg-transparent text-fg hover:bg-surface-2"
		},
		size: {
			md: "h-11 px-3",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "outline",
		size: "md"
	}
});
function Button({ className, variant, size, asChild = false, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		type,
		...props
	});
}
var MIN_SPAN = 1e-4;
var MAX_SPAN = 1e5;
function plotMargins(cssWidth) {
	if (cssWidth < 520) return {
		left: 48,
		right: 12,
		top: 22,
		bottom: 34
	};
	return {
		left: 58,
		right: 16,
		top: 22,
		bottom: 38
	};
}
function defaultView(plotW, plotH) {
	return fitSquare({
		xMin: -10,
		xMax: 10,
		yMin: -10,
		yMax: 10
	}, plotW, plotH);
}
function fitSquare(view, plotW, plotH) {
	if (plotW < 8 || plotH < 8) return view;
	const xSpan = view.xMax - view.xMin;
	if (!(xSpan > 0)) return view;
	const ySpan = xSpan * (plotH / plotW);
	const cy = (view.yMin + view.yMax) / 2;
	const next = {
		xMin: view.xMin,
		xMax: view.xMax,
		yMin: cy - ySpan / 2,
		yMax: cy + ySpan / 2
	};
	if (Math.abs(next.yMin - view.yMin) < xSpan * 1e-4 && Math.abs(next.yMax - view.yMax) < xSpan * 1e-4) return view;
	return next;
}
function clampView(view) {
	let xSpan = view.xMax - view.xMin;
	let ySpan = view.yMax - view.yMin;
	if (!(xSpan > 0) || !(ySpan > 0)) return {
		xMin: -10,
		xMax: 10,
		yMin: -6,
		yMax: 6
	};
	const cx = (view.xMin + view.xMax) / 2;
	const cy = (view.yMin + view.yMax) / 2;
	xSpan = Math.min(MAX_SPAN, Math.max(MIN_SPAN, xSpan));
	ySpan = Math.min(MAX_SPAN, Math.max(MIN_SPAN, ySpan));
	return {
		xMin: cx - xSpan / 2,
		xMax: cx + xSpan / 2,
		yMin: cy - ySpan / 2,
		yMax: cy + ySpan / 2
	};
}
function zoomAt(view, factor, anchorX, anchorY, fx, fy) {
	const safe = Math.min(8, Math.max(.125, factor));
	const xSpan = (view.xMax - view.xMin) * safe;
	const ySpan = (view.yMax - view.yMin) * safe;
	const xMin = anchorX - fx * xSpan;
	const yMax = anchorY + fy * ySpan;
	return clampView({
		xMin,
		xMax: xMin + xSpan,
		yMin: yMax - ySpan,
		yMax
	});
}
function panBy(view, dxPx, dyPx, plotW, plotH) {
	if (plotW < 8 || plotH < 8) return view;
	const xSpan = view.xMax - view.xMin;
	const ySpan = view.yMax - view.yMin;
	const dx = -dxPx / plotW * xSpan;
	const dy = dyPx / plotH * ySpan;
	return {
		xMin: view.xMin + dx,
		xMax: view.xMax + dx,
		yMin: view.yMin + dy,
		yMax: view.yMax + dy
	};
}
function niceStep(span, target) {
	const rough = span / Math.max(1, target);
	if (!(rough > 0) || !Number.isFinite(rough)) return 1;
	const pow = 10 ** Math.floor(Math.log10(rough));
	const n = rough / pow;
	return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * pow;
}
function tickValues(min, max, step) {
	if (!(step > 0) || !(max > min)) return [];
	const start = Math.ceil(min / step - 1e-8) * step;
	const values = [];
	const limit = Math.ceil((max - start) / step);
	for (let i = 0; i <= limit + 1; i++) {
		const v = start + i * step;
		if (v > max + step * 1e-6) break;
		if (v < min - step * 1e-6) continue;
		values.push(Number(v.toPrecision(12)));
	}
	return values;
}
function formatTick(value, step) {
	if (!Number.isFinite(value)) return "";
	const abs = Math.abs(value);
	if (abs !== 0 && (abs >= 1e5 || abs < 1e-4 && step < 1e-4)) return value.toExponential(0).replace(/\.?0+e/, "e").replace("e+", "e");
	const decimals = Math.min(6, Math.max(0, -Math.floor(Math.log10(step) + 1e-9)));
	let s = value.toFixed(decimals);
	if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
	if (s === "-0") s = "0";
	return s;
}
function formatNum(value) {
	if (!Number.isFinite(value)) return "无定义";
	const abs = Math.abs(value);
	if (abs !== 0 && (abs >= 1e6 || abs < 1e-4)) return value.toExponential(4).replace(/(\.\d*?)0+e/, "$1e").replace(/\.e/, "e").replace("e+", "e");
	let s = value.toFixed(6);
	if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
	if (s === "-0") s = "0";
	return s;
}
function sampleCurve(fn, view, pixelWidth) {
	const n = Math.max(2, Math.min(2400, Math.ceil(pixelWidth)));
	const xs = new Array(n);
	const ys = new Array(n);
	const dx = (view.xMax - view.xMin) / n;
	for (let i = 0; i < n; i++) {
		const x = view.xMin + (i + .5) * dx;
		xs[i] = x;
		let y = safeEval(fn, x);
		if (!Number.isFinite(y)) {
			const eps = dx * .25;
			const y1 = safeEval(fn, x + eps);
			const y2 = safeEval(fn, x - eps);
			const ySpan = view.yMax - view.yMin;
			if (Number.isFinite(y1) && Number.isFinite(y2) && Math.abs(y1 - y2) < ySpan * .35) y = (y1 + y2) / 2;
		}
		ys[i] = y;
	}
	const jump = (view.yMax - view.yMin) * .85;
	const segments = [];
	let current = null;
	for (let i = 0; i < n; i++) {
		const y = ys[i];
		if (!Number.isFinite(y)) {
			current = null;
			continue;
		}
		if (current && Math.abs(y - current[current.length - 1].y) > jump) current = null;
		if (!current) {
			current = [];
			segments.push(current);
		}
		current.push({
			x: xs[i],
			y
		});
	}
	return segments;
}
function evalAt(fn, x) {
	const direct = safeEval(fn, x);
	if (Number.isFinite(direct)) return direct;
	const eps = 1e-6 * Math.max(1, Math.abs(x));
	const left = safeEval(fn, x - eps);
	const right = safeEval(fn, x + eps);
	if (Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < .001) return (left + right) / 2;
	return direct;
}
function safeEval(fn, x) {
	try {
		return fn(x);
	} catch {
		return NaN;
	}
}
var SERIES_VARS = [
	"--color-s1",
	"--color-s2",
	"--color-s3",
	"--color-s4",
	"--color-s5",
	"--color-s6"
];
var SERIES_FALLBACK = [
	"#c2410c",
	"#0f6e75",
	"#1d4ed8",
	"#a16207",
	"#6d28d9",
	"#be123c"
];
function readSeriesColors() {
	if (typeof document === "undefined") return [...SERIES_FALLBACK];
	const cs = getComputedStyle(document.documentElement);
	return SERIES_VARS.map((name, i) => cs.getPropertyValue(name).trim() || SERIES_FALLBACK[i]);
}
var PALETTE_FALLBACK = {
	paper: "#f3efe4",
	ink: "#1c241e",
	grid: "#e3dccb",
	gridStrong: "#cfc6b2",
	axis: "#24302a",
	tick: "#3e4a43"
};
function readPalette() {
	if (typeof document === "undefined") return PALETTE_FALLBACK;
	const cs = getComputedStyle(document.documentElement);
	const get = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
	return {
		paper: get("--color-paper", PALETTE_FALLBACK.paper),
		ink: get("--color-ink", PALETTE_FALLBACK.ink),
		grid: get("--color-grid", PALETTE_FALLBACK.grid),
		gridStrong: get("--color-grid-strong", PALETTE_FALLBACK.gridStrong),
		axis: get("--color-axis", PALETTE_FALLBACK.axis),
		tick: get("--color-tick", PALETTE_FALLBACK.tick)
	};
}
function PlotStage({ view, grid, functions, onViewChange, onPlotSize, onProbe, onToggleGrid, onReset }) {
	const wrapRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const viewRef = (0, import_react.useRef)(view);
	const fnsRef = (0, import_react.useRef)(functions);
	const gridRef = (0, import_react.useRef)(grid);
	const probeRef = (0, import_react.useRef)(null);
	const dragRef = (0, import_react.useRef)(null);
	const pointers = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [palette, setPalette] = (0, import_react.useState)(null);
	const paletteRef = (0, import_react.useRef)(null);
	viewRef.current = view;
	fnsRef.current = functions;
	gridRef.current = grid;
	(0, import_react.useEffect)(() => {
		const next = readPalette();
		paletteRef.current = next;
		setPalette(next);
	}, []);
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		draw();
	}, [
		view,
		functions,
		grid,
		palette
	]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const onWheel = (event) => {
			event.preventDefault();
			const local = localPoint(canvas, event.clientX, event.clientY);
			const box = plotBox(canvas);
			if (!box || !inside(local, box)) return;
			let dy = event.deltaY;
			if (event.deltaMode === 1) dy *= 16;
			if (event.deltaMode === 2) dy *= 40;
			const factor = Math.min(1.35, Math.max(.74, Math.exp(dy * .0016)));
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
		const box = {
			x: m.left,
			y: m.top,
			w: width - m.left - m.right,
			h: height - m.top - m.bottom
		};
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
		const xToPx = (x) => box.x + (x - v.xMin) / xSpan * box.w;
		const yToPx = (y) => box.y + (v.yMax - y) / ySpan * box.h;
		ctx.save();
		ctx.beginPath();
		ctx.rect(box.x, box.y, box.w, box.h);
		ctx.clip();
		if (gridRef.current) {
			const minorX = xStep / 5;
			if (minorX / xSpan * box.w >= 8) {
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
			if (minorY / ySpan * box.h >= 8) {
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
			ctx.globalAlpha = .45;
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
		ctx.strokeRect(box.x + .5, box.y + .5, box.w - 1, box.h - 1);
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
	function updateProbeFromClient(clientX, clientY) {
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
	function onPointerDown(event) {
		const canvas = canvasRef.current;
		if (!canvas) return;
		canvas.setPointerCapture(event.pointerId);
		pointers.current.set(event.pointerId, {
			x: event.clientX,
			y: event.clientY
		});
		if (pointers.current.size >= 2) {
			const pts = [...pointers.current.values()];
			const box = plotBox(canvas);
			if (!box) return;
			const mid = {
				x: (pts[0].x + pts[1].x) / 2,
				y: (pts[0].y + pts[1].y) / 2
			};
			const anchor = toWorld(localPoint(canvas, mid.x, mid.y), box, viewRef.current);
			dragRef.current = {
				kind: "pinch",
				view: viewRef.current,
				startDist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
				anchorX: anchor.x,
				anchorY: anchor.y
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
			pointerType: event.pointerType
		};
		updateProbeFromClient(event.clientX, event.clientY);
	}
	function onPointerMove(event) {
		if (pointers.current.has(event.pointerId)) pointers.current.set(event.pointerId, {
			x: event.clientX,
			y: event.clientY
		});
		const drag = dragRef.current;
		const canvas = canvasRef.current;
		if (!canvas) return;
		if (drag?.kind === "pinch" && pointers.current.size >= 2) {
			const pts = [...pointers.current.values()];
			const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
			if (drag.startDist < 1 || dist < 1) return;
			const box = plotBox(canvas);
			if (!box) return;
			const mid = {
				x: (pts[0].x + pts[1].x) / 2,
				y: (pts[0].y + pts[1].y) / 2
			};
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
		if (!drag || drag.kind === "pan" && !drag.moved) updateProbeFromClient(event.clientX, event.clientY);
	}
	function onPointerUp(event) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: "absolute inset-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			role: "img",
			"aria-label": "函数绘图区。拖拽平移，滚轮或双指缩放，移动光标读取坐标。",
			className: dragging ? "absolute inset-0 h-full w-full touch-none cursor-grabbing" : "absolute inset-0 h-full w-full touch-none cursor-crosshair",
			onPointerDown,
			onPointerMove,
			onPointerUp,
			onPointerCancel: onPointerUp,
			onPointerLeave: (event) => {
				if (dragRef.current) return;
				if (event.pointerType === "mouse") {
					probeRef.current = null;
					onProbe(null);
					draw();
				}
			},
			onContextMenu: (event) => event.preventDefault()
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "view-tools shadow-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
					label: "放大",
					onClick: () => zoomCenter(viewRef.current, .8, onViewChange),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-5",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
					label: "缩小",
					onClick: () => zoomCenter(viewRef.current, 1.25, onViewChange),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
						className: "size-5",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
					label: grid ? "隐藏网格" : "显示网格",
					pressed: grid,
					onClick: onToggleGrid,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid3x3, {
						className: "size-5",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolButton, {
					label: "复位视图",
					onClick: onReset,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
						className: "size-5",
						"aria-hidden": "true"
					})
				})
			]
		})]
	});
}
function ToolButton({ label, pressed, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		"aria-pressed": pressed,
		title: label,
		onClick,
		className: pressed ? "inline-flex size-11 items-center justify-center border-l border-border text-primary first:border-l-0 hover:bg-surface-2 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 lg:border-l-0 lg:border-t lg:first:border-t-0" : "inline-flex size-11 items-center justify-center border-l border-border text-fg first:border-l-0 hover:bg-surface-2 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 lg:border-l-0 lg:border-t lg:first:border-t-0",
		children
	});
}
function zoomCenter(view, factor, onViewChange) {
	onViewChange(zoomAt(view, factor, (view.xMin + view.xMax) / 2, (view.yMin + view.yMax) / 2, .5, .5));
}
function plotBox(canvas) {
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	const m = plotMargins(width);
	const w = width - m.left - m.right;
	const h = height - m.top - m.bottom;
	if (w < 8 || h < 8) return null;
	return {
		x: m.left,
		y: m.top,
		w,
		h
	};
}
function localPoint(canvas, clientX, clientY) {
	const rect = canvas.getBoundingClientRect();
	return {
		x: clientX - rect.left,
		y: clientY - rect.top
	};
}
function inside(point, box) {
	return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
}
function toWorld(point, box, view) {
	return {
		x: view.xMin + (point.x - box.x) / box.w * (view.xMax - view.xMin),
		y: view.yMax - (point.y - box.y) / box.h * (view.yMax - view.yMin)
	};
}
function crisp(value) {
	return Math.round(value) + .5;
}
function drawArrow(ctx, x, y, angle, color) {
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
var FN_ARITY = {
	sin: {
		min: 1,
		max: 1
	},
	cos: {
		min: 1,
		max: 1
	},
	tan: {
		min: 1,
		max: 1
	},
	asin: {
		min: 1,
		max: 1
	},
	acos: {
		min: 1,
		max: 1
	},
	atan: {
		min: 1,
		max: 1
	},
	arcsin: {
		min: 1,
		max: 1
	},
	arccos: {
		min: 1,
		max: 1
	},
	arctan: {
		min: 1,
		max: 1
	},
	sinh: {
		min: 1,
		max: 1
	},
	cosh: {
		min: 1,
		max: 1
	},
	tanh: {
		min: 1,
		max: 1
	},
	exp: {
		min: 1,
		max: 1
	},
	ln: {
		min: 1,
		max: 1
	},
	log: {
		min: 1,
		max: 2
	},
	lg: {
		min: 1,
		max: 1
	},
	log10: {
		min: 1,
		max: 1
	},
	log2: {
		min: 1,
		max: 1
	},
	sqrt: {
		min: 1,
		max: 1
	},
	cbrt: {
		min: 1,
		max: 1
	},
	abs: {
		min: 1,
		max: 1
	},
	floor: {
		min: 1,
		max: 1
	},
	ceil: {
		min: 1,
		max: 1
	},
	round: {
		min: 1,
		max: 1
	},
	sign: {
		min: 1,
		max: 1
	},
	min: {
		min: 2,
		max: 8
	},
	max: {
		min: 2,
		max: 8
	},
	atan2: {
		min: 2,
		max: 2
	},
	arctan2: {
		min: 2,
		max: 2
	}
};
var ExprError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "ExprError";
	}
};
function toHalfWidth(input) {
	return input.replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 65248)).replace(/\u3000/g, " ");
}
function replaceAbs(input) {
	let out = "";
	for (let i = 0; i < input.length; i++) {
		if (input[i] !== "|") {
			out += input[i];
			continue;
		}
		const j = input.indexOf("|", i + 1);
		if (j < 0) return input;
		const inner = input.slice(i + 1, j);
		if (!inner.trim()) return input;
		out += `abs(${inner})`;
		i = j;
	}
	return out;
}
function preprocess(raw) {
	let s = toHalfWidth(raw).trim();
	s = s.replace(/。/g, ".");
	s = s.replace(/^[yY]\s*=\s*/, "");
	s = s.replace(/[πΠ]/g, "pi").replace(/[−–—]/g, "-").replace(/[×·∙]/g, "*").replace(/÷/g, "/").replace(/²/g, "^2").replace(/³/g, "^3").replace(/√/g, "sqrt ");
	s = replaceAbs(s);
	return s;
}
function isDigit(c) {
	return c !== void 0 && c >= "0" && c <= "9";
}
function isIdStart(c) {
	return c !== void 0 && /[A-Za-z_]/.test(c);
}
function isIdPart(c) {
	return c !== void 0 && /[A-Za-z0-9_]/.test(c);
}
function lex(input) {
	const out = [];
	let i = 0;
	while (i < input.length) {
		const c = input[i];
		if (c === " " || c === "	" || c === "\n" || c === "\r") {
			i += 1;
			continue;
		}
		if (c === "(") {
			out.push({ t: "(" });
			i += 1;
			continue;
		}
		if (c === ")") {
			out.push({ t: ")" });
			i += 1;
			continue;
		}
		if (c === ",") {
			out.push({ t: "," });
			i += 1;
			continue;
		}
		if (c === "*" && input[i + 1] === "*") {
			out.push({
				t: "op",
				v: "^"
			});
			i += 2;
			continue;
		}
		if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") {
			out.push({
				t: "op",
				v: c
			});
			i += 1;
			continue;
		}
		if (c === "." || isDigit(c)) {
			let j = i;
			if (input[j] === ".") j += 1;
			while (isDigit(input[j])) j += 1;
			if (input[i] === "." && j === i + 1) throw new ExprError("小数点缺少数字");
			if (input[j] === "." && isDigit(input[i])) {
				j += 1;
				while (isDigit(input[j])) j += 1;
			}
			const exp = input[j];
			if (exp === "e" || exp === "E") {
				let k = j + 1;
				if (input[k] === "+" || input[k] === "-") k += 1;
				if (isDigit(input[k])) {
					while (isDigit(input[k])) k += 1;
					j = k;
				}
			}
			const n = Number(input.slice(i, j));
			if (!Number.isFinite(n)) throw new ExprError("数字无法读取");
			out.push({
				t: "num",
				v: n
			});
			i = j;
			continue;
		}
		if (isIdStart(c)) {
			let j = i + 1;
			while (isIdPart(input[j])) j += 1;
			out.push({
				t: "id",
				v: input.slice(i, j).toLowerCase()
			});
			i = j;
			continue;
		}
		if (c === "|") throw new ExprError("绝对值请写成 abs(x)，或使用成对的 |x|");
		throw new ExprError(`无法识别的字符「${c}」`);
	}
	out.push({ t: "eof" });
	return out;
}
function peek(p) {
	return p.toks[p.i] ?? { t: "eof" };
}
function eat(p) {
	const t = peek(p);
	p.i += 1;
	return t;
}
function matchOp(p, op) {
	const t = peek(p);
	if (t.t === "op" && t.v === op) {
		p.i += 1;
		return true;
	}
	return false;
}
function match(p, kind) {
	if (peek(p).t === kind) {
		p.i += 1;
		return true;
	}
	return false;
}
function startsAtom(tok) {
	return tok.t === "num" || tok.t === "id" || tok.t === "(";
}
function isFunctionName(name) {
	return Object.prototype.hasOwnProperty.call(FN_ARITY, name);
}
function isBareFunction(p) {
	const t = peek(p);
	if (t.t !== "id" || !isFunctionName(t.v)) return false;
	const n = p.toks[p.i + 1];
	return !n || n.t !== "(";
}
function expect(p, kind, message) {
	if (!match(p, kind)) throw new ExprError(message);
}
function parseAdd(p) {
	let left = parseProduct(p, false);
	while (true) {
		if (matchOp(p, "+")) {
			left = {
				k: "b",
				op: "+",
				l: left,
				r: parseProduct(p, false)
			};
			continue;
		}
		if (matchOp(p, "-")) {
			left = {
				k: "b",
				op: "-",
				l: left,
				r: parseProduct(p, false)
			};
			continue;
		}
		break;
	}
	return left;
}
function parseProduct(p, stopBeforeBareFn) {
	let left = parseFactor(p);
	while (true) {
		if (matchOp(p, "*")) {
			left = {
				k: "b",
				op: "*",
				l: left,
				r: parseFactor(p)
			};
			continue;
		}
		if (matchOp(p, "/")) {
			left = {
				k: "b",
				op: "/",
				l: left,
				r: parseFactor(p)
			};
			continue;
		}
		if (startsAtom(peek(p))) {
			if (stopBeforeBareFn && isBareFunction(p)) break;
			left = {
				k: "b",
				op: "*",
				l: left,
				r: parseFactor(p)
			};
			continue;
		}
		break;
	}
	return left;
}
function parseFactor(p) {
	if (matchOp(p, "-")) return {
		k: "neg",
		a: parseFactor(p)
	};
	if (matchOp(p, "+")) return parseFactor(p);
	if (isBareFunction(p)) {
		const name = eat(p).v;
		const arity = FN_ARITY[name];
		if (!arity || arity.min > 1) throw new ExprError(`${name} 需要写成 ${name}(a, b)`);
		const next = peek(p);
		if (!(next.t === "op" && (next.v === "+" || next.v === "-")) && !startsAtom(next)) throw new ExprError(`函数 ${name} 缺少参数`);
		return {
			k: "c",
			name,
			args: [parseProduct(p, true)]
		};
	}
	return parsePow(p);
}
function parsePow(p) {
	const left = parsePrimary(p);
	if (matchOp(p, "^")) return {
		k: "b",
		op: "^",
		l: left,
		r: parseFactor(p)
	};
	return left;
}
function parsePrimary(p) {
	const t = peek(p);
	if (t.t === "num") {
		eat(p);
		return {
			k: "n",
			v: t.v
		};
	}
	if (t.t === "id") {
		const name = t.v;
		eat(p);
		if (isFunctionName(name) && match(p, "(")) return finishCall(p, name);
		if (name === "x") return { k: "x" };
		if (name === "pi") return {
			k: "n",
			v: Math.PI
		};
		if (name === "e") return {
			k: "n",
			v: Math.E
		};
		if (name === "tau") return {
			k: "n",
			v: Math.PI * 2
		};
		if (isFunctionName(name)) throw new ExprError(`函数 ${name} 缺少参数`);
		throw new ExprError(`未知符号「${name}」。变量请使用 x`);
	}
	if (t.t === "(") {
		eat(p);
		if (peek(p).t === "eof") throw new ExprError("缺少右括号");
		if (peek(p).t === ")") throw new ExprError("括号里是空的");
		const inner = parseAdd(p);
		expect(p, ")", "缺少右括号");
		return inner;
	}
	if (t.t === ")") throw new ExprError("多余的右括号");
	if (t.t === ",") throw new ExprError("这里不能使用逗号");
	if (t.t === "op") throw new ExprError("运算符位置不对");
	throw new ExprError("表达式不完整");
}
function finishCall(p, name) {
	const arity = FN_ARITY[name];
	if (peek(p).t === "eof") throw new ExprError("缺少右括号");
	const args = [];
	if (peek(p).t !== ")") {
		args.push(parseAdd(p));
		while (match(p, ",")) args.push(parseAdd(p));
	}
	expect(p, ")", "缺少右括号");
	if (!arity || args.length < arity.min || args.length > arity.max) throw new ExprError(`${name} 需要 ${arity && arity.min === arity.max ? `${arity.min} 个参数` : arity ? `${arity.min} 到 ${arity.max} 个参数` : "正确的参数"}`);
	return {
		k: "c",
		name,
		args
	};
}
function realPow(a, b) {
	if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
	if (a === 0) {
		if (b > 0) return 0;
		return NaN;
	}
	if (a < 0) {
		const rounded = Math.round(b);
		if (Math.abs(b - rounded) < 1e-10) return Math.pow(a, rounded);
		const inv = 1 / b;
		const n = Math.round(inv);
		if (Number.isFinite(inv) && Math.abs(inv - n) < 1e-8 && Math.abs(n) % 2 === 1) return -Math.pow(-a, b);
		return NaN;
	}
	return Math.pow(a, b);
}
function callFn(name, args, degrees) {
	const a = args[0] ?? NaN;
	const b = args[1];
	const radIn = (v) => degrees ? v * Math.PI / 180 : v;
	const radOut = (v) => degrees ? v * 180 / Math.PI : v;
	switch (name) {
		case "sin": return Math.sin(radIn(a));
		case "cos": return Math.cos(radIn(a));
		case "tan": return Math.tan(radIn(a));
		case "asin":
		case "arcsin": return radOut(Math.asin(a));
		case "acos":
		case "arccos": return radOut(Math.acos(a));
		case "atan":
		case "arctan": return radOut(Math.atan(a));
		case "atan2":
		case "arctan2": return radOut(Math.atan2(a, b ?? NaN));
		case "sinh": return Math.sinh(a);
		case "cosh": return Math.cosh(a);
		case "tanh": return Math.tanh(a);
		case "exp": return Math.exp(a);
		case "ln": return Math.log(a);
		case "lg":
		case "log10": return Math.log10(a);
		case "log2": return Math.log2(a);
		case "log": return b === void 0 ? Math.log10(a) : Math.log(a) / Math.log(b);
		case "sqrt": return Math.sqrt(a);
		case "cbrt": return Math.cbrt(a);
		case "abs": return Math.abs(a);
		case "floor": return Math.floor(a);
		case "ceil": return Math.ceil(a);
		case "round": return Math.round(a);
		case "sign": return Math.sign(a);
		case "min": return Math.min(...args);
		case "max": return Math.max(...args);
		default: return NaN;
	}
}
function evaluate(node, x, degrees) {
	switch (node.k) {
		case "n": return node.v;
		case "x": return x;
		case "neg": return -evaluate(node.a, x, degrees);
		case "b": {
			const l = evaluate(node.l, x, degrees);
			const r = evaluate(node.r, x, degrees);
			switch (node.op) {
				case "+": return l + r;
				case "-": return l - r;
				case "*": return l * r;
				case "/": return r === 0 ? NaN : l / r;
				case "^": return realPow(l, r);
			}
		}
		case "c": return callFn(node.name, node.args.map((arg) => evaluate(arg, x, degrees)), degrees);
	}
}
function compile(source, degrees = false) {
	const prepared = preprocess(source);
	if (!prepared.trim()) return {
		empty: true,
		error: null,
		eval: null
	};
	if (prepared.includes("=")) return {
		empty: false,
		error: "请写成 y = f(x)。等号右边只能是关于 x 的表达式",
		eval: null
	};
	try {
		const p = {
			toks: lex(prepared),
			i: 0
		};
		const ast = parseAdd(p);
		if (peek(p).t !== "eof") throw new ExprError("表达式末尾有多余内容");
		return {
			empty: false,
			error: null,
			eval: (x) => evaluate(ast, x, degrees)
		};
	} catch (err) {
		return {
			empty: false,
			error: err instanceof ExprError ? err.message : "无法解析这个表达式",
			eval: null
		};
	}
}
var STORAGE_KEY = "hanshu-tuban.v1";
var MAX_FNS = 8;
var EXAMPLES = [
	{
		id: "trig",
		name: "正余弦",
		exprs: ["sin(x)", "cos(x)"]
	},
	{
		id: "taylor",
		name: "泰勒近似",
		exprs: [
			"sin(x)",
			"x",
			"x - x^3/6"
		]
	},
	{
		id: "quad",
		name: "抛物线",
		exprs: ["0.25*x^2"]
	},
	{
		id: "cubic",
		name: "三次曲线",
		exprs: ["0.08*x^3 - 0.8*x"]
	},
	{
		id: "gauss",
		name: "高斯",
		exprs: ["exp(-x^2/2)"]
	},
	{
		id: "damp",
		name: "阻尼振荡",
		exprs: ["exp(-0.12*abs(x))*cos(2*x)"]
	},
	{
		id: "sinc",
		name: "采样函数",
		exprs: ["sin(x)/x"]
	},
	{
		id: "hyper",
		name: "反比例",
		exprs: ["1/x"]
	}
];
var DEFAULT_ITEMS = [{
	id: "f1",
	expr: "sin(x)",
	visible: true,
	colorIndex: 0
}, {
	id: "f2",
	expr: "cos(x)",
	visible: true,
	colorIndex: 1
}];
function FunctionPlotter() {
	const [items, setItems] = (0, import_react.useState)(DEFAULT_ITEMS);
	const [grid, setGrid] = (0, import_react.useState)(true);
	const [degrees, setDegrees] = (0, import_react.useState)(false);
	const [view, setView] = (0, import_react.useState)({
		xMin: -10,
		xMax: 10,
		yMin: -6,
		yMax: 6
	});
	const [probe, setProbe] = (0, import_react.useState)(null);
	const [plotPx, setPlotPx] = (0, import_react.useState)({
		w: 0,
		h: 0
	});
	const [colors, setColors] = (0, import_react.useState)(SERIES_FALLBACK);
	const [focusId, setFocusId] = (0, import_react.useState)(null);
	const seq = (0, import_react.useRef)(2);
	const skipSave = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		setColors(readSeriesColors());
	}, []);
	(0, import_react.useEffect)(() => {
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
	(0, import_react.useEffect)(() => {
		if (skipSave.current) {
			skipSave.current = false;
			return;
		}
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({
				items,
				grid,
				degrees
			}));
		} catch {}
	}, [
		items,
		grid,
		degrees
	]);
	(0, import_react.useEffect)(() => {
		if (!focusId) return;
		document.getElementById(`expr-${focusId}`)?.focus();
		setFocusId(null);
	}, [focusId, items]);
	const compiled = (0, import_react.useMemo)(() => items.map((item) => ({
		...item,
		color: colors[item.colorIndex % colors.length] ?? SERIES_FALLBACK[0],
		...compile(item.expr, degrees)
	})), [
		items,
		degrees,
		colors
	]);
	const drawn = (0, import_react.useMemo)(() => compiled.filter((item) => item.visible && item.eval).map((item) => ({
		id: item.id,
		color: item.color,
		eval: item.eval
	})), [compiled]);
	const anyCurve = drawn.length > 0;
	const onPlotSize = (0, import_react.useCallback)((w, h) => {
		setPlotPx((prev) => prev.w === w && prev.h === h ? prev : {
			w,
			h
		});
		setView((current) => fitSquare(current, w, h));
	}, []);
	const resetView = (0, import_react.useCallback)(() => {
		setView(defaultView(plotPx.w, plotPx.h));
		setProbe(null);
	}, [plotPx.h, plotPx.w]);
	const toggleGrid = (0, import_react.useCallback)(() => setGrid((value) => !value), []);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			const target = event.target;
			if (target instanceof HTMLElement) {
				const tag = target.tagName;
				if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
			}
			if (event.key === "+" || event.key === "=") {
				event.preventDefault();
				setView((current) => zoomAboutCenter(current, .8));
			} else if (event.key === "-" || event.key === "_") {
				event.preventDefault();
				setView((current) => zoomAboutCenter(current, 1.25));
			} else if (event.key === "0") resetView();
			else if (event.key === "g" || event.key === "G") toggleGrid();
			else if (event.key.startsWith("Arrow")) {
				event.preventDefault();
				setView((current) => {
					const fraction = .12;
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
						yMax: current.yMax + dy
					};
				});
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [resetView, toggleGrid]);
	function updateExpr(id, expr) {
		setItems((current) => current.map((item) => item.id === id ? {
			...item,
			expr
		} : item));
	}
	function toggleVisible(id) {
		setItems((current) => current.map((item) => item.id === id ? {
			...item,
			visible: !item.visible
		} : item));
	}
	function removeItem(id) {
		setItems((current) => {
			if (current.length === 1) return current.map((item) => item.id === id ? {
				...item,
				expr: ""
			} : item);
			return current.filter((item) => item.id !== id);
		});
	}
	function addItem() {
		if (items.length >= MAX_FNS) return;
		const id = nextId(seq);
		const colorIndex = (Math.max(-1, ...items.map((item) => item.colorIndex)) + 1) % colors.length;
		setItems((current) => [...current, {
			id,
			expr: "",
			visible: true,
			colorIndex
		}]);
		setFocusId(id);
	}
	function applyExample(example) {
		seq.current += example.exprs.length;
		const base = seq.current - example.exprs.length + 1;
		setItems(example.exprs.map((expr, index) => ({
			id: `f${base + index}`,
			expr,
			visible: true,
			colorIndex: index % colors.length
		})));
		resetView();
	}
	const activeExample = EXAMPLES.find((example) => sameExprs(items, example))?.id ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "app-shell",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative min-h-0 bg-paper",
			"aria-label": "绘图区",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlotStage, {
					view,
					grid,
					functions: drawn,
					onViewChange: setView,
					onPlotSize,
					onProbe: setProbe,
					onToggleGrid: toggleGrid,
					onReset: resetView
				}),
				!anyCurve ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pointer-events-none absolute inset-0 flex items-center justify-center px-16 text-center text-sm text-balance text-ink/70",
					children: "输入函数，或选择一个示例开始绘制"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
					className: "absolute top-3 left-16 z-10 max-w-56",
					probe,
					rows: compiled,
					degrees
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "pad-safe-b min-h-0 overflow-y-auto border-t border-border bg-bg lg:border-t-0 lg:border-l",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-5 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-wide text-muted",
							children: "坐标绘图"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-semibold text-balance text-fg",
							children: "函数图板"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-2 h-px w-10 bg-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-pretty text-muted",
							children: "拖拽平移，滚轮或双指缩放。把光标移到图上，或轻点图面，读取坐标和函数值。"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-medium text-fg",
									children: "函数"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-xs text-muted tabular-nums",
									children: [
										compiled.filter((item) => item.visible && item.eval).length,
										"/",
										items.length
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "flex flex-col gap-2",
								children: compiled.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-lg border border-border bg-surface p-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "size-2.5 shrink-0 rounded-full",
												style: { backgroundColor: item.color },
												"aria-hidden": "true"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "sr-only",
												htmlFor: `expr-${item.id}`,
												children: [
													"第 ",
													index + 1,
													" 条函数"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: cn("flex h-11 min-w-0 flex-1 items-center rounded-md border bg-bg px-2.5 focus-within:border-primary", item.error ? "border-danger" : "border-border"),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "shrink-0 pr-2 font-mono text-sm text-muted",
													children: "y ="
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													id: `expr-${item.id}`,
													value: item.expr,
													onChange: (event) => updateExpr(item.id, event.target.value),
													placeholder: "sin(x)",
													maxLength: 200,
													spellCheck: false,
													autoCapitalize: "off",
													autoCorrect: "off",
													autoComplete: "off",
													"aria-invalid": item.error ? true : void 0,
													"aria-describedby": item.error ? `err-${item.id}` : void 0,
													className: "h-full w-full min-w-0 bg-transparent font-mono text-base text-fg outline-none placeholder:text-muted"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												"aria-label": item.visible ? "隐藏这条曲线" : "显示这条曲线",
												"aria-pressed": item.visible,
												onClick: () => toggleVisible(item.id),
												children: item.visible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-5" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "ghost",
												size: "icon",
												"aria-label": "删除这条函数",
												onClick: () => removeItem(item.id),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-5" })
											})
										]
									}), item.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										id: `err-${item.id}`,
										role: "alert",
										className: "mt-1 pl-4 text-sm text-pretty text-danger",
										children: item.error
									}) : null]
								}, item.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "primary",
								onClick: addItem,
								disabled: items.length >= MAX_FNS,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
									className: "size-4",
									"aria-hidden": "true"
								}), "添加函数"]
							}),
							items.length >= MAX_FNS ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									"最多同时绘制 ",
									MAX_FNS,
									" 条曲线。"
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-pretty text-muted",
								children: "支持 y = sin(x)、2x、x^2、|x|、sqrt、ln、log。log 是常用对数。无效公式会标出原因，且不会画进图里。"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium text-fg",
							children: "示例"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: EXAMPLES.map((example) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": activeExample === example.id,
								onClick: () => applyExample(example),
								className: cn("h-11 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70", activeExample === example.id ? "border-primary bg-primary/15 text-fg" : "border-border bg-surface text-fg hover:bg-surface-2"),
								children: example.name
							}, example.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium text-fg",
								children: "视图"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid h-11 grid-cols-2 rounded-md border border-border bg-surface p-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": !degrees,
									onClick: () => setDegrees(false),
									className: cn("h-full rounded-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70", !degrees ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
									children: "弧度"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": degrees,
									onClick: () => setDegrees(true),
									className: cn("h-full rounded-sm text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70", degrees ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
									children: "角度"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs text-muted tabular-nums",
								children: [
									"x [",
									formatNum(view.xMin),
									", ",
									formatNum(view.xMax),
									"]"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-xs text-muted tabular-nums",
								children: [
									"y [",
									formatNum(view.yMin),
									", ",
									formatNum(view.yMax),
									"]"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: grid ? "primary" : "outline",
									className: "flex-1",
									"aria-pressed": grid,
									onClick: toggleGrid,
									children: grid ? "网格开" : "网格关"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									className: "flex-1",
									onClick: resetView,
									children: "复位视图"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "键盘：方向键平移，+ / − 缩放，0 复位，G 切换网格。"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-medium text-fg",
							children: "读数"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Readout, {
							probe,
							rows: compiled,
							degrees
						})]
					})
				]
			})
		})]
	});
}
function Readout({ probe, rows, degrees, className }) {
	const active = rows.filter((row) => row.visible && !row.empty);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-lg border border-border bg-surface px-3 py-2 text-fg shadow-sm", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-1 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium text-muted",
					children: "光标"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs text-muted",
					children: degrees ? "DEG" : "RAD"
				})]
			}),
			probe ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs tabular-nums",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "x"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-right",
						children: formatNum(probe.x)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "y"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-right",
						children: formatNum(probe.y)
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-pretty text-muted",
				children: "移动光标或轻点图面"
			}),
			active.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 flex flex-col gap-1 border-t border-border pt-2",
				children: active.map((row) => {
					const value = probe && row.eval && !row.error ? safeValue(row.eval, probe.x) : null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 font-mono text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2 rounded-full",
								style: { backgroundColor: row.color },
								"aria-hidden": "true"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-muted",
								title: row.expr || "空表达式",
								children: row.error ? "无效" : row.expr || "空"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums text-fg",
								children: value ?? "—"
							})
						]
					}, row.id);
				})
			}) : null
		]
	});
}
function safeValue(fn, x) {
	return formatNum(evalAt(fn, x));
}
function zoomAboutCenter(view, factor) {
	return zoomAt(view, factor, (view.xMin + view.xMax) / 2, (view.yMin + view.yMax) / 2, .5, .5);
}
function nextId(seq) {
	seq.current += 1;
	return `f${seq.current}`;
}
function sameExprs(items, example) {
	const current = items.map((item) => item.expr.replace(/\s+/g, ""));
	const expected = example.exprs.map((expr) => expr.replace(/\s+/g, ""));
	if (current.length !== expected.length) return false;
	return current.every((expr, index) => expr === expected[index]);
}
function loadPersisted() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > MAX_FNS) return null;
		const items = [];
		for (const row of data.items) {
			if (!row || typeof row !== "object") return null;
			const record = row;
			if (typeof record.id !== "string" || typeof record.expr !== "string") return null;
			const colorIndex = typeof record.colorIndex === "number" ? record.colorIndex : items.length;
			items.push({
				id: record.id.slice(0, 32),
				expr: record.expr.slice(0, 200),
				visible: record.visible !== false,
				colorIndex: (colorIndex % SERIES_FALLBACK.length + SERIES_FALLBACK.length) % SERIES_FALLBACK.length
			});
		}
		return {
			items,
			grid: data.grid !== false,
			degrees: data.degrees === true
		};
	} catch {
		return null;
	}
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FunctionPlotter, {});
}
//#endregion
export { Home as component };
