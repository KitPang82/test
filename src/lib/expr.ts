export type Compiled = {
  empty: boolean;
  error: string | null;
  eval: ((x: number) => number) | null;
};

type Node =
  | { k: "n"; v: number }
  | { k: "x" }
  | { k: "neg"; a: Node }
  | { k: "b"; op: "+" | "-" | "*" | "/" | "^"; l: Node; r: Node }
  | { k: "c"; name: string; args: Node[] };

type Tok =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "^" }
  | { t: "(" | ")" | "," | "eof" };

const FN_ARITY: Record<string, { min: number; max: number }> = {
  sin: { min: 1, max: 1 },
  cos: { min: 1, max: 1 },
  tan: { min: 1, max: 1 },
  asin: { min: 1, max: 1 },
  acos: { min: 1, max: 1 },
  atan: { min: 1, max: 1 },
  arcsin: { min: 1, max: 1 },
  arccos: { min: 1, max: 1 },
  arctan: { min: 1, max: 1 },
  sinh: { min: 1, max: 1 },
  cosh: { min: 1, max: 1 },
  tanh: { min: 1, max: 1 },
  exp: { min: 1, max: 1 },
  ln: { min: 1, max: 1 },
  log: { min: 1, max: 2 },
  lg: { min: 1, max: 1 },
  log10: { min: 1, max: 1 },
  log2: { min: 1, max: 1 },
  sqrt: { min: 1, max: 1 },
  cbrt: { min: 1, max: 1 },
  abs: { min: 1, max: 1 },
  floor: { min: 1, max: 1 },
  ceil: { min: 1, max: 1 },
  round: { min: 1, max: 1 },
  sign: { min: 1, max: 1 },
  min: { min: 2, max: 8 },
  max: { min: 2, max: 8 },
  atan2: { min: 2, max: 2 },
  arctan2: { min: 2, max: 2 },
};

class ExprError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExprError";
  }
}

function toHalfWidth(input: string): string {
  return input
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, " ");
}

function replaceAbs(input: string): string {
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

function preprocess(raw: string): string {
  let s = toHalfWidth(raw).trim();
  s = s.replace(/。/g, ".");
  s = s.replace(/^[yY]\s*=\s*/, "");
  s = s
    .replace(/[πΠ]/g, "pi")
    .replace(/[−–—]/g, "-")
    .replace(/[×·∙]/g, "*")
    .replace(/÷/g, "/")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/√/g, "sqrt ");
  s = replaceAbs(s);
  return s;
}

function isDigit(c: string | undefined): boolean {
  return c !== undefined && c >= "0" && c <= "9";
}

function isIdStart(c: string | undefined): boolean {
  return c !== undefined && /[A-Za-z_]/.test(c);
}

function isIdPart(c: string | undefined): boolean {
  return c !== undefined && /[A-Za-z0-9_]/.test(c);
}

function lex(input: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (c === " " || c === "\t" || c === "\n" || c === "\r") {
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
      out.push({ t: "op", v: "^" });
      i += 2;
      continue;
    }
    if (c === "+" || c === "-" || c === "*" || c === "/" || c === "^") {
      out.push({ t: "op", v: c });
      i += 1;
      continue;
    }
    if (c === "." || isDigit(c)) {
      let j = i;
      if (input[j] === ".") j += 1;
      while (isDigit(input[j])) j += 1;
      if (input[i] === "." && j === i + 1) {
        throw new ExprError("小数点缺少数字");
      }
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
      out.push({ t: "num", v: n });
      i = j;
      continue;
    }
    if (isIdStart(c)) {
      let j = i + 1;
      while (isIdPart(input[j])) j += 1;
      out.push({ t: "id", v: input.slice(i, j).toLowerCase() });
      i = j;
      continue;
    }
    if (c === "|") {
      throw new ExprError("绝对值请写成 abs(x)，或使用成对的 |x|");
    }
    throw new ExprError(`无法识别的字符「${c}」`);
  }
  out.push({ t: "eof" });
  return out;
}

type Parser = { toks: Tok[]; i: number };

