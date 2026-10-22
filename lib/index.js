import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cp, mkdir, open, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { homedir, hostname } from "node:os";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { zstdDecompressSync } from "node:zlib";
import yaml from "js-yaml";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import Schema from "@deepseek-ai/schemastery";

//#region src/host/adapters/commands.ts
const SUBCOMMANDS = [
	"status",
	"search",
	"read",
	"add",
	"forget",
	"doctor",
	"catalog",
	"panel"
];
function registerCommands(ctx, api) {
	const commands = ctx.get("commands");
	if (!commands) return () => {};
	const disposers = [];
	for (const command of [
		memoryCommand(api),
		rememberCommand(api),
		recallCommand(api)
	]) disposers.push(commands.register(command));
	return () => {
		for (const dispose of disposers) dispose();
	};
}
function ok(text) {
	return {
		kind: "success",
		text
	};
}
function fail(text) {
	return {
		kind: "error",
		text
	};
}
/** `/memory <subcommand>` —— 面板能做的事都必须有等价的命令（原则 P7：UI 只是 API 的一个视图） */
function memoryCommand(api) {
	return {
		name: "memory",
		description: `Manage long-term memory (${SUBCOMMANDS.join(" / ")})`,
		input: { hint: "<status|search|read|add|forget|doctor|catalog|panel> …" },
		async handler({ rawInput }) {
			const [sub, ...rest] = rawInput.trim().split(/\s+/);
			const arg = rest.join(" ");
			switch (sub) {
				case void 0:
				case "":
				case "status": return ok(await renderStatus(api));
				case "search":
					if (!arg) return fail("usage: /memory search <query>");
					return ok(renderHits(api, arg));
				case "catalog": return ok(api.catalog().text || "(memory is empty)");
				case "read":
					if (!arg) return fail("usage: /memory read <id>");
					return ok(await renderEntry(api, arg));
				case "add":
					if (!arg) return fail("usage: /memory add <text>");
					return ok(await quickAdd(api, arg));
				case "forget":
					if (!arg) return fail("usage: /memory forget <id> [reason]");
					return ok(await forget(api, arg));
				case "doctor": return ok(await renderDoctor(api));
				case "panel": return ok("Open the Memory panel from the sidebar. (CLI has no TUI; every panel view has a /memory equivalent.)");
				default: return fail(`unknown subcommand "${sub}". Try: ${SUBCOMMANDS.join(", ")}`);
			}
		}
	};
}
/** `/remember <text>` —— 一键捕获，不打断当前任务 */
function rememberCommand(api) {
	return {
		name: "remember",
		description: "Capture something into long-term memory right now",
		input: { hint: "<text to remember>" },
		async handler({ rawInput }) {
			const text = rawInput.trim();
			if (!text) return fail("usage: /remember <text>");
			return ok(await quickAdd(api, text));
		}
	};
}
/**
* `/recall <question>` —— 不注入上下文，只把检索结果打印给人看。
* 用户不信任黑盒记忆时，最有效的解药不是解释架构，而是给他一个能反复试探的探针。
*/
function recallCommand(api) {
	return {
		name: "recall",
		description: "Probe what memory would be recalled for a query (does not touch the conversation)",
		input: { hint: "<question>" },
		async handler({ rawInput }) {
			const query = rawInput.trim();
			if (!query) return fail("usage: /recall <question>");
			const hits = api.search(query, { limit: 10 });
			if (hits.length === 0) return ok(`Nothing in memory matches "${query}".`);
			const lines = hits.map((h) => {
				const flag = h.gated ? " [GATED below threshold]" : "";
				return `${h.score.toFixed(3)}${flag} ${h.entry.meta.id} [${h.entry.meta.kind}·${h.entry.meta.confidence}·${h.entry.meta.provenance.source}]\n    ${h.entry.meta.title} — ${h.entry.meta.summary}\n    ${h.why}`;
			});
			return ok(`Probe for "${query}" (${hits.length} candidate(s), ${hits.filter((h) => h.gated).length} gated):\n${lines.join("\n")}`);
		}
	};
}
async function quickAdd(api, text) {
	const title = text.length > 40 ? `${text.slice(0, 39)}…` : text;
	const entry = await api.create({
		kind: "feedback",
		title,
		summary: text.length > 120 ? `${text.slice(0, 119)}…` : text,
		body: text,
		source: "user-stated",
		createdBy: "slash-command",
		activation: "on_demand"
	});
	return `Remembered ${entry.meta.id} [feedback·user-stated]. It will show up in the catalog on the next request; use /memory read ${entry.meta.id} to review.`;
}
async function forget(api, arg) {
	const [id, ...reason] = arg.split(/\s+/);
	return await api.invalidate(id, { reason: reason.join(" ") || "forgotten by user" }) ? `Invalidated ${id} → archive (recoverable via /memory doctor or the Recovery view).` : `No memory entry with id ${id}.`;
}
async function renderStatus(api) {
	const s = await api.stats();
	const kinds = Object.entries(s.byKind).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, n]) => `  ${k}: ${n}`).join("\n");
	const verbatimRate = s.recall.inject.events > 0 ? s.recall.inject.verbatim / s.recall.inject.events : 0;
	return [
		`Memory root : ${s.root}`,
		`Entries     : ${s.entryCount}`,
		kinds || "  (none)",
		`Index       : ${s.index.lines}/${s.index.maxLines} lines · ${s.index.bytes}/${s.index.maxBytes} bytes${s.index.overBudget ? " · OVER BUDGET" : ""}`,
		`Injection   : ${(s.recall.lastShare * 100).toFixed(2)}% of request (cap ${(s.recall.maxShare * 100).toFixed(0)}%)`,
		`Prefix cache: verbatim ${(verbatimRate * 100).toFixed(0)}% · inject events ${s.recall.inject.events} · hits ${s.recall.inject.hits}`,
		`Recall      : tool events ${s.recall.tool.events} · zero-hit ${s.recall.tool.zeroHit} · gated ${s.recall.inject.gated}`,
		`Issues      : ${s.issues.length}`,
		s.alerts.length > 0 ? `Alerts:\n${s.alerts.map((a) => `  [${a.level}] ${a.code}: ${a.message}`).join("\n")}` : "Alerts      : none"
	].join("\n");
}
function renderHits(api, query) {
	const hits = api.search(query, { limit: 10 });
	if (hits.length === 0) return `Nothing matches "${query}".`;
	return hits.map((h) => `${h.score.toFixed(3)}${h.gated ? " [gated]" : ""} ${h.entry.meta.id} [${h.entry.meta.kind}] ${h.entry.meta.title} — ${h.entry.meta.summary}`).join("\n");
}
async function renderEntry(api, id) {
	const entry = await api.read(id);
	if (!entry) return `No memory entry with id ${id}.`;
	const m = entry.meta;
	return [
		`${m.id} · ${m.kind} · ${m.scope}${m.project ? `/${m.project}` : ""} · ${m.confidence} · ${m.provenance.source}`,
		`title   : ${m.title}`,
		`summary : ${m.summary}`,
		`activation: ${m.activation}${m.globs.length > 0 ? ` (${m.globs.join(", ")})` : ""}`,
		`created : ${m.provenance.createdAt}${m.provenance.origin ? ` · ${m.provenance.origin}` : ""}`,
		`stats   : rev ${m.stats.revisions} · hits ${m.stats.hits} · heat ${m.stats.heat}`,
		m.temporal.invalidatedAt ? `INVALIDATED ${m.temporal.invalidatedAt}${m.temporal.supersededBy ? ` → ${m.temporal.supersededBy}` : ""}` : "",
		`path    : ${entry.rel}`,
		"",
		entry.body.trim()
	].filter((line) => line !== void 0).join("\n");
}
async function renderDoctor(api) {
	const before = await api.stats();
	const { written, unchanged } = await api.rebuildDerived();
	const after = await api.stats();
	const lines = [
		`Scanned ${after.entryCount} entries.`,
		after.issues.length === 0 ? "No invalid entries." : `${after.issues.length} invalid entr(ies):`,
		...after.issues.slice(0, 10).map((i) => `  [${i.issue}] ${i.rel}: ${i.message}`),
		`Derived files: rewrote ${written.length ? written.join(", ") : "none"} · unchanged ${unchanged.length} (content-hash matched)`,
		after.index.overBudget ? `INDEX.md is over budget (${after.index.lines}/${after.index.maxLines} lines) — consolidation needed.` : `INDEX.md within budget (${after.index.lines}/${after.index.maxLines} lines).`
	];
	if (before.alerts.length > 0) lines.push(`Alerts: ${before.alerts.map((a) => `${a.code}(${a.level})`).join(", ")}`);
	return lines.join("\n");
}

//#endregion
//#region src/host/paths.ts
/**
* 记忆根：**dsh 专属**，默认落在 `$DSH_HOME/memory`（即 `~/.dsh/memory`）。
*
* 这个插件不是"给所有 agent 共用的记忆服务"——它是一个 dsh 插件，数据、面板、
* 管理全部归 dsh。与其他工具的唯一关系是**导入**：把它们的记忆文件与会话读进来。
* 所以默认位置跟随 dsh 自己的家目录，而不是 `~/.agents` 那个共享根。
*
* 需要让别的工具直接读这份记忆时，把 `memoryRoot` 指到 `~/.agents/memory` 即可——
* 这是显式选择，不是默认行为。
*/
function resolveDshHome() {
	const fromEnv = process.env.DSH_HOME;
	if (fromEnv && fromEnv.trim().length > 0) return expandUserPath(fromEnv.trim());
	return path.join(homedir(), ".dsh");
}
function resolveMemoryRoot(configured) {
	const explicit = configured?.trim() || process.env.DSH_MEMORY_ROOT?.trim();
	if (explicit) return path.resolve(expandUserPath(explicit));
	return path.join(resolveDshHome(), "memory");
}
/** 展开 `~` / `~/` / `~\`。Windows 用户习惯输反斜杠，不能当成普通字符。 */
function expandUserPath(p) {
	if (p === "~" || p === "~/" || p === "~\\") return homedir();
	if (p.startsWith("~/") || p.startsWith("~\\")) return path.join(homedir(), p.slice(2));
	return p;
}
/** 真相源与派生物（docs/03 §3）。`.cache` 永不参与同步，随时可删。 */
const DIRS = {
	persona: "persona",
	preference: "preference",
	feedback: "feedback",
	relations: "relations",
	reference: "reference",
	procedures: "procedures",
	project: "project",
	projects: "projects",
	archive: "archive",
	audit: "audit",
	snapshots: "snapshots",
	sync: "sync",
	cache: ".cache"
};
const DERIVED_FILES = [
	"INDEX.md",
	"persona/PROFILE.md",
	"relations/GENEALOGY.md",
	"relations/graph.jsonl"
];
/** 扫描条目时要走的目录（相对 root）；`{slug}` 由调用方展开 */
const ENTRY_DIRS = [
	DIRS.persona,
	DIRS.preference,
	DIRS.feedback,
	DIRS.relations,
	DIRS.reference,
	DIRS.procedures,
	DIRS.project
];
const MANIFEST_NAME = "MANIFEST.yaml";
/**
* 项目 slug = 哈希前缀 + 人类可读尾巴。
*
* 刻意**不复用** dsh 的会话目录编码（`--<cwd 里 / 换成 ->--`），也不复用前作记忆插件的
* 编码（`---Users-…--`，前导 3 个 dash）。那两套互不兼容，混用会导致导入错位。
* 哈希前缀保证唯一与稳定，尾巴保证 `ls` 可读。
*/
function projectSlug(absolutePath) {
	const normalized = path.resolve(absolutePath);
	const hashInput = process.platform === "win32" ? normalized.toLowerCase() : normalized;
	const hash = createHash("sha256").update(hashInput).digest("base64url").slice(0, 12);
	const tail = path.basename(normalized).replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 32);
	return tail ? `${hash}-${tail}` : hash;
}
function toPosix(p) {
	return p.split(path.sep).join("/");
}

