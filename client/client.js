window.__ModuleLoader__.load({ id: "dsh-general-automatic-memory", factory: (require) => {
	var module = { exports: {} };
	var exports = module.exports;
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	let react = require("react");

	//#region locale/en.json
	var en_default = {
		meta: {
			"title": "General Automatic Memory",
			"description": "Cross-tool, human-editable, self-indexing long-term memory with a fixed token budget."
		},
		panel: {
			"title": "Memory",
			"loading": "Loading memory…",
			"empty": "No memories yet. Tell the agent something worth remembering, or import from another tool.",
			"error": "This view failed to render.",
			"retry": "Retry",
			"hostUnavailable": "Host routes unavailable. Tools and slash commands still work."
		},
		nav: {
			"overview": "Overview",
			"browse": "Browse",
			"import": "Import",
			"graph": "Genealogy",
			"recovery": "Recovery",
			"audit": "Audit",
			"timeline": "Timeline",
			"settings": "Settings"
		},
		overview: {
			"budget": "Injection budget",
			"budgetShare": "Share of request",
			"entries": "Entries",
			"cacheHealth": "Prefix-cache health",
			"verbatimRate": "Byte-identical rate",
			"prefixBreaks": "Prefix breaks",
			"recent": "Recent writes",
			"recall": "Recall",
			"zeroHit": "Zero-hit rate",
			"gated": "Gated out",
			"alerts": "Alerts",
			"noAlerts": "All clear."
		},
		browse: {
			"search": "Search memories…",
			"allKinds": "All kinds",
			"noResults": "Nothing matched.",
			"hits": "hits",
			"open": "Open",
			"source": "Source",
			"confidence": "Confidence"
		},
		kind: {
			"persona": "Persona",
			"preference": "Preference",
			"feedback": "Feedback",
			"relations": "Relations",
			"project": "Project",
			"reference": "Reference",
			"procedure": "Procedure",
			"episode": "Episode"
		},
		"import": {
			"hint": "Bring in memory files and past conversations from other agents. Scan is read-only; a snapshot is taken before applying.",
			"memory": "Memory files",
			"conversation": "Conversations → memory",
			"new": "New",
			"merge": "Merge",
			"duplicate": "Existing",
			"skipped": "Skipped files",
			"selectAll": "Select all",
			"selectNone": "Select none",
			"cancel": "Cancel",
			"apply": "Import",
			"done": "Import complete",
			"added": "added",
			"updated": "updated",
			"noop": "already present",
			"rejected": "blocked",
			"snapshot": "Snapshot",
			"budgetWarn": "Always layer will exceed budget"
		},
		confirm: {
			"prompt": "Remember this?",
			"accept": "Remember",
			"reject": "No",
			"edit": "Edit",
			"autoDismiss": "Ignored in {n}s"
		},
		timeline: {
			"asOf": "As of",
			"hint": "Shows memories valid on that date (validFrom ≤ date < invalidatedAt) — answers “why did the agent decide that back then”."
		},
		graph: {
			"entity": "Filter by entity",
			"empty": "No relations yet. Say “X owns Y” and one will be created."
		},
		audit: {
			"allActs": "All actions",
			"empty": "No audit records for this day."
		},
		recovery: {
			"consolidate": "Consolidate",
			"export": "Export zip",
			"exported": "Exported",
			"diff": "Diff of the two latest snapshots",
			"snapshots": "Snapshots",
			"noSnapshots": "No snapshots yet (created automatically before import/consolidation)",
			"restore": "Restore",
			"restored": "Restored"
		},
		settings: {
			"hint": "These values come from the dsh profile (cordis.patch.yml). Edit them in dsh Plugins / Settings; this view is read-only.",
			"projections": "Optional: one-way projections",
			"projectionHint": "Export memory into formats other tools read. Off by default — the value of this plugin is importing in, not sharing out.",
			"applied": "Projected",
			"applyEnabled": "Apply enabled projections"
		}
	};

	//#endregion
	//#region locale/zh.json
	var zh_default = {
		meta: {
			"title": "通用自动记忆",
			"description": "跨工具、可编辑、自索引的长期记忆，注入 token 成本恒定可控。"
		},
		panel: {
			"title": "记忆",
			"loading": "正在加载记忆…",
			"empty": "还没有记忆。说点值得长期记住的事，或从其他工具导入。",
			"error": "本视图渲染失败。",
			"retry": "重试",
			"hostUnavailable": "Host 路由不可用。工具与 slash 命令仍可正常使用。"
		},
		nav: {
			"overview": "总览",
			"browse": "浏览",
			"import": "导入",
			"graph": "族谱",
			"recovery": "恢复",
			"audit": "审计",
			"timeline": "时间线",
			"settings": "设置"
		},
		overview: {
			"budget": "注入预算",
			"budgetShare": "占请求比例",
			"entries": "条目",
			"cacheHealth": "前缀缓存健康",
			"verbatimRate": "逐字节复读率",
			"prefixBreaks": "前缀击穿次数",
			"recent": "最近写入",
			"recall": "召回",
			"zeroHit": "零命中率",
			"gated": "被门控裁掉",
			"alerts": "告警",
			"noAlerts": "一切正常。"
		},
		browse: {
			"search": "搜索记忆…",
			"allKinds": "全部类型",
			"noResults": "没有匹配的记忆。",
			"hits": "次命中",
			"open": "打开",
			"source": "来源",
			"confidence": "可信度"
		},
		kind: {
			"persona": "画像",
			"preference": "偏好",
			"feedback": "反馈",
			"relations": "关系",
			"project": "项目",
			"reference": "参考",
			"procedure": "程序",
			"episode": "情景"
		},
		"import": {
			"hint": "把其他 agent 的记忆文件与历史会话收编进来。扫描只读不写，导入前自动快照。",
			"memory": "记忆文件",
			"conversation": "历史会话 → 记忆",
			"new": "新增",
			"merge": "合并",
			"duplicate": "已有",
			"skipped": "跳过文件",
			"selectAll": "全选",
			"selectNone": "全不选",
			"cancel": "取消",
			"apply": "导入",
			"done": "导入完成",
			"added": "新增",
			"updated": "更新",
			"noop": "已存在",
			"rejected": "被拦截",
			"snapshot": "快照",
			"budgetWarn": "常驻层将超预算"
		},
		confirm: {
			"prompt": "要记住这条吗？",
			"accept": "记住",
			"reject": "不要",
			"edit": "改一下",
			"autoDismiss": "{n} 秒后自动忽略"
		},
		timeline: {
			"asOf": "查看日期",
			"hint": "显示「当时有效」的记忆（validFrom ≤ 日期 < invalidatedAt），用来回答“为什么那时候做了那个决定”。"
		},
		graph: {
			"entity": "按实体过滤",
			"empty": "还没有关系记忆。说一句“谁负责什么”就会生成。"
		},
		audit: {
			"allActs": "全部动作",
			"empty": "这一天没有审计记录。"
		},
		recovery: {
			"consolidate": "固化",
			"export": "导出 zip",
			"exported": "已导出",
			"diff": "最近两次快照差异",
			"snapshots": "快照",
			"noSnapshots": "还没有快照（导入/固化前会自动创建）",
			"restore": "回滚",
			"restored": "已恢复"
		},
		settings: {
			"hint": "配置值来自 dsh 的 profile（cordis.patch.yml）。改配置请用 dsh 的 Plugins / Settings 页，面板这里只读。",
			"projections": "可选：单向投影",
			"projectionHint": "把记忆导出成其他工具能读的格式。默认关闭——本插件的价值在“导入进来”，不在“共享出去”。",
			"applied": "已投影",
			"applyEnabled": "应用已启用的投影"
		}
	};

	//#endregion
	//#region src/client/api.ts
	/**
	* 面板 ↔ Host 的通信：同源相对路径 fetch。
	*
	* 不写死 host/port —— 手机浏览器经 SSH / public deployment 访问同一个 Host 时，
	* 相对路径才是唯一正确的做法（docs/07 §6）。
	*/
	const PREFIX = "/general-memory";
	let nonce = null;
	let noncePromise = null;
	async function ensureNonce() {
		if (nonce !== null) return nonce;
		if (!noncePromise) noncePromise = fetchJson(`${PREFIX}/nonce`).then((value) => {
			nonce = value?.nonce ?? null;
			return nonce;
		}).catch(() => null);
		return noncePromise;
	}
	async function fetchJson(path, init) {
		const response = await fetch(path, {
			credentials: "same-origin",
			...init,
			headers: {
				accept: "application/json",
				...init?.headers ?? {}
			}
		});
		if (!response.ok) {
			let detail = "";
			try {
				detail = JSON.stringify(await response.json());
			} catch {
				detail = response.statusText;
			}
			throw new Error(`${response.status} ${path} ${detail}`);
		}
		return await response.json();
	}
	async function get(path, params) {
		const search = new URLSearchParams();
		for (const [key, value] of Object.entries(params ?? {})) if (value !== void 0 && value !== "") search.set(key, String(value));
		const qs = search.toString();
		return fetchJson(`${PREFIX}/${path}${qs ? `?${qs}` : ""}`);
	}
	async function post(path, body) {
		const token = await ensureNonce();
		return fetchJson(`${PREFIX}/${path}`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				...token ? { "x-gam-nonce": token } : {}
			},
			body: JSON.stringify(body ?? {})
		});
	}
	const api = {
		stats: () => get("stats"),
		entries: (params) => get("entries", params),
		entry: (id) => get("entry", { id }),
		catalog: (project) => get("catalog", { project }),
		patch: (id, body, expectedRev) => post("entry/patch", {
			id,
			body,
			expectedRev
		}),
		invalidate: (id, reason) => post("entry/invalidate", {
			id,
			reason
		}),
		doctor: (fix) => post(`doctor${fix ? "?fix=1" : ""}`, {}),
		importSources: () => get("import/sources"),
		importScan: (body) => post("import/scan", body),
		importApply: (body) => post("import/apply", body),
		snapshots: () => get("snapshots"),
		audit: (date, limit = 200) => get("audit", {
			date,
			limit
		}),
		graph: (entity) => get("graph", { entity }),
		consolidate: () => post("consolidate", {}),
		snapshotDiff: (a, b) => get("snapshot/diff", {
			a,
			b
		}),
		restore: (label) => post("snapshot/restore", { label }),
		projections: () => get("projections"),
		applyProjections: (ids) => post("projections/apply", { ids }),
		exportZip: () => post("export", {}),
		config: () => get("config"),
		pending: () => get("pending-writes"),
		decidePending: (id, action) => post("pending-writes/decide", {
			id,
			action
		})
	};

	//#endregion
	//#region src/client/styles.ts
	/**
	* 样式。
	*
	* 官方约束（docs/web-styling.md + practices.md）：
	* - feature 包只消费主题 token，**禁止写死颜色**，禁止在 feature CSS 里写主题选择器
	* - 禁止 import `@deepseek-ai/dsh-client-ui-primitives` 等宿主 client 包（要控件就自己写）
	* - CSS Modules 可用；这里为了避免引入 CSS 构建产物（会多一个 chunk 请求），
	*   用一次性 <style> 注入，类名统一 `.gam-` 前缀。
	*
	* 配色策略：全部用 `currentColor` + `color-mix()`，不出现任何字面色值。
	* 这样明暗主题、宿主换肤都自动跟随，且天然满足「禁止写死颜色」。
	* 等能用 `cordis_inspect_query` 的 Theme provider 枚举出真实 token 名后，
	* 再切换成 `--dsw-alias-*` 语义别名（见 docs/07 §12）。
	*/
	const STYLE_ID = "gam-styles";
	const CSS = `
	.gam-root { display: flex; flex-direction: column; height: 100%; min-height: 0; font-size: 13px; line-height: 1.5; }
	.gam-head { display: flex; align-items: baseline; gap: 12px; padding: 12px 16px; border-bottom: 1px solid color-mix(in srgb, currentColor 14%, transparent); }
	.gam-title { font-size: 15px; font-weight: 600; }
	.gam-sub { color: color-mix(in srgb, currentColor 60%, transparent); font-size: 12px; }
	.gam-nav { display: flex; gap: 4px; padding: 8px 16px 0; flex-wrap: wrap; }
	.gam-nav button { all: unset; cursor: pointer; padding: 5px 12px; border-radius: 8px; font-size: 12px;
	  color: color-mix(in srgb, currentColor 70%, transparent); }
	.gam-nav button:hover { background: color-mix(in srgb, currentColor 8%, transparent); }
	.gam-nav button[aria-current="page"] { background: color-mix(in srgb, currentColor 14%, transparent);
	  color: currentColor; font-weight: 600; }
	.gam-nav button:focus-visible { outline: 2px solid currentColor; outline-offset: 1px; }
	.gam-body { flex: 1; min-height: 0; overflow: auto; padding: 16px; }
	.gam-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
	.gam-card { border: 1px solid color-mix(in srgb, currentColor 14%, transparent); border-radius: 10px; padding: 12px; }
	.gam-card h3 { margin: 0 0 6px; font-size: 12px; font-weight: 600;
	  color: color-mix(in srgb, currentColor 65%, transparent); text-transform: uppercase; letter-spacing: .04em; }
	.gam-big { font-size: 22px; font-weight: 600; font-variant-numeric: tabular-nums; }
	.gam-meter { height: 6px; border-radius: 3px; background: color-mix(in srgb, currentColor 12%, transparent); overflow: hidden; margin-top: 8px; }
	.gam-meter > i { display: block; height: 100%; background: currentColor; opacity: .75; }
	.gam-row { display: flex; justify-content: space-between; gap: 8px; font-variant-numeric: tabular-nums; }
	.gam-muted { color: color-mix(in srgb, currentColor 60%, transparent); }
	.gam-alerts { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
	.gam-alert { border-left: 3px solid currentColor; padding: 6px 10px; border-radius: 0 8px 8px 0;
	  background: color-mix(in srgb, currentColor 6%, transparent); font-size: 12px; }
	.gam-alert[data-level="error"] { background: color-mix(in srgb, currentColor 16%, transparent); font-weight: 600; }
	.gam-toolbar { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
	.gam-input { all: unset; box-sizing: border-box; flex: 1; min-width: 180px; padding: 7px 10px; border-radius: 8px;
	  border: 1px solid color-mix(in srgb, currentColor 18%, transparent); font-size: 13px; }
	.gam-input:focus-visible { border-color: currentColor; }
	.gam-select { all: unset; cursor: pointer; padding: 7px 10px; border-radius: 8px; font-size: 12px;
	  border: 1px solid color-mix(in srgb, currentColor 18%, transparent); }
	.gam-list { display: flex; flex-direction: column; gap: 6px; }
	.gam-item { all: unset; box-sizing: border-box; cursor: pointer; display: block; width: 100%;
	  border: 1px solid color-mix(in srgb, currentColor 12%, transparent); border-radius: 10px; padding: 10px 12px; }
	.gam-item:hover { background: color-mix(in srgb, currentColor 6%, transparent); }
	.gam-item:focus-visible { outline: 2px solid currentColor; outline-offset: 1px; }
	.gam-item-title { font-weight: 600; }
	.gam-item-sum { color: color-mix(in srgb, currentColor 70%, transparent); font-size: 12px; margin-top: 2px; }
	.gam-tags { display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap; align-items: center; }
	.gam-tag { font-size: 11px; padding: 1px 7px; border-radius: 999px;
	  border: 1px solid color-mix(in srgb, currentColor 20%, transparent);
	  color: color-mix(in srgb, currentColor 75%, transparent); }
	.gam-detail { border: 1px solid color-mix(in srgb, currentColor 14%, transparent); border-radius: 10px;
	  padding: 14px; margin-top: 12px; }
	.gam-pre { white-space: pre-wrap; word-break: break-word; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	  font-size: 12px; background: color-mix(in srgb, currentColor 5%, transparent); padding: 10px; border-radius: 8px; margin: 8px 0 0; }
	.gam-actions { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
	.gam-btn { all: unset; cursor: pointer; padding: 6px 12px; border-radius: 8px; font-size: 12px;
	  border: 1px solid color-mix(in srgb, currentColor 22%, transparent); }
	.gam-btn:hover { background: color-mix(in srgb, currentColor 10%, transparent); }
	.gam-btn:focus-visible { outline: 2px solid currentColor; outline-offset: 1px; }
	.gam-btn[data-tone="danger"] { font-weight: 600; }
	.gam-empty { color: color-mix(in srgb, currentColor 60%, transparent); padding: 32px 0; text-align: center; }
	.gam-error { border: 1px solid currentColor; border-radius: 10px; padding: 12px; }
	.gam-icon { display: block; }
	.gam-confirm { margin: 6px 0; padding: 8px 10px; border-radius: 10px;
	  border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
	  background: color-mix(in srgb, currentColor 6%, transparent); font-size: 12px; }
	.gam-confirm-head { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
	.gam-confirm-title { font-weight: 600; }
	.gam-confirm-body { margin-top: 4px; font-weight: 600; }
	.gam-confirm-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 6px; }
	.gam-card[disabled] { opacity: .5; cursor: default; }
	.gam-detail .gam-item { cursor: default; }
	.gam-detail .gam-item:hover { background: transparent; }
	.gam-detail .gam-item-title { display: inline; }

	@media (max-width: 767px) {
	  .gam-body { padding: 12px; }
	  .gam-grid { grid-template-columns: 1fr; }
	  .gam-head { padding: 10px 12px; }
	}
	`;
	function ensureStyles() {
		if (typeof document === "undefined") return;
		if (document.getElementById("gam-styles")) return;
		const style = document.createElement("style");
		style.id = STYLE_ID;
		style.textContent = CSS;
		document.head.appendChild(style);
	}

	//#endregion
	//#region src/client/panel.ts
	/** 侧栏图标（slot: sidebar.panellist，owner props 为 { size, active }） */
	function MemoryPanelIcon(props) {
		const size = props.size ?? 20;
		return (0, react.createElement)("svg", {
			className: "gam-icon",
			viewBox: "0 0 24 24",
			width: size,
			height: size,
			fill: "none",
			stroke: "currentColor",
			"stroke-width": 1.6,
			"stroke-linecap": "round",
			"stroke-linejoin": "round",
			"aria-hidden": true,
			opacity: props.active ? 1 : .75
		}, (0, react.createElement)("path", { d: "M5 4h10l4 4v12H5z" }), (0, react.createElement)("path", { d: "M15 4v4h4" }), (0, react.createElement)("circle", {
			cx: "9",
			cy: "12",
			r: "1.2",
			fill: "currentColor",
			stroke: "none"
		}), (0, react.createElement)("circle", {
			cx: "15",
			cy: "16",
			r: "1.2",
			fill: "currentColor",
			stroke: "none"
		}), (0, react.createElement)("path", {
			d: "M9 12l6 4",
			opacity: .6
		}));
	}
	/**
	* 面板根组件。每个视图都包 ErrorBoundary：组件抛错时 dsh 只会让 slot 空白，
	* console 里留一行 `slot entry crashed in '<slot>'`，用户看到的是「点了没反应」——
	* 必须自己降级成可读的错误而不是白屏。
	*/
	function MemoryPanel(props) {
		ensureStyles();
		const [view, setView] = (0, react.useState)("overview");
		const t = props.t;
		return (0, react.createElement)("div", { className: "gam-root" }, (0, react.createElement)("header", { className: "gam-head" }, (0, react.createElement)("span", { className: "gam-title" }, t("panel.title")), (0, react.createElement)("span", { className: "gam-sub" }, "dsh-general-automatic-memory")), (0, react.createElement)("nav", {
			className: "gam-nav",
			"aria-label": t("panel.title")
		}, navButton("overview", t("nav.overview"), view, setView), navButton("browse", t("nav.browse"), view, setView), navButton("import", t("nav.import"), view, setView), navButton("timeline", t("nav.timeline"), view, setView), navButton("graph", t("nav.graph"), view, setView), navButton("audit", t("nav.audit"), view, setView), navButton("recovery", t("nav.recovery"), view, setView), navButton("settings", t("nav.settings"), view, setView)), (0, react.createElement)("main", { className: "gam-body" }, (0, react.createElement)(Boundary, { label: view }, view === "overview" ? (0, react.createElement)(Overview, { t }) : view === "browse" ? (0, react.createElement)(Browse, { t }) : view === "import" ? (0, react.createElement)(ImportView, { t }) : view === "timeline" ? (0, react.createElement)(TimelineView, { t }) : view === "graph" ? (0, react.createElement)(GraphView, { t }) : view === "audit" ? (0, react.createElement)(AuditView, { t }) : view === "recovery" ? (0, react.createElement)(RecoveryView, { t }) : (0, react.createElement)(SettingsView, { t }))));
	}
	function navButton(id, label, current, setView) {
		return (0, react.createElement)("button", {
			type: "button",
			key: id,
			"aria-current": current === id ? "page" : void 0,
			onClick: () => setView(id)
		}, label);
	}
	function Overview(props) {
		const t = props.t;
		const [stats, setStats] = (0, react.useState)(null);
		const [error, setError] = (0, react.useState)(null);
		const [fixing, setFixing] = (0, react.useState)(false);
		const load = (0, react.useCallback)(() => {
			api.stats().then(setStats).catch((cause) => setError(cause.message));
		}, []);
		(0, react.useEffect)(() => {
			load();
			const timer = setInterval(() => {
				if (!document.hidden) load();
			}, 2e3);
			return () => clearInterval(timer);
		}, [load]);
		if (error) return (0, react.createElement)("div", { className: "gam-error" }, (0, react.createElement)("div", null, t("panel.hostUnavailable")), (0, react.createElement)("pre", { className: "gam-pre" }, error), (0, react.createElement)("div", { className: "gam-actions" }, (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			onClick: () => {
				setError(null);
				load();
			}
		}, t("panel.retry"))));
		if (!stats) return (0, react.createElement)("div", { className: "gam-empty" }, t("panel.loading"));
		const share = stats.recall.lastShare;
		const shareCap = stats.recall.maxShare || .03;
		const verbatimRate = stats.recall.inject.events > 0 ? stats.recall.inject.verbatim / stats.recall.inject.events : 1;
		const zeroHitRate = stats.recall.tool.events > 0 ? stats.recall.tool.zeroHit / stats.recall.tool.events : 0;
		return (0, react.createElement)("div", null, (0, react.createElement)("div", { className: "gam-grid" }, card(t("overview.budget"), (0, react.createElement)("div", { className: "gam-big" }, `${(share * 100).toFixed(2)}%`), [
			meter(Math.min(1, share / shareCap)),
			row(t("overview.budgetShare"), `${(shareCap * 100).toFixed(0)}% cap`),
			row("index", `${stats.index.lines}/${stats.index.maxLines} lines`),
			row("bytes", `${stats.index.bytes}/${stats.index.maxBytes}`)
		]), card(t("overview.cacheHealth"), (0, react.createElement)("div", { className: "gam-big" }, `${(verbatimRate * 100).toFixed(0)}%`), [
			meter(verbatimRate),
			row(t("overview.verbatimRate"), `${stats.recall.inject.verbatim}/${stats.recall.inject.events}`),
			row("inject chars", String(stats.recall.inject.chars)),
			row("inject tokens", String(stats.recall.inject.tokens))
		]), card(t("overview.entries"), (0, react.createElement)("div", { className: "gam-big" }, String(stats.entryCount)), [...Object.entries(stats.byKind).sort((a, b) => b[1] - a[1]).map(([kind, n]) => row(`${t(`kind.${kind}`) === `kind.${kind}` ? kind : t(`kind.${kind}`)}`, String(n))), row("issues", String(stats.issues.length))]), card(t("overview.recall"), (0, react.createElement)("div", { className: "gam-big" }, String(stats.recall.tool.events)), [
			row(t("overview.zeroHit"), `${(zeroHitRate * 100).toFixed(0)}%`),
			row(t("overview.gated"), String(stats.recall.inject.gated)),
			row("hits", String(stats.recall.tool.hits))
		])), (0, react.createElement)("section", {
			className: "gam-alerts",
			"aria-label": t("overview.alerts")
		}, stats.alerts.length === 0 ? (0, react.createElement)("div", { className: "gam-muted" }, t("overview.noAlerts")) : stats.alerts.map((alert) => (0, react.createElement)("div", {
			className: "gam-alert",
			key: alert.code,
			"data-level": alert.level
		}, `${alert.code} · ${alert.message}`))), (0, react.createElement)("div", { className: "gam-actions" }, (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			disabled: fixing,
			onClick: () => {
				setFixing(true);
				api.doctor(true).then(load).catch((cause) => setError(cause.message)).finally(() => setFixing(false));
			}
		}, fixing ? "…" : `${t("nav.recovery")} · doctor`), (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			onClick: load
		}, t("panel.retry"))), (0, react.createElement)("p", {
			className: "gam-muted",
			style: {
				marginTop: "12px",
				wordBreak: "break-all"
			}
		}, stats.root));
	}
	function card(title, headline, rows) {
		return (0, react.createElement)("div", {
			className: "gam-card",
			key: title
		}, (0, react.createElement)("h3", null, title), headline, ...rows);
	}
	function row(label, value) {
		return (0, react.createElement)("div", {
			className: "gam-row",
			key: label
		}, (0, react.createElement)("span", { className: "gam-muted" }, label), (0, react.createElement)("span", null, value));
	}
	function meter(ratio) {
		const pct = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0)) * 100;
		return (0, react.createElement)("div", {
			className: "gam-meter",
			role: "presentation"
		}, (0, react.createElement)("i", { style: { width: `${pct}%` } }));
	}
	const KINDS = [
		"persona",
		"preference",
		"feedback",
		"relations",
		"project",
		"reference",
		"procedure"
	];
	function Browse(props) {
		const t = props.t;
		const [query, setQuery] = (0, react.useState)("");
		const [kind, setKind] = (0, react.useState)("");
		const [items, setItems] = (0, react.useState)([]);
		const [total, setTotal] = (0, react.useState)(0);
		const [selected, setSelected] = (0, react.useState)(null);
		const [error, setError] = (0, react.useState)(null);
		const [busy, setBusy] = (0, react.useState)(false);
		const load = (0, react.useCallback)((q, k) => {
			setBusy(true);
			api.entries({
				q: q || void 0,
				kind: k || void 0,
				limit: 200
			}).then((page) => {
				setItems(page.items);
				setTotal(page.total);
			}).catch((cause) => setError(cause.message)).finally(() => setBusy(false));
		}, []);
		(0, react.useEffect)(() => {
			load(query, kind);
		}, [
			kind,
			load,
			query
		]);
		const open = (0, react.useCallback)((id) => {
			api.entry(id).then(setSelected).catch((cause) => setError(cause.message));
		}, []);
		return (0, react.createElement)("div", null, (0, react.createElement)("div", { className: "gam-toolbar" }, (0, react.createElement)("input", {
			className: "gam-input",
			type: "search",
			value: query,
			placeholder: t("browse.search"),
			"aria-label": t("browse.search"),
			onChange: (event) => setQuery(event.target.value)
		}), (0, react.createElement)("select", {
			className: "gam-select",
			value: kind,
			"aria-label": t("browse.allKinds"),
			onChange: (event) => setKind(event.target.value)
		}, (0, react.createElement)("option", { value: "" }, t("browse.allKinds")), ...KINDS.map((value) => (0, react.createElement)("option", {
			value,
			key: value
		}, t(`kind.${value}`)))), (0, react.createElement)("span", { className: "gam-muted" }, busy ? "…" : `${total}`)), error ? (0, react.createElement)("div", { className: "gam-error" }, error) : null, items.length === 0 && !busy ? (0, react.createElement)("div", { className: "gam-empty" }, query || kind ? t("browse.noResults") : t("panel.empty")) : (0, react.createElement)("div", {
			className: "gam-list",
			role: "list"
		}, items.map((item) => (0, react.createElement)("button", {
			className: "gam-item",
			type: "button",
			role: "listitem",
			key: item.id,
			onClick: () => open(item.id)
		}, (0, react.createElement)("div", { className: "gam-item-title" }, item.title), (0, react.createElement)("div", { className: "gam-item-sum" }, item.summary), (0, react.createElement)("div", { className: "gam-tags" }, (0, react.createElement)("span", { className: "gam-tag" }, t(`kind.${item.kind}`)), (0, react.createElement)("span", { className: "gam-tag" }, item.confidence), (0, react.createElement)("span", { className: "gam-tag" }, item.source), (0, react.createElement)("span", { className: "gam-tag" }, item.activation), item.pii ? (0, react.createElement)("span", { className: "gam-tag" }, "PII") : null, item.invalidatedAt ? (0, react.createElement)("span", { className: "gam-tag" }, "invalidated") : null, (0, react.createElement)("span", { className: "gam-tag" }, `${item.hits} ${t("browse.hits")}`), typeof item.score === "number" ? (0, react.createElement)("span", { className: "gam-tag" }, item.score.toFixed(3)) : null)))), selected ? (0, react.createElement)(Detail, {
			entry: selected,
			t,
			onChanged: () => {
				load(query, kind);
				setSelected(null);
			}
		}) : null);
	}
	function Detail(props) {
		const t = props.t;
		const entry = props.entry;
		const [reason, setReason] = (0, react.useState)("");
		const [message, setMessage] = (0, react.useState)(null);
		return (0, react.createElement)("div", { className: "gam-detail" }, (0, react.createElement)("div", { className: "gam-item-title" }, entry.meta.title), (0, react.createElement)("div", { className: "gam-muted" }, entry.meta.summary), (0, react.createElement)("div", { className: "gam-tags" }, (0, react.createElement)("span", { className: "gam-tag" }, entry.meta.id), (0, react.createElement)("span", { className: "gam-tag" }, entry.rel), (0, react.createElement)("span", { className: "gam-tag" }, JSON.stringify(entry.meta.provenance))), (0, react.createElement)("pre", { className: "gam-pre" }, entry.body), (0, react.createElement)("div", { className: "gam-actions" }, (0, react.createElement)("input", {
			className: "gam-input",
			value: reason,
			placeholder: "reason (required to invalidate)",
			"aria-label": "reason",
			onChange: (event) => setReason(event.target.value)
		}), (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			"data-tone": "danger",
			onClick: () => {
				if (!reason.trim()) {
					setMessage("a reason is required — forgetting must be explainable");
					return;
				}
				api.invalidate(entry.meta.id, reason.trim()).then(() => props.onChanged()).catch((cause) => setMessage(cause.message));
			}
		}, "Invalidate"), message ? (0, react.createElement)("span", { className: "gam-muted" }, message) : null), (0, react.createElement)("p", { className: "gam-muted" }, t("browse.open") + ": " + entry.rel));
	}
	function ImportView(props) {
		const t = props.t;
		const [sources, setSources] = (0, react.useState)([]);
		const [scan, setScan] = (0, react.useState)(null);
		const [selected, setSelected] = (0, react.useState)(/* @__PURE__ */ new Set());
		const [report, setReport] = (0, react.useState)(null);
		const [error, setError] = (0, react.useState)(null);
		const [busy, setBusy] = (0, react.useState)(false);
		(0, react.useEffect)(() => {
			api.importSources().then((result) => setSources(result.sources)).catch((cause) => setError(cause.message));
		}, []);
		const pick = (source) => {
			setBusy(true);
			setReport(null);
			setError(null);
			setScan(null);
			api.importScan({
				source: source.id,
				limit: 200
			}).then((result) => {
				setScan(result);
				setSelected(new Set(result.items.filter((item) => !item.duplicateOf && !item.pii).map((item) => item.key)));
			}).catch((cause) => setError(cause.message)).finally(() => setBusy(false));
		};
		const toggle = (key) => {
			setSelected((prev) => {
				const next = new Set(prev);
				if (next.has(key)) next.delete(key);
				else next.add(key);
				return next;
			});
		};
		const apply = () => {
			if (!scan || selected.size === 0) return;
			setBusy(true);
			api.importApply({
				scanId: scan.scanId,
				keys: [...selected]
			}).then((result) => {
				setReport(result);
				setScan(null);
				setSelected(/* @__PURE__ */ new Set());
			}).catch((cause) => setError(cause.message)).finally(() => setBusy(false));
		};
		const memorySources = sources.filter((source) => source.kind === "memory");
		const conversationSources = sources.filter((source) => source.kind === "conversation");
		return (0, react.createElement)("div", null, (0, react.createElement)("p", { className: "gam-muted" }, t("import.hint")), error ? (0, react.createElement)("div", { className: "gam-error" }, error) : null, scan ? null : (0, react.createElement)("div", null, section(t("import.memory"), memorySources, pick, busy), section(t("import.conversation"), conversationSources, pick, busy)), report ? (0, react.createElement)("div", { className: "gam-detail" }, (0, react.createElement)("div", { className: "gam-item-title" }, t("import.done")), (0, react.createElement)("div", { className: "gam-tags" }, chip(`${t("import.added")} ${report.added}`), chip(`${t("import.updated")} ${report.updated}`), chip(`${t("import.noop")} ${report.noop}`), chip(`${t("import.rejected")} ${report.rejected}`)), (0, react.createElement)("p", { className: "gam-muted" }, `${t("import.snapshot")}: ${report.snapshot}`)) : null, scan ? (0, react.createElement)("div", { className: "gam-detail" }, (0, react.createElement)("div", { className: "gam-item-title" }, `${scan.label} · ${scan.items.length}`), (0, react.createElement)("div", { className: "gam-tags" }, chip(`${t("import.new")} ${scan.estimate.added}`), chip(`${t("import.merge")} ${scan.estimate.merged}`), chip(`${t("import.duplicate")} ${scan.estimate.duplicate}`), scan.estimate.pii > 0 ? chip(`PII ${scan.estimate.pii}`) : null, scan.budget?.overBudget ? (0, react.createElement)("span", { className: "gam-tag" }, t("import.budgetWarn")) : null), scan.skipped.length > 0 ? (0, react.createElement)("p", { className: "gam-muted" }, `${t("import.skipped")}: ${scan.skipped.length}`) : null, (0, react.createElement)("div", { className: "gam-actions" }, (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			onClick: () => setSelected(new Set(scan.items.map((i) => i.key)))
		}, t("import.selectAll")), (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			onClick: () => setSelected(/* @__PURE__ */ new Set())
		}, t("import.selectNone")), (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			onClick: () => setScan(null)
		}, t("import.cancel")), (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			disabled: busy || selected.size === 0,
			onClick: apply
		}, `${t("import.apply")} ${selected.size}`)), (0, react.createElement)("div", {
			className: "gam-list",
			style: { marginTop: "10px" }
		}, scan.items.slice(0, 300).map((item) => (0, react.createElement)("label", {
			className: "gam-item",
			key: item.key,
			style: { cursor: "pointer" }
		}, (0, react.createElement)("input", {
			type: "checkbox",
			checked: selected.has(item.key),
			onChange: () => toggle(item.key),
			style: { marginRight: "8px" }
		}), (0, react.createElement)("span", { className: "gam-item-title" }, item.title), (0, react.createElement)("div", { className: "gam-item-sum" }, item.summary), (0, react.createElement)("div", { className: "gam-tags" }, chip(t(`kind.${item.kind}`)), chip(item.activation), item.duplicateOf ? chip(t("import.duplicate")) : null, item.pii ? chip("PII") : null, (0, react.createElement)("span", { className: "gam-tag" }, item.origin)))))) : null);
	}
	function section(title, sources, pick, busy) {
		if (sources.length === 0) return null;
		return (0, react.createElement)("section", { style: { marginTop: "14px" } }, (0, react.createElement)("h3", { style: {
			fontSize: "12px",
			margin: "0 0 8px",
			opacity: .7
		} }, title), (0, react.createElement)("div", { className: "gam-grid" }, sources.map((source) => (0, react.createElement)("button", {
			className: "gam-card",
			key: source.id,
			type: "button",
			disabled: busy,
			onClick: () => pick(source),
			style: {
				textAlign: "left",
				cursor: "pointer",
				font: "inherit",
				color: "inherit",
				background: "transparent"
			}
		}, (0, react.createElement)("h3", null, source.label), (0, react.createElement)("div", { className: "gam-muted" }, source.detected.length > 0 ? `${source.detected.length} 处 · ${source.detected[0]}` : "未检测到")))));
	}
	function chip(text) {
		return (0, react.createElement)("span", { className: "gam-tag" }, text);
	}
	function TimelineView(props) {
		const t = props.t;
		const [asOf, setAsOf] = (0, react.useState)(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
		const [items, setItems] = (0, react.useState)([]);
		const [error, setError] = (0, react.useState)(null);
		(0, react.useEffect)(() => {
			api.entries({ limit: 500 }).then((page) => setItems(page.items)).catch((cause) => setError(cause.message));
		}, []);
		if (error) return (0, react.createElement)("div", { className: "gam-error" }, error);
		const valid = items.filter((item) => item.createdAt.slice(0, 10) <= asOf && (!item.invalidatedAt || item.invalidatedAt > asOf)).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
		const byDay = /* @__PURE__ */ new Map();
		for (const item of valid) {
			const day = item.createdAt.slice(0, 10);
			const list = byDay.get(day) ?? [];
			list.push(item);
			byDay.set(day, list);
		}
		return (0, react.createElement)("div", null, (0, react.createElement)("div", { className: "gam-toolbar" }, (0, react.createElement)("label", { className: "gam-muted" }, t("timeline.asOf")), (0, react.createElement)("input", {
			className: "gam-input",
			type: "date",
			value: asOf,
			"aria-label": t("timeline.asOf"),
			onChange: (event) => setAsOf(event.target.value)
		}), (0, react.createElement)("span", { className: "gam-muted" }, `${valid.length} / ${items.length}`)), (0, react.createElement)("p", { className: "gam-muted" }, t("timeline.hint")), byDay.size === 0 ? (0, react.createElement)("div", { className: "gam-empty" }, t("browse.noResults")) : [...byDay.entries()].map(([day, list]) => (0, react.createElement)("section", {
			key: day,
			style: { marginBottom: "14px" }
		}, (0, react.createElement)("h3", { style: {
			fontSize: "12px",
			margin: "0 0 6px",
			opacity: .7
		} }, day), (0, react.createElement)("div", { className: "gam-list" }, list.map((item) => (0, react.createElement)("div", {
			className: "gam-item",
			key: item.id
		}, (0, react.createElement)("span", { className: "gam-item-title" }, item.title), (0, react.createElement)("div", { className: "gam-item-sum" }, item.summary), (0, react.createElement)("div", { className: "gam-tags" }, chip(t(`kind.${item.kind}`)), chip(item.confidence), item.invalidatedAt ? chip(`invalidated ${item.invalidatedAt}`) : null)))))));
	}
	function GraphView(props) {
		const t = props.t;
		const [entity, setEntity] = (0, react.useState)("");
		const [nodes, setNodes] = (0, react.useState)([]);
		const [edges, setEdges] = (0, react.useState)([]);
		const [mermaid, setMermaid] = (0, react.useState)("");
		const [error, setError] = (0, react.useState)(null);
		const load = (value) => {
			api.graph(value || void 0).then((result) => {
				setNodes(result.nodes);
				setEdges(result.edges);
				setMermaid(result.mermaid);
			}).catch((cause) => setError(cause.message));
		};
		(0, react.useEffect)(() => load(""), []);
		return (0, react.createElement)("div", null, (0, react.createElement)("div", { className: "gam-toolbar" }, (0, react.createElement)("input", {
			className: "gam-input",
			value: entity,
			placeholder: t("graph.entity"),
			"aria-label": t("graph.entity"),
			onChange: (event) => setEntity(event.target.value)
		}), (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			onClick: () => load(entity)
		}, t("panel.retry")), (0, react.createElement)("span", { className: "gam-muted" }, `${nodes.length} nodes · ${edges.length} edges`)), error ? (0, react.createElement)("div", { className: "gam-error" }, error) : null, edges.length === 0 ? (0, react.createElement)("div", { className: "gam-empty" }, t("graph.empty")) : (0, react.createElement)("div", { className: "gam-list" }, edges.map((edge) => (0, react.createElement)("div", {
			className: "gam-item",
			key: edge.id
		}, (0, react.createElement)("span", { className: "gam-item-title" }, `${edge.from} → ${edge.to}`), (0, react.createElement)("div", { className: "gam-item-sum" }, `${edge.rel} · ${edge.summary}`), (0, react.createElement)("div", { className: "gam-tags" }, chip(edge.confidence), chip(edge.id))))), mermaid ? (0, react.createElement)("pre", {
			className: "gam-pre",
			"aria-label": "mermaid"
		}, mermaid) : null);
	}
	const AUDIT_ACTS = [
		"read",
		"write",
		"update",
		"invalidate",
		"delete",
		"import",
		"export",
		"consolidate",
		"repair",
		"gate-drop",
		"deny",
		"restore"
	];
	function AuditView(props) {
		const t = props.t;
		const [date, setDate] = (0, react.useState)(() => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
		const [act, setAct] = (0, react.useState)("");
		const [rows, setRows] = (0, react.useState)([]);
		const [error, setError] = (0, react.useState)(null);
		const load = (day) => {
			api.audit(day, 500).then((result) => setRows(result.items)).catch((cause) => setError(cause.message));
		};
		(0, react.useEffect)(() => load(date), [date]);
		const shown = rows.filter((row) => act ? row.act === act : true);
		return (0, react.createElement)("div", null, (0, react.createElement)("div", { className: "gam-toolbar" }, (0, react.createElement)("input", {
			className: "gam-input",
			type: "date",
			value: date,
			"aria-label": "date",
			onChange: (event) => setDate(event.target.value)
		}), (0, react.createElement)("select", {
			className: "gam-select",
			value: act,
			"aria-label": "act",
			onChange: (event) => setAct(event.target.value)
		}, (0, react.createElement)("option", { value: "" }, t("audit.allActs")), ...AUDIT_ACTS.map((value) => (0, react.createElement)("option", {
			value,
			key: value
		}, value))), (0, react.createElement)("span", { className: "gam-muted" }, `${shown.length} / ${rows.length}`)), error ? (0, react.createElement)("div", { className: "gam-error" }, error) : null, shown.length === 0 ? (0, react.createElement)("div", { className: "gam-empty" }, t("audit.empty")) : (0, react.createElement)("div", { className: "gam-list" }, shown.map((row, index) => (0, react.createElement)("div", {
			className: "gam-item",
			key: `${row.ts ?? index}-${index}`
		}, (0, react.createElement)("span", { className: "gam-item-title" }, `${row.act ?? "?"} · ${row.actor ?? "?"}`), (0, react.createElement)("div", { className: "gam-item-sum" }, [
			row.decision,
			row.reason,
			row.kind,
			row.id
		].filter(Boolean).join(" · ")), (0, react.createElement)("div", { className: "gam-tags" }, chip(row.ts ?? ""), row.target ? chip(String(row.target)) : null)))));
	}
	function RecoveryView(props) {
		const t = props.t;
		const [snapshots, setSnapshots] = (0, react.useState)([]);
		const [diff, setDiff] = (0, react.useState)(null);
		const [message, setMessage] = (0, react.useState)(null);
		const [busy, setBusy] = (0, react.useState)(false);
		const [error, setError] = (0, react.useState)(null);
		const load = () => {
			api.snapshots().then((result) => {
				setSnapshots(result.items);
				if (result.items.length >= 2) api.snapshotDiff(result.items[1].label, result.items[0].label).then(setDiff).catch(() => setDiff(null));
			}).catch((cause) => setError(cause.message));
		};
		(0, react.useEffect)(load, []);
		const run = (label, task) => {
			setBusy(true);
			setMessage(null);
			task().then((text) => {
				setMessage(text);
				load();
			}).catch((cause) => setError(cause.message)).finally(() => setBusy(false));
		};
		return (0, react.createElement)("div", null, (0, react.createElement)("div", { className: "gam-actions" }, (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			disabled: busy,
			onClick: () => void api.doctor(true).then(() => setMessage("doctor done")).catch((e) => setError(e.message))
		}, "doctor"), (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			disabled: busy,
			onClick: () => run("consolidate", async () => {
				const result = await api.consolidate();
				return `merged ${result.merged} · promoted ${result.promoted} · demoted ${result.demoted} · expired ${result.expiredEpisodes} · summaries ${result.summariesRewritten} · ${result.durationMs}ms`;
			})
		}, t("recovery.consolidate")), (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			disabled: busy,
			onClick: () => run("snapshot", async () => {
				const result = await api.exportZip();
				return `${t("recovery.exported")}: ${result.path} (${result.files} files, ${result.bytes} B)`;
			})
		}, t("recovery.export"))), error ? (0, react.createElement)("div", { className: "gam-error" }, error) : null, message ? (0, react.createElement)("p", { className: "gam-muted" }, message) : null, diff ? (0, react.createElement)("div", { className: "gam-detail" }, (0, react.createElement)("div", { className: "gam-item-title" }, t("recovery.diff")), (0, react.createElement)("div", { className: "gam-tags" }, chip(`+${diff.added.length}`), chip(`-${diff.removed.length}`), chip(`~${diff.changed.length}`)), diff.changed.length > 0 ? (0, react.createElement)("pre", { className: "gam-pre" }, diff.changed.slice(0, 20).join("\n")) : null) : null, (0, react.createElement)("h3", { style: {
			fontSize: "12px",
			margin: "14px 0 8px",
			opacity: .7
		} }, t("recovery.snapshots")), snapshots.length === 0 ? (0, react.createElement)("div", { className: "gam-empty" }, t("recovery.noSnapshots")) : (0, react.createElement)("div", { className: "gam-list" }, snapshots.map((snapshot) => (0, react.createElement)("div", {
			className: "gam-item",
			key: snapshot.label
		}, (0, react.createElement)("span", { className: "gam-item-title" }, snapshot.label), (0, react.createElement)("div", { className: "gam-item-sum" }, `${snapshot.createdAt} · ${snapshot.files} files · ${snapshot.bytes} B`), (0, react.createElement)("div", { className: "gam-actions" }, (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			disabled: busy,
			onClick: () => run("restore", async () => {
				const result = await api.restore(snapshot.label);
				return `${t("recovery.restored")} ${result.restored} · pre-snapshot ${result.preSnapshot}`;
			})
		}, t("recovery.restore")))))));
	}
	function SettingsView(props) {
		const t = props.t;
		const [config, setConfig] = (0, react.useState)(null);
		const [targets, setTargets] = (0, react.useState)([]);
		const [message, setMessage] = (0, react.useState)(null);
		const [error, setError] = (0, react.useState)(null);
		(0, react.useEffect)(() => {
			api.config().then(setConfig).catch((cause) => setError(cause.message));
			api.projections().then((result) => setTargets(result.targets)).catch(() => {});
		}, []);
		return (0, react.createElement)("div", null, (0, react.createElement)("p", { className: "gam-muted" }, t("settings.hint")), error ? (0, react.createElement)("div", { className: "gam-error" }, error) : null, message ? (0, react.createElement)("p", { className: "gam-muted" }, message) : null, (0, react.createElement)("pre", { className: "gam-pre" }, config ? JSON.stringify(config, null, 2) : "…"), (0, react.createElement)("h3", { style: {
			fontSize: "12px",
			margin: "14px 0 8px",
			opacity: .7
		} }, t("settings.projections")), (0, react.createElement)("p", { className: "gam-muted" }, t("settings.projectionHint")), (0, react.createElement)("div", { className: "gam-list" }, targets.map((target) => (0, react.createElement)("div", {
			className: "gam-item",
			key: target.id
		}, (0, react.createElement)("span", { className: "gam-item-title" }, target.label), (0, react.createElement)("div", { className: "gam-item-sum" }, target.path), (0, react.createElement)("div", { className: "gam-tags" }, chip(target.enabled ? "enabled" : "off"))))), (0, react.createElement)("div", { className: "gam-actions" }, (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			onClick: () => api.applyProjections(targets.filter((target) => target.enabled).map((target) => target.id)).then((result) => setMessage(`${t("settings.applied")} ${result.results.filter((r) => r.changed).length}/${result.results.length}`)).catch((cause) => setError(cause.message))
		}, t("settings.applyEnabled"))));
	}
	/**
	* 写入确认卡（slot: conversation.input.dock）。
	*
	* 这是建立用户信任的最重要组件：`writeMode: suggest` 时，涉及画像/纪律的写入
	* 必须先被用户看见并批准。**15 秒无操作即静默放弃** —— 绝不因为用户没点就偷偷写。
	*/
	function WriteConfirmCard(props) {
		ensureStyles();
		const t = props.t;
		const [items, setItems] = (0, react.useState)([]);
		const [busy, setBusy] = (0, react.useState)(false);
		(0, react.useEffect)(() => {
			const load = () => {
				if (document.hidden) return;
				api.pending().then((result) => setItems(result.items)).catch(() => {});
			};
			load();
			const timer = setInterval(load, 2e3);
			return () => clearInterval(timer);
		}, []);
		const item = items[0];
		if (!item) return null;
		const decide = (action) => {
			setBusy(true);
			api.decidePending(item.id, action).then(() => setItems((prev) => prev.filter((entry) => entry.id !== item.id))).catch(() => {}).finally(() => setBusy(false));
		};
		const seconds = Math.max(0, Math.round((item.expiresAt - Date.now()) / 1e3));
		return (0, react.createElement)("div", {
			className: "gam-confirm",
			role: "group",
			"aria-label": t("confirm.prompt")
		}, (0, react.createElement)("div", { className: "gam-confirm-head" }, (0, react.createElement)("span", { className: "gam-confirm-title" }, t("confirm.prompt")), chip(t(`kind.${item.candidate.kind}`)), chip(item.candidate.source), items.length > 1 ? chip(`+${items.length - 1}`) : null, (0, react.createElement)("span", { className: "gam-muted" }, t("confirm.autoDismiss").replace("{n}", String(seconds)))), (0, react.createElement)("div", { className: "gam-confirm-body" }, item.candidate.title), (0, react.createElement)("div", { className: "gam-item-sum" }, item.candidate.summary), (0, react.createElement)("div", { className: "gam-confirm-actions" }, (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			disabled: busy,
			onClick: () => decide("reject")
		}, t("confirm.reject")), (0, react.createElement)("button", {
			className: "gam-btn",
			type: "button",
			disabled: busy,
			onClick: () => decide("accept")
		}, t("confirm.accept"))));
	}
	var Boundary = class extends react.Component {
		state = { error: null };
		static getDerivedStateFromError(error) {
			return { error };
		}
		render() {
			if (this.state.error) return (0, react.createElement)("div", { className: "gam-error" }, (0, react.createElement)("div", null, "This view failed to render."), (0, react.createElement)("pre", { className: "gam-pre" }, `${this.props.label}: ${this.state.error.message}`), (0, react.createElement)("div", { className: "gam-actions" }, (0, react.createElement)("button", {
				className: "gam-btn",
				type: "button",
				onClick: () => this.setState({ error: null })
			}, "Retry")));
			return this.props.children;
		}
	};

	//#endregion
	//#region src/client/client.ts
	const name = "general-memory";
	const inject = ["slots"];
	const NS = "general-memory";
	const dictionaries = {
		zh: zh_default,
		en: en_default
	};
	function apply(ctx) {
		ensureStyles();
		const locale = ctx.get("locale");
		if (locale) ctx.effect(() => locale.register(NS, dictionaries), `${NS}:dictionaries`);
		const translate = locale ? locale.bind(NS) : (key) => lookup(key);
		ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
			name: "sidebar.panellist",
			id: NS,
			order: 350,
			label: () => translate("panel.title"),
			locale: NS,
			inject: () => ({ size: 20 })
		}, MemoryPanelIcon));
		ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
			name: "conversation.input.dock",
			id: `${NS}-confirm`,
			order: 40,
			inject: () => ({ t: translate })
		}, WriteConfirmCard));
		ctx.slots.inject("main", () => ctx.slots.register({
			name: "main",
			key: NS,
			order: 100,
			inject: () => ({ t: translate })
		}, MemoryPanel));
	}
	function lookup(key) {
		const dict = dictionaries.zh ?? dictionaries.en;
		const [group, leaf] = key.split(".");
		if (group && leaf) {
			const nested = dict[group];
			if (nested && typeof nested === "object") return nested[leaf] ?? key;
		}
		const flat = dict[key];
		return typeof flat === "string" ? flat : key;
	}

	//#endregion
	exports.apply = apply;
	exports.inject = inject;
	exports.name = name;
	return module.exports;
	}
});