function peek(p: Parser): Tok {
  return p.toks[p.i] ?? { t: "eof" };
}

function eat(p: Parser): Tok {
  const t = peek(p);
  p.i += 1;
  return t;
}

function matchOp(p: Parser, op: "+" | "-" | "*" | "/" | "^"): boolean {
  const t = peek(p);
  if (t.t === "op" && t.v === op) {
    p.i += 1;
    return true;
  }
  return false;
}

function match(p: Parser, kind: "(" | ")" | ","): boolean {
  if (peek(p).t === kind) {
    p.i += 1;
    return true;
  }
  return false;
}

function startsAtom(tok: Tok): boolean {
  return tok.t === "num" || tok.t === "id" || tok.t === "(";
}

function isFunctionName(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(FN_ARITY, name);
}

function isBareFunction(p: Parser): boolean {
  const t = peek(p);
  if (t.t !== "id" || !isFunctionName(t.v)) return false;
  const n = p.toks[p.i + 1];
  return !n || n.t !== "(";
}

function expect(p: Parser, kind: ")" | ",", message: string) {
  if (!match(p, kind)) throw new ExprError(message);
}

function parseAdd(p: Parser): Node {
  let left = parseProduct(p, false);
  while (true) {
    if (matchOp(p, "+")) {
      left = { k: "b", op: "+", l: left, r: parseProduct(p, false) };
      continue;
    }
    if (matchOp(p, "-")) {
      left = { k: "b", op: "-", l: left, r: parseProduct(p, false) };
      continue;
    }
    break;
  }
  return left;
}

function parseProduct(p: Parser, stopBeforeBareFn: boolean): Node {
  let left = parseFactor(p);
  while (true) {
    if (matchOp(p, "*")) {
      left = { k: "b", op: "*", l: left, r: parseFactor(p) };
      continue;
    }
    if (matchOp(p, "/")) {
      left = { k: "b", op: "/", l: left, r: parseFactor(p) };
      continue;
    }
    if (startsAtom(peek(p))) {
      if (stopBeforeBareFn && isBareFunction(p)) break;
      left = { k: "b", op: "*", l: left, r: parseFactor(p) };
      continue;
    }
    break;
  }
  return left;
}

function parseFactor(p: Parser): Node {
  if (matchOp(p, "-")) return { k: "neg", a: parseFactor(p) };
  if (matchOp(p, "+")) return parseFactor(p);
  if (isBareFunction(p)) {
    const name = (eat(p) as { t: "id"; v: string }).v;
    const arity = FN_ARITY[name];
    if (!arity || arity.min > 1) {
      throw new ExprError(`${name} 需要写成 ${name}(a, b)`);
    }
    const next = peek(p);
    if (!(next.t === "op" && (next.v === "+" || next.v === "-")) && !startsAtom(next)) {
      throw new ExprError(`函数 ${name} 缺少参数`);
    }
    return { k: "c", name, args: [parseProduct(p, true)] };
  }
  return parsePow(p);
}

function parsePow(p: Parser): Node {
  const left = parsePrimary(p);
  if (matchOp(p, "^")) {
    return { k: "b", op: "^", l: left, r: parseFactor(p) };
  }
  return left;
}