//#endregion
//#region src/host/files.ts
var PathEscapeError = class extends Error {
	constructor(rel) {
		super(`path escapes the memory root: ${rel}`);
		this.name = "PathEscapeError";
	}
};
/**
* 把相对路径解析到 root 内，拒绝任何逃逸。
*
* dsh 的 Host 插件代码在进程内运行、**不受 workspace sandbox 约束**
* （`dsh-plugin-manager/README.md`: "installed Host code executes in-process outside the
* workspace sandbox"），所以边界必须我们自己守。面板路由与工具入参都先过这里。
*/
function resolveInRoot(root, rel) {
	const rootAbs = path.resolve(root);
	const abs = path.isAbsolute(rel) ? path.resolve(rel) : path.resolve(rootAbs, toPosix(rel).replace(/^\/+/, ""));
	const rootWithSep = rootAbs.endsWith(path.sep) ? rootAbs : rootAbs + path.sep;
	if (!(process.platform === "win32" || process.platform === "darwin" ? abs.toLowerCase() === rootAbs.toLowerCase() || abs.toLowerCase().startsWith(rootWithSep.toLowerCase()) : abs === rootAbs || abs.startsWith(rootWithSep))) throw new PathEscapeError(rel);
	return abs;
}
async function ensureDir(dir) {
	await mkdir(dir, {
		recursive: true,
		mode: 448
	});
}
/** 大小写不敏感的扩展名判断：Windows/macOS 上 `.MD` 与 `.md` 是同一类文件。 */
function hasExtension(name, ext) {
	return name.toLowerCase().endsWith(ext.toLowerCase());
}
/**
* 原子写：临时文件 → fsync 文件 → rename → fsync 父目录。
* rename 是原子的，所以任何时刻读到的都是完整旧版或完整新版，不存在半写状态。
*/
async function writeFileAtomic(abs, data) {
	await ensureDir(path.dirname(abs));
	const tmp = `${abs}.tmp.${process.pid}.${Date.now().toString(36)}`;
	let handle;
	try {
		handle = await open(tmp, "w", 384);
		await handle.writeFile(data, "utf8");
		await handle.sync();
	} finally {
		await handle?.close();
	}
	try {
		await rename(tmp, abs);
	} catch (cause) {
		await rm(tmp, { force: true });
		throw cause;
	}
	let dir;
	try {
		dir = await open(path.dirname(abs), "r");
		await dir.sync();
	} catch {} finally {
		await dir?.close();
	}
}
async function readTextFile(abs) {
	try {
		return await readFile(abs, "utf8");
	} catch (cause) {
		if (cause.code === "ENOENT") return null;
		throw cause;
	}
}
async function appendLine(abs, line) {
	await ensureDir(path.dirname(abs));
	let handle;
	try {
		handle = await open(abs, "a", 384);
		await handle.writeFile(line.endsWith("\n") ? line : `${line}\n`, "utf8");
		await handle.sync();
	} finally {
		await handle?.close();
	}
}
/** 递归收集 .md 文件的相对路径，返回结果按字典序排序（确定性，原则 P4）。 */
async function walkMarkdown(root, dirs) {
	const out = [];
	for (const dir of dirs) {
		const abs = path.join(root, dir);
		if (!await isDirectory(abs)) continue;
		await walk(abs, root, out);
	}
	return out.sort();
}
async function walk(abs, root, out) {
	let entries;
	try {
		entries = await readdir(abs, { withFileTypes: true });
	} catch {
		return;
	}
	for (const entry of entries.sort((a, b) => a.name < b.name ? -1 : 1)) {
		const child = path.join(abs, entry.name);
		if (entry.isDirectory()) await walk(child, root, out);
		else if (entry.isFile() && hasExtension(entry.name, ".md") && !hasExtension(entry.name, ".tmp")) out.push(toPosix(path.relative(root, child)));
	}
}
async function isDirectory(abs) {
	try {
		return (await stat(abs)).isDirectory();
	} catch {
		return false;
	}
}
/** 列出 root 下的直接子目录名（用于发现 projects/<slug>）。 */
async function listSubdirs(abs) {
	try {
		return (await readdir(abs, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name).sort();
	} catch {
		return [];
	}
}

//#endregion
//#region src/host/model.ts
const KINDS = [
	"persona",
	"preference",
	"feedback",
	"relations",
	"project",
	"reference",
	"procedure",
	"episode"
];
const ACTIVATIONS = [
	"always",
	"glob",
	"on_demand",
	"manual"
];
const SOURCES = [
	"user-stated",
	"model-inferred",
	"tool-output",
	"web-content",
	"imported",
	"team",
	"manual"
];
const CONFIDENCES = [
	"high",
	"medium",
	"low"
];
const SCOPES = ["global", "project"];
const SHAREABLE = ["team", "none"];
const WRITE_MODES = [
	"auto",
	"suggest",
	"manual"
];
const RETRIEVAL_BACKENDS = [
	"l0",
	"l1",
	"auto"
];
const SYNC_TRANSPORTS = [
	"none",
	"git",
	"zip",
	"remote"
];
const CONFLICT_POLICIES = [
	"ask",
	"prefer-local",
	"prefer-remote"
];
const TOOL_SURFACES = ["minimal", "standard"];
/** INDEX.md 的分组顺序；同时是常驻层裁剪时的优先级（越前越不该被裁） */
const KIND_ORDER = [
	"feedback",
	"persona",
	"preference",
	"relations",
	"project",
	"reference",
	"procedure",
	"episode"
];
/** 召回排序里的来源可信度权重（docs/04 §7）。不可信来源不是被丢弃，而是被降权。 */
const SOURCE_TRUST = {
	"user-stated": 1,
	manual: 1,
	"model-inferred": .8,
	imported: .7,
	team: .6,
	"tool-output": .4,
	"web-content": .2
};
const CONFIDENCE_WEIGHT = {
	high: 1,
	medium: .7,
	low: .4
};
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
let lastTime = 0;
let lastRandom = [];
/** 单调递增 ULID：同一毫秒内递增随机段，保证 id 可按时间排序且不重复。 */
function ulid(now = Date.now()) {
	let time = now;
	let random;
	if (time === lastTime && lastRandom.length > 0) {
		random = [...lastRandom];
		for (let i = random.length - 1; i >= 0; i--) {
			const next = random[i] + 1;
			if (next < 32) {
				random[i] = next;
				break;
			}
			random[i] = 0;
			if (i === 0) time = ++lastTime;
		}
	} else {
		const bytes = randomBytes(16);
		random = Array.from({ length: 16 }, (_, i) => bytes[i] % 32);
	}
	lastTime = time;
	lastRandom = random;
	let out = "";
	let t = time;
	for (let i = 0; i < 10; i++) {
		out = CROCKFORD[t % 32] + out;
		t = Math.floor(t / 32);
	}
	for (const r of random) out += CROCKFORD[r];
	return `m_${out}`;
}
/** 只覆盖正文：frontmatter 里的 stats 每次召回都会变，一起算哈希会造成写放大。 */
function checksumOf(body) {
	return `sha256:${createHash("sha256").update(body, "utf8").digest("hex")}`;
}
/**
* 正文规范化。**必须只有一个实现**：写入与解析两侧若不一致，checksum 会在每次
* 往返时漂移，doctor 就会把每个文件都误判成"用户手工改过"。
*/
function normalizeBody(body) {
	const text = body.replace(/\r\n/g, "\n").replace(/^\n+/, "").replace(/\s+$/, "");
	return text.length === 0 ? "" : `${text}\n`;
}
function computeHeat(input) {
	const now = input.now ?? Date.now();
	const hitsPart = .5 * Math.min(1, Math.log(1 + Math.max(0, input.hits)) / Math.log(11));
	const days = input.lastUsedAt ? Math.max(0, (now - Date.parse(input.lastUsedAt)) / 864e5) : 365;
	const recencyPart = .3 * Math.exp(-days / 60);
	const boostPart = input.boosted ? .2 : 0;
	return Number(Math.min(1, hitsPart + recencyPart + boostPart).toFixed(4));
}
const CJK = /[\u3000-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
/**
* 无 ctx.tokenMeter 时的兜底估算：CJK 字符按 0.7 token/字，其余按 4 字符/token。
* 面板与预算裁剪优先用 ctx.tokenMeter.measure() 的实测值，这只是降级路径。
*/
function estimateTokens(text) {
	let cjk = 0;
	let other = 0;
	for (const ch of text) if (CJK.test(ch)) cjk++;
	else other++;
	return Math.ceil(cjk * .7 + other / 4);
}
/** ISO 日期（yyyy-mm-dd）。刻意不用 toLocaleString / 相对时间：注入文本必须逐字节稳定。 */
function isoDate(d = /* @__PURE__ */ new Date()) {
	return new Date(d).toISOString().slice(0, 10);
}
function isoNow(d = /* @__PURE__ */ new Date()) {
	return new Date(d).toISOString().replace(/\.000Z$/, "Z");
}

//#endregion
//#region src/host/audit.ts
async function audit(root, record, now = isoNow()) {
	const file = path.posix.join(DIRS.audit, `${now.slice(0, 10)}.jsonl`);
	const line = JSON.stringify({
		ts: now,
		...record
	});
	await appendLine(resolveInRoot(root, file), line);
}
/**
* 面板按用户本地日期查审计，审计文件按 UTC 日期命名。
* 这里把「本地日 + 时区偏移」换算成 UTC 区间，并指出要读哪几个 UTC 日文件。
* `tzOffset` 是“东几区”的分钟数（东八区 = 480）。
*/
function utcDayFilesForLocalDate(date, tzOffset) {
	const [year, month, day] = date.split("-").map((part) => Number(part));
	const start = Date.UTC(year, month - 1, day) - tzOffset * 6e4;
	const end = start + 864e5;
	return {
		start,
		end,
		files: [.../* @__PURE__ */ new Set([new Date(start).toISOString().slice(0, 10), (/* @__PURE__ */ new Date(end - 1)).toISOString().slice(0, 10)])]
	};
}

//#endregion
//#region src/host/snapshot.ts
const EXCLUDE = /* @__PURE__ */ new Set([
	DIRS.cache,
	"snapshots",
	DIRS.sync
]);
async function createSnapshot(root, label) {
	const id = `${isoNow().replace(/[:.]/g, "-")}__${label}-${ulid().slice(-4).toLowerCase()}`;
	const target = resolveInRoot(root, path.posix.join("snapshots", id));
	await mkdir(target, { recursive: true });
	let files = 0;
	let bytes = 0;
	const manifest = [];
	const walk = async (absDir, relDir) => {
		let entries;
		try {
			entries = await readdir(absDir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			if (EXCLUDE.has(entry.name)) continue;
			const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
			const abs = path.join(absDir, entry.name);
			if (entry.isDirectory()) {
				if (rel.split("/")[0] === "snapshots") continue;
				await walk(abs, rel);
				continue;
			}
			const info = await stat(abs);
			const content = await readFile(abs);
			files++;
			bytes += info.size;
			manifest.push(JSON.stringify({
				path: rel,
				size: info.size,
				sha256: createHash("sha256").update(content).digest("hex")
			}));
			const dest = path.join(target, rel);
			await mkdir(path.dirname(dest), { recursive: true });
			await cp(abs, dest);
		}
	};
	await walk(root, "");
	await writeFile(path.join(target, "snapshot.json"), `${JSON.stringify({
		label,
		createdAt: isoNow(),
		files,
		bytes,
		root
	}, null, 2)}\n`, "utf8");
	await writeFile(path.join(target, "manifest.jsonl"), `${manifest.join("\n")}\n`, "utf8");
	return {
		label: id,
		createdAt: isoNow(),
		files,
		bytes
	};
}
async function listSnapshots(root) {
	const dir = path.join(root, "snapshots");
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return [];
	}
	const out = [];
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		try {
			const meta = JSON.parse(await readFile(path.join(dir, entry.name, "snapshot.json"), "utf8"));
			out.push({
				label: entry.name,
				createdAt: meta.createdAt ?? "",
				files: meta.files ?? 0,
				bytes: meta.bytes ?? 0
			});
		} catch {}
	}
	return out.sort((a, b) => a.label < b.label ? 1 : -1);
}
async function readManifest(root, label) {
	const text = await readFile(path.join(root, "snapshots", label, "manifest.jsonl"), "utf8").catch(() => "");
	const map = /* @__PURE__ */ new Map();
	for (const line of text.split("\n")) {
		if (!line.trim()) continue;
		try {
			const entry = JSON.parse(line);
			if (entry.path) map.set(entry.path, entry);
		} catch {}
	}
	return map;
}
/** 比对两个快照：只给出路径级结论，正文 diff 交给面板按需读取 */
async function diffSnapshots(root, a, b) {
	const left = await readManifest(root, a);
	const right = await readManifest(root, b);
	const added = [];
	const removed = [];
	const changed = [];
	for (const [rel, entry] of right) {
		const before = left.get(rel);
		if (!before) added.push(rel);
		else if (before.sha256 && entry.sha256 ? before.sha256 !== entry.sha256 : before.size !== entry.size) changed.push(rel);
	}
	for (const rel of left.keys()) if (!right.has(rel)) removed.push(rel);
	return {
		added: added.sort(),
		removed: removed.sort(),
		changed: changed.sort()
	};
}
/**
* 回滚。默认全量；传 paths 只回滚指定文件。
* **回滚前先给当前状态做一次快照** —— 回滚本身必须可撤销。
*/
async function restoreSnapshot(root, label, paths) {
	const pre = await createSnapshot(root, "pre-restore");
	const manifest = await readManifest(root, label);
	const selected = paths && paths.length > 0 ? paths.filter((rel) => manifest.has(rel)) : [...manifest.keys()];
	let restored = 0;
	for (const rel of selected) {
		if (rel.split("/")[0] === "snapshots") continue;
		const from = path.join(root, "snapshots", label, rel);
		const to = resolveInRoot(root, rel);
		try {
			await mkdir(path.dirname(to), { recursive: true });
			await cp(from, to);
			restored++;
		} catch {}
	}
	return {
		restored,
		preSnapshot: pre.label
	};
}

//#endregion
//#region src/host/bridge.ts
const BEGIN = "<!-- BEGIN dsh-general-automatic-memory (managed, do not edit) -->";
const END = "<!-- END dsh-general-automatic-memory -->";
function projectionTargets(cwd) {
	const home = homedir();
	return [
		{
			id: "agentsMdPointer",
			label: "~/.agents/AGENTS.md（只放指针）",
			path: path.join(home, ".agents", "AGENTS.md"),
			render: () => `记忆索引见 ~/.dsh/memory/INDEX.md。需要时用 memory_recall 检索、memory_read 读全文。`
		},
		{
			id: "claudeMd",
			label: "~/.claude/CLAUDE.md",
			path: path.join(home, ".claude", "CLAUDE.md"),
			render: (entries) => renderProfileBlock(entries)
		},
		{
			id: "geminiMd",
			label: "~/.gemini/GEMINI.md",
			path: path.join(home, ".gemini", "GEMINI.md"),
			render: (entries) => renderProfileBlock(entries).slice(0, 1e3)
		},
		{
			id: "projectAgentsMd",
			label: "仓库根 AGENTS.md",
			path: path.join(cwd, "AGENTS.md"),
			render: (entries) => renderProjectBlock(entries)
		},
		{
			id: "cursorRules",
			label: ".cursor/rules/gam-memory.mdc",
			path: path.join(cwd, ".cursor", "rules", "gam-memory.mdc"),
			render: (entries) => `---\ndescription: Long-term memory (managed by dsh-general-automatic-memory)\nalwaysApply: false\n---\n\n${renderProjectBlock(entries)}`
		},
		{
			id: "windsurfRules",
			label: ".windsurf/rules/gam-memory.md",
			path: path.join(cwd, ".windsurf", "rules", "gam-memory.md"),
			render: (entries) => `---\ntrigger: model_decision\ndescription: Long-term memory (managed by dsh-general-automatic-memory)\n---\n\n${renderProjectBlock(entries)}`
		},
		{
			id: "copilotInstructions",
			label: ".github/copilot-instructions.md",
			path: path.join(cwd, ".github", "copilot-instructions.md"),
			render: (entries) => renderProjectBlock(entries)
		}
	];
}
function renderProfileBlock(entries) {
	const pick = (kind) => entries.filter((entry) => entry.meta.kind === kind && entry.meta.activation === "always" && entry.meta.temporal.invalidatedAt === null);
	const lines = ["## 关于用户", ...pick("persona").map((entry) => `- ${entry.meta.title}：${entry.meta.summary}`)];
	const feedback = pick("feedback");
	if (feedback.length > 0) lines.push("", "## 协作纪律", ...feedback.map((entry) => `- ${entry.meta.title}：${entry.meta.summary}`));
	return lines.join("\n");
}
function renderProjectBlock(entries) {
	const top = entries.filter((entry) => entry.meta.kind === "project" && entry.meta.temporal.invalidatedAt === null && entry.meta.scope === "global").slice(0, 20);
	if (top.length === 0) return "(no project memories yet)";
	return ["## 项目记忆", ...top.map((entry) => `- ${entry.meta.title}：${entry.meta.summary}`)].join("\n");
}
/** 把内容写进受管区块；没有区块就在文末追加，绝不覆盖用户内容 */
function mergeManagedBlock(existing, content) {
	const block = `${BEGIN}\n${content.trim()}\n${END}`;
	const start = existing.indexOf(BEGIN);
	const end = existing.indexOf(END);
	if (start >= 0 && end > start) return `${existing.slice(0, start)}${block}${existing.slice(end + 41)}`;
	const prefix = existing.trimEnd();
	return prefix.length > 0 ? `${prefix}\n\n${block}\n` : `${block}\n`;
}
async function applyProjection(target, entries) {
	const existing = await readFile(target.path, "utf8").catch(() => "");
	const next = mergeManagedBlock(existing, target.render(entries));
	if (next === existing) return {
		target: target.id,
		path: target.path,
		bytes: Buffer.byteLength(next),
		changed: false
	};
	await mkdir(path.dirname(target.path), { recursive: true });
	await writeFile(target.path, next, "utf8");
	return {
		target: target.id,
		path: target.path,
		bytes: Buffer.byteLength(next),
		changed: true
	};
}
/**
* 导出 `.gam.zip`：真相源 + 派生聚合，**不含** `.cache/`、`snapshots/`、`sync/`。
* 默认排除 PII 与 shareable:none 的条目（隐私默认值，见 docs/09）。
*/
async function exportZip(root, opts = {}) {
	const files = {};
	let count = 0;
	let excluded = 0;
	const walk = async (absDir, relDir) => {
		let entries;
		try {
			entries = await readdir(absDir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries) {
			const rel = relDir ? `${relDir}/${entry.name}` : entry.name;
			const top = rel.split("/")[0];
			if (top === DIRS.cache || top === "snapshots" || top === DIRS.sync || top === "exports") continue;
			const abs = path.join(absDir, entry.name);
			if (entry.isDirectory()) {
				await walk(abs, rel);
				continue;
			}
			if (!hasExtension(entry.name, ".md") && !hasExtension(entry.name, ".jsonl") && !hasExtension(entry.name, ".yaml")) continue;
			const content = await readFile(abs, "utf8");
			if (!opts.includePii && /pii:\s*true/.test(content)) {
				excluded++;
				continue;
			}
			files[`memory/${rel}`] = strToU8(content);
			count++;
		}
	};
	await walk(root, "");
	const header = {
		formatVersion: 1,
		exportedAt: isoNow(),
		plugin: "dsh-general-automatic-memory",
		files: count,
		excluded,
		note: "Truth source only. .cache/ is always rebuildable and never exported."
	};
	files["gam.json"] = strToU8(`${JSON.stringify(header, null, 2)}\n`);
	const zipped = zipSync(files, { level: 6 });
	const outDir = path.join(root, "exports");
	await mkdir(outDir, { recursive: true });
	const outPath = path.join(outDir, `gam-${isoNow().replace(/[:.]/g, "-")}.zip`);
	await writeFile(outPath, zipped);
	return {
		path: outPath,
		bytes: zipped.byteLength,
		files: count,
		excluded
	};
}
/** 导入 zip：**不覆盖**已存在的文件（冲突留给导入器按条目决策，避免静默盖掉较新的记忆） */
async function importZip(root, zipPath) {
	const buffer = await readFile(path.resolve(expandUserPath(zipPath)));
	const unzipped = unzipSync(new Uint8Array(buffer));
	let restored = 0;
	let skipped = 0;
	for (const [name, bytes] of Object.entries(unzipped)) {
		if (!name.startsWith("memory/")) continue;
		const rel = name.slice(7);
		if (rel.split("/")[0] === "snapshots" || rel.split("/")[0] === DIRS.cache) continue;
		const abs = resolveInRoot(root, rel);
		if (await readFile(abs).then(() => true, () => false)) {
			skipped++;
			continue;
		}
		await mkdir(path.dirname(abs), { recursive: true });
		await writeFile(abs, strFromU8(bytes), "utf8");
		restored++;
	}
	return {
		restored,
		skipped
	};
}

//#endregion
//#region src/host/curator.ts
async function curate(api, config, opts = {}) {
	const started = Date.now();
	const now = opts.now ?? /* @__PURE__ */ new Date();
	const result = {
		expiredEpisodes: 0,
		promoted: 0,
		merged: 0,
		summariesRewritten: 0,
		demoted: 0,
		durationMs: 0
	};
	const slugs = await api.episodes.listProjects();
	const cutoff = isoDate(/* @__PURE__ */ new Date(now.getTime() - config.curator.episodeTtlDays * 864e5));
	for (const slug of slugs) result.expiredEpisodes += await api.episodes.expire(slug, cutoff);
	for (const slug of slugs) {
		const recent = await api.episodes.recent(slug, config.curator.episodeTtlDays, now);
		const byTopic = /* @__PURE__ */ new Map();
		for (const episode of recent) {
			if (episode.promoted !== null) continue;
			if (!episode.topic || episode.topic === "(compaction summary)") continue;
			const list = byTopic.get(episode.topic) ?? [];
			list.push(episode);
			byTopic.set(episode.topic, list);
		}
		for (const [topic, episodes] of byTopic) {
			if (episodes.length < 2) continue;
			const outcomes = episodes.map((episode) => episode.outcome).filter((text) => text.length > 0);
			if (outcomes.length === 0) continue;
			const created = await api.create({
				kind: "project",
				title: topic.slice(0, 40),
				summary: outcomes[0].slice(0, 120),
				body: [
					`## 反复出现的主题`,
					"",
					topic,
					"",
					"## 每次的结论",
					...outcomes.map((text) => `- ${text}`),
					"",
					`来源：${episodes.length} 次会话，已由固化任务晋升。`
				].join("\n"),
				scope: "project",
				project: slug,
				source: "model-inferred",
				confidence: "medium",
				activation: "on_demand",
				createdBy: "curator"
			});
			await api.episodes.markPromoted(slug, episodes.map((episode) => episode.id), created.meta.id, now);
			result.promoted++;
		}
	}
	const consumed = /* @__PURE__ */ new Set();
	for (const entry of api.list()) {
		if (consumed.has(entry.meta.id) || entry.meta.temporal.invalidatedAt !== null) continue;
		const other = api.search(`${entry.meta.title} ${entry.meta.summary}`, {
			kind: entry.meta.kind,
			limit: 3,
			scope: "all"
		}).find((hit) => hit.entry.meta.id !== entry.meta.id && !consumed.has(hit.entry.meta.id) && hit.entry.meta.temporal.invalidatedAt === null && hit.entry.meta.scope === entry.meta.scope && hit.entry.meta.project === entry.meta.project && hit.parts.relevance >= .9);
		if (!other) continue;
		const keep = entry.body.length >= other.entry.body.length ? entry : other.entry;
		const drop = keep.meta.id === entry.meta.id ? other.entry : entry;
		consumed.add(keep.meta.id);
		consumed.add(drop.meta.id);
		await api.mergeInto(keep.meta.id, {
			title: keep.meta.title,
			summary: keep.meta.summary,
			body: `${keep.body.trimEnd()}\n\n---\n\n${drop.body.trim()}`,
			reason: "curator:merge-duplicate"
		});
		await api.invalidate(drop.meta.id, {
			reason: "curator:merged-duplicate",
			supersededBy: keep.meta.id
		});
		result.merged++;
	}
	for (const entry of api.list()) {
		if (entry.meta.temporal.invalidatedAt !== null) continue;
		const current = entry.meta.summary;
		if (current.length <= 120 && !current.endsWith("…")) continue;
		const next = firstSentence(entry.body).slice(0, 120);
		if (!next || next === current) continue;
		await api.store.patchMeta(entry.meta.id, (meta) => ({
			...meta,
			summary: next
		}));
		result.summariesRewritten++;
	}
	for (const entry of api.list()) {
		if (entry.meta.temporal.invalidatedAt !== null) continue;
		const reference = entry.meta.stats.lastUsedAt ?? entry.meta.provenance.createdAt;
		const ageDays = (now.getTime() - Date.parse(reference)) / 864e5;
		if (entry.meta.stats.heat < .1 && ageDays > config.curator.archiveAfterDays) {
			await api.store.archive(entry.meta.id, now.toISOString());
			result.demoted++;
		}
	}
	await api.refresh();
	result.durationMs = Date.now() - started;
	await api.writeAudit("consolidate", { ...result });
	return result;
}
function firstSentence(body) {
	const firstLine = body.replace(/^#+\s.*$/gm, "").trim().split("\n")[0] ?? "";
	return (firstLine.split(/(?<=[。！？.!?])\s*/)[0] ?? firstLine).replace(/^[-*]\s*/, "").trim();
}

//#endregion
//#region src/host/adapters/http.ts
const PREFIX$1 = "/general-memory";
/**
* 面板 ↔ Host 通信。
*
* 走 `ctx.webServer.register` 的 exact 路由 + 客户端同源 fetch，而不是官方 Typert Remote：
* Remote 的方法集由 `dsh-api-remotes` 的白名单决定，第三方新增命名空间成本远高于自建路由。
*
* 宿主的认证 ≠ 授权。dsh 已经做了 launch token → 签名 cookie（HttpOnly / SameSite=Strict /
* host-only）→ Origin 信任检查 → 拒绝 sec-fetch-site: cross-site。但插件代码在进程内**无沙箱**，
* 所以这里必须自己再加一层守卫。
*/
function registerHttp(ctx, api, nonce) {
	const server = ctx.get("webServer");
	if (!server?.register) return () => {};
	const disposers = [];
	const route = (name, handler, mutating = false) => {
		disposers.push(server.register({
			kind: "exact",
			path: `${PREFIX$1}/${name}`,
			handler: async (req, res) => {
				if (guard(req, res, mutating, nonce)) return;
				const query = queryOf(req.url);
				try {
					await handler(req, res, query);
				} catch (cause) {
					ctx.logger?.warn?.(`[general-memory] route ${name} failed:`, cause.message);
					send(res, 500, { error: "internal" });
				}
			}
		}));
	};
	route("stats", async (_req, res) => send(res, 200, await api.stats()));
	route("entries", async (_req, res, query) => {
		const kind = query.get("kind") ?? void 0;
		const scope = query.get("scope") ?? void 0;
		const q = query.get("q")?.trim() ?? "";
		const limit = Number(query.get("limit") ?? "100");
		const offset = Number(query.get("offset") ?? "0");
		const hits = q ? api.search(q, {
			limit: Number.MAX_SAFE_INTEGER,
			kind
		}) : null;
		const sorted = (hits ? hits.filter((h) => !h.gated).map((h) => ({
			...summaryOf(h.entry),
			score: h.score,
			why: h.why
		})) : api.list().filter((e) => (kind ? e.meta.kind === kind : true) && (scope ? e.meta.scope === scope : true)).map((e) => summaryOf(e))).slice().sort((a, b) => b.heat !== a.heat ? b.heat - a.heat : a.id < b.id ? -1 : 1);
		send(res, 200, {
			total: sorted.length,
			items: sorted.slice(offset, offset + limit)
		});
	});
	route("entry", async (_req, res, query) => {
		const id = query.get("id");
		if (!id) return send(res, 400, { error: "id is required" });
		const entry = await api.read(id);
		if (!entry) return send(res, 404, { error: "not-found" });
		send(res, 200, {
			meta: entry.meta,
			body: entry.body,
			rel: entry.rel
		});
	});
	route("catalog", async (_req, res, query) => {
		send(res, 200, api.catalog(query.get("project") ?? void 0));
	});
	route("entry/patch", async (req, res) => {
		const payload = await readJson(req);
		if (!payload) return send(res, 400, { error: "json body required" });
		const id = String(payload.id ?? "");
		const body = typeof payload.body === "string" ? payload.body : null;
		if (!id || body === null) return send(res, 400, { error: "id and body are required" });
		const result = await api.update(id, body, typeof payload.expectedRev === "number" ? payload.expectedRev : void 0);
		if (!result.ok) return send(res, result.reason === "stale" ? 409 : 404, {
			error: result.reason,
			currentRev: result.currentRev
		});
		await api.writeAudit("update", {
			id,
			via: "panel",
			rev: result.entry.meta.stats.revisions
		});
		send(res, 200, {
			ok: true,
			rev: result.entry.meta.stats.revisions,
			checksum: result.entry.meta.checksum
		});
	}, true);
	route("entry/invalidate", async (req, res) => {
		const payload = await readJson(req);
		const id = String(payload?.id ?? "");
		const reason = String(payload?.reason ?? "");
		if (!id || !reason) return send(res, 400, { error: "id and reason are required" });
		const entry = await api.invalidate(id, {
			reason,
			supersededBy: payload?.supersededBy ? String(payload.supersededBy) : null
		});
		send(res, entry ? 200 : 404, entry ? {
			ok: true,
			id
		} : { error: "not-found" });
	}, true);
	route("doctor", async (_req, res, query) => {
		const fix = query.get("fix") === "1";
		const before = await api.stats();
		const { written, unchanged } = await api.rebuildDerived();
		const after = await api.stats();
		if (fix) await api.writeAudit("repair", {
			rebuilt: written,
			via: "panel"
		});
		send(res, 200, {
			before: before.alerts,
			after: after.alerts,
			issues: after.issues,
			rebuilt: written,
			unchanged: unchanged.length,
			fixed: fix
		});
	}, true);
	return () => {
		for (const dispose of disposers) dispose();
	};
}
function summaryOf(entry) {
	const m = entry.meta;
	return {
		id: m.id,
		kind: m.kind,
		title: m.title,
		summary: m.summary,
		scope: m.scope,
		project: m.project ?? null,
		confidence: m.confidence,
		source: m.provenance.source,
		activation: m.activation,
		heat: m.stats.heat,
		hits: m.stats.hits,
		revisions: m.stats.revisions,
		lastUsedAt: m.stats.lastUsedAt,
		createdAt: m.provenance.createdAt,
		invalidatedAt: m.temporal.invalidatedAt,
		pii: m.privacy.pii,
		rel: entry.rel
	};
}
/** 同源 + 内容类型 + 一次性 nonce。nonce 防同源页面里的其他脚本误触写操作。 */
function guard(req, res, mutating, nonce) {
	if (headerOf(req, "sec-fetch-site") === "cross-site") {
		send(res, 403, { error: "cross-site" });
		return true;
	}
	const origin = headerOf(req, "origin") ?? headerOf(req, "referer");
	if (origin) try {
		const url = new URL(origin);
		const host = headerOf(req, "host") ?? "";
		if (host && url.host !== host) {
			send(res, 403, { error: "cross-origin" });
			return true;
		}
	} catch {
		send(res, 403, { error: "bad-origin" });
		return true;
	}
	if (mutating) {
		if (req.method !== "POST" && req.method !== "PUT") {
			send(res, 405, { error: "method-not-allowed" });
			return true;
		}
		if (headerOf(req, "x-gam-nonce") !== nonce) {
			send(res, 403, { error: "csrf" });
			return true;
		}
	}
	return false;
}
function headerOf(req, name) {
	const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
	return Array.isArray(value) ? value[0] : value;
}
function queryOf(url) {
	try {
		return new URL(url, "http://localhost").searchParams;
	} catch {
		return new URLSearchParams();
	}
}
async function readJson(req) {
	if (!(headerOf(req, "content-type") ?? "").includes("application/json")) return null;
	const chunks = [];
	for await (const chunk of req) chunks.push(typeof chunk === "string" ? Buffer.from(chunk, "utf8") : chunk);
	const raw = Buffer.concat(chunks).toString("utf8");
	if (raw.length === 0 || raw.length > 1e6) return null;
	try {
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
	} catch {
		return null;
	}
}
function send(res, status, payload) {
	const body = JSON.stringify(payload);
	res.statusCode = status;
	res.setHeader("content-type", "application/json; charset=utf-8");
	res.setHeader("cache-control", "no-store");
	res.setHeader("x-content-type-options", "nosniff");
	res.setHeader("content-length", String(Buffer.byteLength(body)));
	res.end(body);
}
/** 面板加载时取一次；写操作必须带回来 */
function registerNonceRoute(ctx, nonce) {
	const server = ctx.get("webServer");
	if (!server?.register) return () => {};
	return server.register({
		kind: "exact",
		path: `${PREFIX$1}/nonce`,
		handler: (_req, res) => send(res, 200, { nonce })
	});
}

//#endregion
//#region src/host/adapters/features.ts
const PREFIX = "/general-memory";
/**
* 导入 / 待确认 / 快照 / 审计 / 时间线 的路由。
*
* 与主 http 路由同一套守卫：同源 + 写操作必须带一次性 nonce。
* 导入是**批量写**，所以它比单条编辑更需要快照与 dry-run——
* 这里的 apply 在落盘前强制 createSnapshot。
*/
function registerFeatures(ctx, nonce, deps) {
	const server = ctx.get("webServer");
	if (!server?.register) return () => {};
	const disposers = [];
	const route = (name, handler, mutating = false) => {
		disposers.push(server.register({
			kind: "exact",
			path: `${PREFIX}/${name}`,
			handler: async (req, res) => {
				if (guard(req, res, mutating, nonce)) return;
				try {
					await handler(req, res, queryOf(req.url));
				} catch (cause) {
					ctx.logger?.warn?.(`[general-memory] route ${name} failed: ${cause.message}`);
					send(res, 400, { error: cause.message });
				}
			}
		}));
	};
	route("import/sources", async (_req, res, query) => {
		const cwd = query.get("cwd") ?? process.cwd();
		send(res, 200, {
			cwd,
			sources: await deps.importer.sources(cwd)
		});
	});
	route("import/scan", async (req, res) => {
		const body = await readJson(req) ?? {};
		const source = String(body.source ?? "");
		if (!source) return send(res, 400, { error: "source is required" });
		const report = await deps.importer.scan(source, {
			...typeof body.cwd === "string" ? { cwd: body.cwd } : {},
			...typeof body.path === "string" ? { path: body.path } : {},
			...typeof body.limit === "number" ? { limit: body.limit } : {},
			...typeof body.maxTurns === "number" ? { maxTurns: body.maxTurns } : {}
		});
		send(res, 200, {
			...report,
			budget: deps.importer.budgetImpact(report.items, deps.importer.configSnapshot.budget.alwaysChars)
		});
	}, true);
	route("import/apply", async (req, res) => {
		const body = await readJson(req) ?? {};
		const scanId = String(body.scanId ?? "");
		const keys = Array.isArray(body.keys) ? body.keys.map(String) : [];
		if (!scanId || keys.length === 0) return send(res, 400, { error: "scanId and keys are required" });
		const report = await deps.importer.apply(scanId, keys, typeof body.project === "string" ? body.project : void 0);
		send(res, 200, report);
	}, true);
	route("pending-writes", async (_req, res) => {
		send(res, 200, {
			items: deps.ingestor.pending.list(),
			size: deps.ingestor.pending.size
		});
	});
	route("pending-writes/decide", async (req, res) => {
		const body = await readJson(req) ?? {};
		const id = String(body.id ?? "");
		const action = body.action === "accept" ? "accept" : "reject";
		if (!id) return send(res, 400, { error: "id is required" });
		const result = await deps.ingestor.resolvePending(id, action);
		send(res, result.ok ? 200 : 410, result);
	}, true);
	route("snapshots", async (_req, res) => send(res, 200, { items: await listSnapshots(deps.api.root) }));
	route("snapshot", async (req, res) => {
		const body = await readJson(req) ?? {};
		const info = await createSnapshot(deps.api.root, String(body.label ?? "manual"));
		await deps.api.writeAudit("export", {
			snapshot: info.label,
			files: info.files,
			bytes: info.bytes
		});
		send(res, 200, info);
	}, true);
	route("episodes", async (_req, res, query) => {
		const slug = query.get("slug");
		const days = Math.min(Number(query.get("days") ?? "7") || 7, 90);
		if (!slug) return send(res, 400, { error: "slug is required" });
		send(res, 200, {
			slug,
			days,
			items: await deps.api.episodes.recent(slug, days)
		});
	});
	route("audit", async (_req, res, query) => {
		const date = query.get("date") ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const limit = Math.min(Number(query.get("limit") ?? "200") || 200, 1e3);
		const tzOffset = Number(query.get("tzOffset") ?? "0") || 0;
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return send(res, 400, { error: "date must be yyyy-mm-dd" });
		if (!Number.isFinite(tzOffset) || Math.abs(tzOffset) > 1440) return send(res, 400, { error: "bad tzOffset" });
		const { start, end, files } = utcDayFilesForLocalDate(date, tzOffset);
		const rows = [];
		let total = 0;
		for (const file of files) {
			let text = "";
			try {
				text = await readFile(resolveInRoot(deps.api.root, path.posix.join(DIRS.audit, `${file}.jsonl`)), "utf8");
			} catch {
				continue;
			}
			for (const line of text.split("\n").filter(Boolean)) try {
				const row = JSON.parse(line);
				const ts = Date.parse(String(row.ts ?? ""));
				if (Number.isFinite(ts) && (ts < start || ts >= end)) continue;
				rows.push(row);
			} catch {
				rows.push({ raw: line });
			}
		}
		rows.sort((a, b) => String(a.ts ?? "").localeCompare(String(b.ts ?? "")));
		total = rows.length;
		send(res, 200, {
			date,
			total,
			items: rows.slice(-limit)
		});
	});
	route("consolidate", async (_req, res) => {
		const result = await curate(deps.api, deps.importer.configSnapshot);
		send(res, 200, result);
	}, true);
	route("snapshot/diff", async (_req, res, query) => {
		const a = query.get("a");
		const b = query.get("b");
		if (!a || !b) return send(res, 400, { error: "a and b are required" });
		send(res, 200, await diffSnapshots(deps.api.root, a, b));
	});
	route("snapshot/restore", async (req, res) => {
		const body = await readJson(req) ?? {};
		const label = String(body.label ?? "");
		if (!label) return send(res, 400, { error: "label is required" });
		const paths = Array.isArray(body.paths) ? body.paths.map(String) : void 0;
		const result = await restoreSnapshot(deps.api.root, label, paths);
		await deps.api.refresh();
		await deps.api.writeAudit("restore", {
			label,
			restored: result.restored,
			preSnapshot: result.preSnapshot
		});
		send(res, 200, result);
	}, true);
	route("projections", async (_req, res, query) => {
		const cwd = query.get("cwd") ?? process.cwd();
		const enabled = deps.importer.configSnapshot.portability.projections;
		send(res, 200, {
			cwd,
			targets: projectionTargets(cwd).map((target) => ({
				id: target.id,
				label: target.label,
				path: target.path,
				enabled: enabled[target.id] === true
			}))
		});
	});
	route("projections/apply", async (req, res) => {
		const body = await readJson(req) ?? {};
		const cwd = typeof body.cwd === "string" ? body.cwd : process.cwd();
		const wanted = Array.isArray(body.ids) ? body.ids.map(String) : Object.entries(deps.importer.configSnapshot.portability.projections).filter(([, on]) => on === true).map(([id]) => id);
		const entries = deps.api.list();
		const results = [];
		for (const target of projectionTargets(cwd)) {
			if (!wanted.includes(target.id)) continue;
			results.push(await applyProjection(target, entries));
		}
		await deps.api.writeAudit("export", {
			projections: results.map((r) => r.target),
			changed: results.filter((r) => r.changed).length
		});
		send(res, 200, { results });
	}, true);
	route("export", async (req, res) => {
		const body = await readJson(req) ?? {};
		const result = await exportZip(deps.api.root, { includePii: body.includePii === true });
		await deps.api.writeAudit("export", {
			path: result.path,
			files: result.files,
			excluded: result.excluded
		});
		send(res, 200, result);
	}, true);
	route("import/zip", async (req, res) => {
		const body = await readJson(req) ?? {};
		const zipPath = String(body.path ?? "");
		if (!zipPath) return send(res, 400, { error: "path is required" });
		const pre = await createSnapshot(deps.api.root, "pre-zip-import");
		const result = await importZip(deps.api.root, zipPath);
		await deps.api.refresh();
		await deps.api.writeAudit("import", {
			source: "zip",
			zipPath,
			restored: result.restored,
			skipped: result.skipped,
			snapshot: pre.label
		});
		send(res, 200, {
			...result,
			preSnapshot: pre.label
		});
	}, true);
	route("graph", async (_req, res, query) => {
		const entity = query.get("entity");
		const edges = deps.api.list().filter((entry) => entry.meta.kind === "relations" && entry.meta.temporal.invalidatedAt === null).filter((entry) => entity ? entry.meta.entities.includes(entity) || entry.meta.id === entity : true).map((entry) => ({
			id: entry.meta.id,
			from: entry.meta.entities[0] ?? "",
			to: entry.meta.entities[1] ?? "",
			rel: entry.meta.title,
			confidence: entry.meta.confidence,
			summary: entry.meta.summary
		})).filter((edge) => edge.from && edge.to);
		const nodes = [...new Set(edges.flatMap((edge) => [edge.from, edge.to]))].sort();
		const mermaid = ["graph LR", ...edges.map((edge, index) => `  n${index}a["${edge.from}"] -->|${edge.rel}| n${index}b["${edge.to}"]`)].join("\n");
		send(res, 200, {
			nodes,
			edges,
			mermaid
		});
	});
	route("config", async (_req, res) => {
		const config = deps.importer.configSnapshot;
		send(res, 200, {
			...config,
			memoryRoot: deps.api.root,
			indexBackend: deps.api.indexBackend
		});
	});
	return () => {
		for (const dispose of disposers) dispose();
	};
}

//#endregion
//#region src/host/ingest/extract.ts
const MAX_TITLE = 40;
const MAX_SUMMARY = 120;
const MAX_EVIDENCE = 80;
const RULES = [
	{
		kind: "feedback",
		pattern: /(记住|记一下|记下|以后都|以后不要|以后别|别再|不要再|不要总|我说过|不是这样|不应该|remember (?:that )?|keep in mind|from now on|stop doing|don'?t )/i,
		reason: "显式记忆/纠正指令",
		source: "user-stated",
		confidence: "high",
		activation: "always"
	},
	{
		kind: "feedback",
		pattern: /(对[，,]?\s*就这样|完全正确|没错就是这样|perfect[,!.]?\s*(keep|continue)|exactly|keep doing that|就这么办)/i,
		reason: "用户确认了某种做法",
		source: "user-stated",
		confidence: "medium"
	},
	{
		kind: "persona",
		pattern: /(我是|我负责|我主要|我做.{0,6}年|我的角色|i'?m a |i am a |my role is)/i,
		reason: "身份陈述",
		source: "user-stated",
		confidence: "medium"
	},
	{
		kind: "project",
		pattern: /(决定用|决定采用|我们选|定了|改用|换成|用.{1,24}(?:而不是|不用|替代)|we (?:decided|chose|went with))/i,
		reason: "技术/产品决策",
		source: "user-stated",
		confidence: "medium",
		activation: "on_demand"
	},
	{
		kind: "reference",
		pattern: /https?:\/\/\S+/i,
		reason: "外部系统地址",
		source: "user-stated",
		confidence: "medium"
	}
];
const RELATION_RULES = [
	{
		rel: "负责",
		pattern: /([\u4e00-\u9fa5A-Za-z0-9_.-]{1,12})\s*负责(?:着)?\s*([\u4e00-\u9fa5A-Za-z0-9_.-]{1,20})/
	},
	{
		rel: "依赖",
		pattern: /([\u4e00-\u9fa5A-Za-z0-9_.-]{1,20})\s*依赖(?:于)?\s*([\u4e00-\u9fa5A-Za-z0-9_.-]{1,20})/
	},
	{
		rel: "属于",
		pattern: /([\u4e00-\u9fa5A-Za-z0-9_.-]{1,20})\s*属于\s*([\u4e00-\u9fa5A-Za-z0-9_.-]{1,20})/
	},
	{
		rel: "汇报给",
		pattern: /([\u4e00-\u9fa5]{2,4})\s*向\s*([\u4e00-\u9fa5]{2,4})\s*汇报/
	}
];
/** 从消息内容数组里取纯文本（跳过 reasoning 块） */
function collectText(message) {
	if (typeof message === "string") return message.trim();
	if (!message || typeof message !== "object") return "";
	const content = message.content;
	if (typeof content === "string") return content.trim();
	if (!Array.isArray(content)) return "";
	const parts = [];
	for (const block of content) if (block && typeof block === "object" && block.type === "text") {
		const text = block.text;
		if (typeof text === "string") parts.push(text);
	}
	return parts.join("\n").trim();
}
/** 结论行：助手回复的最后一段纯文本的第一句，≤200 字 */
function conclusionOf(message) {
	const text = collectText(message);
	if (!text) return "";
	const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
	const last = paragraphs[paragraphs.length - 1] ?? "";
	return (last.split(/(?<=[。！？.!?])\s*/)[0] ?? last).trim().slice(0, 200);
}
function extractFromTurn(input) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const raw of input.userMessages) {
		const text = normalizeDates(raw, input.now ?? /* @__PURE__ */ new Date()).trim();
		if (text.length < 4) continue;
		for (const rule of RULES) {
			const match = text.match(rule.pattern);
			if (!match) continue;
			if (rule.kind === "reference" && !/(看板|文档|仪表盘|dashboard|oncall|wiki|文档站|监控|日志)/i.test(text)) continue;
			const title = deriveTitle(text);
			const key = `${rule.kind}:${title}`;
			if (seen.has(key)) continue;
			seen.add(key);
			out.push({
				kind: rule.kind,
				title,
				summary: clip$2(text, MAX_SUMMARY),
				body: buildBody(text, rule.kind),
				tags: deriveTags(text),
				activation: rule.activation,
				source: rule.source ?? "user-stated",
				confidence: rule.confidence ?? "medium",
				evidence: clip$2(match[0], MAX_EVIDENCE),
				reason: rule.reason
			});
			break;
		}
		for (const relation of RELATION_RULES) {
			const match = text.match(relation.pattern);
			if (!match) continue;
			const [, from, to] = match;
			if (!from || !to) continue;
			const title = `${from} ${relation.rel} ${to}`;
			if (seen.has(`relations:${title}`)) continue;
			seen.add(`relations:${title}`);
			out.push({
				kind: "relations",
				title: clip$2(title, MAX_TITLE),
				summary: clip$2(text, MAX_SUMMARY),
				body: `- ${from} ${relation.rel} ${to}\n\n依据：${clip$2(text, 240)}`,
				entities: [from, to],
				tags: ["relation", relation.rel],
				activation: "on_demand",
				source: "user-stated",
				confidence: "medium",
				evidence: clip$2(match[0], MAX_EVIDENCE),
				reason: `关系陈述（${relation.rel}）`
			});
		}
	}
	return out;
}
/** feedback 强制三段式：规则 / Why / How to apply（docs/03 §2） */
function buildBody(text, kind) {
	if (kind !== "feedback") return text;
	return [
		text,
		/因为|由于|原因是|否则|because/i.test(text) ? "" : "**Why:** （用户未说明；之后补充时请更新本条）",
		"**How to apply:** 该场景出现时先按本条执行；与后续用户指令冲突时以最新指令为准。"
	].filter((part) => part.length > 0).join("\n\n");
}
function deriveTitle(text) {
	const firstLine = text.split("\n")[0] ?? text;
	const sentence = firstLine.split(/(?<=[。！？.!?])\s*/)[0] ?? firstLine;
	const cleaned = sentence.replace(/^(请|麻烦|帮我|能不能|可以)?\s*(记住|记一下|记下)[：:，,\s]*/i, "").trim();
	return clip$2(cleaned.length > 0 ? cleaned : sentence, MAX_TITLE);
}
function deriveTags(text) {
	const tags = [];
	if (/(代码|code|提交|commit|pr|diff)/i.test(text)) tags.push("code");
	if (/(测试|test|spec)/i.test(text)) tags.push("testing");
	if (/(部署|deploy|上线|release)/i.test(text)) tags.push("deploy");
	if (/(安全|security|权限|auth|鉴权)/i.test(text)) tags.push("security");
	if (/(文档|doc|readme)/i.test(text)) tags.push("docs");
	return tags;
}
/** 相对日期必须转绝对，否则记忆过期后无法解释（docs/05 §2.1） */
function normalizeDates(text, now) {
	const weekday = [
		"日",
		"一",
		"二",
		"三",
		"四",
		"五",
		"六"
	];
	const day = 864e5;
	const fmt = (d) => d.toISOString().slice(0, 10);
	let out = text;
	out = out.replace(/今天/g, fmt(now));
	out = out.replace(/明天/g, fmt(new Date(now.getTime() + day)));
	out = out.replace(/后天/g, fmt(new Date(now.getTime() + 2 * day)));
	out = out.replace(/昨天/g, fmt(/* @__PURE__ */ new Date(now.getTime() - day)));
	out = out.replace(/下周([一二三四五六日天])/g, (_, d) => {
		const delta = ((d === "天" ? 0 : weekday.indexOf(d)) - now.getDay() + 7) % 7 || 7;
		return fmt(new Date(now.getTime() + delta * day));
	});
	out = out.replace(/(?:本周|这周|周)([一二三四五六日天])/g, (_, d) => {
		const delta = ((d === "天" ? 0 : weekday.indexOf(d)) - now.getDay() + 7) % 7;
		return fmt(new Date(now.getTime() + delta * day));
	});
	return out;
}
function clip$2(text, max) {
	const single = text.replace(/\s+/g, " ").trim();
	return single.length > max ? `${single.slice(0, max - 1)}…` : single;
}

//#endregion
//#region src/host/adapters/ingest.ts
/**
* 自动写入的事件挂载。
*
* ⚠️ `turn/*`、`step/*`、`compaction/*` 是**持久化 session 事件类型，不是同名 Cordis 事件**，
* 只能监听 `session/event` 再判 `event.type`（官方文档明确警告过）。
*
* 这里只做"攒上下文 → 交给 Ingestor"；所有抽取/门控/决策都在 ingest 里，
* 保证实时路径与会话导入路径共用同一套逻辑。
*/
function registerIngest(ctx, ingestor, config) {
	if (typeof ctx.on !== "function") return () => {};
	const disposers = [];
	const buffers = /* @__PURE__ */ new Map();
	/** 本会话实际使用的模型；LLM 兜底抽取必须跟着会话走，不能猜默认值 */
	const sessionModels = /* @__PURE__ */ new Map();
	const bufferOf = (key) => {
		let buffer = buffers.get(key);
		if (!buffer) {
			buffer = {
				turn: 0,
				users: [],
				assistants: []
			};
			buffers.set(key, buffer);
		}
		return buffer;
	};
	const flush = async (key, reason) => {
		const buffer = buffers.get(key);
		if (!buffer || buffer.users.length === 0) return;
		const snapshot = {
			...buffer,
			users: [...buffer.users],
			assistants: [...buffer.assistants]
		};
		const model = sessionModels.get(key);
		buffers.set(key, {
			turn: buffer.turn + 1,
			users: [],
			assistants: [],
			...buffer.cwd ? { cwd: buffer.cwd } : {}
		});
		try {
			const result = await ingestor.ingestTurn({
				sid: key,
				turn: snapshot.turn,
				...snapshot.cwd ? { cwd: snapshot.cwd } : {},
				...model ? { model } : {},
				userMessages: snapshot.users,
				assistantMessages: snapshot.assistants
			});
			if (reason === "rescue" && result.episodeId) ctx.logger?.info?.(`[general-memory] compaction rescue → ${result.episodeId}`);
		} catch (cause) {
			ctx.logger?.warn?.(`[general-memory] ingest failed: ${cause.message}`);
		}
	};
	disposers.push(ctx.on("session/event", ((session, event) => {
		const key = sessionKeyOf$1(session);
		const type = event?.type ?? "";
		const data = event?.data ?? {};
		if (type === "model/selection" || type === "request/header") {
			const config = type === "model/selection" ? data : data.header?.config;
			const provider = config?.provider;
			const model = config?.model;
			if (typeof provider === "string" && provider && typeof model === "string" && model) sessionModels.set(key, {
				provider,
				model
			});
			return;
		}
		if (type === "turn/start") {
			const buffer = bufferOf(key);
			buffer.turn = typeof data.turn === "number" ? data.turn : buffer.turn + 1;
			return;
		}
		if (type === "user/message") {
			const text = collectText(data.message ?? data);
			if (text) bufferOf(key).users.push(text);
			return;
		}
		if (type === "assistant/message") {
			const buffer = bufferOf(key);
			buffer.assistants.push(data.message ?? data);
			if (!buffer.cwd) {
				const cwd = session?.cwd;
				if (typeof cwd === "string") buffer.cwd = cwd;
			}
			return;
		}
		if (type === "turn/end") {
			flush(key, "turn");
			return;
		}
		if (type === "compaction/start") {
			flush(key, "rescue");
			return;
		}
		if (type === "compaction/summary") {
			const summary = collectText(data.summary ?? data);
			const cwd = session?.cwd;
			if (summary) ingestor.episodes.append(typeof cwd === "string" ? projectSlug(cwd) : "_global", {
				sid: key,
				turn: 0,
				topic: "(compaction summary)",
				user: "",
				outcome: conclusionOf(summary) || summary.slice(0, 120),
				src: "model-inferred"
			});
		}
	})));
	if (config.ingest.writeMode === "suggest") {
		const timer = setInterval(() => {
			ingestor.sweepPending().catch(() => {});
		}, 5e3);
		if (typeof timer === "object" && timer !== null && "unref" in timer) timer.unref();
		disposers.push(() => clearInterval(timer));
	}
	return () => {
		for (const dispose of disposers) dispose();
	};
}
function sessionKeyOf$1(session) {
	if (typeof session === "string") return session;
	if (session && typeof session === "object") {
		const id = session.id;
		if (typeof id === "string") return id;
	}
	return "default";
}

//#endregion
//#region src/host/ingest/gate.ts
const SECRET_PATTERNS = [
	/\bsk-[A-Za-z0-9]{16,}\b/,
	/\bghp_[A-Za-z0-9]{20,}\b/,
	/\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
	/\bAKIA[0-9A-Z]{16}\b/,
	/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
	/-----BEGIN [A-Z ]*PRIVATE KEY-----/,
	/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
	/\b(?:password|passwd|api[_-]?key|secret|token)\s*[=:]\s*\S{6,}/i
];
const PII_PATTERNS = [
	/\b1[3-9]\d{9}\b/,
	/\b\d{17}[\dXx]\b/,
	/\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/,
	/\b(?:\d[ -]?){13,19}\b/,
	/\b(?:\d{1,3}\.){3}\d{1,3}\b/
];
const SENSITIVE_PATTERNS = [/(抑郁症|焦虑症|双相|精神|心理疾病|病史|诊断|用药|怀孕|流产|性取向|性生活|宗教|信仰|洗礼|政治立场|党派|选举|诉讼|判决|犯罪记录|未成年)/, /(depress|anxiety|bipolar|diagnos|medication|pregnan|sexual|religio|political|law ?suit|conviction)/i];
/** 密钥是硬拒绝：连审计里都不记内容，只记"拦了一次密钥写入" */
function scanSecrets(text) {
	return SECRET_PATTERNS.some((pattern) => pattern.test(text));
}
function scanPii(text) {
	return PII_PATTERNS.some((pattern) => pattern.test(text));
}
function isSensitiveTopic(text) {
	return SENSITIVE_PATTERNS.some((pattern) => pattern.test(text));
}
/** 不可信来源只能进 episode 层（晋升需用户批准或热度，见 docs/05 §3） */
const LONG_TERM_SOURCES = /* @__PURE__ */ new Set([
	"user-stated",
	"manual",
	"imported",
	"model-inferred",
	"team"
]);
function gateCandidate(candidate, config, counters) {
	const text = `${candidate.title}\n${candidate.summary}\n${candidate.body}\n${candidate.evidence}`;
	if (scanSecrets(text)) return {
		allow: false,
		reason: "secret-detected",
		pii: false,
		sensitive: false,
		shareable: "none",
		longTermAllowed: false
	};
	if (config.privacy.sensitiveTopics && isSensitiveTopic(text)) return {
		allow: false,
		reason: "sensitive-topic",
		pii: false,
		sensitive: true,
		shareable: "none",
		longTermAllowed: false
	};
	if (candidate.evidence.trim().length === 0 && config.ingest.requireEvidence) return {
		allow: false,
		reason: "missing-evidence",
		pii: false,
		sensitive: false,
		shareable: "none",
		longTermAllowed: false
	};
	if (counters.writesLastHour >= config.ingest.burstThreshold) return {
		allow: false,
		reason: "burst-circuit-breaker",
		pii: false,
		sensitive: false,
		shareable: "none",
		longTermAllowed: false
	};
	const pii = config.privacy.piiScan && scanPii(text);
	return {
		allow: true,
		pii,
		sensitive: false,
		shareable: pii ? "none" : "team",
		longTermAllowed: LONG_TERM_SOURCES.has(candidate.source)
	};
}

//#endregion
//#region src/host/ingest/decide.ts
/** 相似到这个程度基本是同一件事 */
const DUPLICATE_THRESHOLD = .9;
/** 低于这个程度就不算"同一条记忆"，照常新增 */
const RELATED_THRESHOLD = .5;
const CONTRADICTION = /(现在|改成|改为|不再是|已经(?:改|换|用)|换成|不再使用|废弃|instead|no longer|now (?:use|using|it'?s)|switched to)/i;
const USER_AUTHORED = /* @__PURE__ */ new Set(["user-stated", "manual"]);
function decide(candidate, similar) {
	const best = similar[0];
	if (!best || best.parts.relevance < RELATED_THRESHOLD) return {
		kind: "ADD",
		reason: "没有相近的既有记忆"
	};
	const target = best.entry;
	const relevance = best.parts.relevance;
	if (USER_AUTHORED.has(target.meta.provenance.source) && !USER_AUTHORED.has(candidate.source)) return {
		kind: "NOOP",
		targetId: target.meta.id,
		reason: "既有条目由用户显式写入，自动推断不得覆盖（用户条目胜出）"
	};
	if (relevance >= DUPLICATE_THRESHOLD) {
		if (sameBody(candidate.body, target.body)) return {
			kind: "NOOP",
			targetId: target.meta.id,
			reason: "已有等价条目，无需重复写入"
		};
		return {
			kind: "UPDATE",
			targetId: target.meta.id,
			reason: "同一事实的更完整版本，就地更新而不是并存"
		};
	}
	if (CONTRADICTION.test(`${candidate.title}\n${candidate.body}`)) return {
		kind: "INVALIDATE",
		targetId: target.meta.id,
		reason: "新表述与既有条目矛盾：旧条目标失效（可回溯），新条目另行写入",
		supersede: true
	};
	return {
		kind: "ADD",
		reason: "与既有条目相关但不等价，新增并建立关联",
		targetId: target.meta.id
	};
}
function sameBody(a, b) {
	return normalize(a) === normalize(b);
}
function normalize(text) {
	return text.replace(/\s+/g, " ").trim().toLowerCase();
}

//#endregion
//#region src/host/ingest/llm-extract.ts
/**
* LLM 兜底抽取。
*
* `ctx.llm.stream()` 的真实契约（0.2.1-rc.2 核对）：
*  - 必须显式给 provider/model；优先用本会话的 model/selection，其次 agentDefaultModel
*  - 文本增量是 `{ type: 'text-delta', text }`
*  - 结束块是 `{ type: 'finish', kind: 'error' | 'aborted' }` 或成功 finish
*
* 只在规则层一个都没抽到时才调用；8 秒硬超时；异常吞掉，不打断会话。
*/
async function extractWithLlm(ctx, transcript, canSpend, sessionModel) {
	const llm = ctx.get("llm");
	if (!llm?.stream) return [];
	const target = resolveTarget(ctx, sessionModel);
	if (!target) return [];
	if (transcript.trim().length < 80) return [];
	if (!await canSpend()) return [];
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 8e3);
	try {
		const request = {
			provider: target.provider,
			model: target.model,
			messages: [{
				role: "user",
				content: [{
					type: "text",
					text: `${EXTRACTION_SYSTEM}\n\n---\n\nConversation:\n${transcript.slice(0, 6e3)}`
				}]
			}],
			maxTokens: 800,
			signal: controller.signal
		};
		const stream = await llm.stream(request);
		const chunks = [];
		let failed = false;
		for await (const chunk of stream) {
			if ((chunk?.type === "text-delta" || chunk?.type === "text") && typeof chunk.text === "string") chunks.push(chunk.text);
			if (chunk?.type === "finish" && (chunk.kind === "error" || chunk.kind === "aborted")) failed = true;
			if (chunks.join("").length > 8e3) break;
		}
		return failed ? [] : parseCandidates(chunks.join(""));
	} catch (cause) {
		ctx.logger?.warn?.(`[general-memory] llm extraction skipped: ${cause.message}`);
		return [];
	} finally {
		clearTimeout(timer);
	}
}
function resolveTarget(ctx, sessionModel) {
	if (sessionModel?.provider && sessionModel.model) return sessionModel;
	const current = ctx.get("agentDefaultModel")?.currentSelection?.();
	if (typeof current?.provider === "string" && typeof current.model === "string" && current.provider && current.model) return {
		provider: current.provider,
		model: current.model
	};
}
const EXTRACTION_SYSTEM = `You extract long-term memory candidates from an agent conversation.
Output ONLY a JSON array (no prose, no code fence). Each item:
{"kind":"persona|preference|feedback|relations|project|reference","title":"<=40 chars","summary":"<=120 chars, this is the only text shown in a catalog","body":"markdown","entities":["..."],"evidence":"exact quote from the user message, <=80 chars","confidence":"high|medium|low"}
Rules:
- Only facts that will still matter weeks later. No transient state.
- feedback must be a rule for how the agent should work, with a Why when the user gave one.
- relations require exactly two entities (from, to).
- Drop anything without a verbatim evidence quote.
- Return [] when nothing qualifies.`;
function parseCandidates(raw) {
	const start = raw.indexOf("[");
	const end = raw.lastIndexOf("]");
	if (start < 0 || end <= start) return [];
	let parsed;
	try {
		parsed = JSON.parse(raw.slice(start, end + 1));
	} catch {
		return [];
	}
	if (!Array.isArray(parsed)) return [];
	const out = [];
	for (const item of parsed.slice(0, 8)) {
		if (!item || typeof item !== "object") continue;
		const record = item;
		const kind = String(record.kind ?? "");
		const title = String(record.title ?? "").trim();
		const summary = String(record.summary ?? "").trim();
		const body = String(record.body ?? "").trim();
		const evidence = String(record.evidence ?? "").trim();
		if (![
			"persona",
			"preference",
			"feedback",
			"relations",
			"project",
			"reference"
		].includes(kind)) continue;
		if (!title || !summary || !body || !evidence) continue;
		const entities = Array.isArray(record.entities) ? record.entities.map(String) : [];
		if (kind === "relations" && entities.length < 2) continue;
		out.push({
			kind,
			title: title.slice(0, 40),
			summary: summary.slice(0, 120),
			body,
			entities,
			source: "model-inferred",
			confidence: record.confidence === "high" ? "medium" : "low",
			evidence: evidence.slice(0, 80),
			reason: "LLM 抽取（带原文引用）"
		});
	}
	return out;
}

//#endregion
//#region src/host/ingest/pending.ts
var PendingStore = class {
	timeoutSec;
	items = /* @__PURE__ */ new Map();
	constructor(timeoutSec) {
		this.timeoutSec = timeoutSec;
	}
	add(candidate, decision, project, now = Date.now()) {
		const item = {
			id: `p_${ulid().slice(2)}`,
			candidate,
			decision,
			...project ? { project } : {},
			createdAt: isoNow(new Date(now)),
			expiresAt: now + this.timeoutSec * 1e3
		};
		this.items.set(item.id, item);
		return item;
	}
	list(now = Date.now()) {
		return [...this.items.values()].filter((item) => item.expiresAt > now).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
	}
	get(id) {
		return this.items.get(id);
	}
	take(id) {
		const item = this.items.get(id);
		if (item) this.items.delete(id);
		return item;
	}
	/** 15 秒没操作自动收起为静默 NOOP —— 绝不因为用户没点就偷偷写 */
	sweep(now = Date.now()) {
		const expired = [];
		for (const [id, item] of this.items) if (item.expiresAt <= now) {
			expired.push(item);
			this.items.delete(id);
		}
		return expired;
	}
	clear() {
		this.items.clear();
	}
	get size() {
		return this.items.size;
	}
};

//#endregion
//#region src/host/ingest/queue.ts
function emptyState() {
	return {
		date: "",
		llmCalls: 0,
		lastRunByProject: {},
		writeTimestamps: []
	};
}
/**
* 节流与预算。
*
* 三件事必须持久化（进程重启不能重置）：
* 1. 同项目的冷却窗口（避免每轮都跑抽取）
* 2. 每日 LLM 抽取调用数（钱）
* 3. 最近一小时的写入时间戳（突增熔断 = 投毒信号）
*/
var IngestQueue = class {
	root;
	config;
	state = emptyState();
	loaded = false;
	constructor(root, config) {
		this.root = root;
		this.config = config;
	}
	get file() {
		return resolveInRoot(this.root, path.posix.join(DIRS.cache, "ingest.json"));
	}
	async load() {
		if (this.loaded) return;
		this.loaded = true;
		const text = await readTextFile(this.file);
		if (!text) return;
		try {
			const parsed = JSON.parse(text);
			this.state = {
				date: parsed.date ?? "",
				llmCalls: parsed.llmCalls ?? 0,
				lastRunByProject: parsed.lastRunByProject ?? {},
				writeTimestamps: parsed.writeTimestamps ?? []
			};
		} catch {
			this.state = emptyState();
		}
	}
	async save() {
		const day = isoNow().slice(0, 10);
		if (this.state.date !== day) this.state = {
			date: day,
			llmCalls: 0,
			lastRunByProject: this.state.lastRunByProject,
			writeTimestamps: this.state.writeTimestamps
		};
		await writeFileAtomic(this.file, `${JSON.stringify(this.state, null, 2)}\n`);
	}
	/** 冷却窗口：同项目 `ingest.cooldownMinutes` 内只跑一次长记忆抽取（episode 不受限） */
	async canRun(project, cooldownMinutes = 30, now = Date.now()) {
		await this.load();
		if (now - (this.state.lastRunByProject[project] ?? 0) < cooldownMinutes * 6e4) return {
			ok: false,
			reason: "cooldown"
		};
		return { ok: true };
	}
	async noteRun(project, now = Date.now()) {
		await this.load();
		this.state.lastRunByProject[project] = now;
		await this.save();
	}
	async writesLastHour(now = Date.now()) {
		await this.load();
		return this.state.writeTimestamps.filter((ts) => now - ts < 36e5).length;
	}
	async noteWrite(now = Date.now()) {
		await this.load();
		this.state.writeTimestamps = [...this.state.writeTimestamps.filter((ts) => now - ts < 36e5), now];
		await this.save();
	}
	/** 每日 LLM 预算；返回 false 表示今天不能再调 */
	async consumeLlm(now = Date.now()) {
		await this.load();
		const day = new Date(now).toISOString().slice(0, 10);
		if (this.state.date !== day) {
			this.state.date = day;
			this.state.llmCalls = 0;
		}
		if (this.state.llmCalls >= this.config.ingest.dailyLlmCalls) return false;
		this.state.llmCalls++;
		await this.save();
		return true;
	}
	async llmUsage() {
		await this.load();
		const day = isoNow().slice(0, 10);
		return {
			used: this.state.date === day ? this.state.llmCalls : 0,
			cap: this.config.ingest.dailyLlmCalls
		};
	}
};

//#endregion
//#region src/host/ingest/index.ts
/** 同项目的长记忆抽取冷却（episode 不受限） */
const COOLDOWN_MINUTES = 30;
const NO_PROJECT = "_global";
/**
* 自动写入管线。
*
* 读写权限分离是刻意的：**对话热路径只允许追加 episode 与提交候选**，
* 合并/重写/归档只发生在 curator（M5）。这样即使会话被注入，
* 攻击者也只能塞进 episode 层，改不动长期记忆的结构。
*/
var Ingestor = class {
	api;
	config;
	ctx;
	queue;
	pending;
	/** 会话导入与 compaction 摘要需要直接写 episode */
	get episodes() {
		return this.api.episodes;
	}
	constructor(api, config, ctx) {
		this.api = api;
		this.config = config;
		this.ctx = ctx;
		this.queue = new IngestQueue(api.root, config);
		this.pending = new PendingStore(config.ingest.suggestTimeoutSec);
	}
	async ingestTurn(input) {
		const now = input.now ?? /* @__PURE__ */ new Date();
		const project = input.cwd ? projectSlug(input.cwd) : void 0;
		const slug = project ?? NO_PROJECT;
		const firstUser = input.userMessages[0] ?? "";
		const lastAssistant = input.assistantMessages[input.assistantMessages.length - 1];
		const outcome = lastAssistant ? conclusionOf(lastAssistant) : "";
		const result = {
			episodeId: null,
			added: 0,
			updated: 0,
			invalidated: 0,
			pending: 0,
			noop: 0,
			rejected: 0
		};
		try {
			result.episodeId = (await this.api.episodes.append(slug, {
				sid: input.sid,
				turn: input.turn,
				topic: firstUser || "(untitled)",
				user: firstUser,
				outcome,
				src: "user",
				ts: now.toISOString()
			})).id;
		} catch (cause) {
			this.ctx?.logger?.warn?.(`[general-memory] episode append failed: ${cause.message}`);
		}
		const gate = await this.queue.canRun(slug, COOLDOWN_MINUTES, now.getTime());
		if (!gate.ok) return {
			...result,
			skipped: gate.reason
		};
		let candidates = extractFromTurn({
			userMessages: input.userMessages,
			now
		});
		if (candidates.length === 0 && this.config.ingest.llmExtract && this.ctx) candidates = await extractWithLlm(this.ctx, input.userMessages.join("\n\n"), () => this.queue.consumeLlm(now.getTime()), input.model);
		if (candidates.length === 0) {
			await this.queue.noteRun(slug, now.getTime());
			return {
				...result,
				skipped: "no-candidate"
			};
		}
		for (const candidate of candidates) {
			const applied = await this.applyCandidate(candidate, project, {
				mode: "live",
				now
			});
			if (applied.outcome === "added") result.added++;
			else if (applied.outcome === "updated") result.updated++;
			else if (applied.outcome === "invalidated") result.invalidated++;
			else if (applied.outcome === "pending") result.pending++;
			else if (applied.outcome === "noop") result.noop++;
			else result.rejected++;
		}
		await this.queue.noteRun(slug, now.getTime());
		return result;
	}
	/**
	* 单个候选落盘。**实时写入与导入共用这一条路径** —— 两套逻辑迟早会分叉出两种记忆质量。
	* 导入时 `approved: true` 跳过 suggest/manual 确认（用户在 dry-run 里已经逐条勾选过）。
	*/
	async applyCandidate(candidate, project, opts = { mode: "live" }) {
		const now = opts.now ?? /* @__PURE__ */ new Date();
		const writesLastHour = opts.mode === "import" ? 0 : await this.queue.writesLastHour(now.getTime());
		const verdict = gateCandidate(candidate, this.config, { writesLastHour });
		if (!verdict.allow) {
			await this.api.writeAudit("deny", {
				kind: candidate.kind,
				title: candidate.title,
				reason: verdict.reason
			});
			return {
				outcome: "rejected",
				reason: verdict.reason
			};
		}
		if (!verdict.longTermAllowed) {
			await this.api.writeAudit("deny", {
				kind: candidate.kind,
				title: candidate.title,
				reason: "untrusted-source-episode-only"
			});
			return {
				outcome: "rejected",
				reason: "untrusted-source-episode-only"
			};
		}
		const scoped = withScope(candidate, project);
		const similar = this.api.search(`${scoped.title} ${scoped.summary}`, {
			kind: scoped.kind,
			limit: 5,
			scope: "all"
		});
		const decision = decide(scoped, similar);
		if (decision.kind === "NOOP") {
			await this.api.writeAudit("write", {
				kind: scoped.kind,
				decision: "NOOP",
				reason: decision.reason,
				target: decision.targetId ?? null
			});
			return {
				outcome: "noop",
				decision,
				reason: decision.reason
			};
		}
		if (!opts.approved && (this.config.ingest.writeMode === "manual" || this.config.ingest.writeMode === "suggest" && !this.config.ingest.autoKinds.includes(scoped.kind))) {
			if (this.config.ingest.writeMode === "manual") {
				await this.api.writeAudit("deny", {
					kind: scoped.kind,
					title: scoped.title,
					reason: "manual-mode"
				});
				return {
					outcome: "rejected",
					decision,
					reason: "manual-mode"
				};
			}
			const item = this.pending.add({
				...scoped,
				pii: verdict.pii,
				shareable: verdict.shareable
			}, decision, project, now.getTime());
			await this.api.writeAudit("write", {
				kind: scoped.kind,
				decision: "PENDING",
				pendingId: item.id,
				reason: decision.reason
			});
			return {
				outcome: "pending",
				decision,
				reason: item.id
			};
		}
		return {
			outcome: await this.execute(decision, scoped, project, verdict.pii),
			decision,
			...decision.targetId ? { entryId: decision.targetId } : {}
		};
	}
	/** 用户批准/拒绝一条待确认写入 */
	async resolvePending(id, action, edited) {
		const item = this.pending.take(id);
		if (!item) return {
			ok: false,
			reason: "expired-or-unknown"
		};
		if (action === "reject") {
			await this.api.writeAudit("write", {
				kind: item.candidate.kind,
				decision: "NOOP",
				reason: "user-rejected",
				pendingId: id
			});
			return { ok: true };
		}
		const candidate = {
			...item.candidate,
			...edited ?? {}
		};
		await this.execute(item.decision, withScope(candidate, item.project), item.project, false);
		await this.api.writeAudit("write", {
			kind: candidate.kind,
			decision: "APPROVED",
			pendingId: id,
			rev: 1
		});
		return { ok: true };
	}
	/** 超时未操作的提议一律静默 NOOP —— 绝不因为用户没点就偷偷写 */
	async sweepPending(now = Date.now()) {
		const expired = this.pending.sweep(now);
		for (const item of expired) await this.api.writeAudit("write", {
			kind: item.candidate.kind,
			decision: "NOOP",
			reason: "suggest-timeout",
			pendingId: item.id
		});
		return expired.length;
	}
	async execute(decision, candidate, project, pii) {
		const scope = candidate.scope ?? "global";
		const base = {
			kind: candidate.kind,
			title: candidate.title,
			summary: candidate.summary,
			body: candidate.body,
			scope,
			...scope === "project" && project ? { project } : {},
			tags: candidate.tags ?? [],
			entities: candidate.entities ?? [],
			activation: candidate.activation ?? "on_demand",
			source: candidate.source,
			...candidate.importedFrom ? { importedFrom: candidate.importedFrom } : {},
			createdBy: candidate.importedFrom ? "import" : "ingest"
		};
		if (decision.kind === "ADD") {
			const entry = await this.api.create(base);
			if (pii) await this.markPii(entry.meta.id);
			await this.api.writeAudit("write", {
				id: entry.meta.id,
				kind: candidate.kind,
				decision: "ADD",
				reason: decision.reason,
				src: candidate.source
			});
			await this.queue.noteWrite();
			return "added";
		}
		if (decision.kind === "UPDATE" && decision.targetId) {
			const entry = await this.api.mergeInto(decision.targetId, {
				title: candidate.title,
				summary: candidate.summary,
				body: candidate.body,
				reason: decision.reason
			});
			if (!entry) return "noop";
			if (pii) await this.markPii(entry.meta.id);
			await this.queue.noteWrite();
			return "updated";
		}
		if (decision.kind === "INVALIDATE" && decision.targetId) {
			const entry = await this.api.create(base);
			if (pii) await this.markPii(entry.meta.id);
			await this.api.invalidate(decision.targetId, {
				reason: decision.reason,
				supersededBy: entry.meta.id
			});
			await this.queue.noteWrite();
			await this.queue.noteWrite();
			return "invalidated";
		}
		return "noop";
	}
	async markPii(id) {
		await this.api.store.patchMeta(id, (meta) => ({
			...meta,
			privacy: {
				...meta.privacy,
				pii: true,
				shareable: "none"
			}
		}));
	}
};
/** 作用域：项目事实/参考落在项目下；画像、偏好、纪律保持全局复用 */
function withScope(candidate, project) {
	const projectish = candidate.kind === "project" || candidate.kind === "reference" || candidate.kind === "procedure";
	return {
		...candidate,
		scope: projectish && project ? "project" : "global"
	};
}

//#endregion
//#region src/host/importers/types.ts
function clip$1(text, max) {
	const single = text.replace(/\s+/g, " ").trim();
	return single.length > max ? `${single.slice(0, max - 1)}…` : single;
}
/** 按二级标题切分 Markdown；没有标题时整篇当一节 */
function splitSections(markdown) {
	const lines = markdown.replace(/\r\n/g, "\n").split("\n");
	const sections = [];
	let current = null;
	for (const line of lines) {
		const heading = /^##\s+(.+?)\s*$/.exec(line);
		if (heading) {
			if (current) sections.push(current);
			current = {
				title: (heading[1] ?? "").trim(),
				body: []
			};
			continue;
		}
		if (current) current.body.push(line);
	}
	if (current) sections.push(current);
	if (sections.length === 0) {
		const body = markdown.trim();
		return body ? [{
			title: "",
			body
		}] : [];
	}
	return sections.map((section) => ({
		title: section.title,
		body: section.body.join("\n").trim()
	})).filter((section) => section.body.length > 0);
}
const FEEDBACK_HINT = /(不要|必须|禁止|别再|别把|always|never|don'?t |must |should not)/i;
const PERSONA_HINT = /(我是|我负责|我主要|我的角色|i'?m a |i am a |my role)/i;
const REFERENCE_HINT = /https?:\/\/|看板|仪表盘|dashboard|oncall|wiki/i;
/**
* 从一段自由文本猜类型。猜测必须保守：拿不准就归 project + on_demand，
* 因为"错标成 always 的纪律"会永久污染每一轮 prompt。
*/
function classify(text) {
	const tags = [];
	if (FEEDBACK_HINT.test(text)) {
		tags.push("rule");
		return {
			kind: "feedback",
			activation: "always",
			tags
		};
	}
	if (PERSONA_HINT.test(text)) {
		tags.push("identity");
		return {
			kind: "persona",
			activation: "on_demand",
			tags
		};
	}
	if (REFERENCE_HINT.test(text)) {
		tags.push("link");
		return {
			kind: "reference",
			activation: "on_demand",
			tags
		};
	}
	return {
		kind: "project",
		activation: "on_demand",
		tags
	};
}
/** 极简 frontmatter 读取（只取字符串/布尔/字符串数组，够用且不引依赖到调用方） */
function readFrontmatter(text) {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
	if (!match) return {
		data: {},
		body: text
	};
	const data = {};
	for (const line of (match[1] ?? "").split("\n")) {
		const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim());
		if (!kv) continue;
		const key = kv[1];
		const raw = (kv[2] ?? "").trim();
		if (raw === "true" || raw === "false") data[key] = raw === "true";
		else if (raw.startsWith("[") && raw.endsWith("]")) data[key] = raw.slice(1, -1).split(",").map((part) => part.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
		else data[key] = raw.replace(/^["']|["']$/g, "");
	}
	return {
		data,
		body: text.slice(match[0].length)
	};
}
/** Claude Code auto memory 的 type 与我们 8 类的一对一映射 */
function mapClaudeType(type) {
	switch (String(type ?? "")) {
		case "user": return "persona";
		case "feedback": return "feedback";
		case "reference": return "reference";
		case "project": return "project";
		default: return "project";
	}
}
function hasPii(text) {
	return /\b1[3-9]\d{9}\b/.test(text) || /\b\d{17}[\dXx]\b/.test(text) || /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/.test(text) || /\b(?:\d[ -]?){13,19}\b/.test(text);
}

//#endregion
//#region src/host/importers/conversation.ts
const MAX_BYTES = 16777216;
/**
* dsh 的会话日志是**多帧** zstd（一帧 header + 每批追加一帧）。
* Node 的 zstdDecompressSync 只解第一帧（实测：concat 两帧只返回第一帧内容），
* 所以必须按 magic 切分逐帧解。
*
* 一个帧内部理论上可能出现伪 magic，因此失败时把切片伸到下一个 magic 重试。
*/
function decompressZstdFrames(buffer) {
	const MAGIC = [
		40,
		181,
		47,
		253
	];
	const starts = [];
	for (let i = 0; i + 4 <= buffer.length; i++) if (buffer[i] === MAGIC[0] && buffer[i + 1] === MAGIC[1] && buffer[i + 2] === MAGIC[2] && buffer[i + 3] === MAGIC[3]) starts.push(i);
	if (starts.length === 0) return buffer.toString("utf8");
	const parts = [];
	let index = 0;
	while (index < starts.length) {
		let done = false;
		for (let span = 1; span <= 3 && index + span <= starts.length; span++) {
			const start = starts[index];
			const end = index + span < starts.length ? starts[index + span] : buffer.length;
			try {
				parts.push(zstdDecompressSync(buffer.subarray(start, end)).toString("utf8"));
				index += span;
				done = true;
				break;
			} catch {}
		}
		if (!done) index++;
	}
	return parts.join("");
}
async function readMaybeZstd(abs) {
	try {
		if ((await stat(abs)).size > MAX_BYTES) return null;
		const buffer = await readFile(abs);
		if (buffer.length >= 4 && buffer[0] === 40 && buffer[1] === 181) return decompressZstdFrames(buffer);
		return buffer.toString("utf8");
	} catch {
		return null;
	}
}
function textOfContent(content) {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	const parts = [];
	for (const block of content) if (typeof block === "string") parts.push(block);
	else if (block && typeof block === "object" && block.type === "text") {
		const text = block.text;
		if (typeof text === "string") parts.push(text);
	}
	return parts.join("\n").trim();
}
/** dsh session.v*.jsonl(.zstd)：按 turn 分组 */
function parseDshSession(text, origin) {
	const turns = [];
	let current = null;
	const flush = () => {
		if (current && (current.userMessages.length > 0 || current.assistantMessages.length > 0)) turns.push(current);
		current = null;
	};
	for (const line of text.split("\n")) {
		if (!line.trim()) continue;
		let event;
		try {
			event = JSON.parse(line);
		} catch {
			continue;
		}
		const type = event.type ?? "";
		if (type === "turn/start") {
			flush();
			current = {
				index: turns.length,
				userMessages: [],
				assistantMessages: [],
				origin
			};
			continue;
		}
		if (type === "turn/end") {
			flush();
			continue;
		}
		if (type === "user/message" || type === "assistant/message") {
			if (!current) current = {
				index: turns.length,
				userMessages: [],
				assistantMessages: [],
				origin
			};
			const message = event.data?.message ?? event.data;
			const textContent = typeof message === "object" && message !== null ? textOfContent(message.content) : "";
			if (!textContent) continue;
			if (type === "user/message") current.userMessages.push(textContent);
			else current.assistantMessages.push(textContent);
		}
	}
	flush();
	return turns;
}
/** Claude Code 会话 jsonl：`{type:'user'|'assistant', message:{role, content}}`，按 user 消息切轮 */
function parseClaudeSession(text, origin) {
	const turns = [];
	let current = null;
	for (const line of text.split("\n")) {
		if (!line.trim()) continue;
		let record;
		try {
			record = JSON.parse(line);
		} catch {
			continue;
		}
		const type = String(record.type ?? "");
		const message = record.message;
		const role = message?.role ?? (type === "user" || type === "assistant" ? type : void 0);
		if (!role || role !== "user" && role !== "assistant") continue;
		const content = textOfContent(message?.content ?? record.content);
		if (!content) continue;
		if (role === "user") {
			if (current && current.userMessages.length > 0) turns.push(current);
			current = {
				index: turns.length,
				userMessages: [],
				assistantMessages: [],
				origin
			};
			current.userMessages.push(content);
		} else {
			if (!current) current = {
				index: turns.length,
				userMessages: [],
				assistantMessages: [],
				origin
			};
			current.assistantMessages.push(content);
		}
	}
	if (current && current.userMessages.length > 0) turns.push(current);
	return turns;
}
/** 通用 jsonl：`{role, content}` 或 `{type, message}` */
function parseGenericJsonl(text, origin) {
	const turns = [];
	let current = null;
	for (const line of text.split("\n")) {
		if (!line.trim()) continue;
		let record;
		try {
			record = JSON.parse(line);
		} catch {
			continue;
		}
		const message = record.message;
		const role = String(record.role ?? message?.role ?? record.type ?? "");
		const content = textOfContent(record.content ?? message?.content ?? record.text);
		if (!content) continue;
		if (role === "user" || role === "human") {
			if (current && current.userMessages.length > 0) turns.push(current);
			current = {
				index: turns.length,
				userMessages: [content],
				assistantMessages: [],
				origin
			};
		} else if (role === "assistant" || role === "ai") {
			if (!current) current = {
				index: turns.length,
				userMessages: [],
				assistantMessages: [],
				origin
			};
			current.assistantMessages.push(content);
		}
	}
	if (current && current.userMessages.length > 0) turns.push(current);
	return turns;
}
/** 导出的 Markdown 对话：按 `## User` / `## Assistant` 切 */
function parseMarkdownConversation(text, origin) {
	const turns = [];
	const blocks = text.split(/^#{1,3}\s*(?:user|human|用户|assistant|ai|助手)\s*$/im);
	const roles = [...text.matchAll(/^#{1,3}\s*(user|human|用户|assistant|ai|助手)\s*$/gim)].map((m) => (m[1] ?? "").toLowerCase());
	let current = null;
	for (let index = 1; index < blocks.length; index++) {
		const role = roles[index - 1] ?? "";
		const body = (blocks[index] ?? "").trim();
		if (!body) continue;
		if (/^(user|human|用户)$/.test(role)) {
			if (current !== null && current.userMessages.length > 0) turns.push(current);
			current = {
				index: turns.length,
				userMessages: [body],
				assistantMessages: [],
				origin
			};
		} else {
			if (current === null) current = {
				index: turns.length,
				userMessages: [],
				assistantMessages: [],
				origin
			};
			current.assistantMessages.push(body);
		}
	}
	if (current !== null && current.userMessages.length > 0) turns.push(current);
	return turns;
}
function candidatesToItems(candidates, origin, source, offset) {
	return candidates.map((candidate, index) => ({
		key: `${source}:${path.basename(origin)}:${offset + index}`,
		source,
		origin,
		kind: candidate.kind,
		title: clip$1(candidate.title, 40),
		summary: clip$1(candidate.summary, 120),
		body: candidate.body,
		entities: candidate.entities ?? [],
		tags: [
			...candidate.tags ?? [],
			"imported",
			"from-conversation"
		],
		confidence: "low",
		activation: candidate.activation ?? "on_demand",
		pii: hasPii(candidate.body)
	}));
}
async function collectSessionFiles(root, pattern, recursive = true) {
	const out = [];
	const walk = async (dir, depth) => {
		if (depth > 3) return;
		let entries;
		try {
			entries = await readdir(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const entry of entries.sort((a, b) => a.name < b.name ? -1 : 1)) {
			const abs = path.join(dir, entry.name);
			if (entry.isDirectory() && recursive) await walk(abs, depth + 1);
			else if (entry.isFile() && pattern(entry.name)) out.push(abs);
		}
	};
	await walk(root, 0);
	return out;
}
function mineTurns(turns, options) {
	const maxTurns = options.maxTurns ?? 200;
	const items = [];
	for (const turn of turns.slice(0, maxTurns)) {
		if (items.length >= options.limit) break;
		const candidates = extractFromTurn({ userMessages: turn.userMessages });
		items.push(...candidatesToItems(candidates, turn.origin, "dsh-sessions", items.length));
	}
	return items.slice(0, options.limit);
}
const dshSessions = {
	id: "dsh-sessions",
	label: "dsh 历史会话（session.v4.jsonl.zstd）",
	kind: "conversation",
	async detect() {
		const root = path.join(homedir(), ".dsh", "sessions");
		return (await collectSessionFiles(root, (name) => name.toLowerCase().startsWith("session") && (hasExtension(name, ".zstd") || hasExtension(name, ".jsonl")))).length > 0 ? [root] : [];
	},
	async scan(_cwd, options) {
		const files = await collectSessionFiles(path.join(homedir(), ".dsh", "sessions"), (name) => name.toLowerCase().startsWith("session") && (hasExtension(name, ".zstd") || hasExtension(name, ".jsonl")));
		const items = [];
		const skipped = [];
		for (const abs of files) {
			if (items.length >= options.limit) break;
			const text = await readMaybeZstd(abs);
			if (!text) {
				skipped.push({
					origin: abs,
					reason: "unreadable"
				});
				continue;
			}
			const mined = mineTurns(parseDshSession(text, abs), {
				...options,
				limit: options.limit - items.length,
				maxTurns: options.maxTurns
			});
			for (const entry of mined) items.push({
				...entry,
				key: `dsh-sessions:${path.basename(path.dirname(abs))}:${items.length}`
			});
		}
		return {
			items,
			skipped
		};
	}
};
const claudeSessions = {
	id: "claude-code-sessions",
	label: "Claude Code 历史会话（jsonl）",
	kind: "conversation",
	async detect() {
		const root = path.join(homedir(), ".claude", "projects");
		return (await collectSessionFiles(root, (name) => hasExtension(name, ".jsonl"))).length > 0 ? [root] : [];
	},
	async scan(_cwd, options) {
		const files = await collectSessionFiles(path.join(homedir(), ".claude", "projects"), (name) => hasExtension(name, ".jsonl"));
		const items = [];
		const skipped = [];
		for (const abs of files) {
			if (items.length >= options.limit) break;
			const text = await readMaybeZstd(abs);
			if (!text) {
				skipped.push({
					origin: abs,
					reason: "unreadable"
				});
				continue;
			}
			const turns = parseClaudeSession(text, abs);
			for (const entry of mineTurns(turns, {
				...options,
				limit: options.limit - items.length,
				maxTurns: options.maxTurns
			})) items.push({
				...entry,
				source: "claude-code-sessions",
				key: `claude-code-sessions:${path.basename(abs)}:${items.length}`
			});
		}
		return {
			items,
			skipped
		};
	}
};
const genericConversation = (id, label) => ({
	id,
	label,
	kind: "conversation",
	async detect() {
		return [];
	},
	async scan(_cwd, options) {
		if (!options.path) return {
			items: [],
			skipped: [{
				origin: "(none)",
				reason: "需要指定 path"
			}]
		};
		const abs = path.resolve(expandUserPath(options.path));
		const text = await readMaybeZstd(abs);
		if (!text) return {
			items: [],
			skipped: [{
				origin: abs,
				reason: "unreadable"
			}]
		};
		const isJsonl = hasExtension(abs, ".jsonl") || hasExtension(abs, ".json");
		return {
			items: mineTurns(id === "generic-jsonl" || isJsonl ? parseGenericJsonl(text, abs) : parseMarkdownConversation(text, abs), options).map((entry, index) => ({
				...entry,
				source: id,
				key: `${id}:${path.basename(abs)}:${index}`
			})),
			skipped: []
		};
	}
});
const CONVERSATION_SOURCES = [
	dshSessions,
	claudeSessions,
	genericConversation("generic-jsonl", "通用 jsonl 对话"),
	genericConversation("generic-markdown", "导出的 Markdown 对话")
];

//#endregion
//#region src/host/importers/memory.ts
const HOME = () => homedir();
async function exists(target) {
	try {
		await stat(target);
		return true;
	} catch {
		return false;
	}
}
async function isDir(target) {
	try {
		return (await stat(target)).isDirectory();
	} catch {
		return false;
	}
}
async function listFiles(dir, exts, recursive = false, depth = 0) {
	if (depth > 3 || !await isDir(dir)) return [];
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return [];
	}
	const out = [];
	for (const entry of entries.sort((a, b) => a.name < b.name ? -1 : 1)) {
		const abs = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (recursive) out.push(...await listFiles(abs, exts, true, depth + 1));
			continue;
		}
		if (exts.some((ext) => hasExtension(entry.name, ext))) out.push(abs);
	}
	return out;
}
/** 去掉 Markdown 扩展名（大小写不敏感）用于标题兜底。 */
function baseNoExt(abs) {
	const name = path.basename(abs);
	return name.toLowerCase().endsWith(".md") ? name.slice(0, -3) : name;
}
async function readText(abs) {
	try {
		return await readFile(abs, "utf8");
	} catch {
		return null;
	}
}
function keyOf(source, origin, index) {
	return `${source}:${path.basename(origin)}:${index}`;
}
function item(input) {
	return {
		key: keyOf(input.source, input.origin, input.index),
		source: input.source,
		origin: input.origin,
		kind: input.kind,
		title: clip$1(input.title || "(untitled)", 40),
		summary: clip$1(input.summary || input.body, 120),
		body: input.body.trim(),
		entities: input.entities ?? [],
		tags: input.tags ?? [],
		confidence: input.confidence ?? "medium",
		activation: input.activation,
		pii: hasPii(input.body)
	};
}
/** 一个 Markdown 文件 → 若干条目（按二级标题切分，每节独立成条） */
function fromMarkdownFile(source, origin, text, defaults = {}) {
	const sections = splitSections(text);
	const out = [];
	sections.forEach((section, index) => {
		const guess = classify(`${section.title}\n${section.body}`);
		out.push(item({
			source,
			origin,
			index,
			title: section.title || clip$1(section.body, 40),
			summary: clip$1(section.body, 120),
			body: section.body,
			kind: defaults.kind ?? guess.kind,
			activation: defaults.activation ?? guess.activation,
			tags: [...defaults.tags ?? [], ...guess.tags]
		}));
	});
	return out;
}
const claudeCodeMemory = {
	id: "claude-code-memory",
	label: "Claude Code auto memory",
	kind: "memory",
	async detect() {
		return (await listUserProjectDirs("memory")).filter(Boolean);
	},
	async scan(_cwd, options) {
		const items = [];
		const skipped = [];
		for (const dir of await listUserProjectDirs("memory")) for (const abs of await listFiles(dir, [".md"])) {
			if (path.basename(abs).toLowerCase() === "memory.md") continue;
			if (items.length >= options.limit) break;
			const text = await readText(abs);
			if (!text) continue;
			const { data, body } = readFrontmatter(text);
			if (!body.trim()) {
				skipped.push({
					origin: abs,
					reason: "empty"
				});
				continue;
			}
			const kind = mapClaudeType(data.type);
			items.push(item({
				source: "claude-code-memory",
				origin: abs,
				index: 0,
				title: String(data.name ?? baseNoExt(abs)),
				summary: String(data.description ?? body),
				body,
				kind,
				activation: kind === "feedback" ? "always" : "on_demand",
				tags: ["imported", "claude-code"],
				confidence: "medium"
			}));
		}
		return {
			items,
			skipped
		};
	}
};
async function listUserProjectDirs(sub) {
	const root = path.join(HOME(), ".claude", "projects");
	if (!await isDir(root)) return [];
	const dirs = [];
	try {
		for (const entry of await readdir(root, { withFileTypes: true })) {
			if (!entry.isDirectory()) continue;
			const candidate = path.join(root, entry.name, sub);
			if (await isDir(candidate)) dirs.push(candidate);
		}
	} catch {
		return [];
	}
	return dirs;
}
function instructionSource(id, label, candidates, tags) {
	return {
		id,
		label,
		kind: "memory",
		async detect(cwd) {
			const found = [];
			for (const candidate of candidates(cwd)) if (await exists(candidate)) found.push(candidate);
			return found;
		},
		async scan(cwd, options) {
			const items = [];
			const skipped = [];
			for (const abs of candidates(cwd)) {
				const text = await readText(abs);
				if (!text) continue;
				const parsed = fromMarkdownFile(id, abs, text, { tags: ["imported", ...tags] });
				for (const entry of parsed) {
					if (items.length >= options.limit) break;
					items.push(entry);
				}
			}
			return {
				items,
				skipped
			};
		}
	};
}
const claudeMd = instructionSource("claude-md", "CLAUDE.md", (cwd) => [
	path.join(HOME(), ".claude", "CLAUDE.md"),
	path.join(cwd, "CLAUDE.md"),
	path.join(cwd, ".claude", "CLAUDE.md")
], ["claude-code"]);
const agentsMd = instructionSource("agents-md", "AGENTS.md", (cwd) => [
	path.join(HOME(), ".agents", "AGENTS.md"),
	path.join(cwd, "AGENTS.md"),
	path.join(cwd, "AGENTS.local.md")
], ["agents-md"]);
const cursorRules = {
	id: "cursor-rules",
	label: "Cursor rules (.cursor/rules)",
	kind: "memory",
	async detect(cwd) {
		return await exists(path.join(cwd, ".cursor", "rules")) ? [path.join(cwd, ".cursor", "rules")] : [];
	},
	async scan(cwd, options) {
		const items = [];
		const skipped = [];
		for (const abs of await listFiles(path.join(cwd, ".cursor", "rules"), [".mdc", ".md"])) {
			if (items.length >= options.limit) break;
			const text = await readText(abs);
			if (!text) continue;
			const { data, body } = readFrontmatter(text);
			if (!body.trim()) {
				skipped.push({
					origin: abs,
					reason: "empty"
				});
				continue;
			}
			const globs = Array.isArray(data.globs) ? data.globs.map(String) : data.globs ? [String(data.globs)] : [];
			const activation = data.alwaysApply === true || data.alwaysApply === "true" ? "always" : globs.length > 0 ? "glob" : "on_demand";
			const kind = classify(`${body}`).kind;
			items.push(item({
				source: "cursor-rules",
				origin: abs,
				index: 0,
				title: String(data.description ?? path.basename(abs).replace(/\.(mdc|md)$/, "")),
				summary: String(data.description ?? body),
				body,
				kind,
				activation,
				tags: [
					"imported",
					"cursor",
					...globs.length > 0 ? ["glob"] : []
				]
			}));
		}
		return {
			items,
			skipped
		};
	}
};
const windsurfRules = {
	id: "windsurf-rules",
	label: "Windsurf rules",
	kind: "memory",
	async detect(cwd) {
		const found = [];
		for (const candidate of [
			path.join(HOME(), ".codeium", "windsurf", "memories", "global_rules.md"),
			path.join(cwd, ".windsurf", "rules"),
			path.join(cwd, ".windsurfrules")
		]) if (await exists(candidate)) found.push(candidate);
		return found;
	},
	async scan(cwd, options) {
		const items = [];
		const skipped = [];
		const files = [
			path.join(HOME(), ".codeium", "windsurf", "memories", "global_rules.md"),
			...await listFiles(path.join(cwd, ".windsurf", "rules"), [".md"]),
			path.join(cwd, ".windsurfrules")
		];
		for (const abs of files) {
			if (items.length >= options.limit) break;
			const text = await readText(abs);
			if (!text) continue;
			const { data, body } = readFrontmatter(text);
			if (!body.trim()) {
				skipped.push({
					origin: abs,
					reason: "empty"
				});
				continue;
			}
			const trigger = String(data.trigger ?? "");
			const activation = trigger === "always_on" ? "always" : trigger === "manual" ? "manual" : "on_demand";
			const kind = classify(body).kind;
			items.push(item({
				source: "windsurf-rules",
				origin: abs,
				index: 0,
				title: String(data.description ?? path.basename(abs).replace(/\.md$/, "")),
				summary: String(data.description ?? body),
				body,
				kind,
				activation,
				tags: ["imported", "windsurf"]
			}));
		}
		return {
			items,
			skipped
		};
	}
};
const clineMemoryBank = {
	id: "cline-memory-bank",
	label: "Cline memory bank",
	kind: "memory",
	async detect(cwd) {
		return await exists(path.join(cwd, "memory-bank")) ? [path.join(cwd, "memory-bank")] : [];
	},
	async scan(cwd, options) {
		const items = [];
		const skipped = [];
		for (const abs of await listFiles(path.join(cwd, "memory-bank"), [".md"])) {
			if (items.length >= options.limit) break;
			const text = await readText(abs);
			if (!text?.trim()) {
				skipped.push({
					origin: abs,
					reason: "empty"
				});
				continue;
			}
			const name = path.basename(abs, ".md");
			items.push(item({
				source: "cline-memory-bank",
				origin: abs,
				index: 0,
				title: name,
				summary: clip$1(text, 120),
				body: text,
				kind: "project",
				activation: "on_demand",
				tags: [
					"imported",
					"cline",
					name
				],
				confidence: name === "activeContext" ? "low" : "medium"
			}));
		}
		return {
			items,
			skipped
		};
	}
};
const copilotInstructions = {
	id: "copilot-instructions",
	label: "GitHub Copilot instructions",
	kind: "memory",
	async detect(cwd) {
		const found = [];
		for (const candidate of [path.join(cwd, ".github", "copilot-instructions.md"), path.join(cwd, ".github", "instructions")]) if (await exists(candidate)) found.push(candidate);
		return found;
	},
	async scan(cwd, options) {
		const items = [];
		const skipped = [];
		const files = [path.join(cwd, ".github", "copilot-instructions.md"), ...await listFiles(path.join(cwd, ".github", "instructions"), [".instructions.md", ".md"])];
		for (const abs of files) {
			if (items.length >= options.limit) break;
			const text = await readText(abs);
			if (!text?.trim()) continue;
			const { data, body } = readFrontmatter(text);
			const applyTo = data.applyTo ? [String(data.applyTo)] : [];
			items.push(item({
				source: "copilot-instructions",
				origin: abs,
				index: 0,
				title: String(data.description ?? path.basename(abs).replace(/\.instructions\.md$|\.md$/, "")),
				summary: clip$1(body, 120),
				body,
				kind: classify(body).kind,
				activation: applyTo.length > 0 ? "glob" : "always",
				tags: [
					"imported",
					"copilot",
					...applyTo
				]
			}));
		}
		return {
			items,
			skipped
		};
	}
};
const geminiMd = instructionSource("gemini-md", "GEMINI.md", (cwd) => [path.join(HOME(), ".gemini", "GEMINI.md"), path.join(cwd, "GEMINI.md")], ["gemini"]);
const dshAutoMemory = {
	id: "dsh-auto-memory",
	label: "第三方前作 dsh-auto-memory",
	kind: "memory",
	async detect(cwd) {
		const found = [];
		for (const candidate of [
			path.join(HOME(), ".dsh", "memory", "MEMORY.md"),
			path.join(cwd, ".dsh-memory", "MEMORY.md"),
			path.join(cwd, ".dsh-memory")
		]) if (await exists(candidate)) found.push(candidate);
		return found;
	},
	async scan(cwd, options) {
		const items = [];
		const skipped = [];
		const files = [
			path.join(HOME(), ".dsh", "memory", "MEMORY.md"),
			path.join(cwd, ".dsh-memory", "MEMORY.md"),
			...await listFiles(path.join(cwd, ".dsh-memory"), [".md"], true)
		];
		for (const abs of files) {
			if (items.length >= options.limit) break;
			const text = await readText(abs);
			if (!text?.trim()) continue;
			const cleaned = text.replace(/<!--\s*memory:[^>]+-->/g, "");
			for (const entry of fromMarkdownFile("dsh-auto-memory", abs, cleaned, { tags: ["imported", "predecessor"] })) {
				if (items.length >= options.limit) break;
				items.push(entry);
			}
		}
		return {
			items,
			skipped
		};
	}
};
const genericDir = {
	id: "generic-dir",
	label: "任意 Markdown 目录",
	kind: "memory",
	async detect() {
		return [];
	},
	async scan(_cwd, options) {
		if (!options.path) return {
			items: [],
			skipped: [{
				origin: "(none)",
				reason: "需要指定 path"
			}]
		};
		const root = path.resolve(expandUserPath(options.path));
		const items = [];
		const skipped = [];
		for (const abs of await listFiles(root, [
			".md",
			".markdown",
			".txt"
		], true)) {
			if (items.length >= options.limit) break;
			const text = await readText(abs);
			if (!text?.trim()) {
				skipped.push({
					origin: abs,
					reason: "empty"
				});
				continue;
			}
			const parsed = fromMarkdownFile("generic-dir", abs, text, { tags: ["imported"] });
			for (const entry of parsed) {
				if (items.length >= options.limit) break;
				items.push(entry);
			}
		}
		return {
			items,
			skipped
		};
	}
};
const MEMORY_SOURCES = [
	claudeCodeMemory,
	claudeMd,
	agentsMd,
	cursorRules,
	windsurfRules,
	clineMemoryBank,
	copilotInstructions,
	geminiMd,
	dshAutoMemory,
	genericDir
];

//#endregion
//#region src/host/importers/index.ts
const ALL_SOURCES = [...MEMORY_SOURCES, ...CONVERSATION_SOURCES];
/**
* 导入服务：扫描 → dry-run 预检 → 用户勾选 → 落盘。
*
* 两条铁律：
* 1. **绝不"一键导入然后祈祷"** —— 必须给出可核对的预检报告（新增/合并/已有/PII/预算影响）
* 2. 落盘前**先做快照**（导入是批量操作，必须可回滚）
*/
var ImportService = class {
	api;
	ingestor;
	config;
	scans = /* @__PURE__ */ new Map();
	constructor(api, ingestor, config) {
		this.api = api;
		this.ingestor = ingestor;
		this.config = config;
	}
	/** 列出全部来源与检测结果（面板的来源卡片） */
	async sources(cwd = process.cwd()) {
		const out = [];
		for (const source of ALL_SOURCES) {
			let detected = [];
			try {
				detected = await source.detect(cwd);
			} catch {
				detected = [];
			}
			out.push({
				id: source.id,
				label: source.label,
				kind: source.kind,
				detected
			});
		}
		return out;
	}
	async scan(sourceId, opts = {}) {
		const source = ALL_SOURCES.find((candidate) => candidate.id === sourceId);
		if (!source) throw new Error(`unknown import source: ${sourceId}`);
		const limit = Math.min(Math.max(opts.limit ?? 200, 1), 500);
		const { items, skipped } = await source.scan(opts.cwd ?? process.cwd(), {
			limit,
			...opts.path ? { path: opts.path } : {},
			...opts.maxTurns ? { maxTurns: opts.maxTurns } : {}
		});
		let added = 0;
		let merged = 0;
		let duplicate = 0;
		let pii = 0;
		for (const item of items) {
			if (item.pii) pii++;
			const best = this.api.search(`${item.title} ${item.summary}`, {
				kind: item.kind,
				limit: 1,
				scope: "all"
			})[0];
			if (best && best.parts.relevance >= .5) {
				item.duplicateOf = best.entry.meta.id;
				if (best.parts.relevance >= .9) duplicate++;
				else merged++;
			} else added++;
		}
		const scanId = `s_${ulid().slice(2)}`;
		this.scans.set(scanId, {
			source: sourceId,
			items
		});
		while (this.scans.size > 10) {
			const oldest = this.scans.keys().next().value;
			if (oldest === void 0) break;
			this.scans.delete(oldest);
		}
		return {
			scanId,
			source: sourceId,
			label: source.label,
			detected: items.length > 0,
			scannedPaths: [...new Set(items.map((item) => item.origin))],
			items,
			skipped,
			estimate: {
				added,
				merged,
				duplicate,
				pii
			}
		};
	}
	async apply(scanId, keys, project) {
		const scan = this.scans.get(scanId);
		if (!scan) throw new Error("scan expired — please scan again");
		const selected = scan.items.filter((item) => keys.includes(item.key));
		if (selected.length === 0) throw new Error("nothing selected");
		const snapshot = await createSnapshot(this.api.root, "import");
		const report = {
			scanId,
			source: scan.source,
			added: 0,
			updated: 0,
			invalidated: 0,
			noop: 0,
			rejected: 0,
			snapshot: snapshot.label,
			details: []
		};
		for (const item of selected) {
			const candidate = toCandidate(item);
			const result = await this.ingestor.applyCandidate(candidate, project, {
				mode: "import",
				approved: true
			});
			if (result.outcome === "added") report.added++;
			else if (result.outcome === "updated") report.updated++;
			else if (result.outcome === "invalidated") report.invalidated++;
			else if (result.outcome === "noop") report.noop++;
			else if (result.outcome === "pending") report.added++;
			else report.rejected++;
			report.details.push({
				key: item.key,
				title: item.title,
				outcome: result.outcome,
				...result.reason ? { reason: result.reason } : {}
			});
		}
		await this.api.writeAudit("import", {
			source: scan.source,
			added: report.added,
			updated: report.updated,
			invalidated: report.invalidated,
			noop: report.noop,
			rejected: report.rejected,
			snapshot: snapshot.label
		});
		this.scans.delete(scanId);
		return report;
	}
	/** 供面板展示：一次导入会影响常驻层的多少字符 */
	budgetImpact(items, alwaysChars) {
		let used = 0;
		let count = 0;
		for (const item of items) {
			if (item.activation !== "always") continue;
			count++;
			used += item.title.length + item.summary.length + 4;
		}
		return {
			alwaysEntries: count,
			alwaysChars: used,
			overBudget: used > alwaysChars
		};
	}
	get configSnapshot() {
		return this.config;
	}
};
function toCandidate(item) {
	return {
		kind: item.kind,
		title: item.title,
		summary: item.summary,
		body: item.body,
		entities: item.entities,
		tags: item.tags,
		activation: item.activation,
		source: "imported",
		confidence: item.confidence,
		evidence: item.body.slice(0, 80),
		reason: `imported from ${item.source}`,
		importedFrom: item.origin
	};
}

//#endregion
//#region src/host/recall.ts
const CATALOG_HEADING = "[记忆目录] 用 memory_recall 检索、memory_read 读全文。目录不完整，\"+N more\" 表示还有。";
const NOT_READY = "[记忆] 索引构建中，本轮不提供目录。需要历史上下文时用 memory_recall 检索。";
function isActive(entry) {
	return entry.meta.temporal.invalidatedAt === null;
}
function byRank$1(a, b) {
	const heat = b.meta.stats.heat - a.meta.stats.heat;
	if (heat !== 0) return heat;
	return a.meta.id < b.meta.id ? -1 : a.meta.id > b.meta.id ? 1 : 0;
}
/**
* 常驻层：activation=always 的 persona/feedback/preference。
* 走 ctx.systemPrompt.context()（cache-safe），**不走 section()**——后者改动会触发
* system prompt 面替换，直接击穿 DeepSeek 前缀缓存。
*/
function renderAlwaysLayer(entries, maxChars) {
	const groups = [
		["协作纪律", pick(entries, "feedback")],
		["关于用户", pick(entries, "persona")],
		["偏好", pick(entries, "preference")]
	];
	const lines = ["## 记忆（长期）"];
	let used = lines[0].length + 1;
	let truncated = 0;
	for (const [title, list] of groups) {
		if (list.length === 0) continue;
		const heading = `### ${title}`;
		if (used + heading.length + 1 > maxChars) break;
		lines.push(heading);
		used += heading.length + 1;
		for (const entry of list) {
			const line = `- ${entry.meta.title} — ${entry.meta.summary}`;
			if (used + line.length + 1 > maxChars) {
				truncated++;
				continue;
			}
			lines.push(line);
			used += line.length + 1;
		}
	}
	if (truncated > 0) lines.push(`（另有 ${truncated} 条常驻记忆超出预算，见 memory_status）`);
	if (lines.length === 1) return "";
	return `${lines.join("\n")}\n`;
}
function pick(entries, kind) {
	return entries.filter((e) => isActive(e) && e.meta.kind === kind && e.meta.activation === "always").sort(byRank$1);
}
/**
* 目录层（L0 catalog）：只有 title + summary + id，**不含正文**。
*
* 它的作用不是「把记忆塞进上下文」，而是让模型知道自己知道什么，从而主动去调
* memory_recall / memory_read。这是 Claude Code auto memory 的做法，也是 Anthropic
* memory tool「不提供 ranked retrieval、路径即检索键」这个设计能成立的前提。
*
* 带上 id 是刻意的：模型可以直接 memory_read，省掉一次 recall 往返。
*/
function renderCatalogLayer(entries, maxChars, project) {
	const pool = entries.filter((e) => isActive(e) && e.meta.activation !== "manual").filter((e) => e.meta.scope === "global" || project !== void 0 && e.meta.project === project).sort((a, b) => {
		const ka = KIND_ORDER.indexOf(a.meta.kind);
		const kb = KIND_ORDER.indexOf(b.meta.kind);
		if (ka !== kb) return ka - kb;
		return byRank$1(a, b);
	});
	const counts = /* @__PURE__ */ new Map();
	for (const entry of pool) counts.set(entry.meta.kind, (counts.get(entry.meta.kind) ?? 0) + 1);
	const heading = `${CATALOG_HEADING}\n${[...counts.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, n]) => `${k}:${n}`).join(" ")}`;
	const rows = [];
	let used = heading.length + 1;
	for (const entry of pool) {
		const row = `- ${entry.meta.title} — ${entry.meta.summary} [${entry.meta.kind}·${entry.meta.confidence}] ${entry.meta.id}`;
		if (used + row.length + 1 > maxChars) break;
		rows.push(row);
		used += row.length + 1;
	}
	const shown = rows.length;
	const omitted = pool.length - shown;
	if (omitted > 0) rows.push(`+${omitted} more via memory_recall`);
	if (shown === 0) return {
		text: "",
		shown: 0,
		omitted: pool.length
	};
	return {
		text: `${heading}\n${rows.join("\n")}\n`,
		shown,
		omitted
	};
}
function renderGlobLayer(entries, maxChars) {
	if (entries.length === 0) return "";
	const lines = ["[与当前文件相关的记忆]"];
	let used = lines[0].length + 1;
	for (const entry of entries.sort(byRank$1)) {
		const line = `- ${entry.meta.title} — ${entry.meta.summary} ${entry.meta.id}`;
		if (used + line.length + 1 > maxChars) break;
		lines.push(line);
		used += line.length + 1;
	}
	return lines.length > 1 ? `${lines.join("\n")}\n` : "";
}
/**
* 渲染一次完整快照。**必须是纯函数**：不含时间戳、随机数、会话 id、相对时间，
* 排序全部确定性。任何非确定性都会让前缀缓存失效（前作曾因此发过 urgent 升级公告）。
*/
function renderSnapshot(input) {
	if (!input.ready) return finish(NOT_READY, input.mode, {
		always: 0,
		catalog: 0,
		glob: 0
	}, 0, 0);
	const always = renderAlwaysLayer(input.entries, input.budget.alwaysChars);
	const catalog = input.mode === "slim" ? {
		text: "",
		shown: 0,
		omitted: 0
	} : renderCatalogLayer(input.entries, input.budget.catalogChars, input.project);
	const glob = renderGlobLayer(input.globMatches ?? [], input.budget.globChars);
	const parts = [
		always,
		catalog.text,
		glob
	].filter((p) => p.length > 0);
	return finish(parts.length > 0 ? parts.join("\n") : "", input.mode, {
		always: always.length,
		catalog: catalog.text.length,
		glob: glob.length
	}, catalog.shown, catalog.omitted);
}
function finish(text, mode, chars, shown, omitted) {
	return {
		text,
		fingerprint: fingerprintOf(text, mode),
		mode,
		chars: {
			...chars,
			total: text.length
		},
		tokens: estimateTokens(text),
		shown,
		omitted
	};
}
function fingerprintOf(text, mode) {
	return `${mode}:${createHash("sha256").update(text, "utf8").digest("hex").slice(0, 16)}`;
}
/**
* 逐字节幂等缓存（原则 P4）。
*
* 给定相同指纹，返回**上一次定稿的同一字符串实例**——不是重新渲染出的等值字符串。
* 这保证注入到请求前缀的字节完全一致，DeepSeek 前缀缓存才能命中。
*/
var SnapshotCache = class {
	last = /* @__PURE__ */ new Map();
	get(sessionKey, candidate) {
		const prev = this.last.get(sessionKey);
		if (prev && prev.fingerprint === candidate.fingerprint) return prev.result;
		this.last.set(sessionKey, {
			fingerprint: candidate.fingerprint,
			result: candidate
		});
		return candidate;
	}
	/** 命中缓存（= 原样复读）返回 true，用于 verbatimRate 遥测 */
	wasVerbatim(sessionKey, fingerprint) {
		return this.last.get(sessionKey)?.fingerprint === fingerprint;
	}
	drop(sessionKey) {
		this.last.delete(sessionKey);
	}
	clear() {
		this.last.clear();
	}
};
/**
* 分层节流（docs/04 §6）。计数器**不进指纹**——否则每个请求都不同，永远无法复读。
* 只有派生出的 mode 进指纹，而 mode 只在跨过阈值时才翻转。
*/
var Throttle = class {
	fullEvery;
	slimEvery;
	sinceFull = Number.MAX_SAFE_INTEGER;
	sinceAny = Number.MAX_SAFE_INTEGER;
	constructor(fullEvery, slimEvery) {
		this.fullEvery = fullEvery;
		this.slimEvery = slimEvery;
	}
	next(opts) {
		if (!opts.ready) return "cold";
		this.sinceFull++;
		this.sinceAny++;
		if (opts.humanPresent) {
			this.sinceFull = 0;
			this.sinceAny = 0;
			return "human";
		}
		if (this.sinceFull >= this.fullEvery) {
			this.sinceFull = 0;
			this.sinceAny = 0;
			return "full";
		}
		if (this.sinceAny < this.slimEvery) return "slim";
		this.sinceAny = 0;
		return "full";
	}
	/** 会话切换或 compaction 后强制下一次给完整版 */
	reset() {
		this.sinceFull = Number.MAX_SAFE_INTEGER;
		this.sinceAny = Number.MAX_SAFE_INTEGER;
	}
};

//#endregion
//#region src/host/adapters/inject.ts
/**
* 注入管线。两条通道，刻意分开：
*
* 1. 常驻层 → `ctx.systemPrompt.context()`。**不用 `section()`**：section 改动会触发
*    system prompt 面替换，直接击穿 DeepSeek 前缀缓存；context 是 cache-safe 的，
*    仅在内容变化或 compaction 移除后追加一条 durable 快照。
* 2. 目录层 → `agent/pre-step` waterfall 改写 messages。**不落盘为新 session 事件**，
*    所以不会膨胀会话日志。
*
* ⚠️ `turn/*`、`compaction/*` 是持久化 session 事件类型，不是同名 Cordis 事件，
* 必须监听 `session/event` 再判 `event.type`。
*/
function registerInjection(ctx, api, config) {
	if (!config.inject.enabled) return () => {};
	const disposers = [];
	let alwaysText = "";
	let alwaysDispose = null;
	/** 每个会话的目录层文本；由 pre-step 计算，由动态 context 读取 */
	const catalogBySession = /* @__PURE__ */ new Map();
	let systemPrompt;
	const syncAlwaysLayer = () => {
		if (!systemPrompt?.context) return;
		const next = renderAlwaysLayer(api.list(), config.budget.alwaysChars);
		if (next === alwaysText) return;
		alwaysDispose?.();
		alwaysText = next;
		if (alwaysText.length === 0) {
			alwaysDispose = null;
			return;
		}
		alwaysDispose = systemPrompt.context({
			name: "general-memory",
			order: systemPrompt.getContextOrder?.("runtime-context") ?? 900,
			text: alwaysText,
			required: false
		});
	};
	ctx.inject(["systemPrompt"], (scoped) => {
		systemPrompt = scoped.get("systemPrompt");
		systemPrompt?.context({
			name: "general-memory-catalog",
			order: 901,
			text: (context) => catalogBySession.get(agentSessionKey(context?.agent)) ?? "",
			required: false
		});
		syncAlwaysLayer();
	});
	const humanPending = /* @__PURE__ */ new Set();
	/** 最近被工具触碰过的文件路径，按会话保留最近 20 个，用于 activation=glob 匹配 */
	const touched = /* @__PURE__ */ new Map();
	if (typeof ctx.on === "function") disposers.push(ctx.on("session/event", ((session, event) => {
		const key = sessionKeyOf(session);
		if (event?.type === "user/message" && isUserMessage(event)) humanPending.add(key);
		if (event?.type === "compaction/start" || event?.type === "compaction/end") api.throttles.get(key)?.reset();
		if (event?.type === "turn/end") api.flushHits();
		if (event?.type === "tool/call") {
			const paths = extractTouchedPaths(event);
			if (paths.length > 0) touched.set(key, [...touched.get(key) ?? [], ...paths].slice(-20));
		}
	})));
	if (typeof ctx.on === "function") disposers.push(ctx.on("agent/pre-step", (async (...args) => {
		const incoming = args[0];
		const next = args[1];
		const decision = typeof next === "function" ? await next() : incoming;
		if (!decision || typeof decision !== "object") return decision;
		const messages = decision.messages;
		if (!Array.isArray(messages)) return decision;
		const payload = incoming ?? decision;
		const key = agentSessionKey(payload.agent);
		const humanPresent = humanPending.has(key);
		humanPending.delete(key);
		const mode = api.throttleFor(key).next({
			ready: api.ready,
			humanPresent
		});
		const globMatches = globMatchesFor(api, payload, touched.get(key) ?? []);
		const snapshot = api.snapshotFor(key, {
			mode,
			project: projectOf(payload),
			globMatches
		});
		const catalog = snapshot.chars.always > 0 ? snapshot.text.slice(snapshot.chars.always).replace(/^\n+/, "") : snapshot.text;
		if (catalog.length > 0) catalogBySession.set(key, catalog);
		else catalogBySession.delete(key);
		const total = measureTotal(ctx, payload);
		if (total > 0) api.setRequestShare(snapshot.tokens / total);
		return decision;
	})));
	disposers.push(api.onChange(syncAlwaysLayer));
	return () => {
		for (const dispose of disposers) dispose();
		alwaysDispose?.();
	};
}
function isUserMessage(event) {
	return (event.data?.source)?.kind === "user";
}
function sessionKeyOf(session) {
	if (typeof session === "string") return session;
	if (session && typeof session === "object") {
		const candidate = session.id;
		if (typeof candidate === "string") return candidate;
	}
	return "default";
}
/** pre-step 的 payload 带 agent，不是 session；两者用同一个 session id 关联 */
function agentSessionKey(agent) {
	if (agent && typeof agent === "object") {
		const session = agent.session;
		if (session && typeof session === "object") {
			const id = session.id;
			if (typeof id === "string") return id;
		}
		const id = agent.id;
		if (typeof id === "string") return id;
	}
	return "default";
}
/** 会话 cwd → 项目 slug，用于把 project 作用域的记忆纳入目录层 */
function projectOf(decision) {
	const cwd = cwdOf(decision);
	return cwd ? projectSlug(cwd) : void 0;
}
function cwdOf(decision) {
	const candidates = [
		decision?.session?.cwd,
		decision?.cwd,
		decision?.agent?.cwd,
		decision?.agent?.session?.cwd,
		decision?.agent?.session?.header?.cwd,
		decision?.agent?.options?.cwd
	];
	for (const candidate of candidates) if (typeof candidate === "string" && candidate.startsWith("/")) return candidate;
}
/**
* glob 命中的条目（activation=glob）。
* 匹配面 = 会话 cwd + 最近被工具触碰过的文件路径。路径来自 tool/call 事件，
* 提取不到就没有 glob 注入 —— fail-safe，宁可少注入也不注入无关内容。
*/
function globMatchesFor(api, decision, touched) {
	const cwd = cwdOf(decision);
	const surfaces = cwd ? [cwd, ...touched] : touched;
	if (surfaces.length === 0) return [];
	const out = [];
	for (const entry of api.list()) {
		if (entry.meta.activation !== "glob" || entry.meta.temporal.invalidatedAt !== null) continue;
		if (entry.meta.globs.some((pattern) => surfaces.some((surface) => matchGlob(pattern, surface, cwd)))) out.push(entry);
	}
	return out;
}
/** Windows 上工具路径是反斜杠：glob 匹配前统一成 POSIX 分隔符。 */
function globPath(p) {
	return process.platform === "win32" ? p.split(path.sep).join("/") : p;
}
/** 极简 glob：支持 `**`、`*`、`?`。路径先相对 cwd 归一化再匹配。 */
function matchGlob(pattern, target, cwd) {
	const normalizedPattern = globPath(pattern);
	const normalizedTarget = globPath(target);
	const normalizedCwd = cwd ? globPath(cwd) : void 0;
	const relative = normalizedCwd && normalizedTarget.startsWith(normalizedCwd) ? normalizedTarget.slice(normalizedCwd.length).replace(/^\//, "") : normalizedTarget.replace(/^\//, "");
	const rx = new RegExp(`^${normalizedPattern.split("/").map((segment) => {
		if (segment === "**") return ".*";
		return segment.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*").replace(/\?/g, "[^/]");
	}).join("/")}$`);
	return rx.test(relative) || rx.test(normalizedTarget);
}
/**
* 从 tool/call 事件里捞出文件路径参数。
*
* 真实 dsh 的 tool/call 是 `{ data: { name, arguments: "<json string>" } }`，
* 且 path 可能是相对 cwd 的。只认「键名像路径」的值，避免把 bash 命令串当文件。
*/
function extractTouchedPaths(event) {
	const out = /* @__PURE__ */ new Set();
	const PATH_KEY = /^(file_path|filePath|path|target|notebook_path|directory|dir|cwd|workspace|root)$/;
	const walk = (value, key, depth) => {
		if (depth > 6 || value === null || value === void 0) return;
		if (typeof value === "string") {
			if (key === "arguments" || key === "args") {
				try {
					walk(JSON.parse(value), void 0, depth + 1);
				} catch {}
				return;
			}
			if (key !== void 0 && PATH_KEY.test(key) && value.length < 4096 && !value.includes("://")) out.add(value);
			return;
		}
		if (Array.isArray(value)) {
			for (const item of value.slice(0, 20)) walk(item, key, depth + 1);
			return;
		}
		if (typeof value === "object") for (const [childKey, child] of Object.entries(value).slice(0, 60)) walk(child, childKey, depth + 1);
	};
	walk(event.data, void 0, 0);
	return [...out];
}
function measureTotal(ctx, decision) {
	const meter = ctx.get("tokenMeter");
	if (!meter?.measure) return 0;
	const session = decision?.session;
	if (!session) return 0;
	try {
		return meter.measure(session, decision.requestHeader)?.totalTokens ?? 0;
	} catch {
		return 0;
	}
}

//#endregion
//#region src/host/adapters/tools.ts
/**
* 工具面。schema 每轮都进 request/header，所以这是一笔**每轮固定开销**：
* 前作挂了 15 个 memory_* 工具，实测那次会话 request/header 42,965 B。
* 我们压到 6 个，并支持 minimal(3) 档。
*
* 所有工具返回**纯文本**而不是 JSON：省 token，且模型读文本比读嵌套 JSON 更稳。
*/
function registerTools(ctx, api, config) {
	const tools = ctx.get("tools");
	if (!tools) return () => {};
	const disposers = [];
	const surface = config.toolSurface === "minimal" ? MINIMAL : STANDARD;
	for (const toolName of surface) {
		const definition = TOOLS[toolName]?.(api, config);
		if (definition) disposers.push(tools.register(definition));
	}
	return () => {
		for (const dispose of disposers) dispose();
	};
}
const MINIMAL = [
	"memory_recall",
	"memory_read",
	"memory_status"
];
const STANDARD = [
	...MINIMAL,
	"memory_write",
	"memory_forget",
	"memory_graph"
];
/** 所有记忆工具都返回纯文本；dsh-tools 要求显式声明 render */
const TEXT_OUTPUT = {
	schema: { type: "string" },
	render: (_args, value) => [{
		type: "text",
		text: String(value ?? "")
	}]
};
const TOOLS = {
	memory_recall: (api, config) => ({
		name: "memory_recall",
		description: "Search long-term memory. Returns a compact list of id + title + summary (no bodies). Use memory_read with an id to get the full text. Leave query empty to get the catalog.",
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					description: "What to look for. Empty = return the catalog."
				},
				limit: {
					type: "number",
					description: `Max results (default ${config.retrieval.recallLimit})`
				},
				kind: {
					type: "string",
					description: "persona|preference|feedback|relations|project|reference|procedure"
				},
				project: {
					type: "string",
					description: "Project slug to restrict to"
				}
			},
			required: [],
			additionalProperties: true
		},
		output: TEXT_OUTPUT,
		async execute(args) {
			const query = typeof args.query === "string" ? args.query : "";
			if (!query.trim()) return api.catalog(typeof args.project === "string" ? args.project : void 0).text || "(memory is empty)";
			const hits = api.search(query, {
				limit: typeof args.limit === "number" ? args.limit : void 0,
				kind: typeof args.kind === "string" ? args.kind : void 0,
				project: typeof args.project === "string" ? args.project : void 0
			});
			const kept = hits.filter((h) => !h.gated).slice(0, typeof args.limit === "number" ? args.limit : config.retrieval.recallLimit);
			const gated = hits.filter((h) => h.gated).length;
			if (gated > 0) {
				api.noteGated(gated);
				api.writeAudit("gate-drop", {
					q: query.slice(0, 80),
					gated
				});
			}
			api.noteRecall(kept.map((h) => h.entry.meta.id));
			if (kept.length === 0) return `No long-term memory matched "${query}". Try a more specific entity name, or memory_read an id from the catalog.`;
			const budget = config.budget.recallChars;
			const lines = [];
			let used = 0;
			for (const hit of kept) {
				const line = `- ${hit.entry.meta.id} [${hit.entry.meta.kind}·${hit.entry.meta.confidence}·${hit.entry.meta.provenance.source}] ${hit.entry.meta.title} — ${hit.entry.meta.summary} (${hit.why})`;
				if (used + line.length > budget) {
					lines.push(`(${kept.length - lines.length} more matches truncated; narrow the query)`);
					break;
				}
				lines.push(line);
				used += line.length;
			}
			return lines.join("\n");
		}
	}),
	memory_read: (api) => ({
		name: "memory_read",
		description: "Read the full text of one memory entry by id. Also works for archived entries.",
		parameters: {
			type: "object",
			properties: { id: {
				type: "string",
				description: "Entry id, e.g. m_01J8ZK3M9QW7RTX2YVBN4C5D6E"
			} },
			required: ["id"],
			additionalProperties: true
		},
		output: TEXT_OUTPUT,
		async execute(args) {
			const id = String(args.id ?? "");
			const entry = await api.read(id);
			if (!entry) return `No memory entry with id ${id}.`;
			api.noteRecall([id]);
			const m = entry.meta;
			return `${[
				`id: ${m.id}`,
				`kind: ${m.kind} · scope: ${m.scope}${m.project ? ` · project: ${m.project}` : ""}`,
				`confidence: ${m.confidence} · source: ${m.provenance.source} · created: ${m.provenance.createdAt.slice(0, 10)}`,
				m.temporal.invalidatedAt ? `INVALIDATED at ${m.temporal.invalidatedAt}${m.temporal.supersededBy ? ` superseded by ${m.temporal.supersededBy}` : ""}` : "",
				m.tags.length > 0 ? `tags: ${m.tags.join(", ")}` : "",
				m.entities.length > 0 ? `entities: ${m.entities.join(", ")}` : ""
			].filter(Boolean).join("\n")}\n\n${entry.body.trim()}\n`;
		}
	}),
	memory_status: (api) => ({
		name: "memory_status",
		description: "Read-only diagnostics: where memory lives, how many entries, injection budget usage, alerts.",
		parameters: {
			type: "object",
			properties: {},
			required: [],
			additionalProperties: true
		},
		output: TEXT_OUTPUT,
		async execute() {
			const s = await api.stats();
			const kinds = Object.entries(s.byKind).sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, n]) => `${k}:${n}`).join(" ");
			const lines = [
				`root: ${s.root}`,
				`entries: ${s.entryCount} (${kinds || "none"})`,
				`index: ${s.index.lines}/${s.index.maxLines} lines, ${s.index.bytes}/${s.index.maxBytes} bytes${s.index.overBudget ? " — OVER BUDGET" : ""}`,
				`injection: ${(s.recall.lastShare * 100).toFixed(2)}% of request (cap ${(s.recall.maxShare * 100).toFixed(0)}%)`,
				`recall: inject ${s.recall.inject.events} events / ${s.recall.inject.hits} hits / verbatim ${s.recall.inject.verbatim} · tool ${s.recall.tool.events} events / zeroHit ${s.recall.tool.zeroHit} · gated ${s.recall.inject.gated}`,
				s.issues.length > 0 ? `issues: ${s.issues.length} (run /memory doctor)` : "issues: none"
			];
			if (s.alerts.length > 0) lines.push(`alerts:\n${s.alerts.map((a) => `  [${a.level}] ${a.code}: ${a.message}`).join("\n")}`);
			return lines.join("\n");
		}
	}),
	memory_write: (api) => ({
		name: "memory_write",
		description: "Submit something worth remembering long-term (who the user is, how they want you to work, a decision and why, who/what relates to what). The plugin decides ADD / UPDATE / NOOP — do not resubmit the same fact.",
		parameters: {
			type: "object",
			properties: {
				title: {
					type: "string",
					description: "One line, <=40 chars"
				},
				summary: {
					type: "string",
					description: "One sentence, <=120 chars. This is the ONLY text shown in the always-loaded catalog — write it so future-you can recognise the memory."
				},
				content: {
					type: "string",
					description: "The memory body. For feedback use: rule / **Why:** / **How to apply:**"
				},
				kind: {
					type: "string",
					description: "persona|preference|feedback|relations|project|reference"
				},
				entities: {
					type: "array",
					items: { type: "string" },
					description: "People/systems this is about (required for relations)"
				},
				tags: {
					type: "array",
					items: { type: "string" }
				},
				activation: {
					type: "string",
					description: "always|glob|on_demand|manual (default on_demand)"
				},
				globs: {
					type: "array",
					items: { type: "string" },
					description: "Required when activation=glob"
				},
				project: {
					type: "string",
					description: "Project slug when the memory is project-scoped"
				},
				userStated: {
					type: "boolean",
					description: "true only if the user literally said this"
				}
			},
			required: [
				"title",
				"summary",
				"content",
				"kind"
			],
			additionalProperties: true
		},
		output: TEXT_OUTPUT,
		async execute(args) {
			const kind = String(args.kind ?? "");
			const title = String(args.title ?? "").trim();
			const summary = String(args.summary ?? "").trim();
			const content = String(args.content ?? "");
			if (!title || !summary || !content) return "REJECTED: title, summary and content are all required.";
			if (![
				"persona",
				"preference",
				"feedback",
				"relations",
				"project",
				"reference"
			].includes(kind)) return `REJECTED: kind must be one of persona|preference|feedback|relations|project|reference (got "${kind}"). episodes and procedures are not writable by this tool.`;
			const duplicate = api.search(`${title} ${summary}`, {
				limit: 3,
				kind
			}).find((h) => h.parts.relevance > .85);
			if (duplicate) return `NOOP: ${duplicate.entry.meta.id} already covers this ("${duplicate.entry.meta.title}"). Use memory_forget + memory_write only if it is actually wrong.`;
			const entities = Array.isArray(args.entities) ? args.entities.map(String) : [];
			if (kind === "relations" && entities.length < 2) return "REJECTED: relations needs at least two entities (from, to).";
			const scope = args.project ? "project" : "global";
			const activation = String(args.activation ?? "on_demand");
			const entry = await api.create({
				kind,
				title,
				summary,
				body: content,
				scope,
				...args.project ? { project: String(args.project) } : {},
				tags: Array.isArray(args.tags) ? args.tags.map(String) : [],
				entities,
				activation: [
					"always",
					"glob",
					"on_demand",
					"manual"
				].includes(activation) ? activation : "on_demand",
				globs: Array.isArray(args.globs) ? args.globs.map(String) : [],
				source: args.userStated === true ? "user-stated" : "model-inferred",
				createdBy: "dsh-agent"
			});
			return `ADD ${entry.meta.id} [${entry.meta.kind}·${entry.meta.provenance.source}] ${title}`;
		}
	}),
	memory_forget: (api) => ({
		name: "memory_forget",
		description: "Invalidate a memory (reversible, moved to archive). Pass hard=true with confirm to delete permanently.",
		parameters: {
			type: "object",
			properties: {
				id: { type: "string" },
				reason: { type: "string" },
				supersededBy: {
					type: "string",
					description: "id of the entry that replaces it"
				},
				hard: { type: "boolean" },
				confirm: {
					type: "string",
					description: "Last 4 characters of the id; required when hard=true"
				}
			},
			required: ["id", "reason"],
			additionalProperties: true
		},
		output: TEXT_OUTPUT,
		async execute(args) {
			const id = String(args.id ?? "");
			const reason = String(args.reason ?? "");
			if (!reason) return "REJECTED: a reason is required — forgetting must be explainable.";
			if (args.hard === true) {
				const result = await api.hardDelete(id, String(args.confirm ?? ""));
				return "error" in result ? `REJECTED: ${result.error}` : `DELETED ${id} (${result.deleted.length} file(s)); derived indexes rebuilt.`;
			}
			return await api.invalidate(id, {
				reason,
				supersededBy: args.supersededBy ? String(args.supersededBy) : null
			}) ? `INVALIDATED ${id} → archive (recoverable). Reason: ${reason}` : `No memory entry with id ${id}.`;
		}
	}),
	memory_graph: (api) => ({
		name: "memory_graph",
		description: "Traverse the relations graph from an entity or an entry id. Forward and backward in one call.",
		parameters: {
			type: "object",
			properties: {
				entity: { type: "string" },
				id: { type: "string" },
				limit: { type: "number" }
			},
			required: [],
			additionalProperties: true
		},
		output: TEXT_OUTPUT,
		async execute(args) {
			const limit = typeof args.limit === "number" ? Math.min(args.limit, 20) : 10;
			const needle = String(args.entity ?? args.id ?? "").trim();
			if (!needle) return "Provide either entity or id.";
			const entries = api.list().filter((e) => e.meta.kind === "relations" && e.meta.temporal.invalidatedAt === null).filter((e) => e.meta.entities.some((x) => x === needle) || e.meta.id === needle).slice(0, limit);
			if (entries.length === 0) return `No relations found for "${needle}".`;
			return entries.map((e) => {
				const [from, to] = e.meta.entities;
				const state = e.meta.temporal.invalidatedAt ? ` (invalidated ${e.meta.temporal.invalidatedAt})` : "";
				return `- ${from} —[${e.meta.title}]→ ${to}${state} · ${e.meta.id} · ${e.meta.summary}`;
			}).join("\n");
		}
	})
};

//#endregion
//#region src/host/catalog.ts
const GENERATED_HEADER = "<!-- GENERATED by dsh-general-automatic-memory · do not edit · rebuild: /memory doctor -->";
const INDEX_LIMITS = {
	maxLines: 200,
	maxBytes: 25600
};
/** INDEX.md 的分组顺序 = 裁剪优先级，越前越不该被裁 */
const GROUP_ORDER = [
	"feedback",
	"persona",
	"preference",
	"relations",
	"project",
	"reference",
	"procedure"
];
/**
* 由 frontmatter 反向生成 INDEX.md。**永不手写**——这是治「索引与内容漂移」
* 这个文件式记忆头号故障的唯一办法。
*
* 排序必须确定性（heat desc, id asc），否则注入文本会随文件系统返回顺序抖动，
* 直接击穿 DeepSeek 前缀缓存（原则 P4）。
*/
function renderIndex(entries, limits = INDEX_LIMITS) {
	const active = entries.filter((e) => e.meta.temporal.invalidatedAt === null);
	const byKind = /* @__PURE__ */ new Map();
	for (const entry of active) {
		const list = byKind.get(entry.meta.kind) ?? [];
		list.push(entry);
		byKind.set(entry.meta.kind, list);
	}
	const groups = [];
	for (const kind of GROUP_ORDER) {
		const list = (byKind.get(kind) ?? []).slice().sort(byRank);
		if (list.length === 0) continue;
		groups.push({
			kind,
			label: GROUP_LABEL[kind] ?? kind,
			rows: list.map((e) => `- [${e.meta.title}](${e.rel}) — ${e.meta.summary}`),
			omitted: 0
		});
		byKind.delete(kind);
	}
	for (const [kind, list] of [...byKind.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1)) {
		const sorted = list.slice().sort(byRank);
		groups.push({
			kind,
			label: kind,
			rows: sorted.map((e) => `- [${e.meta.title}](${e.rel}) — ${e.meta.summary}`),
			omitted: 0
		});
	}
	const header = (omittedTotal, bytes) => [
		GENERATED_HEADER,
		`<!-- entries: ${active.length} · omitted: ${omittedTotal} · bytes: ${bytes} / ${limits.maxBytes} · lines: ${limits.maxLines} -->`,
		""
	].join("\n");
	let omittedTotal = 0;
	for (let attempt = 0; attempt < 60; attempt++) {
		const body = groups.map((g) => {
			const shown = g.rows.slice(0, g.rows.length - g.omitted);
			const tail = g.omitted > 0 ? [`- … +${g.omitted} more via memory_recall`] : [];
			return [
				`## ${g.label} (${shown.length + g.omitted})`,
				...shown,
				...tail
			].join("\n");
		}).join("\n\n");
		const text = `${header(omittedTotal, Buffer.byteLength(body, "utf8"))}\n${body}\n`;
		const lines = text.split("\n").length;
		const bytes = Buffer.byteLength(text, "utf8");
		if (lines <= limits.maxLines && bytes <= limits.maxBytes) return text;
		for (let i = groups.length - 1; i >= 0; i--) {
			const g = groups[i];
			if (g.omitted < g.rows.length) {
				g.omitted++;
				omittedTotal++;
				break;
			}
		}
	}
	return header(omittedTotal, 0) + "\n(index over budget even after trimming; run /memory doctor)\n";
}
const GROUP_LABEL = {
	feedback: "反馈 feedback",
	persona: "画像 persona",
	preference: "偏好 preference",
	relations: "关系 relations",
	project: "项目 project",
	reference: "参考 reference",
	procedure: "程序 procedure"
};
function byRank(a, b) {
	const heat = b.meta.stats.heat - a.meta.stats.heat;
	if (heat !== 0) return heat;
	return a.meta.id < b.meta.id ? -1 : a.meta.id > b.meta.id ? 1 : 0;
}
/**
* PROFILE.md：给**其他 agent 工具**直接读的画像汇编。
* 只收 activation=always 的 persona/preference/feedback，按 kind 分段。
*/
function renderProfile(entries, maxChars) {
	const pick = (kind) => entries.filter((e) => e.meta.kind === kind && e.meta.activation === "always" && e.meta.temporal.invalidatedAt === null).sort(byRank);
	const sections = [
		["关于用户", pick("persona")],
		["协作纪律", pick("feedback")],
		["偏好", pick("preference")]
	];
	const lines = [GENERATED_HEADER, ""];
	let used = lines.join("\n").length;
	for (const [title, list] of sections) {
		if (list.length === 0) continue;
		const block = [`## ${title}`];
		for (const entry of list) {
			const line = `- ${entry.meta.title}：${entry.body.trim().split("\n")[0] ?? entry.meta.summary}`;
			if (used + line.length + 1 > maxChars) {
				block.push(`- …（其余 ${list.length - (block.length - 1)} 条见 INDEX.md）`);
				break;
			}
			block.push(line);
			used += line.length + 1;
		}
		lines.push("", ...block);
		used += title.length + 5;
	}
	return `${lines.join("\n").trim()}\n`;
}
/** 关系边表：派生物，供族谱视图与 memory_graph 使用。 */
function renderGraphJsonl(entries) {
	const edges = [];
	for (const entry of entries.filter((e) => e.meta.kind === "relations").sort(byRank)) {
		const [from, to] = entry.meta.entities;
		if (!from || !to) continue;
		edges.push(JSON.stringify({
			from,
			rel: relationOf(entry),
			to,
			mid: entry.meta.id,
			conf: entry.meta.confidence,
			validFrom: entry.meta.temporal.validFrom,
			invalidatedAt: entry.meta.temporal.invalidatedAt
		}));
	}
	return edges.length > 0 ? `${edges.join("\n")}\n` : "";
}
const RELATION_WORDS = [
	"负责",
	"汇报给",
	"属于",
	"依赖",
	"使用",
	"位于",
	"参与",
	"取代",
	"冲突于"
];
function relationOf(entry) {
	const haystack = `${entry.meta.title}\n${entry.body}`;
	return RELATION_WORDS.find((w) => haystack.includes(w)) ?? "关联";
}
/**
* 把所有派生文件一次性写回。写前先比对 checksum，内容没变就不落盘——
* 避免每次固化都改动 mtime，进而让 watcher 与同步误判为「有变更」。
*/
async function writeDerived(root, files, write, read) {
	const written = [];
	const unchanged = [];
	for (const [rel, content] of files) {
		const abs = resolveInRoot(root, rel);
		const existing = await read(abs);
		if (existing !== null && checksumOf(existing) === checksumOf(content)) {
			unchanged.push(rel);
			continue;
		}
		await writeFileAtomic(abs, content);
		written.push(rel);
	}
	return {
		written,
		unchanged
	};
}
function derivedFiles(entries, budget) {
	return [
		[DERIVED_FILES[0], renderIndex(entries)],
		[DERIVED_FILES[1], renderProfile(entries, budget.alwaysChars)],
		[DERIVED_FILES[3], renderGraphJsonl(entries)]
	];
}

//#endregion
//#region src/host/search.ts
const CJK_RANGE = /[\u3000-\u9fff\u3040-\u30ff\uac00-\ud7af]/;
const LATIN_TOKEN = /[a-z0-9_]+/g;
/**
* 分词：拉丁按词，CJK 按「单字 + 相邻双字」。
* 双字组是中文检索的关键——单字召回太宽（"记"命中一切），双字才有区分度。
* 这与 dsh 官方 plugin-market 的 CJK 分词策略一致（重叠字符对 + 末字符，无词典）。
*/
function tokenize(text) {
	const lower = text.toLowerCase();
	const out = [];
	for (const match of lower.matchAll(LATIN_TOKEN)) out.push(match[0]);
	const cjkChars = [...lower].filter((ch) => CJK_RANGE.test(ch));
	let previous;
	for (const ch of cjkChars) {
		out.push(ch);
		if (previous !== void 0) out.push(previous + ch);
		previous = ch;
	}
	return out;
}
function buildCorpus(entries) {
	const docs = /* @__PURE__ */ new Map();
	const df = /* @__PURE__ */ new Map();
	for (const entry of entries) {
		const tokens = tokenize(indexableText(entry));
		const set = new Set(tokens);
		docs.set(entry.meta.id, set);
		for (const token of set) df.set(token, (df.get(token) ?? 0) + 1);
	}
	return {
		docs,
		df,
		size: entries.length
	};
}
/** 参与检索的字段。正文权重最低——title/summary/tags/entities 才是召回的抓手。 */
function indexableText(entry) {
	const m = entry.meta;
	return [
		m.title,
		m.title,
		m.summary,
		m.summary,
		m.tags.join(" "),
		m.entities.join(" "),
		m.project ?? "",
		entry.body.slice(0, 400)
	].join(" ");
}
/** BM25 的简化版：tf 饱和 + idf。零依赖、可解释、对小规模记忆足够。 */
function lexicalScore(query, entryId, corpus) {
	const doc = corpus.docs.get(entryId);
	if (!doc || doc.size === 0 || corpus.size === 0) return 0;
	const qTokens = new Set(tokenize(query));
	if (qTokens.size === 0) return 0;
	let score = 0;
	for (const token of qTokens) {
		if (!doc.has(token)) continue;
		const n = corpus.df.get(token) ?? 1;
		const idf = Math.log(1 + (corpus.size - n + .5) / (n + .5));
		score += idf;
	}
	let max = 0;
	for (const token of qTokens) {
		const n = corpus.df.get(token) ?? 0;
		max += Math.log(1 + (corpus.size - n + .5) / (n + .5));
	}
	return max > 0 ? Math.min(1, score / max) : 0;
}
const DEFAULT_WEIGHTS = {
	relevance: .5,
	heat: .15,
	confidence: .15,
	sourceTrust: .15,
	recency: .05
};
/**
* 最终排序（docs/04 §7）。冲突条目降权但不隐藏——矛盾要能被看见才能被裁决。
* 来源可信度是显式因子：web-content 只拿 0.2 的权重，这是防投毒的检索侧防线。
*/
function rank(entries, query, corpus, weights = {}, now = Date.now()) {
	const w = {
		...DEFAULT_WEIGHTS,
		...weights
	};
	const ranked = [];
	for (const entry of entries) {
		const m = entry.meta;
		const relevance = query.trim() ? lexicalScore(query, m.id, corpus) : 0;
		const heat = computeHeat({
			hits: m.stats.hits,
			lastUsedAt: m.stats.lastUsedAt,
			now
		});
		const confidence = CONFIDENCE_WEIGHT[m.confidence];
		const sourceTrust = SOURCE_TRUST[m.provenance.source];
		const days = m.stats.lastUsedAt ? Math.max(0, (now - Date.parse(m.stats.lastUsedAt)) / 864e5) : 365;
		const recency = Math.exp(-days / 90);
		const conflictPenalty = m.links.conflictsWith.length > 0 ? .1 : 0;
		const score = Math.max(0, Math.min(1, w.relevance * relevance + w.heat * heat + w.confidence * confidence + w.sourceTrust * sourceTrust + w.recency * recency - conflictPenalty));
		ranked.push({
			entry,
			score: Number(score.toFixed(4)),
			parts: {
				relevance: Number(relevance.toFixed(3)),
				heat: Number(heat.toFixed(3)),
				confidence,
				sourceTrust,
				recency: Number(recency.toFixed(3))
			},
			why: explain(m, relevance, heat)
		});
	}
	return ranked.sort((a, b) => b.score !== a.score ? b.score - a.score : a.entry.meta.id < b.entry.meta.id ? -1 : 1);
}
function explain(m, relevance, heat) {
	const bits = [];
	if (relevance > 0) bits.push(`词法 ${relevance.toFixed(2)}`);
	if (heat > 0) bits.push(`热度 ${heat.toFixed(2)}`);
	bits.push(`来源 ${m.provenance.source}`);
	bits.push(`可信 ${m.confidence}`);
	return bits.join(" · ");
}

//#endregion
//#region src/host/frontmatter.ts
const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
var FrontmatterError = class extends Error {
	field;
	constructor(message, field) {
		super(message);
		this.field = field;
		this.name = "FrontmatterError";
	}
};
function splitDocument(text) {
	const match = FENCE.exec(text);
	if (!match) throw new FrontmatterError("missing YAML frontmatter (expected a leading --- block)");
	return {
		raw: match[1] ?? "",
		body: text.slice(match[0].length)
	};
}
const oneOf = (value, allowed, field) => {
	if (typeof value === "string" && allowed.includes(value)) return value;
	throw new FrontmatterError(`${field} must be one of ${allowed.join("|")}, got ${JSON.stringify(value)}`, field);
};
const str = (value, field) => {
	if (typeof value !== "string") throw new FrontmatterError(`${field} must be a string`, field);
	return value;
};
const strList = (value, field) => {
	if (value === void 0 || value === null) return [];
	if (!Array.isArray(value)) throw new FrontmatterError(`${field} must be an array`, field);
	return value.map((v, i) => {
		if (typeof v !== "string") throw new FrontmatterError(`${field}[${i}] must be a string`, field);
		return v;
	});
};
const nullableStr = (value, field) => {
	if (value === void 0 || value === null || value === "") return null;
	return str(value, field);
};
const num = (value, field, fallback = 0) => {
	if (value === void 0 || value === null) return fallback;
	if (typeof value !== "number" || !Number.isFinite(value)) throw new FrontmatterError(`${field} must be a finite number`, field);
	return value;
};
const bool = (value, field, fallback = false) => {
	if (value === void 0 || value === null) return fallback;
	if (typeof value !== "boolean") throw new FrontmatterError(`${field} must be a boolean`, field);
	return value;
};
const obj = (value, field) => {
	if (value === void 0 || value === null) return {};
	if (typeof value !== "object" || Array.isArray(value)) throw new FrontmatterError(`${field} must be a mapping`, field);
	return value;
};
/**
* CORE_SCHEMA 只有 str/seq/map/bool/int/float/null：
* ① 不会构造任意应用对象（用户可编辑文件必须按不可信输入处理）；
* ② 裸日期保持字符串而不是被解析成 Date，序列化才不会漂移（原则 P4 的前提）。
*/
const YAML_SCHEMA = yaml.CORE_SCHEMA;
/** js-yaml 在 CORE_SCHEMA 下只产出 string/number，number 分支是给导入数据里的 epoch 毫秒兜底。 */
function asIsoString(value) {
	if (typeof value === "string") return value;
	if (typeof value === "number") return new Date(value).toISOString();
	return "";
}
function asIsoDateOnly(value) {
	return asIsoString(value).slice(0, 10);
}
function parseFrontmatter(text, rel) {
	const { raw, body } = splitDocument(text);
	let data;
	try {
		data = yaml.load(raw, { schema: YAML_SCHEMA });
	} catch (cause) {
		throw new FrontmatterError(`invalid YAML in ${rel}: ${cause.message}`);
	}
	const f = obj(data, "frontmatter");
	const id = str(f.id, "id");
	if (!/^m_[0-9A-HJKMNP-TV-Z]{26}$/.test(id)) throw new FrontmatterError(`id must match m_<ULID>, got ${id}`, "id");
	const kind = oneOf(f.kind, KINDS, "kind");
	const scope = oneOf(f.scope, SCOPES, "scope");
	const title = str(f.title, "title");
	const summary = str(f.summary, "summary");
	if (!title) throw new FrontmatterError("title must not be empty", "title");
	if (!summary) throw new FrontmatterError("summary must not be empty (it is the only thing the catalog layer shows)", "summary");
	if (title.includes("\n")) throw new FrontmatterError("title must be a single line", "title");
	const provenance = obj(f.provenance, "provenance");
	const temporal = obj(f.temporal, "temporal");
	const stats = obj(f.stats, "stats");
	const links = obj(f.links, "links");
	const privacy = obj(f.privacy, "privacy");
	const normalizedBody = normalizeBody(body);
	const meta = {
		id,
		kind,
		title,
		summary,
		scope,
		...scope === "project" ? { project: str(f.project, "project") } : {},
		tags: strList(f.tags, "tags"),
		entities: strList(f.entities, "entities"),
		activation: oneOf(f.activation, ACTIVATIONS, "activation"),
		globs: strList(f.globs, "globs"),
		confidence: oneOf(f.confidence, CONFIDENCES, "confidence"),
		provenance: {
			source: oneOf(provenance.source, SOURCES, "provenance.source"),
			createdAt: asIsoString(provenance.createdAt),
			createdBy: str(provenance.createdBy ?? "dsh", "provenance.createdBy"),
			...provenance.sessionId ? { sessionId: str(provenance.sessionId, "provenance.sessionId") } : {},
			...provenance.eventSeq !== void 0 ? { eventSeq: num(provenance.eventSeq, "provenance.eventSeq") } : {},
			...provenance.origin ? { origin: str(provenance.origin, "provenance.origin") } : {},
			...provenance.importedFrom ? { importedFrom: str(provenance.importedFrom, "provenance.importedFrom") } : {}
		},
		temporal: {
			observedAt: asIsoDateOnly(temporal.observedAt),
			validFrom: asIsoDateOnly(temporal.validFrom),
			invalidatedAt: nullableStr(temporal.invalidatedAt, "temporal.invalidatedAt"),
			supersededBy: nullableStr(temporal.supersededBy, "temporal.supersededBy"),
			expiresAt: temporal.expiresAt ? asIsoDateOnly(temporal.expiresAt) : null
		},
		stats: {
			revisions: num(stats.revisions, "stats.revisions", 1),
			hits: num(stats.hits, "stats.hits", 0),
			lastUsedAt: stats.lastUsedAt ? asIsoString(stats.lastUsedAt) : null,
			heat: num(stats.heat, "stats.heat", 0)
		},
		links: {
			relates: strList(links.relates, "links.relates"),
			derivedFrom: strList(links.derivedFrom, "links.derivedFrom"),
			conflictsWith: strList(links.conflictsWith, "links.conflictsWith")
		},
		privacy: {
			pii: bool(privacy.pii, "privacy.pii"),
			sensitive: bool(privacy.sensitive, "privacy.sensitive"),
			shareable: oneOf(privacy.shareable ?? "none", SHAREABLE, "privacy.shareable")
		},
		checksum: checksumOf(normalizedBody)
	};
	if (meta.activation === "glob" && meta.globs.length === 0) throw new FrontmatterError("activation=glob requires at least one glob", "globs");
	if (meta.scope === "project" && !meta.project) throw new FrontmatterError("scope=project requires a project slug", "project");
	return {
		meta,
		body: normalizedBody,
		rel
	};
}
/**
* 序列化。**键序固定**：注入文本与派生文件的逐字节幂等（原则 P4）依赖它。
* 同一 entry 序列化两次必须得到完全相同的字节。
*/
function serializeEntry(meta, body) {
	const normalizedBody = normalizeBody(body);
	const doc = {
		id: meta.id,
		kind: meta.kind,
		title: meta.title,
		summary: meta.summary,
		scope: meta.scope
	};
	if (meta.scope === "project") doc.project = meta.project ?? "";
	doc.tags = meta.tags;
	doc.entities = meta.entities;
	doc.activation = meta.activation;
	doc.globs = meta.globs;
	doc.confidence = meta.confidence;
	doc.provenance = {
		source: meta.provenance.source,
		createdAt: meta.provenance.createdAt,
		createdBy: meta.provenance.createdBy,
		...meta.provenance.sessionId ? { sessionId: meta.provenance.sessionId } : {},
		...meta.provenance.eventSeq !== void 0 ? { eventSeq: meta.provenance.eventSeq } : {},
		...meta.provenance.origin ? { origin: meta.provenance.origin } : {},
		...meta.provenance.importedFrom ? { importedFrom: meta.provenance.importedFrom } : {}
	};
	doc.temporal = {
		observedAt: meta.temporal.observedAt,
		validFrom: meta.temporal.validFrom,
		invalidatedAt: meta.temporal.invalidatedAt,
		supersededBy: meta.temporal.supersededBy,
		expiresAt: meta.temporal.expiresAt
	};
	doc.stats = {
		revisions: meta.stats.revisions,
		hits: meta.stats.hits,
		lastUsedAt: meta.stats.lastUsedAt,
		heat: meta.stats.heat
	};
	doc.links = {
		relates: meta.links.relates,
		derivedFrom: meta.links.derivedFrom,
		conflictsWith: meta.links.conflictsWith
	};
	doc.privacy = {
		pii: meta.privacy.pii,
		sensitive: meta.privacy.sensitive,
		shareable: meta.privacy.shareable
	};
	doc.checksum = checksumOf(normalizedBody);
	return `---\n${yaml.dump(doc, {
		schema: YAML_SCHEMA,
		sortKeys: false,
		lineWidth: -1,
		noRefs: true,
		quotingType: "\"",
		forceQuotes: false,
		noCompatMode: true
	})}---\n\n${normalizedBody}`;
}

//#endregion
//#region src/host/store.ts
/** 派生 Markdown 不是记忆条目：persona/PROFILE.md 就落在条目目录里 */
const DERIVED_MARKDOWN = /* @__PURE__ */ new Set(["PROFILE.MD", "INDEX.MD"]);
function isDerivedMarkdown(rel) {
	return DERIVED_MARKDOWN.has(path.posix.basename(rel).toUpperCase());
}
function baseIdOf(rel) {
	const name = path.posix.basename(rel);
	return name.toLowerCase().endsWith(".md") ? name.slice(0, -3) : name;
}
var MemoryStore = class {
	root;
	constructor(root) {
		this.root = root;
	}
	async init(deviceId) {
		const dirs = [
			DIRS.persona,
			DIRS.preference,
			DIRS.feedback,
			DIRS.relations,
			DIRS.reference,
			DIRS.procedures,
			DIRS.project,
			DIRS.projects,
			DIRS.archive,
			DIRS.audit,
			DIRS.snapshots,
			DIRS.sync,
			DIRS.cache
		];
		for (const dir of dirs) await ensureDir(path.join(this.root, dir));
		const manifestPath = path.join(this.root, MANIFEST_NAME);
		if (!await readTextFile(manifestPath)) {
			const manifest = yaml.dump({
				schemaVersion: 1,
				plugin: "dsh-general-automatic-memory",
				createdAt: isoNow(),
				deviceId,
				note: "Truth source. Everything under .cache/ is a disposable derived index."
			}, {
				schema: yaml.CORE_SCHEMA,
				sortKeys: false,
				lineWidth: -1,
				noRefs: true
			});
			await writeFileAtomic(manifestPath, manifest);
		}
	}
	/** kind + scope → 相对目录。project 类落在 projects/<slug>/facts/。 */
	dirFor(kind, scope, project) {
		if (kind === "episode") throw new Error("episodes live in jsonl, not as entry files");
		if (kind === "project") {
			if (scope !== "project") return DIRS.project;
			if (!project) throw new Error("scope=project requires a project slug");
			return path.posix.join(DIRS.projects, project, "facts");
		}
		const dir = kind === "procedure" ? DIRS.procedures : kind;
		if (!ENTRY_DIRS.includes(dir)) throw new Error(`no directory mapped for kind ${kind}`);
		return dir;
	}
	relFor(kind, scope, project, id) {
		return path.posix.join(this.dirFor(kind, scope, project), `${id}.md`);
	}
	/** 扫描目录集合：6 个全局 kind 目录 + 每个项目的 facts/ */
	async scanDirs() {
		const dirs = [...ENTRY_DIRS];
		for (const slug of await listSubdirs(path.join(this.root, DIRS.projects))) dirs.push(path.posix.join(DIRS.projects, slug, "facts"));
		return dirs;
	}
	/** 扫描全部活跃条目。单个文件解析失败不影响其余，问题收集进 issues 交给 doctor。 */
	async scan() {
		const entries = [];
		const issues = [];
		for (const rel of await walkMarkdown(this.root, await this.scanDirs())) {
			if (isDerivedMarkdown(rel)) continue;
			const text = await readTextFile(resolveInRoot(this.root, rel));
			if (text === null) continue;
			try {
				entries.push(parseFrontmatter(text, rel));
			} catch (cause) {
				issues.push({
					rel,
					issue: cause instanceof FrontmatterError ? "invalid" : "parse",
					message: cause.message
				});
			}
		}
		return {
			entries,
			issues
		};
	}
	buildMeta(input) {
		const now = input.now ?? isoNow();
		const today = now.slice(0, 10);
		const scope = input.scope ?? "global";
		const activation = input.activation ?? "on_demand";
		if (activation === "glob" && (input.globs?.length ?? 0) === 0) throw new Error("activation=glob requires at least one glob");
		if (scope === "project" && !input.project) throw new Error("scope=project requires a project slug");
		const source = input.source ?? "manual";
		const body = normalizeBody(input.body);
		return {
			id: input.id ?? ulid(),
			kind: input.kind,
			title: input.title,
			summary: input.summary,
			scope,
			...scope === "project" ? { project: input.project } : {},
			tags: input.tags ?? [],
			entities: input.entities ?? [],
			activation,
			globs: input.globs ?? [],
			confidence: input.confidence ?? (source === "user-stated" || source === "manual" ? "high" : "medium"),
			provenance: {
				source,
				createdAt: now,
				createdBy: input.createdBy ?? "dsh",
				...input.sessionId ? { sessionId: input.sessionId } : {},
				...input.eventSeq !== void 0 ? { eventSeq: input.eventSeq } : {},
				...input.origin ? { origin: input.origin } : {},
				...input.importedFrom ? { importedFrom: input.importedFrom } : {}
			},
			temporal: {
				observedAt: today,
				validFrom: today,
				invalidatedAt: null,
				supersededBy: null,
				expiresAt: input.expiresAt ?? null
			},
			stats: {
				revisions: 1,
				hits: 0,
				lastUsedAt: null,
				heat: 0
			},
			links: {
				relates: [],
				derivedFrom: [],
				conflictsWith: []
			},
			privacy: {
				pii: false,
				sensitive: false,
				shareable: "none"
			},
			checksum: checksumOf(body)
		};
	}
	async put(meta, body) {
		const normalized = normalizeBody(body);
		const rel = this.relFor(meta.kind, meta.scope, meta.project, meta.id);
		const stamped = {
			...meta,
			checksum: checksumOf(normalized)
		};
		await writeFileAtomic(resolveInRoot(this.root, rel), serializeEntry(stamped, normalized));
		return rel;
	}
	/** 只改 frontmatter（stats 刷盘等），正文不动。 */
	async patchMeta(id, patch) {
		const entry = await this.get(id);
		if (!entry) return null;
		const meta = patch(entry.meta);
		await this.put(meta, entry.body);
		return {
			meta,
			body: entry.body,
			rel: entry.rel
		};
	}
	async get(id) {
		const { entries } = await this.scan();
		return entries.find((e) => e.meta.id === id) ?? null;
	}
	/**
	* 失效 ≠ 删除：写 temporal.invalidatedAt + supersededBy，然后移入 archive/<yyyy>/。
	* 归档文件与活跃文件格式完全一致（不追加任何注释），否则正文 checksum 会漂移。
	* 失效原因记在审计里，不进文件。
	*/
	async invalidate(id, opts = {}) {
		const entry = await this.get(id);
		if (!entry) return null;
		const now = opts.now ?? isoNow();
		const meta = {
			...entry.meta,
			temporal: {
				...entry.meta.temporal,
				invalidatedAt: now.slice(0, 10),
				supersededBy: opts.supersededBy ?? null
			},
			stats: {
				...entry.meta.stats,
				revisions: entry.meta.stats.revisions + 1
			}
		};
		await this.moveToArchive(meta, entry.body, entry.rel, now);
		return {
			meta,
			body: entry.body,
			rel: entry.rel
		};
	}
	async archive(id, now = isoNow()) {
		const entry = await this.get(id);
		if (!entry) return null;
		return this.moveToArchive(entry.meta, entry.body, entry.rel, now);
	}
	async moveToArchive(meta, body, activeRel, now) {
		const rel = path.posix.join(DIRS.archive, now.slice(0, 4), `${meta.id}.md`);
		await writeFileAtomic(resolveInRoot(this.root, rel), serializeEntry(meta, body));
		await rm(resolveInRoot(this.root, activeRel), { force: true });
		return rel;
	}
	/** 物理删除：活跃副本 + 归档副本。派生索引由 rebuild 清除。仅用于用户硬删与 GDPR。 */
	async hardDelete(id) {
		const deleted = [];
		const entry = await this.get(id);
		if (entry) {
			await rm(resolveInRoot(this.root, entry.rel), { force: true });
			deleted.push(entry.rel);
		}
		for (const rel of await walkMarkdown(this.root, [DIRS.archive])) if (baseIdOf(rel) === id) {
			await rm(resolveInRoot(this.root, rel), { force: true });
			deleted.push(rel);
		}
		return deleted;
	}
	/** 归档面：memory_read 与时间线的时点查询会用到。 */
	async scanArchive() {
		const out = [];
		for (const rel of await walkMarkdown(this.root, [DIRS.archive])) {
			const text = await readTextFile(resolveInRoot(this.root, rel));
			if (text === null) continue;
			try {
				out.push(parseFrontmatter(text, rel));
			} catch {}
		}
		return out;
	}
};

//#endregion
//#region src/host/episode.ts
const EPISODE_DAILY_CAP = 256;
const EPISODE_USER_CHARS = 200;
const EPISODE_OUTCOME_CHARS = 120;
var EpisodeStore = class {
	root;
	constructor(root) {
		this.root = root;
	}
	rel(slug, date) {
		return path.posix.join(DIRS.projects, slug, "episodes", `${date}.jsonl`);
	}
	async append(slug, input) {
		const ts = input.ts ?? isoNow();
		const episode = {
			v: 1,
			id: `e_${ulid().slice(2)}`,
			sid: input.sid,
			turn: input.turn,
			ts,
			topic: clip(input.topic, 80),
			user: clip(input.user, 200),
			outcome: clip(input.outcome, 120),
			src: input.src,
			promoted: null
		};
		const rel = this.rel(slug, ts.slice(0, 10));
		const abs = resolveInRoot(this.root, rel);
		const lines = (await readTextFile(abs) ?? "").split("\n").filter((line) => line.trim().length > 0);
		const next = `${[...lines.length >= 256 ? lines.slice(lines.length - 256 + 1) : lines, JSON.stringify(episode)].join("\n")}\n`;
		if (lines.length >= 256) await writeFileAtomic(abs, next);
		else await appendLine(abs, JSON.stringify(episode));
		return episode;
	}
	async listDay(slug, date) {
		return parseLines(await readTextFile(resolveInRoot(this.root, this.rel(slug, date))));
	}
	/** 最近 N 天（含今天），按时间正序 */
	async recent(slug, days, now = /* @__PURE__ */ new Date()) {
		const out = [];
		for (let i = days - 1; i >= 0; i--) {
			const date = (/* @__PURE__ */ new Date(now.getTime() - i * 864e5)).toISOString().slice(0, 10);
			out.push(...await this.listDay(slug, date));
		}
		return out.sort((a, b) => a.ts < b.ts ? -1 : 1);
	}
	/** 发现所有项目 slug（curator 需要遍历它们做过期与晋升） */
	async listProjects() {
		try {
			const { readdir } = await import("node:fs/promises");
			return (await readdir(resolveInRoot(this.root, DIRS.projects), { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name).sort();
		} catch {
			return [];
		}
	}
	/** 标记某几条 episode 已被晋升为长期条目（重写当日文件，保留其余行） */
	async markPromoted(slug, ids, entryId, now = /* @__PURE__ */ new Date()) {
		let updated = 0;
		const want = new Set(ids);
		for (let i = 0; i < 8; i++) {
			const date = (/* @__PURE__ */ new Date(now.getTime() - i * 864e5)).toISOString().slice(0, 10);
			const abs = resolveInRoot(this.root, this.rel(slug, date));
			const text = await readTextFile(abs);
			if (!text) continue;
			const lines = text.split("\n").filter((line) => line.trim().length > 0);
			let touched = false;
			const next = lines.map((line) => {
				try {
					const episode = JSON.parse(line);
					if (episode.v === 1 && want.has(episode.id) && episode.promoted === null) {
						episode.promoted = entryId;
						touched = true;
						updated++;
						return JSON.stringify(episode);
					}
				} catch {}
				return line;
			});
			if (touched) await writeFileAtomic(abs, `${next.join("\n")}\n`);
		}
		return updated;
	}
	/** 过期行移到 archive/episodes/<yyyy-mm>.jsonl，退出默认召回面但可检索 */
	async expire(slug, beforeDate) {
		let moved = 0;
		const dir = path.posix.join(DIRS.projects, slug, "episodes");
		const abs = resolveInRoot(this.root, dir);
		let names = [];
		try {
			const { readdir } = await import("node:fs/promises");
			names = (await readdir(abs)).filter((n) => hasExtension(n, ".jsonl")).sort();
		} catch {
			return 0;
		}
		for (const name of names) {
			const date = name.replace(/\.jsonl$/, "");
			if (date >= beforeDate) continue;
			const episodes = await this.listDay(slug, date);
			if (episodes.length === 0) continue;
			const archiveRel = path.posix.join(DIRS.archive, "episodes", `${slug}-${date}.jsonl`);
			const archiveAbs = resolveInRoot(this.root, archiveRel);
			const merged = [(await readTextFile(archiveAbs) ?? "").trimEnd(), ...episodes.map((e) => JSON.stringify(e))].filter(Boolean).join("\n");
			await writeFileAtomic(archiveAbs, `${merged}\n`);
			const { rm } = await import("node:fs/promises");
			await rm(resolveInRoot(this.root, this.rel(slug, date)), { force: true });
			moved += episodes.length;
		}
		return moved;
	}
};
function parseLines(text) {
	if (!text) return [];
	const out = [];
	for (const line of text.split("\n")) {
		if (!line.trim()) continue;
		try {
			const parsed = JSON.parse(line);
			if (parsed && parsed.v === 1) out.push(parsed);
		} catch {}
	}
	return out;
}
function clip(text, max) {
	const single = text.replace(/\s+/g, " ").trim();
	return single.length > max ? `${single.slice(0, max - 1)}…` : single;
}

//#endregion
//#region src/host/fts.ts
/**
* L1 词法索引（SQLite FTS5）。
*
* 用 Node 内置的 `node:sqlite`，不引原生依赖 —— dsh 的 pnpm 会拦构建脚本，
* 少一个原生模块就少一次"Allow these scripts"的安装摩擦。
*
* **它只是缓存**：`.cache/fts.sqlite` 随时可删，删了下次 refresh 自动重建。
* CJK 的关键在于"先分词再入库"：FTS5 自带的 unicode61 不切中文，
* 所以写入的是我们分词后的空格分隔 token，而不是原文。
*/
var FtsIndex = class FtsIndex {
	db;
	constructor(db) {
		this.db = db;
	}
	static open(root) {
		try {
			const dir = path.join(root, ".cache");
			mkdirSync(dir, { recursive: true });
			const db = new DatabaseSync(path.join(dir, "fts.sqlite"));
			db.exec("PRAGMA journal_mode = WAL");
			db.exec("CREATE TABLE IF NOT EXISTS entry_meta (id TEXT PRIMARY KEY, kind TEXT NOT NULL, hash TEXT NOT NULL)");
			db.exec("CREATE VIRTUAL TABLE IF NOT EXISTS entry_fts USING fts5(id UNINDEXED, tokens)");
			return new FtsIndex(db);
		} catch {
			return null;
		}
	}
	/** 增量同步：只重算 hash 变化的条目 */
	sync(entries) {
		const known = /* @__PURE__ */ new Map();
		for (const row of this.db.prepare("SELECT id, hash FROM entry_meta").all()) known.set(row.id, row.hash);
		const insertMeta = this.db.prepare("INSERT INTO entry_meta (id, kind, hash) VALUES (?, ?, ?)");
		const insertFts = this.db.prepare("INSERT INTO entry_fts (id, tokens) VALUES (?, ?)");
		const deleteMeta = this.db.prepare("DELETE FROM entry_meta WHERE id = ?");
		const deleteFts = this.db.prepare("DELETE FROM entry_fts WHERE id = ?");
		const seen = /* @__PURE__ */ new Set();
		for (const entry of entries) {
			const id = entry.meta.id;
			seen.add(id);
			const hash = hashOf(entry);
			if (known.get(id) === hash) continue;
			const tokens = [...new Set(tokenize(indexable(entry)))].join(" ");
			this.db.exec("BEGIN");
			try {
				deleteFts.run(id);
				deleteMeta.run(id);
				insertMeta.run(id, entry.meta.kind, hash);
				insertFts.run(id, tokens);
				this.db.exec("COMMIT");
			} catch {
				this.db.exec("ROLLBACK");
			}
		}
		for (const id of known.keys()) {
			if (seen.has(id)) continue;
			this.db.exec("BEGIN");
			try {
				deleteFts.run(id);
				deleteMeta.run(id);
				this.db.exec("COMMIT");
			} catch {
				this.db.exec("ROLLBACK");
			}
		}
	}
	/** 返回候选 id（按 bm25 排序）。只做粗筛，最终排序仍走我们的 rank()。 */
	candidates(query, limit) {
		const tokens = [...new Set(tokenize(query))].slice(0, 32).map((token) => token.replace(/["']/g, ""));
		if (tokens.length === 0) return [];
		const expression = tokens.map((token) => `"${token}"`).join(" OR ");
		try {
			return this.db.prepare("SELECT id FROM entry_fts WHERE entry_fts MATCH ? ORDER BY bm25(entry_fts) LIMIT ?").all(expression, Math.max(1, Math.min(limit, 500))).map((row) => row.id);
		} catch {
			return [];
		}
	}
	close() {
		try {
			this.db.close();
		} catch {}
	}
};
function indexable(entry) {
	const meta = entry.meta;
	return [
		meta.title,
		meta.title,
		meta.summary,
		meta.summary,
		meta.tags.join(" "),
		meta.entities.join(" "),
		meta.project ?? "",
		entry.body.slice(0, 400)
	].join(" ");
}
function hashOf(entry) {
	return `${entry.meta.kind}:${entry.meta.title.length}:${entry.meta.summary.length}:${entry.meta.checksum}:${entry.body.length}`;
}

//#endregion
//#region src/host/api.ts
const EMPTY_RECALL = {
	inject: {
		events: 0,
		hits: 0,
		verbatim: 0,
		zeroHit: 0,
		chars: 0,
		tokens: 0,
		gated: 0
	},
	tool: {
		events: 0,
		hits: 0,
		zeroHit: 0
	},
	lastShare: 0,
	maxShare: 0
};
var MemoryService = class MemoryService {
	root;
	config;
	deviceId;
	store;
	episodes;
	fts = null;
	entries = [];
	issues = [];
	corpus = {
		docs: /* @__PURE__ */ new Map(),
		df: /* @__PURE__ */ new Map(),
		size: 0
	};
	loaded = false;
	recall = structuredClone(EMPTY_RECALL);
	snapshots = new SnapshotCache();
	throttles = /* @__PURE__ */ new Map();
	indexText = "";
	constructor(root, config, deviceId) {
		this.root = root;
		this.config = config;
		this.deviceId = deviceId;
		this.store = new MemoryStore(root);
		this.episodes = new EpisodeStore(root);
	}
	static async create(config, root) {
		const deviceId = await ensureDeviceId(root);
		const service = new MemoryService(root, config, deviceId);
		await service.store.init(deviceId);
		await service.refresh();
		return service;
	}
	get ready() {
		return this.loaded;
	}
	get indexBackend() {
		return this.fts ? "l1" : "l0";
	}
	/** 插件卸载时释放 sqlite 句柄 */
	dispose() {
		this.fts?.close();
		this.fts = null;
	}
	/** 重新扫描条目并重建派生索引。写入后调用；启动时调用一次。 */
	async refresh() {
		const { entries, issues } = await this.store.scan();
		this.entries = entries;
		this.issues = issues;
		this.corpus = buildCorpus(entries);
		this.indexText = renderIndex(entries);
		this.loaded = true;
		if (this.config.retrieval.backend !== "l0") {
			this.fts ??= FtsIndex.open(this.root);
			try {
				this.fts?.sync(entries);
			} catch {
				this.fts = null;
			}
		}
		await this.rebuildDerived();
		for (const listener of this.listeners) listener();
	}
	/** 常驻层注入需要在条目变化后重算，用订阅而不是给 refresh 打补丁 */
	onChange(listener) {
		this.listeners.push(listener);
		return () => {
			const at = this.listeners.indexOf(listener);
			if (at >= 0) this.listeners.splice(at, 1);
		};
	}
	listeners = [];
	async rebuildDerived() {
		const files = derivedFiles(this.entries, { alwaysChars: this.config.budget.alwaysChars });
		const result = await writeDerived(this.root, files, (abs, data) => writeFileAtomic(abs, data), (abs) => readTextFile(abs));
		this.snapshots.clear();
		return result;
	}
	list() {
		return this.entries;
	}
	issuesList() {
		return this.issues;
	}
	async get(id) {
		return this.entries.find((e) => e.meta.id === id) ?? await this.store.get(id);
	}
	async read(id, opts = {}) {
		const active = await this.get(id);
		if (active) return active;
		if (opts.archive !== false) return (await this.store.scanArchive()).find((e) => e.meta.id === id) ?? null;
		return null;
	}
	search(query, opts = {}) {
		const limit = opts.limit ?? this.config.retrieval.recallLimit;
		const pool = opts.scope === "archive" || opts.scope === "all" ? this.entries.filter((e) => opts.kind === void 0 || e.meta.kind === opts.kind) : this.entries.filter((e) => e.meta.temporal.invalidatedAt === null && (opts.kind === void 0 || e.meta.kind === opts.kind) && (opts.project === void 0 || e.meta.project === opts.project || e.meta.scope === "global"));
		let candidates = pool;
		if (query.trim() && this.fts) {
			const ids = new Set(this.fts.candidates(query, 400));
			if (ids.size > 0) candidates = pool.filter((entry) => ids.has(entry.meta.id));
		}
		const ranked = rank(candidates, query, this.corpus);
		const threshold = this.config.retrieval.gateThreshold;
		return ranked.slice(0, Math.max(limit, ranked.length)).map((r) => ({
			...r,
			gated: query.trim() !== "" && r.score < threshold
		}));
	}
	/** 目录层的紧凑视图，供 memory_recall 无 query 时使用 */
	catalog(project) {
		return renderCatalogLayer(this.entries, this.config.budget.recallChars, project);
	}
	async create(input) {
		const meta = this.store.buildMeta(input);
		const rel = await this.store.put(meta, input.body);
		await this.writeAudit("write", {
			id: meta.id,
			kind: meta.kind,
			decision: "ADD",
			src: meta.provenance.source,
			bytes: Buffer.byteLength(input.body, "utf8"),
			rev: 1
		});
		await this.refresh();
		return {
			meta: {
				...meta,
				checksum: (await this.get(meta.id))?.meta.checksum ?? meta.checksum
			},
			body: input.body,
			rel
		};
	}
	/**
	* 批量新增：**只刷新一次**。
	*
	* `create()` 每次都会全量 scan + 重建派生索引，N 条就是 O(N²)。Windows 上 40 条
	* 就能把测试跑到 5s 超时。批量导入/灌测试数据必须走这条路。
	*/
	async createMany(inputs) {
		if (inputs.length === 0) return [];
		const written = [];
		for (const input of inputs) {
			const meta = this.store.buildMeta(input);
			const rel = await this.store.put(meta, input.body);
			await this.writeAudit("write", {
				id: meta.id,
				kind: meta.kind,
				decision: "ADD",
				src: meta.provenance.source,
				bytes: Buffer.byteLength(input.body, "utf8"),
				rev: 1
			});
			written.push({
				meta,
				body: input.body,
				rel
			});
		}
		await this.refresh();
		return written.map(({ meta, body, rel }) => ({
			meta: {
				...meta,
				checksum: this.entries.find((entry) => entry.meta.id === meta.id)?.meta.checksum ?? meta.checksum
			},
			body,
			rel
		}));
	}
	async update(id, body, expectedRev) {
		const existing = await this.get(id);
		if (!existing) return {
			ok: false,
			reason: "not-found"
		};
		if (expectedRev !== void 0 && existing.meta.stats.revisions !== expectedRev) return {
			ok: false,
			reason: "stale",
			currentRev: existing.meta.stats.revisions
		};
		const meta = {
			...existing.meta,
			stats: {
				...existing.meta.stats,
				revisions: existing.meta.stats.revisions + 1
			}
		};
		const rel = await this.store.put(meta, body);
		await this.writeAudit("update", {
			id,
			rev: meta.stats.revisions,
			bytes: Buffer.byteLength(body, "utf8")
		});
		await this.refresh();
		return {
			ok: true,
			entry: {
				meta,
				body,
				rel
			}
		};
	}
	/**
	* 就地合并：同一事实的更完整版本。保留 id 与溯源（跨设备的锚点不能变），
	* 只把 title/summary/body 换成新的，revisions +1。
	*/
	async mergeInto(id, input) {
		const existing = await this.get(id);
		if (!existing) return null;
		const meta = {
			...existing.meta,
			...input.title ? { title: input.title } : {},
			...input.summary ? { summary: input.summary } : {},
			stats: {
				...existing.meta.stats,
				revisions: existing.meta.stats.revisions + 1
			}
		};
		const rel = await this.store.put(meta, input.body);
		await this.writeAudit("update", {
			id,
			rev: meta.stats.revisions,
			reason: input.reason ?? "merge",
			bytes: Buffer.byteLength(input.body, "utf8")
		});
		await this.refresh();
		return {
			meta,
			body: input.body,
			rel
		};
	}
	async invalidate(id, opts = {}) {
		const entry = await this.store.invalidate(id, opts);
		if (entry) {
			await this.writeAudit("invalidate", {
				id,
				reason: opts.reason ?? "",
				supersededBy: opts.supersededBy ?? null
			});
			await this.refresh();
		}
		return entry;
	}
	async hardDelete(id, confirm) {
		if (confirm !== id.slice(-4)) return { error: `confirm must be the last 4 characters of the id (${id.slice(-4)})` };
		const deleted = await this.store.hardDelete(id);
		await this.refresh();
		await this.writeAudit("delete", {
			id,
			hard: true,
			purged: deleted
		});
		return { deleted };
	}
	/** 召回计数延迟刷盘：立刻写回条目会让下一次渲染的指纹变化，击穿前缀缓存（原则 P4） */
	noteRecall(ids) {
		this.recall.tool.events++;
		this.recall.tool.hits += ids.length;
		if (ids.length === 0) this.recall.tool.zeroHit++;
		this.pendingHits.push(...ids);
	}
	/**
	* 被相关度门控裁掉的候选数。**必须可观测**——「该记的没被想起来」是记忆系统最痛的
	* 失败模式，静默裁掉等于把 bug 藏起来。
	*/
	noteGated(count) {
		this.recall.inject.gated += count;
	}
	pendingHits = [];
	async flushHits() {
		if (this.pendingHits.length === 0) return;
		const ids = this.pendingHits;
		this.pendingHits = [];
		const now = isoNow();
		for (const id of new Set(ids)) await this.store.patchMeta(id, (meta) => ({
			...meta,
			stats: {
				...meta.stats,
				hits: meta.stats.hits + 1,
				lastUsedAt: now,
				heat: computeHeat({
					hits: meta.stats.hits + 1,
					lastUsedAt: now
				})
			}
		}));
		await this.refresh();
	}
	snapshotFor(sessionKey, opts) {
		const candidate = renderSnapshot({
			entries: this.entries,
			mode: opts.mode,
			project: opts.project,
			globMatches: opts.globMatches,
			ready: this.loaded,
			budget: {
				alwaysChars: this.config.budget.alwaysChars,
				catalogChars: this.config.budget.catalogChars,
				globChars: this.config.budget.globChars
			}
		});
		const verbatim = this.snapshots.wasVerbatim(sessionKey, candidate.fingerprint);
		const result = this.snapshots.get(sessionKey, candidate);
		this.recall.inject.events++;
		this.recall.inject.chars += result.chars.total;
		this.recall.inject.tokens += result.tokens;
		this.recall.inject.hits += result.shown;
		if (verbatim) this.recall.inject.verbatim++;
		if (result.shown === 0 && this.entries.length > 0) this.recall.inject.zeroHit++;
		return result;
	}
	setRequestShare(share) {
		this.recall.lastShare = Number(share.toFixed(4));
		this.recall.maxShare = this.config.budget.maxShareOfRequest;
	}
	throttleFor(sessionKey) {
		let throttle = this.throttles.get(sessionKey);
		if (!throttle) {
			throttle = new Throttle(this.config.inject.fullEvery, this.config.inject.slimEvery);
			this.throttles.set(sessionKey, throttle);
		}
		return throttle;
	}
	async stats() {
		const byKind = {};
		const byScope = {};
		const bySource = {};
		let bytes = 0;
		for (const entry of this.entries) {
			byKind[entry.meta.kind] = (byKind[entry.meta.kind] ?? 0) + 1;
			byScope[entry.meta.scope] = (byScope[entry.meta.scope] ?? 0) + 1;
			bySource[entry.meta.provenance.source] = (bySource[entry.meta.provenance.source] ?? 0) + 1;
			bytes += Buffer.byteLength(entry.body, "utf8");
		}
		const lines = this.indexText.split("\n").length;
		const indexBytes = Buffer.byteLength(this.indexText, "utf8");
		return {
			root: this.root,
			ready: this.loaded,
			entryCount: this.entries.length,
			issues: this.issues,
			byKind,
			byScope,
			bySource,
			bytes,
			index: {
				lines,
				bytes: indexBytes,
				maxLines: INDEX_LIMITS.maxLines,
				maxBytes: INDEX_LIMITS.maxBytes,
				overBudget: lines > INDEX_LIMITS.maxLines || indexBytes > INDEX_LIMITS.maxBytes
			},
			recall: structuredClone(this.recall),
			alerts: this.buildAlerts()
		};
	}
	buildAlerts() {
		const alerts = [];
		for (const issue of this.issues.slice(0, 5)) alerts.push({
			level: "error",
			code: "entry-invalid",
			message: `${issue.rel}: ${issue.message}`
		});
		const lines = this.indexText.split("\n").length;
		if (lines > INDEX_LIMITS.maxLines || Buffer.byteLength(this.indexText, "utf8") > INDEX_LIMITS.maxBytes) alerts.push({
			level: "warn",
			code: "index-over-budget",
			message: `INDEX.md ${lines} lines exceeds ${INDEX_LIMITS.maxLines}; run consolidation`
		});
		if (this.recall.lastShare > this.config.budget.maxShareOfRequest) alerts.push({
			level: "warn",
			code: "budget-overrun",
			message: `injection share ${(this.recall.lastShare * 100).toFixed(1)}% exceeds ${(this.config.budget.maxShareOfRequest * 100).toFixed(1)}%`
		});
		const conflicts = this.entries.filter((e) => e.meta.links.conflictsWith.length > 0 && e.meta.temporal.invalidatedAt === null);
		if (conflicts.length > 0) alerts.push({
			level: "warn",
			code: "conflicts",
			message: `${conflicts.length} entries carry unresolved conflicts`
		});
		if (this.recall.inject.events > 20) {
			const verbatimRate = this.recall.inject.verbatim / this.recall.inject.events;
			if (verbatimRate < .5) alerts.push({
				level: "error",
				code: "prefix-cache-risk",
				message: `verbatim rate ${(verbatimRate * 100).toFixed(0)}% is low; injection text is not byte-stable`
			});
		}
		return alerts;
	}
	async writeAudit(act, fields) {
		await audit(this.root, {
			actor: "plugin",
			act,
			...fields
		});
	}
};
async function ensureDeviceId(root) {
	const rel = path.posix.join(DIRS.cache, "device.json");
	const abs = resolveInRoot(root, rel);
	const existing = await readTextFile(abs);
	if (existing) try {
		const parsed = JSON.parse(existing);
		if (parsed.id) return parsed.id;
	} catch {}
	const id = `dev-${createHash("sha256").update(`${hostname()}:${randomUUID()}`).digest("hex").slice(0, 12)}`;
	await writeFileAtomic(abs, `${JSON.stringify({
		id,
		hostname: hostname(),
		createdAt: isoNow()
	}, null, 2)}\n`);
	return id;
}

//#endregion
//#region src/config.ts
/**
* Cordis 靠「interface Config 与 const Config 同名」配对；导出普通对象无效
* （不实现 StandardSchemaV1）。枚举用 Schema.union(['a','b']) 的简写形式，
* schemastery 会把原始值转成 Schema.const（官方 README · Shorthand Syntax）。
*
* 键数上限是产品约束（见 docs/08 §4.1）：前作 @a9i5k4/dsh-auto-memory 有 159 键，
* 结果是用户一个都不改。这里 38 键。
*/
const DEFAULT_CONFIG = {
	memoryRoot: "",
	budget: {
		alwaysChars: 2e3,
		catalogChars: 1600,
		recallChars: 1600,
		globChars: 1200,
		maxShareOfRequest: .03,
		whiteboardChars: 1200
	},
	inject: {
		enabled: true,
		fullEvery: 20,
		slimEvery: 8,
		showTurnTail: false
	},
	ingest: {
		writeMode: "auto",
		autoKinds: ["episode", "project"],
		suggestTimeoutSec: 15,
		llmExtract: true,
		dailyLlmCalls: 8,
		burstThreshold: 10,
		requireEvidence: true
	},
	retrieval: {
		backend: "auto",
		vectorEnabled: false,
		gateThreshold: .35,
		recallLimit: 5
	},
	curator: {
		enabled: true,
		scheduleTime: "09:30",
		consolidateEverySessions: 20,
		promoteMinHits: 2,
		episodeTtlDays: 14,
		archiveAfterDays: 90
	},
	portability: {
		projections: {
			agentsMdPointer: true,
			skills: true
		},
		importOnFirstRun: true,
		syncTransport: "none",
		syncConflictPolicy: "ask"
	},
	privacy: {
		sensitiveTopics: true,
		piiScan: true,
		sharePii: false,
		auditKeepDays: 90
	},
	toolSurface: "standard",
	advanced: {
		snapshotKeep: 10,
		indexRebuildOnStart: false,
		shadowRetrieval: false
	}
};
const kindList = Schema.array(Schema.string()).default([...KINDS]);
const Config = Schema.object({
	memoryRoot: Schema.string().default("").description("Empty = <dshHome>/memory (~/.dsh/memory). Point it at ~/.agents/memory only if you want other tools to read the raw files."),
	budget: Schema.object({
		alwaysChars: Schema.number().default(DEFAULT_CONFIG.budget.alwaysChars).description("Hard cap of the always-on layer, in characters"),
		catalogChars: Schema.number().default(DEFAULT_CONFIG.budget.catalogChars).description("Hard cap of the L0 catalog layer, in characters"),
		recallChars: Schema.number().default(DEFAULT_CONFIG.budget.recallChars).description("Cap of a single memory_recall result"),
		globChars: Schema.number().default(DEFAULT_CONFIG.budget.globChars).description("Cap of glob-triggered dynamic injection"),
		maxShareOfRequest: Schema.number().default(DEFAULT_CONFIG.budget.maxShareOfRequest).description("Memory injection share of the whole request"),
		whiteboardChars: Schema.number().default(DEFAULT_CONFIG.budget.whiteboardChars)
	}).default({ ...DEFAULT_CONFIG.budget }),
	inject: Schema.object({
		enabled: Schema.boolean().default(true),
		fullEvery: Schema.number().default(20).description("Give the full catalog every N model requests"),
		slimEvery: Schema.number().default(8).description("Minimum gap between two slim snapshots"),
		showTurnTail: Schema.boolean().default(false).description("Show what was injected at the end of each turn")
	}).default({ ...DEFAULT_CONFIG.inject }),
	ingest: Schema.object({
		writeMode: Schema.union(WRITE_MODES).default("auto").description("auto = write immediately and undo anytime; suggest = ask before writing persona/feedback/preference"),
		autoKinds: kindList,
		suggestTimeoutSec: Schema.number().default(15),
		llmExtract: Schema.boolean().default(true),
		dailyLlmCalls: Schema.number().default(8),
		burstThreshold: Schema.number().default(10).description("Writes per hour before auto-ingest is paused (poisoning guard)"),
		requireEvidence: Schema.boolean().default(true).description("Drop LLM candidates without a quoted evidence span")
	}).default({
		...DEFAULT_CONFIG.ingest,
		autoKinds: [...DEFAULT_CONFIG.ingest.autoKinds]
	}),
	retrieval: Schema.object({
		backend: Schema.union(RETRIEVAL_BACKENDS).default("auto"),
		vectorEnabled: Schema.boolean().default(false),
		gateThreshold: Schema.number().default(.35).description("Below this score nothing is injected; dropped candidates are audited"),
		recallLimit: Schema.number().default(5)
	}).default({ ...DEFAULT_CONFIG.retrieval }),
	curator: Schema.object({
		enabled: Schema.boolean().default(true),
		scheduleTime: Schema.string().default("09:30"),
		consolidateEverySessions: Schema.number().default(20),
		promoteMinHits: Schema.number().default(2),
		episodeTtlDays: Schema.number().default(14),
		archiveAfterDays: Schema.number().default(90)
	}).default({ ...DEFAULT_CONFIG.curator }),
	portability: Schema.object({
		projections: Schema.dict(Schema.boolean()).default({ ...DEFAULT_CONFIG.portability.projections }),
		importOnFirstRun: Schema.boolean().default(true),
		syncTransport: Schema.union(SYNC_TRANSPORTS).default("none"),
		syncConflictPolicy: Schema.union(CONFLICT_POLICIES).default("ask")
	}).default({
		projections: { ...DEFAULT_CONFIG.portability.projections },
		importOnFirstRun: true,
		syncTransport: "none",
		syncConflictPolicy: "ask"
	}),
	privacy: Schema.object({
		sensitiveTopics: Schema.boolean().default(true).description("true = never write sensitive-topic memories"),
		piiScan: Schema.boolean().default(true),
		sharePii: Schema.boolean().default(false),
		auditKeepDays: Schema.number().default(90)
	}).default({ ...DEFAULT_CONFIG.privacy }),
	toolSurface: Schema.union(TOOL_SURFACES).default("standard").description("minimal = 3 tools, standard = 6"),
	advanced: Schema.object({
		snapshotKeep: Schema.number().default(10),
		indexRebuildOnStart: Schema.boolean().default(false),
		shadowRetrieval: Schema.boolean().default(false)
	}).default({ ...DEFAULT_CONFIG.advanced })
});

//#endregion
//#region src/index.ts
const name = "general-memory";
/**
* 刻意**不**导出 `inject`：写进 inject 的服务未就绪时插件永不激活。
* 所有 dsh 服务我们都按可选处理（adapter 内部自己判存在性），
* 这样即使上游改了服务名，插件也只是降级而不是彻底不加载。
*/
function apply(ctx, config) {
	const merged = deepMerge(DEFAULT_CONFIG, config ?? {});
	const root = resolveMemoryRoot(merged.memoryRoot);
	const nonce = randomBytes(16).toString("hex");
	ctx.effect(() => {
		let disposed = false;
		const disposers = [];
		(async () => {
			try {
				const api = await MemoryService.create(merged, root);
				if (disposed) {
					api.dispose();
					return;
				}
				disposers.push(() => api.dispose());
				const ingestor = new Ingestor(api, merged, ctx);
				const importer = new ImportService(api, ingestor, merged);
				const attempt = (label, fn) => {
					try {
						fn();
					} catch (cause) {
						ctx.logger?.warn?.(`[general-memory] ${label} registration failed: ${cause.message}`);
					}
				};
				ctx.inject(["tools"], (scoped) => {
					attempt("tools", () => registerTools(scoped, api, merged));
				});
				ctx.inject(["commands"], (scoped) => {
					attempt("commands", () => registerCommands(scoped, api));
				});
				ctx.inject(["webServer"], (scoped) => {
					attempt("http", () => registerHttp(scoped, api, nonce));
					attempt("nonce", () => registerNonceRoute(scoped, nonce));
					attempt("features", () => registerFeatures(scoped, nonce, {
						api,
						ingestor,
						importer
					}));
				});
				disposers.push(registerInjection(ctx, api, merged), registerIngest(ctx, ingestor, merged));
				ctx.provide?.("generalMemory", api);
				const stats = await api.stats();
				ctx.logger?.info?.(`[general-memory] ready · ${root} · ${stats.entryCount} entries · index ${stats.index.lines}/${stats.index.maxLines} lines`);
			} catch (cause) {
				ctx.logger?.error?.(`[general-memory] failed to start: ${cause.message}`);
			}
		})();
		return () => {
			disposed = true;
			for (const dispose of disposers) dispose();
		};
	}, "general-memory:boot");
}
/** config 是整体替换不深合并（Loader 语义），所以这里自己补全嵌套默认值 */
function deepMerge(base, override) {
	if (override === null || override === void 0) return base;
	if (typeof base !== "object" || base === null || Array.isArray(base)) return override ?? base;
	const out = { ...base };
	for (const [key, value] of Object.entries(override)) {
		if (value === void 0) continue;
		const current = out[key];
		out[key] = typeof current === "object" && current !== null && !Array.isArray(current) ? deepMerge(current, value) : value;
	}
	return out;
}

//#endregion
export { Config, apply, name };