function parsePrimary(p: Parser): Node {
  const t = peek(p);
  if (t.t === "num") {
    eat(p);
    return { k: "n", v: t.v };
  }
  if (t.t === "id") {
    const name = t.v;
    eat(p);
    if (isFunctionName(name) && match(p, "(")) {
      return finishCall(p, name);
    }
    if (name === "x") return { k: "x" };
    if (name === "pi") return { k: "n", v: Math.PI };
    if (name === "e") return { k: "n", v: Math.E };
    if (name === "tau") return { k: "n", v: Math.PI * 2 };
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

function finishCall(p: Parser, name: string): Node {
  const arity = FN_ARITY[name];
  if (peek(p).t === "eof") throw new ExprError("缺少右括号");
  const args: Node[] = [];
  if (peek(p).t !== ")") {
    args.push(parseAdd(p));
    while (match(p, ",")) args.push(parseAdd(p));
  }
  expect(p, ")", "缺少右括号");
  if (!arity || args.length < arity.min || args.length > arity.max) {
    const expectText =
      arity && arity.min === arity.max
        ? `${arity.min} 个参数`
        : arity
          ? `${arity.min} 到 ${arity.max} 个参数`
          : "正确的参数";
    throw new ExprError(`${name} 需要 ${expectText}`);
  }
  return { k: "c", name, args };
}

function realPow(a: number, b: number): number {
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
    if (Number.isFinite(inv) && Math.abs(inv - n) < 1e-8 && Math.abs(n) % 2 === 1) {
      return -Math.pow(-a, b);
    }
    return NaN;
  }
  return Math.pow(a, b);
}

function callFn(name: string, args: number[], degrees: boolean): number {
  const a = args[0] ?? NaN;
  const b = args[1];
  const radIn = (v: number) => (degrees ? (v * Math.PI) / 180 : v);
  const radOut = (v: number) => (degrees ? (v * 180) / Math.PI : v);
  switch (name) {
    case "sin":
      return Math.sin(radIn(a));
    case "cos":
      return Math.cos(radIn(a));
    case "tan":
      return Math.tan(radIn(a));
    case "asin":
    case "arcsin":
      return radOut(Math.asin(a));
    case "acos":
    case "arccos":
      return radOut(Math.acos(a));
    case "atan":
    case "arctan":
      return radOut(Math.atan(a));
    case "atan2":
    case "arctan2":
      return radOut(Math.atan2(a, b ?? NaN));
    case "sinh":
      return Math.sinh(a);
    case "cosh":
      return Math.cosh(a);
    case "tanh":
      return Math.tanh(a);
    case "exp":
      return Math.exp(a);
    case "ln":
      return Math.log(a);
    case "lg":
    case "log10":
      return Math.log10(a);
    case "log2":
      return Math.log2(a);
    case "log":
      return b === undefined ? Math.log10(a) : Math.log(a) / Math.log(b);
    case "sqrt":
      return Math.sqrt(a);
    case "cbrt":
      return Math.cbrt(a);
    case "abs":
      return Math.abs(a);
    case "floor":
      return Math.floor(a);
    case "ceil":
      return Math.ceil(a);
    case "round":
      return Math.round(a);
    case "sign":
      return Math.sign(a);
    case "min":
      return Math.min(...args);
    case "max":
      return Math.max(...args);
    default:
      return NaN;
  }
}

function evaluate(node: Node, x: number, degrees: boolean): number {
  switch (node.k) {
    case "n":
      return node.v;
    case "x":
      return x;
    case "neg":
      return -evaluate(node.a, x, degrees);
    case "b": {
      const l = evaluate(node.l, x, degrees);
      const r = evaluate(node.r, x, degrees);
      switch (node.op) {
        case "+":
          return l + r;
        case "-":
          return l - r;
        case "*":
          return l * r;
        case "/":
          return r === 0 ? NaN : l / r;
        case "^":
          return realPow(l, r);
      }
    }
    case "c":
      return callFn(
        node.name,
        node.args.map((arg) => evaluate(arg, x, degrees)),
        degrees,
      );
  }
}

export function compile(source: string, degrees = false): Compiled {
  const prepared = preprocess(source);
  if (!prepared.trim()) return { empty: true, error: null, eval: null };
  if (prepared.includes("=")) {
    return {
      empty: false,
      error: "请写成 y = f(x)。等号右边只能是关于 x 的表达式",
      eval: null,
    };
  }
  try {
    const toks = lex(prepared);
    const p: Parser = { toks, i: 0 };
    const ast = parseAdd(p);
    if (peek(p).t !== "eof") throw new ExprError("表达式末尾有多余内容");
    return {
      empty: false,
      error: null,
      eval: (x: number) => evaluate(ast, x, degrees),
    };
  } catch (err) {
    const message = err instanceof ExprError ? err.message : "无法解析这个表达式";
    return { empty: false, error: message, eval: null };
  }
}
