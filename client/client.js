window.__ModuleLoader__.load({ id: "dsh-general-automatic-memory", factory: (require) => {
	var module = { exports: {} };
	var exports = module.exports;
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	let react = require("react");
	let react_jsx_runtime = require("react/jsx-runtime");

	//#region locale/en.json
	var en_default = {
		meta: {
			"title": "General Automatic Memory",
			"description": "Cross-tool, human-editable, self-indexing long-term memory with a fixed token budget."
		},
		panel: {
			"title": "Memory",
			"tagline": "Long-term memory",
			"autoRefresh": "Auto-refresh",
			"shortcutHint": "Search or jump anytime:",
			"loading": "Loading memory…",
			"empty": "No memories yet",
			"error": "This view failed to render",
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
			"settings": "Settings",
			"groupMemory": "Memory",
			"groupSystem": "System"
		},
		common: {
			"refresh": "Refresh",
			"refreshed": "Refreshed",
			"cancel": "Cancel",
			"close": "Close",
			"copy": "Copy",
			"copied": "Copied",
			"copyId": "Copy ID",
			"copyPath": "Copy path",
			"copyFailed": "Copy failed",
			"clear": "Clear",
			"loading": "Loading…",
			"on": "On",
			"off": "Off",
			"save": "Save",
			"saving": "Saving…",
			"edit": "Edit",
			"open": "Open",
			"search": "Search",
			"today": "Today",
			"show": "Show",
			"hide": "Hide",
			"viewAll": "View all",
			"unknown": "Unknown"
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
		overview: {
			"desc": "Health, injection cost and everything waiting for you — in one place.",
			"budget": "Injection budget",
			"budgetShare": "Share cap of request",
			"bytes": "Index bytes",
			"cacheHealth": "Prefix-cache health",
			"verbatimRate": "Byte-identical rate",
			"injectChars": "Injected chars",
			"injectTokens": "Injected tokens",
			"entries": "Entries",
			"itemsUnit": "entries",
			"kinds": "Kinds",
			"issues": "Issues",
			"bodyBytes": "Body bytes",
			"recall": "Recall",
			"callsUnit": "calls",
			"zeroHit": "Zero-hit rate",
			"gated": "Gated out",
			"hits": "Hits",
			"kindDistribution": "Memory makeup",
			"kindDistributionHint": "Click a kind to browse it",
			"noEntries": "No entries to summarize yet.",
			"attention": "Needs your attention",
			"attentionCount": "{n} pending",
			"noAttention": "Nothing pending",
			"noAttentionDesc": "Budget, index and write queue all look healthy.",
			"pendingWrites": "Pending writes",
			"pendingAccepted": "Remembered",
			"pendingRejected": "Ignored",
			"recent": "Recent writes",
			"recentHint": "From today's audit trail",
			"noRecent": "No writes today.",
			"undo": "Undo",
			"undoTitle": "Undo this automatic write?",
			"undoDesc": "The entry moves to the archive with a full audit record. Nothing is hard-deleted.",
			"undone": "Undone and archived",
			"quickActions": "Quick actions",
			"quickActionsHint": "The actions you reach for most",
			"memoryRoot": "Memory root",
			"ready": "Index",
			"viewInjection": "View injection",
			"injectionPreview": "Current injection catalog",
			"injectionPreviewHint": "The exact catalog layer the model sees. Byte stability is what makes prefix cache work.",
			"shown": "Injected",
			"omitted": "Omitted",
			"emptyCatalog": "The catalog layer is empty: no always-on or on-demand entries yet.",
			"allClear": "All clear",
			"allClearDesc": "No alerts. Injection budget and index are both healthy.",
			"errorsFound": "{n} issues need attention",
			"warningsFound": "{n} warnings",
			"errors": "errors",
			"warnings": "warnings",
			"pending": "pending",
			"fixNow": "Check and fix",
			"doctorDone": "Check complete · {n} derived files rebuilt"
		},
		browse: {
			"desc": "Search, filter and edit long-term memory directly.",
			"search": "Search memories…",
			"allKinds": "All kinds",
			"allScopes": "All scopes",
			"scope": "Scope",
			"scopeGlobal": "Global",
			"scopeProject": "Project",
			"sort": "Sort",
			"sortHeat": "By heat",
			"sortRecent": "By created",
			"sortUsed": "By last used",
			"sortHits": "By hits",
			"sortTitle": "By title",
			"clearFilters": "Clear filters",
			"noResults": "Nothing matched",
			"noResultsDesc": "Try another keyword, or clear kind and scope filters.",
			"emptyDesc": "Tell the agent something worth remembering, or import from another tool.",
			"loadFailed": "Failed to load memories",
			"loadMore": "Load more",
			"hits": "hits",
			"invalidated": "Invalidated",
			"pii": "PII"
		},
		detail: {
			"title": "Memory detail",
			"content": "Content",
			"meta": "Metadata",
			"raw": "Raw",
			"basic": "Basics",
			"time": "Time",
			"usage": "Usage",
			"provenance": "Provenance",
			"tagsEntities": "Tags & entities",
			"relations": "Related entries",
			"file": "File",
			"copyBody": "Copy body",
			"invalidate": "Invalidate",
			"invalidated": "Invalidated and archived",
			"invalidateTitle": "Invalidate this memory?",
			"invalidateDesc": "Invalidation is reversible: the entry moves to the archive with a full audit record.",
			"reason": "Reason (required)",
			"reasonPlaceholder": "e.g. outdated / superseded by a new decision",
			"invalidateHint": "The reason goes into the audit trail so future-you can explain the decision.",
			"invalidateConfirm": "Invalidate",
			"discardTitle": "Discard unsaved changes?",
			"discardDesc": "Leaving now will drop this edit.",
			"discardConfirm": "Discard",
			"editBody": "Edit body",
			"markdownHint": "Markdown supported; saving rebuilds the index immediately",
			"unsaved": "Unsaved",
			"saved": "Saved",
			"saveFailed": "Save failed",
			"emptyBody": "This memory has no body",
			"emptyBodyDesc": "Enter edit mode to add content.",
			"loadFailed": "Failed to load memory",
			"rawHint": "Raw data is read-only and ready to copy."
		},
		"import": {
			"hint": "Bring in memory files and past conversations from other agents. Scan is read-only; a snapshot is taken before applying.",
			"rescanSources": "Rescan sources",
			"scanFailed": "Scan failed",
			"scanOnlyHint": "Scanning is read-only; applying always snapshots first",
			"filterSources": "Filter sources",
			"filterItems": "Filter items",
			"filterAll": "All",
			"detected": "Detected",
			"places": "places",
			"notDetected": "Not detected",
			"notDetectedHint": "You can still scan the default locations",
			"memory": "Memory files",
			"conversation": "Conversations",
			"noSources": "No matching sources",
			"noSourcesDesc": "Try another filter, or point at a Markdown directory manually.",
			"scan": "Scan",
			"scanning": "Scanning {name}…",
			"genericTitle": "Choose a Markdown directory",
			"genericDesc": "Scan .md / .markdown / .txt files, review the dry-run, then decide what to import.",
			"genericHint": "Choose any local directory",
			"chooseFolder": "Choose directory",
			"path": "Directory path",
			"pathPlaceholder": "~/notes or C:\\notes",
			"pathHint": "Absolute paths and ~ are supported.",
			"items": "items",
			"new": "New",
			"merge": "Merge",
			"duplicate": "Existing",
			"budgetWarn": "Always layer will exceed budget",
			"skipped": "Skipped files",
			"searchItems": "Filter candidates…",
			"selectVisible": "Select visible",
			"selectNone": "Select none",
			"noItems": "No matching candidates",
			"noItemsDesc": "Change the filter or clear the search.",
			"selectedCount": "{n} selected",
			"countLabel": "Items",
			"applyCount": "Import {n}",
			"applying": "Writing…",
			"cancel": "Cancel scan",
			"confirmTitle": "Apply this import?",
			"confirmDesc": "Import is a batch write: a snapshot is created first and can be rolled back as a whole.",
			"snapshot": "Snapshot",
			"snapshotAuto": "Created automatically before import",
			"done": "Import complete",
			"doneHint": "Written and snapshotted. Roll back anytime from Recovery.",
			"added": "Added",
			"updated": "Updated",
			"noop": "Already present",
			"rejected": "Blocked",
			"viewMemories": "View memories",
			"continue": "Import more"
		},
		confirm: {
			"prompt": "Remember this?",
			"accept": "Remember",
			"reject": "Ignore",
			"edit": "Edit",
			"autoDismiss": "Ignored in {n}s",
			"more": "{n} more",
			"queueTitle": "Pending writes",
			"queueDesc": "These candidates are not on disk yet. Approve to write; ignoring leaves no memory behind."
		},
		timeline: {
			"hint": "See memories as they were valid on a date (validFrom ≤ date < invalidatedAt) — answers “why did the agent decide that back then”.",
			"asOf": "As of",
			"asOfHint": "Point-in-time validity",
			"prevDay": "Previous day",
			"nextDay": "Next day",
			"empty": "No valid memories on this day",
			"emptyDesc": "Try another date, or jump back to today.",
			"invalidatedAfter": "Invalidated later",
			"loadFailed": "Failed to load timeline"
		},
		graph: {
			"desc": "An entity/relation map of memory. Click a node to focus; click a relation to open its source memory.",
			"entity": "Filter by entity",
			"nodes": "nodes",
			"edges": "edges",
			"copyMermaid": "Copy Mermaid",
			"resetFilter": "Reset",
			"mode": "View mode",
			"graphMode": "Graph",
			"listMode": "List",
			"empty": "No relationship memories yet",
			"emptyDesc": "Say “X owns Y”; it will appear after import or automatic extraction.",
			"loadFailed": "Failed to load genealogy",
			"svgLabel": "Memory entity graph. Focus nodes to inspect relations, or switch to the list view.",
			"legendEdge": "Relation",
			"legendLow": "Low confidence (dashed)",
			"legendClick": "Click a node to focus",
			"focusHint": "Focused on {name}",
			"relationsOf": "Relations of {name}",
			"allRelations": "All relations"
		},
		audit: {
			"desc": "Every read and write, including gated and blocked attempts.",
			"copyRows": "Copy current rows",
			"date": "Date",
			"act": "Action",
			"allActs": "All actions",
			"search": "Search audit entries…",
			"prevDay": "Previous day",
			"nextDay": "Next day",
			"empty": "No audit records for this day",
			"emptyDesc": "Try another day, or clear the action and keyword filters.",
			"loadFailed": "Failed to load audit trail"
		},
		recovery: {
			"desc": "Snapshots, rollback, checks and export. Every batch operation snapshots first.",
			"doctor": "Check",
			"doctorDone": "Check complete",
			"doctorHint": "Verifies derived files and index; can auto-repair.",
			"doctorIdle": "No check has run yet.",
			"doctorResult": "Check result",
			"createSnapshot": "Snapshot now",
			"snapshotCreated": "Snapshot created",
			"consolidate": "Consolidate",
			"consolidateDone": "Consolidation complete",
			"snapshots": "Snapshots",
			"snapshotsHint": "Select two to compare",
			"noSnapshots": "No snapshots yet",
			"noSnapshotsDesc": "They are created automatically before import, consolidation and restore — or make one now.",
			"compare": "Select for comparison",
			"restore": "Restore",
			"restoreTitle": "Restore this snapshot?",
			"restoreDesc": "Current state is snapshotted first, so the restore itself can be undone.",
			"restored": "Restored",
			"preSnapshot": "Pre-restore snapshot",
			"auto": "Created automatically",
			"createdAt": "Created",
			"snapshot": "Snapshot",
			"diff": "Snapshot diff",
			"diffHint": "Select two snapshots to see additions, removals and changes",
			"diffPick": "Select one more snapshot to compare.",
			"added": "added",
			"removed": "removed",
			"changed": "changed",
			"none": "None",
			"files": "files",
			"exportTitle": "Export & migrate",
			"exportHint": "Exports truth source only; PII is excluded by default.",
			"export": "Export zip",
			"exportDialogDesc": "A local backup containing truth-source files, the graph and index metadata.",
			"includePii": "Include PII entries",
			"includePiiHint": "Entries with pii: true are excluded by default to keep backups private.",
			"exported": "Exported",
			"excludedPii": "PII entries excluded",
			"importZip": "Import from zip",
			"importZipDesc": "Existing files are never overwritten; conflicts stay entry-level decisions.",
			"importZipHint": "A snapshot is created before importing.",
			"zipPath": "zip path",
			"zipPathPlaceholder": "~/.dsh/memory/exports/gam-….zip or C:\\…\\gam-….zip",
			"zipImported": "Restored {n} files from zip",
			"rebuilt": "rebuilt",
			"unchanged": "unchanged",
			"loadFailed": "Failed to load snapshots"
		},
		settings: {
			"hint": "Values come from the dsh profile (cordis.patch.yml). This view is read-only; edit in dsh Plugins / Settings.",
			"copyConfig": "Copy config",
			"showRaw": "Raw JSON",
			"hideRaw": "Hide JSON",
			"rawConfig": "Raw config",
			"rawConfigHint": "Every resolved key/value.",
			"projections": "One-way projections",
			"projectionHint": "Export memory into formats other tools read. Off by default — the value is importing in, not sharing out.",
			"projectionReadonly": "Toggles live in the profile; this only runs them.",
			"applyEnabled": "Generate enabled projections",
			"applied": "Generated",
			"generate": "Generate",
			"injectionPreview": "Injection catalog preview",
			"injectionPreviewHint": "Exactly what the model sees, byte-stable.",
			"injectionPreviewIdle": "Expand to inspect the current injection catalog.",
			"groupStorage": "Storage & index",
			"groupBudget": "Budget",
			"groupInject": "Injection",
			"groupIngest": "Automatic writes",
			"groupIngestHint": "Auto-write by default with undo in Overview; switch to suggest to approve first.",
			"groupRetrieval": "Retrieval",
			"groupCurator": "Consolidation & archive",
			"groupPortability": "Portability",
			"groupPrivacy": "Privacy",
			"groupAdvanced": "Advanced",
			"groupOther": "Other",
			"loadFailed": "Failed to load config"
		},
		command: {
			"trigger": "Search or jump",
			"title": "Command palette",
			"placeholder": "Search memories, jump to a view, or run an action…",
			"noResults": "No matches",
			"noResultsDesc": "Try another keyword, or use the navigation below.",
			"navigation": "Navigate",
			"actions": "Actions",
			"memories": "Memories",
			"memoryGroup": "Memory views",
			"systemGroup": "System views",
			"select": "Select",
			"open": "Open",
			"close": "Close",
			"refreshHint": "Reload current panel data",
			"doctorHint": "Rebuild derived files and verify the index",
			"exportHint": "Export a memory zip without PII"
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
			"tagline": "长期记忆中枢",
			"autoRefresh": "自动刷新",
			"shortcutHint": "随时搜索或跳转：",
			"loading": "正在加载记忆…",
			"empty": "还没有记忆",
			"error": "本视图渲染失败",
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
			"settings": "设置",
			"groupMemory": "记忆",
			"groupSystem": "系统"
		},
		common: {
			"refresh": "刷新",
			"refreshed": "已刷新",
			"cancel": "取消",
			"close": "关闭",
			"copy": "复制",
			"copied": "已复制",
			"copyId": "复制 ID",
			"copyPath": "复制路径",
			"copyFailed": "复制失败",
			"clear": "清空",
			"loading": "加载中…",
			"on": "开",
			"off": "关",
			"save": "保存",
			"saving": "保存中…",
			"edit": "编辑",
			"open": "打开",
			"search": "搜索",
			"today": "今天",
			"show": "展开",
			"hide": "收起",
			"viewAll": "查看全部",
			"unknown": "未知"
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
		overview: {
			"desc": "记忆系统的健康、注入成本与待处理事项，一处看完。",
			"budget": "注入预算",
			"budgetShare": "占请求比例上限",
			"bytes": "索引字节",
			"cacheHealth": "前缀缓存健康",
			"verbatimRate": "逐字节复读率",
			"injectChars": "注入字符",
			"injectTokens": "注入 tokens",
			"entries": "条目",
			"itemsUnit": "条",
			"kinds": "类型",
			"issues": "问题",
			"bodyBytes": "正文字节",
			"recall": "召回",
			"callsUnit": "次调用",
			"zeroHit": "零命中率",
			"gated": "被门控裁掉",
			"hits": "命中",
			"kindDistribution": "记忆构成",
			"kindDistributionHint": "点击类型直接浏览",
			"noEntries": "还没有可统计的条目。",
			"attention": "需要你处理",
			"attentionCount": "{n} 项待处理",
			"noAttention": "没有待处理事项",
			"noAttentionDesc": "预算、索引与写入队列都正常。",
			"pendingWrites": "待确认写入",
			"pendingAccepted": "已记住",
			"pendingRejected": "已忽略",
			"recent": "最近写入",
			"recentHint": "来自今天的审计流水",
			"noRecent": "今天还没有写入记录。",
			"undo": "撤销",
			"undoTitle": "撤销这条自动写入？",
			"undoDesc": "条目会移入归档并保留审计记录，不是硬删除。",
			"undone": "已撤销并归档",
			"quickActions": "快捷操作",
			"quickActionsHint": "常用动作不必再找",
			"memoryRoot": "存储位置",
			"ready": "索引状态",
			"viewInjection": "查看注入内容",
			"injectionPreview": "当前注入目录",
			"injectionPreviewHint": "这是模型实际看到的目录层；逐字节稳定才会命中前缀缓存。",
			"shown": "已注入",
			"omitted": "已省略",
			"emptyCatalog": "目录层为空：还没有常驻或按需注入的条目。",
			"allClear": "一切正常",
			"allClearDesc": "没有告警，注入预算与索引都在健康区间。",
			"errorsFound": "发现 {n} 个需要处理的问题",
			"warningsFound": "{n} 个警告",
			"errors": "错误",
			"warnings": "警告",
			"pending": "待确认",
			"fixNow": "体检并修复",
			"doctorDone": "体检完成 · 重建 {n} 个派生文件"
		},
		browse: {
			"desc": "搜索、筛选与直接编辑长期记忆。",
			"search": "搜索记忆…",
			"allKinds": "全部类型",
			"allScopes": "全部范围",
			"scope": "范围",
			"scopeGlobal": "全局",
			"scopeProject": "项目",
			"sort": "排序",
			"sortHeat": "按热度",
			"sortRecent": "按创建时间",
			"sortUsed": "按最近使用",
			"sortHits": "按命中次数",
			"sortTitle": "按标题",
			"clearFilters": "清除筛选",
			"noResults": "没有匹配的记忆",
			"noResultsDesc": "换个关键词，或清除类型与范围筛选。",
			"emptyDesc": "说点值得长期记住的事，或从其他 agent 导入。",
			"loadFailed": "加载记忆失败",
			"loadMore": "加载更多",
			"hits": "次命中",
			"invalidated": "已失效",
			"pii": "PII"
		},
		detail: {
			"title": "记忆详情",
			"content": "正文",
			"meta": "元数据",
			"raw": "原始",
			"basic": "基本",
			"time": "时间",
			"usage": "使用统计",
			"provenance": "溯源",
			"tagsEntities": "标签与实体",
			"relations": "关联条目",
			"file": "文件",
			"copyBody": "复制正文",
			"invalidate": "失效",
			"invalidated": "已失效并归档",
			"invalidateTitle": "让这条记忆失效？",
			"invalidateDesc": "失效是可逆的：条目会移入归档，并保留完整审计记录。",
			"reason": "原因（必填）",
			"reasonPlaceholder": "例如：信息已过时 / 被新决定取代",
			"invalidateHint": "原因会进入审计，未来可以解释“为什么当时那样做”。",
			"invalidateConfirm": "确认失效",
			"discardTitle": "放弃未保存的修改？",
			"discardDesc": "离开后本次编辑不会保留。",
			"discardConfirm": "放弃修改",
			"editBody": "编辑正文",
			"markdownHint": "支持 Markdown，保存后立即重建索引",
			"unsaved": "未保存",
			"saved": "已保存",
			"saveFailed": "保存失败",
			"emptyBody": "这条记忆没有正文",
			"emptyBodyDesc": "进入编辑模式可以补充内容。",
			"loadFailed": "加载记忆失败",
			"rawHint": "原始数据只读，可直接复制。"
		},
		"import": {
			"hint": "把其他 agent 的记忆文件与历史会话收编进来。扫描只读不写，导入前自动快照。",
			"rescanSources": "重新检测来源",
			"scanFailed": "扫描失败",
			"scanOnlyHint": "扫描只读不写，落盘前一定先做快照",
			"filterSources": "筛选来源",
			"filterItems": "筛选条目",
			"filterAll": "全部",
			"detected": "已检测",
			"places": "处",
			"notDetected": "未检测到",
			"notDetectedHint": "仍可点击扫描默认位置",
			"memory": "记忆文件",
			"conversation": "历史会话",
			"noSources": "没有匹配的来源",
			"noSourcesDesc": "换一个筛选条件，或手动指定 Markdown 目录。",
			"scan": "扫描",
			"scanning": "正在扫描 {name}…",
			"genericTitle": "指定 Markdown 目录",
			"genericDesc": "扫描该目录下的 .md / .markdown / .txt，逐条预检后再决定导入。",
			"genericHint": "选择任意本地目录",
			"chooseFolder": "指定目录",
			"path": "目录路径",
			"pathPlaceholder": "~/notes 或 C:\\notes",
			"pathHint": "支持绝对路径与 ~ 开头的路径。",
			"items": "条",
			"new": "新增",
			"merge": "合并",
			"duplicate": "已有",
			"budgetWarn": "常驻层将超预算",
			"skipped": "跳过文件",
			"searchItems": "筛选候选条目…",
			"selectVisible": "全选可见",
			"selectNone": "全不选",
			"noItems": "没有匹配的候选条目",
			"noItemsDesc": "切换筛选条件或清除搜索。",
			"selectedCount": "已选择 {n} 条",
			"countLabel": "条目",
			"applyCount": "导入 {n} 条",
			"applying": "正在写入…",
			"cancel": "取消本次扫描",
			"confirmTitle": "确认导入？",
			"confirmDesc": "导入是批量写入：会先创建快照，之后可以整体回滚。",
			"snapshot": "快照",
			"snapshotAuto": "导入前自动创建",
			"done": "导入完成",
			"doneHint": "已写入并创建快照，可随时在“恢复”里回滚。",
			"added": "新增",
			"updated": "更新",
			"noop": "已存在",
			"rejected": "被拦截",
			"viewMemories": "查看记忆",
			"continue": "继续导入"
		},
		confirm: {
			"prompt": "要记住这条吗？",
			"accept": "记住",
			"reject": "忽略",
			"edit": "改一下",
			"autoDismiss": "{n} 秒后忽略",
			"more": "还有 {n} 条",
			"queueTitle": "待确认写入",
			"queueDesc": "这些候选还没有落盘。批准才会写入；忽略不会留下记忆。"
		},
		timeline: {
			"hint": "按“当时有效”看记忆（validFrom ≤ 日期 < invalidatedAt），回答“为什么那时候做了那个决定”。",
			"asOf": "查看日期",
			"asOfHint": "时点有效性",
			"prevDay": "前一天",
			"nextDay": "后一天",
			"empty": "这一天没有有效记忆",
			"emptyDesc": "换一个日期，或回到今天。",
			"invalidatedAfter": "此后失效",
			"loadFailed": "加载时间线失败"
		},
		graph: {
			"desc": "实体与关系构成的知识族谱，点击节点聚焦，点击关系打开源记忆。",
			"entity": "按实体过滤",
			"nodes": "节点",
			"edges": "关系",
			"copyMermaid": "复制 Mermaid",
			"resetFilter": "重置",
			"mode": "展示方式",
			"graphMode": "图形",
			"listMode": "列表",
			"empty": "还没有关系记忆",
			"emptyDesc": "说一句“谁负责什么”，导入或自动抽取后就会出现在这里。",
			"loadFailed": "加载族谱失败",
			"svgLabel": "记忆实体关系图。可聚焦节点查看关联，或切换到列表视图。",
			"legendEdge": "关系边",
			"legendLow": "低置信（虚线）",
			"legendClick": "点击节点聚焦",
			"focusHint": "已聚焦 {name}",
			"relationsOf": "{name} 的关联",
			"allRelations": "全部关系"
		},
		audit: {
			"desc": "全量读写流水，包含被门控与被拦截的写入。",
			"copyRows": "复制当前结果",
			"date": "日期",
			"act": "动作",
			"allActs": "全部动作",
			"search": "搜索审计内容…",
			"prevDay": "前一天",
			"nextDay": "后一天",
			"empty": "这一天没有审计记录",
			"emptyDesc": "换一天，或清除动作与关键词筛选。",
			"loadFailed": "加载审计失败"
		},
		recovery: {
			"desc": "快照、回滚、体检与导出。所有批量操作前都会自动留一份可回滚快照。",
			"doctor": "体检",
			"doctorDone": "体检完成",
			"doctorHint": "检查派生文件与索引，可自动修复。",
			"doctorIdle": "还没有运行体检。",
			"doctorResult": "体检结果",
			"createSnapshot": "立即快照",
			"snapshotCreated": "快照已创建",
			"consolidate": "固化",
			"consolidateDone": "固化完成",
			"snapshots": "快照",
			"snapshotsHint": "勾选两份即可对比差异",
			"noSnapshots": "还没有快照",
			"noSnapshotsDesc": "导入、固化与回滚前会自动创建，也可以现在手动创建一份。",
			"compare": "选择对比",
			"restore": "回滚",
			"restoreTitle": "回滚到这份快照？",
			"restoreDesc": "当前状态会先被自动快照，回滚本身也可以撤销。",
			"restored": "已恢复",
			"preSnapshot": "回滚前快照",
			"auto": "自动创建",
			"createdAt": "创建时间",
			"snapshot": "快照",
			"diff": "快照差异",
			"diffHint": "选择两份快照后显示增删改",
			"diffPick": "再勾选一份快照即可对比。",
			"added": "新增",
			"removed": "删除",
			"changed": "修改",
			"none": "无",
			"files": "文件",
			"exportTitle": "导出与迁移",
			"exportHint": "导出只包含真相源；PII 默认排除。",
			"export": "导出 zip",
			"exportDialogDesc": "zip 是本机备份，包含条目、图与审计之外的真相源文件。",
			"includePii": "包含 PII 条目",
			"includePiiHint": "默认排除带 pii: true 的条目，避免备份泄露隐私。",
			"exported": "已导出",
			"excludedPii": "排除的 PII 条目",
			"importZip": "从 zip 导入",
			"importZipDesc": "导入不会覆盖已有文件，冲突留给条目级决策。",
			"importZipHint": "导入前会自动创建快照。",
			"zipPath": "zip 路径",
			"zipPathPlaceholder": "~/.dsh/memory/exports/gam-….zip 或 C:\\…\\gam-….zip",
			"zipImported": "已从 zip 恢复 {n} 个文件",
			"rebuilt": "重建",
			"unchanged": "未变",
			"loadFailed": "加载快照失败"
		},
		settings: {
			"hint": "配置来自 dsh profile（cordis.patch.yml）。这里只读；修改请使用 dsh 的 Plugins / Settings 页。",
			"copyConfig": "复制配置",
			"showRaw": "原始 JSON",
			"hideRaw": "收起 JSON",
			"rawConfig": "原始配置",
			"rawConfigHint": "包含当前解析后的全部键值。",
			"projections": "单向投影",
			"projectionHint": "把记忆导出成其他工具能读的格式。默认关闭——价值在“导入进来”，不在“共享出去”。",
			"projectionReadonly": "开关由 profile 配置决定，这里只执行。",
			"applyEnabled": "生成已启用的投影",
			"applied": "已生成",
			"generate": "生成",
			"injectionPreview": "注入目录预览",
			"injectionPreviewHint": "模型实际看到的目录层内容，逐字节稳定。",
			"injectionPreviewIdle": "展开以查看当前注入目录。",
			"groupStorage": "存储与索引",
			"groupBudget": "预算",
			"groupInject": "注入",
			"groupIngest": "自动写入",
			"groupIngestHint": "默认自动写入并可在总览里撤销；改为 suggest 可先确认再写。",
			"groupRetrieval": "检索",
			"groupCurator": "固化与归档",
			"groupPortability": "导入导出",
			"groupPrivacy": "隐私",
			"groupAdvanced": "高级",
			"groupOther": "其他",
			"loadFailed": "加载配置失败"
		},
		command: {
			"trigger": "搜索或跳转",
			"title": "命令面板",
			"placeholder": "搜索记忆、跳转视图或执行操作…",
			"noResults": "没有匹配结果",
			"noResultsDesc": "换个关键词，或直接选择下方导航。",
			"navigation": "跳转",
			"actions": "操作",
			"memories": "记忆",
			"memoryGroup": "记忆视图",
			"systemGroup": "系统视图",
			"select": "选择",
			"open": "打开",
			"close": "关闭",
			"refreshHint": "重新拉取当前面板数据",
			"doctorHint": "重建派生文件并检查索引",
			"exportHint": "导出不含 PII 的记忆 zip"
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
		const timeout = typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(15e3) : void 0;
		const response = await fetch(path, {
			credentials: "same-origin",
			cache: "no-store",
			...init,
			signal: init?.signal ?? timeout,
			headers: {
				accept: "application/json",
				...init?.headers ?? {}
			}
		});
		if (!response.ok) {
			let detail = "";
			try {
				const body = await response.json();
				detail = body?.error ?? JSON.stringify(body);
			} catch {
				detail = response.statusText;
			}
			throw new Error(detail ? `${detail} (${response.status})` : `${response.status} ${path}`);
		}
		return await response.json();
	}
	/** 面板按本地日期筛选审计；把该日期的本地时区偏移传给 Host，用来换算 UTC 文件名。 */
	function tzOffsetForDate(date) {
		const parsed = /* @__PURE__ */ new Date(`${date}T12:00:00`);
		if (Number.isNaN(parsed.getTime())) return 0;
		return -parsed.getTimezoneOffset();
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
		importZip: (path) => post("import/zip", { path }),
		snapshots: () => get("snapshots"),
		createSnapshot: (label = "manual") => post("snapshot", { label }),
		audit: (date, limit = 200) => get("audit", {
			date,
			limit,
			tzOffset: tzOffsetForDate(date)
		}),
		graph: (entity) => get("graph", { entity }),
		consolidate: () => post("consolidate", {}),
		snapshotDiff: (a, b) => get("snapshot/diff", {
			a,
			b
		}),
		restore: (label, paths) => post("snapshot/restore", {
			label,
			paths
		}),
		projections: () => get("projections"),
		applyProjections: (ids) => post("projections/apply", { ids }),
		exportZip: (includePii = false) => post("export", { includePii }),
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
	* 面板样式（单文件 <style> 注入，类名统一 .gam-）。
	*
	* 硬约束：只消费宿主主题 token，不写死颜色，不写主题选择器。
	* 设计取向：Claude 式的编辑感 —— 衬线标题、纸面留白、发丝边框、低饱和表面、
	* 列表化信息层级；所有交互元件都有键盘焦点、触控尺寸与 reduced-motion 降级。
	*/
	const STYLE_ID = "gam-styles";
	const CSS = `
	/* 变量同时挂到会话输入区的确认卡上：它和主面板是两个独立 slot，不能依赖 .gam-root 祖先 */
	.gam-root, .gam-confirm-scope {
	  --gam-text: var(--dsw-alias-label-primary, CanvasText);
	  --gam-text-2: var(--dsw-alias-label-secondary, color-mix(in srgb, currentColor 72%, transparent));
	  --gam-text-3: var(--dsw-alias-label-tertiary, color-mix(in srgb, currentColor 54%, transparent));
	  --gam-text-4: var(--dsw-alias-label-quaternary, color-mix(in srgb, currentColor 40%, transparent));
	  --gam-bg: var(--dsw-alias-bg-base, Canvas);
	  --gam-panel: var(--dsw-alias-bg-l1, Canvas);
	  --gam-surface: var(--dsw-alias-bg-layer-1, color-mix(in srgb, currentColor 3%, transparent));
	  --gam-surface-2: var(--dsw-alias-bg-layer-2, color-mix(in srgb, currentColor 6%, transparent));
	  --gam-surface-3: var(--dsw-alias-bg-layer-3, color-mix(in srgb, currentColor 9%, transparent));
	  --gam-border: var(--dsw-alias-border-l1, color-mix(in srgb, currentColor 12%, transparent));
	  --gam-border-2: var(--dsw-alias-border-l2, color-mix(in srgb, currentColor 18%, transparent));
	  --gam-border-3: var(--dsw-alias-border-l3, color-mix(in srgb, currentColor 26%, transparent));
	  /* 回退值必须是 CanvasText/Canvas，不能用 currentColor：主色同时用作文字和底色时会自引用 */
	  --gam-accent: var(--dsw-alias-brand-primary, CanvasText);
	  --gam-accent-fg: var(--dsw-alias-label-primary-foreground, Canvas);
	  --gam-danger: var(--dsw-alias-state-error-primary, CanvasText);
	  --gam-warn: var(--dsw-alias-state-warn-primary, CanvasText);
	  --gam-success: var(--dsw-alias-state-success-primary, CanvasText);
	  --gam-info: var(--dsw-alias-state-business-primary, CanvasText);
	  --gam-r-xs: var(--dsw-radius-xs, 4px);
	  --gam-r-sm: var(--dsw-radius-sm, 8px);
	  --gam-r-md: var(--dsw-radius-md, 10px);
	  --gam-r-lg: var(--dsw-radius-lg, 16px);
	  --gam-r-xl: var(--dsw-radius-xl, 20px);
	  --gam-shadow-1: var(--dsw-shadow-lv1, 0 1px 2px color-mix(in srgb, currentColor 7%, transparent));
	  --gam-shadow-2: var(--dsw-shadow-lv2, 0 8px 24px color-mix(in srgb, currentColor 12%, transparent));
	  --gam-shadow-3: var(--dsw-shadow-lv3, 0 18px 48px color-mix(in srgb, currentColor 18%, transparent));
	  --gam-sans: var(--dsw-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif);
	  --gam-serif: ui-serif, "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, "Songti SC", "SimSun", serif;
	  --gam-mono: var(--dsw-font-markdown-code-font-family, ui-monospace, SFMono-Regular, "SF Mono", "Cascadia Code", Menlo, Consolas, "Liberation Mono", monospace);
	}
	.gam-root {
	  position: relative;
	  display: flex;
	  flex-direction: column;
	  height: 100%;
	  min-height: 0;
	  overflow: hidden;
	  color: var(--gam-text);
	  background: var(--gam-bg);
	  font-family: var(--gam-sans);
	  font-size: 13px;
	  line-height: 1.55;
	  letter-spacing: .002em;
	  -webkit-font-smoothing: antialiased;
	  -moz-osx-font-smoothing: grayscale;
	  text-rendering: optimizeLegibility;
	  container: gam / inline-size;
	  /* 独立运行（没有宿主 token）时跟随系统浅色/深色；有宿主时由 .gam-hosted 交还给宿主 */
	  color-scheme: light dark;
	}
	.gam-root.gam-hosted { color-scheme: inherit; }
	.gam-confirm-scope {
	  display: contents;
	  color: var(--gam-text);
	  font-family: var(--gam-sans);
	  font-size: 13px;
	  line-height: 1.55;
	  letter-spacing: .002em;
	  -webkit-font-smoothing: antialiased;
	  -moz-osx-font-smoothing: grayscale;
	  color-scheme: light dark;
	}
	.gam-root *, .gam-root *::before, .gam-root *::after,
	.gam-confirm-scope *, .gam-confirm-scope *::before, .gam-confirm-scope *::after { box-sizing: border-box; }
	.gam-root ::selection, .gam-confirm-scope ::selection { background: color-mix(in srgb, var(--gam-accent) 25%, transparent); }
	.gam-root button, .gam-root input, .gam-root select, .gam-root textarea,
	.gam-confirm-scope button, .gam-confirm-scope input, .gam-confirm-scope select, .gam-confirm-scope textarea { font: inherit; color: inherit; }
	.gam-root :focus-visible, .gam-confirm-scope :focus-visible { outline: 2px solid var(--gam-accent); outline-offset: 2px; }

	/* 滚动条：macOS 覆盖为细条，Windows 走标准属性 */
	.gam-root * { scrollbar-width: thin; scrollbar-color: var(--dsw-alias-scrollbar-hover-l1, color-mix(in srgb, currentColor 24%, transparent)) transparent; }
	.gam-root *::-webkit-scrollbar { width: 10px; height: 10px; }
	.gam-root *::-webkit-scrollbar-track { background: transparent; }
	.gam-root *::-webkit-scrollbar-thumb {
	  background: var(--dsw-alias-scrollbar-bg-l1, color-mix(in srgb, currentColor 18%, transparent));
	  border: 3px solid transparent;
	  border-radius: 999px;
	  background-clip: padding-box;
	}
	.gam-root *::-webkit-scrollbar-thumb:hover { background: var(--dsw-alias-scrollbar-hover-l1, color-mix(in srgb, currentColor 30%, transparent)); background-clip: padding-box; }

	/* ---------- 顶部 ---------- */
	.gam-header {
	  display: flex; align-items: center; gap: 14px;
	  padding: 18px 24px 14px;
	  min-height: 64px;
	}
	.gam-brand { display: flex; align-items: center; gap: 11px; min-width: 0; }
	.gam-brandmark {
	  display: grid; place-items: center; flex: none;
	  width: 34px; height: 34px; border-radius: var(--gam-r-md);
	  border: 1px solid var(--gam-border);
	  background: var(--gam-surface);
	  color: var(--gam-text);
	}
	.gam-brandtext { min-width: 0; }
	.gam-brandtitle {
	  font-family: var(--gam-serif); font-size: 20px; font-weight: 600; line-height: 1.15;
	  letter-spacing: -.015em; white-space: nowrap;
	}
	.gam-brandsub {
	  margin-top: 2px; font-size: 10.5px; line-height: 1.2; color: var(--gam-text-3);
	  letter-spacing: .075em; text-transform: uppercase; white-space: nowrap;
	}
	.gam-header-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
	.gam-live { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--gam-text-3); white-space: nowrap; }
	.gam-live i { width: 6px; height: 6px; border-radius: 50%; background: var(--gam-success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--gam-success) 14%, transparent); }
	.gam-command-trigger {
	  display: inline-flex; align-items: center; gap: 8px;
	  height: 32px; padding: 0 8px 0 10px; border-radius: var(--gam-r-sm);
	  border: 1px solid var(--gam-border); background: var(--gam-surface);
	  color: var(--gam-text-3); cursor: pointer; white-space: nowrap;
	}
	.gam-command-trigger:hover { border-color: var(--gam-border-2); color: var(--gam-text-2); background: var(--gam-surface-2); }
	.gam-command-trigger span { font-size: 12px; }

	/* ---------- 主框架 ---------- */
	.gam-shell { display: grid; grid-template-columns: 186px minmax(0, 1fr); flex: 1; min-height: 0; }
	.gam-rail {
	  display: flex; flex-direction: column; gap: 18px;
	  min-height: 0; overflow: auto;
	  padding: 4px 12px 18px 16px;
	  border-right: 1px solid var(--gam-border);
	}
	.gam-railgroup { display: flex; flex-direction: column; gap: 2px; }
	.gam-rail-label {
	  padding: 0 10px 6px; font-size: 10px; color: var(--gam-text-4);
	  letter-spacing: .09em; text-transform: uppercase;
	}
	.gam-navitem {
	  position: relative; display: flex; align-items: center; gap: 9px;
	  width: 100%; min-height: 32px; padding: 5px 10px;
	  border: 1px solid transparent; border-radius: var(--gam-r-sm);
	  background: transparent; color: var(--gam-text-2);
	  font-size: 12.5px; text-align: left; cursor: pointer;
	  transition: background .12s ease, color .12s ease, border-color .12s ease;
	}
	.gam-navitem:hover { background: var(--gam-surface); color: var(--gam-text); }
	.gam-navitem.is-active { background: var(--gam-surface-2); border-color: var(--gam-border); color: var(--gam-text); font-weight: 600; }
	.gam-navitem.is-active::before {
	  content: ""; position: absolute; left: -1px; top: 50%; transform: translateY(-50%);
	  width: 2px; height: 15px; border-radius: 2px; background: var(--gam-accent);
	}
	.gam-navicon { display: inline-grid; place-items: center; width: 16px; height: 16px; flex: none; opacity: .82; }
	.gam-navitem.is-active .gam-navicon { opacity: 1; }
	.gam-navtext { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-navbadge {
	  margin-left: auto; min-width: 17px; height: 17px; padding: 0 5px;
	  display: inline-grid; place-items: center;
	  border-radius: 999px; background: color-mix(in srgb, var(--gam-danger) 16%, transparent);
	  color: var(--gam-danger); font-size: 10px; font-weight: 700;
	}
	.gam-railfoot { margin-top: auto; padding: 10px; border-top: 1px solid var(--gam-border); color: var(--gam-text-4); font-size: 10.5px; line-height: 1.5; }
	.gam-railfoot code { display: block; margin-top: 3px; font-family: var(--gam-mono); font-size: 10px; word-break: break-all; color: var(--gam-text-3); }

	.gam-content { min-width: 0; min-height: 0; overflow: auto; }
	.gam-content-inner { width: 100%; max-width: 1120px; margin: 0 auto; padding: 2px 28px 48px; }
	.gam-page { display: flex; flex-direction: column; gap: 18px; }
	.gam-pagehead { display: flex; align-items: flex-end; gap: 16px; padding-top: 4px; }
	.gam-pagehead-main { min-width: 0; flex: 1; }
	.gam-eyebrow { margin: 0 0 4px; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--gam-text-4); }
	.gam-pagetitle { margin: 0; font-family: var(--gam-serif); font-size: 25px; font-weight: 600; line-height: 1.18; letter-spacing: -.018em; }
	.gam-pagedesc { margin: 5px 0 0; max-width: 70ch; color: var(--gam-text-3); font-size: 12.5px; }
	.gam-pageactions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
	.gam-section { display: flex; flex-direction: column; gap: 10px; }
	.gam-subhead { display: flex; align-items: baseline; gap: 8px; margin: 2px 0 0; }
	.gam-subhead h2 { margin: 0; font-size: 12px; font-weight: 650; letter-spacing: .01em; }
	.gam-subhead span { color: var(--gam-text-4); font-size: 11px; }

	/* ---------- 按钮 / 输入 ---------- */
	.gam-btn {
	  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
	  min-height: 32px; padding: 0 11px;
	  border: 1px solid var(--gam-border); border-radius: var(--gam-r-sm);
	  background: var(--gam-surface); color: var(--gam-text);
	  font-size: 12px; font-weight: 550; white-space: nowrap; cursor: pointer;
	  transition: background .12s ease, border-color .12s ease, color .12s ease, opacity .12s ease;
	}
	.gam-btn:hover:not([disabled]) { background: var(--gam-surface-2); border-color: var(--gam-border-2); }
	.gam-btn[data-variant="primary"] { background: var(--gam-accent); border-color: var(--gam-accent); color: var(--gam-accent-fg); }
	.gam-btn[data-variant="primary"]:hover:not([disabled]) { background: color-mix(in srgb, var(--gam-accent) 86%, var(--gam-text)); }
	.gam-btn[data-variant="ghost"] { background: transparent; border-color: transparent; color: var(--gam-text-2); }
	.gam-btn[data-variant="ghost"]:hover:not([disabled]) { background: var(--gam-surface); border-color: transparent; color: var(--gam-text); }
	.gam-btn[data-variant="danger"] { color: var(--gam-danger); border-color: color-mix(in srgb, var(--gam-danger) 36%, var(--gam-border)); background: color-mix(in srgb, var(--gam-danger) 7%, transparent); }
	.gam-btn[data-variant="danger"]:hover:not([disabled]) { background: color-mix(in srgb, var(--gam-danger) 13%, transparent); border-color: color-mix(in srgb, var(--gam-danger) 52%, transparent); }
	.gam-btn[data-size="sm"] { min-height: 27px; padding: 0 9px; font-size: 11.5px; border-radius: var(--gam-r-xs); }
	.gam-btn[disabled] { opacity: .48; cursor: not-allowed; }
	.gam-iconbtn {
	  display: inline-grid; place-items: center; flex: none;
	  width: 32px; height: 32px; padding: 0;
	  border: 1px solid transparent; border-radius: var(--gam-r-sm);
	  background: transparent; color: var(--gam-text-3); cursor: pointer;
	  transition: background .12s ease, color .12s ease, border-color .12s ease;
	}
	.gam-iconbtn:hover { background: var(--gam-surface); border-color: var(--gam-border); color: var(--gam-text); }
	.gam-iconbtn[data-size="sm"] { width: 26px; height: 26px; }
	.gam-iconbtn[data-tone="danger"]:hover { color: var(--gam-danger); }

	.gam-input, .gam-select, .gam-textarea {
	  width: 100%; min-width: 0;
	  border: 1px solid var(--gam-border); border-radius: var(--gam-r-sm);
	  background: var(--gam-surface); color: var(--gam-text);
	  font-size: 12.5px;
	  transition: border-color .12s ease, background .12s ease, box-shadow .12s ease;
	}
	.gam-input { height: 34px; padding: 0 11px; }
	.gam-textarea { min-height: 180px; padding: 10px 12px; resize: vertical; line-height: 1.6; font-family: var(--gam-mono); font-size: 12px; }
	.gam-input:hover, .gam-select:hover, .gam-textarea:hover { border-color: var(--gam-border-2); }
	.gam-input:focus, .gam-select:focus, .gam-textarea:focus {
	  outline: none; border-color: var(--gam-accent);
	  box-shadow: 0 0 0 3px color-mix(in srgb, var(--gam-accent) 16%, transparent);
	}
	.gam-input::placeholder, .gam-textarea::placeholder { color: var(--gam-text-4); }
	.gam-inputwrap { position: relative; flex: 1; min-width: 160px; }
	.gam-inputwrap .gam-input { padding-left: 32px; padding-right: 58px; }
	.gam-inputicon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--gam-text-4); pointer-events: none; display: grid; place-items: center; }
	.gam-inputclear { position: absolute; right: 7px; top: 50%; transform: translateY(-50%); }
	.gam-inputkbd { position: absolute; right: 9px; top: 50%; transform: translateY(-50%); pointer-events: none; }
	.gam-selectwrap { position: relative; display: inline-flex; min-width: 120px; }
	.gam-select { appearance: none; -webkit-appearance: none; height: 34px; padding: 0 30px 0 11px; cursor: pointer; }
	.gam-select option { background: var(--gam-panel); color: var(--gam-text); }
	.gam-select-chevron { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--gam-text-4); display: grid; place-items: center; }
	.gam-kbd, .gam-inputkbd {
	  display: inline-flex; align-items: center; justify-content: center; gap: 2px;
	  min-width: 19px; height: 19px; padding: 0 4px;
	  border: 1px solid var(--gam-border); border-radius: 5px;
	  background: var(--gam-surface-2); color: var(--gam-text-4);
	  font-family: var(--gam-sans); font-size: 10px; line-height: 1;
	}
	.gam-field { display: flex; flex-direction: column; gap: 6px; }
	.gam-field-label { font-size: 11px; color: var(--gam-text-3); font-weight: 600; }
	.gam-field-hint { font-size: 11px; color: var(--gam-text-4); }
	.gam-checkrow { display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; user-select: none; }
	.gam-checkrow input { accent-color: var(--gam-accent); width: 15px; height: 15px; }

	/* ---------- 卡片 / 指标 ---------- */
	.gam-card {
	  min-width: 0; padding: 17px 18px;
	  border: 1px solid var(--gam-border); border-radius: var(--gam-r-lg);
	  background: var(--gam-surface);
	}
	.gam-card[data-flat="true"] { background: transparent; }
	.gam-cardhead { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
	.gam-cardtitle { margin: 0; font-size: 11.5px; font-weight: 650; color: var(--gam-text-2); letter-spacing: .01em; }
	.gam-cardhint { margin: 2px 0 0; font-size: 11px; color: var(--gam-text-4); }
	.gam-card-actions { margin-left: auto; display: flex; gap: 4px; flex-wrap: wrap; }
	.gam-statgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(215px, 1fr)); gap: 12px; }
	.gam-stat { display: flex; flex-direction: column; min-height: 154px; }
	.gam-stat-label { font-size: 11px; color: var(--gam-text-3); }
	.gam-stat-value { margin-top: 6px; font-family: var(--gam-serif); font-size: 30px; font-weight: 600; line-height: 1.05; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
	.gam-stat-unit { margin-left: 3px; font-family: var(--gam-sans); font-size: 13px; font-weight: 500; color: var(--gam-text-3); letter-spacing: 0; }
	.gam-stat-sub { margin-top: auto; padding-top: 10px; display: flex; flex-direction: column; gap: 3px; }
	.gam-stat-row { display: flex; justify-content: space-between; gap: 10px; font-size: 11px; color: var(--gam-text-3); font-variant-numeric: tabular-nums; }
	.gam-stat-row b { font-weight: 550; color: var(--gam-text-2); }
	.gam-muted { color: var(--gam-text-3); }
	.gam-faint { color: var(--gam-text-4); }
	.gam-mono { font-family: var(--gam-mono); font-size: .94em; }
	.gam-nowrap { white-space: nowrap; }
	.gam-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

	.gam-meter { position: relative; height: 5px; margin-top: 9px; border-radius: 999px; background: var(--gam-surface-3); overflow: hidden; }
	.gam-meter > i { display: block; height: 100%; border-radius: inherit; background: var(--gam-accent); transition: width .35s ease; }
	.gam-meter[data-tone="warn"] > i { background: var(--gam-warn); }
	.gam-meter[data-tone="danger"] > i { background: var(--gam-danger); }
	.gam-meter[data-tone="success"] > i { background: var(--gam-success); }
	.gam-meter-lg { height: 7px; }

	.gam-health {
	  display: flex; align-items: center; gap: 12px;
	  padding: 13px 16px; border-radius: var(--gam-r-md);
	  border: 1px solid color-mix(in srgb, var(--gam-success) 28%, var(--gam-border));
	  background: color-mix(in srgb, var(--gam-success) 7%, transparent);
	}
	.gam-health[data-tone="warn"] { border-color: color-mix(in srgb, var(--gam-warn) 34%, var(--gam-border)); background: color-mix(in srgb, var(--gam-warn) 8%, transparent); }
	.gam-health[data-tone="danger"] { border-color: color-mix(in srgb, var(--gam-danger) 34%, var(--gam-border)); background: color-mix(in srgb, var(--gam-danger) 8%, transparent); }
	.gam-health-icon { display: grid; place-items: center; flex: none; width: 30px; height: 30px; border-radius: 50%; background: color-mix(in srgb, currentColor 9%, transparent); }
	.gam-health-text { min-width: 0; flex: 1; }
	.gam-health-title { font-weight: 600; font-size: 12.5px; }
	.gam-health-desc { margin-top: 1px; font-size: 11.5px; color: var(--gam-text-3); }
	.gam-health-actions { display: flex; gap: 6px; flex-wrap: wrap; }

	.gam-grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
	.gam-grid2[data-align="start"] { align-items: start; }
	.gam-grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
	.gam-settingsgrid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; align-items: start; }
	.gam-stack { display: flex; flex-direction: column; gap: 8px; }
	.gam-inline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
	.gam-spacer { flex: 1; }
	.gam-divider { height: 1px; background: var(--gam-border); margin: 2px 0; }

	/* ---------- 徽标 / 标签 ---------- */
	.gam-badge {
	  display: inline-flex; align-items: center; gap: 5px;
	  min-height: 20px; padding: 1px 7px; border-radius: 999px;
	  border: 1px solid var(--gam-border); background: var(--gam-surface);
	  color: var(--gam-text-2); font-size: 10.5px; font-weight: 550; white-space: nowrap;
	}
	.gam-badge[data-tone="accent"] { color: var(--gam-accent); border-color: color-mix(in srgb, var(--gam-accent) 32%, var(--gam-border)); background: color-mix(in srgb, var(--gam-accent) 8%, transparent); }
	.gam-badge[data-tone="danger"] { color: var(--gam-danger); border-color: color-mix(in srgb, var(--gam-danger) 34%, var(--gam-border)); background: color-mix(in srgb, var(--gam-danger) 8%, transparent); }
	.gam-badge[data-tone="warn"] { color: var(--gam-warn); border-color: color-mix(in srgb, var(--gam-warn) 34%, var(--gam-border)); background: color-mix(in srgb, var(--gam-warn) 8%, transparent); }
	.gam-badge[data-tone="success"] { color: var(--gam-success); border-color: color-mix(in srgb, var(--gam-success) 32%, var(--gam-border)); background: color-mix(in srgb, var(--gam-success) 8%, transparent); }
	.gam-badge[data-tone="neutral"] { color: var(--gam-text-3); }
	.gam-badge i { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex: none; }
	.gam-kindbadge { font-variant-numeric: tabular-nums; letter-spacing: .01em; }
	.gam-kindbadge::before { content: "◇"; font-size: 9px; opacity: .7; }
	.gam-kindrow { display: flex; align-items: center; gap: 10px; width: 100%; padding: 6px 0; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
	.gam-kindrow:hover .gam-kindname { color: var(--gam-accent); }
	.gam-kindname { width: 64px; flex: none; font-size: 11.5px; color: var(--gam-text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-kindbar { flex: 1; height: 5px; border-radius: 999px; background: var(--gam-surface-3); overflow: hidden; }
	.gam-kindbar i { display: block; height: 100%; border-radius: inherit; background: color-mix(in srgb, var(--gam-accent) 52%, var(--gam-text-3)); transition: width .35s ease; }
	.gam-kindcount { width: 34px; flex: none; text-align: right; font-size: 11px; color: var(--gam-text-3); font-variant-numeric: tabular-nums; }
	.gam-tagrow { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; min-width: 0; }
	.gam-tag {
	  display: inline-flex; align-items: center; gap: 4px;
	  padding: 1px 6px; border-radius: var(--gam-r-xs);
	  border: 1px solid var(--gam-border); color: var(--gam-text-3);
	  font-size: 10.5px; white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
	}
	.gam-tag[data-tone="danger"] { color: var(--gam-danger); border-color: color-mix(in srgb, var(--gam-danger) 32%, var(--gam-border)); }
	.gam-chiprow { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
	.gam-chiprow[data-scroll="true"] { flex-wrap: nowrap; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
	.gam-chiprow[data-scroll="true"]::-webkit-scrollbar { display: none; }
	.gam-chip {
	  display: inline-flex; align-items: center; gap: 6px;
	  min-height: 27px; padding: 0 9px; border-radius: 999px;
	  border: 1px solid var(--gam-border); background: transparent; color: var(--gam-text-3);
	  font-size: 11.5px; white-space: nowrap; cursor: pointer;
	  transition: background .12s ease, color .12s ease, border-color .12s ease;
	}
	.gam-chip:hover { background: var(--gam-surface); color: var(--gam-text); }
	.gam-chip.is-active { background: var(--gam-surface-2); border-color: var(--gam-border-3); color: var(--gam-text); font-weight: 600; }
	.gam-chipcount { font-size: 10px; color: var(--gam-text-4); font-variant-numeric: tabular-nums; }
	.gam-chip.is-active .gam-chipcount { color: var(--gam-text-2); }

	/* ---------- 列表 / 工具条 ---------- */
	.gam-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
	.gam-toolbar-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; min-width: 0; }
	.gam-listcard { border: 1px solid var(--gam-border); border-radius: var(--gam-r-lg); background: var(--gam-surface); overflow: hidden; }
	.gam-rowitem {
	  display: flex; align-items: center; gap: 14px; width: 100%;
	  padding: 13px 16px; border: 0; border-bottom: 1px solid var(--gam-border);
	  background: transparent; color: inherit; text-align: left; cursor: pointer;
	  transition: background .12s ease;
	}
	.gam-rowitem:last-child { border-bottom: 0; }
	.gam-rowitem:hover { background: var(--gam-surface-2); }
	.gam-rowitem-main { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 3px; }
	.gam-rowitem-top { display: flex; align-items: center; gap: 8px; min-width: 0; }
	.gam-rowitem-title { font-size: 13px; font-weight: 600; line-height: 1.35; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-rowitem-sum { color: var(--gam-text-3); font-size: 11.5px; line-height: 1.45; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-rowitem-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 10.5px; color: var(--gam-text-4); }
	.gam-rowitem-side { display: flex; align-items: center; gap: 8px; flex-wrap: nowrap; flex: none; }
	.gam-rowitem-chevron { color: var(--gam-text-4); display: grid; place-items: center; }
	.gam-rowitem.is-selected { background: color-mix(in srgb, var(--gam-accent) 7%, transparent); }
	.gam-rowitem[data-static="true"] { cursor: default; }
	.gam-rowitem[data-static="true"]:hover { background: transparent; }
	.gam-hits { font-variant-numeric: tabular-nums; }

	.gam-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 54px 24px; }
	.gam-empty-icon { display: grid; place-items: center; width: 46px; height: 46px; margin-bottom: 14px; border-radius: 50%; border: 1px dashed var(--gam-border-3); color: var(--gam-text-3); }
	.gam-empty-title { font-family: var(--gam-serif); font-size: 18px; font-weight: 600; letter-spacing: -.01em; }
	.gam-empty-desc { max-width: 46ch; margin-top: 5px; color: var(--gam-text-3); font-size: 12px; }
	.gam-empty-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 16px; }
	.gam-errorbox { padding: 14px 16px; border: 1px solid color-mix(in srgb, var(--gam-danger) 36%, var(--gam-border)); border-radius: var(--gam-r-md); background: color-mix(in srgb, var(--gam-danger) 6%, transparent); }
	.gam-error-title { font-weight: 650; color: var(--gam-danger); font-size: 12.5px; }
	.gam-errorbox .gam-pre, .gam-errorbox pre { margin-top: 8px; }

	/* ---------- 代码 / Markdown ---------- */
	.gam-pre {
	  margin: 8px 0 0; padding: 12px; border-radius: var(--gam-r-sm);
	  background: var(--gam-surface-2); border: 1px solid var(--gam-border);
	  font-family: var(--gam-mono); font-size: 11.5px; line-height: 1.6;
	  white-space: pre-wrap; word-break: break-word; overflow: auto; max-height: 420px;
	}
	.gam-prose { font-size: 13px; line-height: 1.68; color: var(--gam-text); overflow-wrap: anywhere; }
	.gam-prose > :first-child { margin-top: 0; }
	.gam-prose > :last-child { margin-bottom: 0; }
	.gam-prose h1, .gam-prose h2, .gam-prose h3 { margin: 20px 0 8px; font-family: var(--gam-serif); font-weight: 600; line-height: 1.25; letter-spacing: -.01em; }
	.gam-prose h1 { font-size: 20px; } .gam-prose h2 { font-size: 17px; } .gam-prose h3 { font-size: 14.5px; }
	.gam-prose p { margin: 0 0 10px; }
	.gam-prose ul, .gam-prose ol { margin: 0 0 10px; padding-left: 20px; }
	.gam-prose li { margin: 2px 0; }
	.gam-prose code { padding: 1px 5px; border-radius: 4px; background: var(--gam-surface-2); border: 1px solid var(--gam-border); font-family: var(--gam-mono); font-size: .9em; }
	.gam-prose pre { padding: 12px; border-radius: var(--gam-r-sm); background: var(--gam-surface-2); border: 1px solid var(--gam-border); overflow: auto; font-family: var(--gam-mono); font-size: 11.5px; }
	.gam-prose pre code { padding: 0; border: 0; background: transparent; }
	.gam-prose blockquote { margin: 0 0 10px; padding: 2px 0 2px 12px; border-left: 2px solid var(--gam-border-3); color: var(--gam-text-2); }
	.gam-prose a { color: var(--gam-accent); text-decoration: underline; text-underline-offset: 2px; }
	.gam-prose hr { border: 0; border-top: 1px solid var(--gam-border); margin: 16px 0; }

	/* ---------- 骨架 ---------- */
	.gam-skeleton { border-radius: var(--gam-r-sm); background: linear-gradient(90deg, var(--gam-surface) 0%, var(--gam-surface-3) 50%, var(--gam-surface) 100%); background-size: 220% 100%; animation: gam-shimmer 1.5s ease-in-out infinite; }
	.gam-skeletonline { height: 11px; margin: 7px 0; }
	@keyframes gam-shimmer { 0% { background-position: 120% 0; } 100% { background-position: -120% 0; } }
	.gam-spinner { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid var(--gam-border-2); border-top-color: var(--gam-accent); animation: gam-spin .7s linear infinite; }
	@keyframes gam-spin { to { transform: rotate(360deg); } }

	/* ---------- 遮罩 / 抽屉 / 对话框 ---------- */
	.gam-overlay {
	  position: absolute; inset: 0; z-index: 40;
	  display: flex; align-items: center; justify-content: center;
	  padding: 24px;
	  background: var(--dsw-alias-bg-mask-2, color-mix(in srgb, CanvasText 32%, transparent));
	  animation: gam-fade .14s ease both;
	}
	.gam-overlay[data-align="top"] { align-items: flex-start; padding-top: 12vh; }
	.gam-overlay[data-align="right"] { justify-content: flex-end; padding: 0; }
	@keyframes gam-fade { from { opacity: 0; } to { opacity: 1; } }
	@keyframes gam-pop { from { opacity: 0; transform: translateY(6px) scale(.985); } to { opacity: 1; transform: none; } }
	@keyframes gam-slide { from { transform: translateX(24px); opacity: .6; } to { transform: none; opacity: 1; } }

	.gam-drawer {
	  display: flex; flex-direction: column;
	  width: min(580px, 100%); height: 100%;
	  background: var(--gam-panel);
	  border-left: 1px solid var(--gam-border-2);
	  box-shadow: var(--gam-shadow-3);
	  animation: gam-slide .18s ease both;
	}
	.gam-drawer-head { display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px 14px; border-bottom: 1px solid var(--gam-border); }
	.gam-drawer-head-main { min-width: 0; flex: 1; }
	.gam-drawer-title { margin: 4px 0 0; font-family: var(--gam-serif); font-size: 21px; font-weight: 600; line-height: 1.25; letter-spacing: -.015em; overflow-wrap: anywhere; }
	.gam-drawer-sub { margin: 5px 0 0; color: var(--gam-text-3); font-size: 12px; }
	.gam-drawer-tabs { display: flex; gap: 2px; padding: 8px 16px 0; border-bottom: 1px solid var(--gam-border); }
	.gam-tab {
	  appearance: none; border: 0; background: transparent; color: var(--gam-text-3);
	  padding: 7px 10px 9px; font-size: 12px; cursor: pointer; position: relative;
	}
	.gam-tab:hover { color: var(--gam-text); }
	.gam-tab.is-active { color: var(--gam-text); font-weight: 600; }
	.gam-tab.is-active::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: -1px; height: 2px; border-radius: 2px; background: var(--gam-accent); }
	.gam-drawer-body { flex: 1; min-height: 0; overflow: auto; padding: 18px 20px 24px; }
	.gam-drawer-footer { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 12px 20px; border-top: 1px solid var(--gam-border); background: var(--gam-surface); }
	.gam-drawer-footer .gam-spacer { min-width: 8px; }

	.gam-dialog {
	  display: flex; flex-direction: column;
	  width: min(480px, 100%); max-height: min(78vh, 720px);
	  border: 1px solid var(--gam-border-2); border-radius: var(--gam-r-xl);
	  background: var(--gam-panel); box-shadow: var(--gam-shadow-3);
	  animation: gam-pop .16s ease both;
	}
	.gam-dialog[data-size="wide"] { width: min(680px, 100%); }
	.gam-dialog[data-size="sm"] { width: min(380px, 100%); }
	.gam-dialog-head { display: flex; align-items: flex-start; gap: 12px; padding: 18px 20px 0; }
	.gam-dialog-head-main { flex: 1; min-width: 0; }
	.gam-dialog-title { margin: 0; font-family: var(--gam-serif); font-size: 19px; font-weight: 600; letter-spacing: -.012em; }
	.gam-dialog-desc { margin: 4px 0 0; color: var(--gam-text-3); font-size: 12px; }
	.gam-dialog-body { padding: 16px 20px; overflow: auto; min-height: 0; }
	.gam-dialog-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; padding: 0 20px 18px; }
	.gam-dialog-actions .gam-spacer { flex: 1; }

	/* ---------- 命令面板 ---------- */
	.gam-command {
	  display: flex; flex-direction: column;
	  width: min(640px, 100%); max-height: min(68vh, 620px);
	  border: 1px solid var(--gam-border-2); border-radius: var(--gam-r-lg);
	  background: var(--gam-panel); box-shadow: var(--gam-shadow-3);
	  overflow: hidden; animation: gam-pop .15s ease both;
	}
	.gam-command-inputrow { display: flex; align-items: center; gap: 9px; padding: 12px 14px; border-bottom: 1px solid var(--gam-border); }
	.gam-command-inputrow .gam-input { border: 0; background: transparent; height: 26px; padding: 0; box-shadow: none; font-size: 14px; }
	.gam-command-inputrow .gam-input:focus { box-shadow: none; }
	.gam-command-list { flex: 1; min-height: 0; overflow: auto; padding: 6px; }
	.gam-command-section { padding: 7px 8px 3px; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--gam-text-4); }
	.gam-command-item {
	  display: flex; align-items: center; gap: 10px; width: 100%;
	  padding: 8px 9px; border: 1px solid transparent; border-radius: var(--gam-r-sm);
	  background: transparent; color: var(--gam-text); text-align: left; cursor: pointer;
	}
	.gam-command-item.is-active { background: var(--gam-surface-2); border-color: var(--gam-border); }
	.gam-command-icon { display: grid; place-items: center; width: 22px; height: 22px; flex: none; border-radius: var(--gam-r-xs); background: var(--gam-surface); color: var(--gam-text-3); }
	.gam-command-label { min-width: 0; flex: 1; }
	.gam-command-label b { display: block; font-size: 12.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-command-label span { display: block; color: var(--gam-text-4); font-size: 10.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-command-hint { flex: none; color: var(--gam-text-4); }
	.gam-command-foot { display: flex; align-items: center; gap: 12px; padding: 8px 14px; border-top: 1px solid var(--gam-border); color: var(--gam-text-4); font-size: 10.5px; }
	.gam-command-foot span { display: inline-flex; align-items: center; gap: 4px; }

	/* ---------- Toast ---------- */
	.gam-toasts { position: absolute; right: 20px; bottom: 20px; z-index: 60; display: flex; flex-direction: column; gap: 8px; max-width: min(380px, calc(100% - 40px)); }
	.gam-toast {
	  display: flex; align-items: flex-start; gap: 9px;
	  padding: 10px 12px; border: 1px solid var(--gam-border-2); border-radius: var(--gam-r-md);
	  background: var(--dsw-alias-toast-bg, var(--gam-panel));
	  color: var(--dsw-alias-toast-label, var(--gam-text));
	  box-shadow: var(--gam-shadow-2); font-size: 12px;
	  animation: gam-pop .16s ease both;
	}
	.gam-toast[data-tone="danger"] { border-color: color-mix(in srgb, var(--gam-danger) 40%, var(--gam-border)); }
	.gam-toast[data-tone="success"] { border-color: color-mix(in srgb, var(--gam-success) 40%, var(--gam-border)); }

	/* ---------- 导入 ---------- */
	.gam-importgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(238px, 1fr)); gap: 10px; }
	.gam-source {
	  display: flex; flex-direction: column; gap: 8px; min-height: 112px;
	  padding: 13px 14px; text-align: left;
	  border: 1px solid var(--gam-border); border-radius: var(--gam-r-md);
	  background: transparent; color: var(--gam-text); cursor: pointer;
	  transition: background .12s ease, border-color .12s ease;
	}
	.gam-source:hover:not([disabled]) { background: var(--gam-surface); border-color: var(--gam-border-2); }
	.gam-source[data-detected="false"] { opacity: .56; }
	.gam-source[data-detected="false"]:hover { opacity: .8; }
	.gam-source-head { display: flex; align-items: center; gap: 7px; }
	.gam-source-dot { width: 6px; height: 6px; border-radius: 50%; flex: none; background: var(--gam-text-4); }
	.gam-source[data-detected="true"] .gam-source-dot { background: var(--gam-success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--gam-success) 14%, transparent); }
	.gam-source-title { font-size: 12px; font-weight: 600; line-height: 1.35; flex: 1; min-width: 0; }
	.gam-source-count { font-size: 10px; color: var(--gam-text-4); white-space: nowrap; }
	.gam-source-path { margin-top: auto; font-family: var(--gam-mono); color: var(--gam-text-4); font-size: 10px; line-height: 1.45; word-break: break-all; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
	.gam-source-cta { font-size: 10.5px; color: var(--gam-accent); font-weight: 600; }
	.gam-scanbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding: 11px 12px; border: 1px solid var(--gam-border); border-radius: var(--gam-r-md); background: var(--gam-surface); }
	.gam-bulkbar {
	  position: sticky; bottom: 0; z-index: 6;
	  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
	  padding: 10px 12px; margin-top: 8px;
	  border: 1px solid var(--gam-border-2); border-radius: var(--gam-r-md);
	  background: var(--gam-panel); box-shadow: var(--gam-shadow-2);
	}
	.gam-importlist { max-height: 52vh; overflow: auto; border: 1px solid var(--gam-border); border-radius: var(--gam-r-md); }
	.gam-importrow { display: flex; align-items: flex-start; gap: 10px; padding: 11px 13px; border-bottom: 1px solid var(--gam-border); cursor: pointer; }
	.gam-importrow:last-child { border-bottom: 0; }
	.gam-importrow:hover { background: var(--gam-surface); }
	.gam-importrow input { margin-top: 3px; accent-color: var(--gam-accent); width: 15px; height: 15px; flex: none; }
	.gam-importrow-main { min-width: 0; flex: 1; }

	/* ---------- 时间线 ---------- */
	.gam-timeline { display: flex; flex-direction: column; gap: 0; }
	.gam-tl-day { display: grid; grid-template-columns: 92px 18px minmax(0, 1fr); gap: 0 10px; }
	.gam-tl-date { padding-top: 10px; text-align: right; }
	.gam-tl-date b { display: block; font-size: 11.5px; font-weight: 600; color: var(--gam-text-2); font-variant-numeric: tabular-nums; }
	.gam-tl-date span { font-size: 10px; color: var(--gam-text-4); }
	.gam-tl-rail { position: relative; display: flex; justify-content: center; }
	.gam-tl-rail::before { content: ""; position: absolute; top: 0; bottom: 0; width: 1px; background: var(--gam-border); }
	.gam-tl-dot { position: relative; z-index: 1; width: 7px; height: 7px; margin-top: 15px; border-radius: 50%; background: var(--gam-panel); border: 1.5px solid var(--gam-border-3); }
	.gam-tl-items { display: flex; flex-direction: column; gap: 6px; padding: 7px 0 16px; }
	.gam-tl-item { display: flex; align-items: flex-start; gap: 10px; width: 100%; padding: 9px 11px; border: 1px solid var(--gam-border); border-radius: var(--gam-r-sm); background: var(--gam-surface); text-align: left; color: inherit; cursor: pointer; }
	.gam-tl-item:hover { background: var(--gam-surface-2); }

	/* ---------- 族谱 ---------- */
	.gam-graph-wrap { display: grid; grid-template-columns: minmax(0, 1fr) 252px; gap: 12px; align-items: stretch; }
	.gam-graph-svg { width: 100%; height: auto; min-height: 360px; border: 1px solid var(--gam-border); border-radius: var(--gam-r-md); background: var(--gam-surface); }
	.gam-graph-edge { stroke: var(--gam-border-3); stroke-width: 1.2; }
	.gam-graph-edge.is-low { stroke-dasharray: 4 4; }
	.gam-graph-edge.is-active { stroke: var(--gam-accent); stroke-width: 1.8; }
	.gam-graph-node { fill: var(--gam-surface-3); stroke: var(--gam-border-3); stroke-width: 1.2; cursor: pointer; transition: fill .12s ease, stroke .12s ease; }
	.gam-graph-node:hover, .gam-graph-node.is-focus { fill: color-mix(in srgb, var(--gam-accent) 18%, var(--gam-surface-3)); stroke: var(--gam-accent); }
	.gam-graph-node:focus-visible { outline: none; stroke: var(--gam-accent); stroke-width: 2.4; }
	.gam-graph-label { fill: var(--gam-text-2); font-family: var(--gam-sans); font-size: 10.5px; pointer-events: none; }
	.gam-graph-label.is-focus { fill: var(--gam-text); font-weight: 600; }
	.gam-graph-edgelabel { fill: var(--gam-text-4); font-family: var(--gam-sans); font-size: 9px; pointer-events: none; }
	.gam-graph-side { display: flex; flex-direction: column; min-height: 0; border: 1px solid var(--gam-border); border-radius: var(--gam-r-md); background: var(--gam-surface); overflow: hidden; }
	.gam-graph-side-head { padding: 10px 12px; border-bottom: 1px solid var(--gam-border); font-size: 11px; font-weight: 650; color: var(--gam-text-2); }
	.gam-graph-side-list { overflow: auto; max-height: 460px; }
	.gam-graph-link { display: block; width: 100%; padding: 9px 12px; border: 0; border-bottom: 1px solid var(--gam-border); background: transparent; text-align: left; color: inherit; cursor: pointer; }
	.gam-graph-link:last-child { border-bottom: 0; }
	.gam-graph-link:hover { background: var(--gam-surface-2); }
	.gam-graph-legend { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; color: var(--gam-text-4); font-size: 10.5px; }
	.gam-graph-legend i { display: inline-block; width: 16px; height: 1px; background: var(--gam-border-3); vertical-align: middle; margin-right: 4px; }
	.gam-graph-legend i.dashed { background: repeating-linear-gradient(90deg, var(--gam-border-3) 0 3px, transparent 3px 6px); }

	/* ---------- 审计 ---------- */
	.gam-auditrow { border-bottom: 1px solid var(--gam-border); }
	.gam-auditrow:last-child { border-bottom: 0; }
	.gam-audit-grid { display: grid; grid-template-columns: 64px 86px minmax(0, 1fr) 90px 46px; gap: 10px; align-items: center; width: 100%; padding: 9px 13px; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; font-size: 11.5px; }
	.gam-audit-grid:hover { background: var(--gam-surface-2); }
	.gam-auditrow[data-flag="true"] .gam-audit-grid { background: color-mix(in srgb, var(--gam-warn) 6%, transparent); }
	.gam-audit-json { padding: 0 13px 12px; }
	.gam-audit-json .gam-pre { margin-top: 0; }
	.gam-audit-time { color: var(--gam-text-4); font-variant-numeric: tabular-nums; }
	.gam-audit-summary { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--gam-text-2); }

	/* ---------- 恢复 / diff ---------- */
	.gam-diff { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
	.gam-diff-col { border: 1px solid var(--gam-border); border-radius: var(--gam-r-sm); overflow: hidden; }
	.gam-diff-head { display: flex; align-items: center; gap: 6px; padding: 8px 10px; border-bottom: 1px solid var(--gam-border); font-size: 11px; font-weight: 600; color: var(--gam-text-2); background: var(--gam-surface); }
	.gam-diff-item { padding: 6px 10px; border-bottom: 1px solid var(--gam-border); font-size: 10.5px; font-family: var(--gam-mono); word-break: break-all; color: var(--gam-text-3); }
	.gam-diff-item:last-child { border-bottom: 0; }
	.gam-diff-col[data-kind="add"] .gam-diff-item { color: var(--gam-success); }
	.gam-diff-col[data-kind="remove"] .gam-diff-item { color: var(--gam-danger); }
	.gam-diff-col[data-kind="change"] .gam-diff-item { color: var(--gam-warn); }
	.gam-snapshotrow { display: flex; align-items: center; gap: 10px; padding: 10px 13px; border-bottom: 1px solid var(--gam-border); }
	.gam-snapshotrow:last-child { border-bottom: 0; }
	.gam-snapshotrow-main { min-width: 0; flex: 1; }
	.gam-snapshotrow-title { font-size: 12px; font-weight: 600; font-family: var(--gam-mono); word-break: break-all; }
	.gam-snapshotrow-sub { font-size: 10.5px; color: var(--gam-text-4); }

	/* ---------- 设置 ---------- */
	.gam-settinggroup { border: 1px solid var(--gam-border); border-radius: var(--gam-r-lg); background: var(--gam-surface); overflow: hidden; }
	.gam-settinggroup-head { padding: 12px 15px; border-bottom: 1px solid var(--gam-border); }
	.gam-settinggroup-head h3 { margin: 0; font-size: 12px; font-weight: 650; }
	.gam-settinggroup-head p { margin: 2px 0 0; font-size: 10.5px; color: var(--gam-text-4); }
	.gam-settingrow { display: flex; align-items: flex-start; gap: 14px; padding: 9px 15px; border-bottom: 1px solid var(--gam-border); }
	.gam-settingrow:last-child { border-bottom: 0; }
	.gam-setting-key { flex: none; width: 168px; font-family: var(--gam-mono); font-size: 10.5px; color: var(--gam-text-3); word-break: break-word; padding-top: 1px; }
	.gam-setting-val { min-width: 0; flex: 1; font-size: 11.5px; color: var(--gam-text); overflow-wrap: anywhere; }
	.gam-setting-val code { font-family: var(--gam-mono); font-size: 10.5px; }
	.gam-projectionrow { display: flex; align-items: center; gap: 10px; padding: 10px 15px; border-bottom: 1px solid var(--gam-border); }
	.gam-projectionrow:last-child { border-bottom: 0; }
	.gam-projectionrow-main { min-width: 0; flex: 1; }
	.gam-projectionrow-title { font-size: 11.5px; font-weight: 600; }
	.gam-projectionrow-path { margin-top: 2px; font-family: var(--gam-mono); font-size: 10px; color: var(--gam-text-4); word-break: break-all; }
	.gam-switch { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; color: var(--gam-text-4); white-space: nowrap; }
	.gam-switch::before { content: ""; width: 20px; height: 11px; border-radius: 999px; background: var(--gam-surface-3); border: 1px solid var(--gam-border); position: relative; }
	.gam-switch[data-on="true"] { color: var(--gam-success); }
	.gam-switch[data-on="true"]::before { background: var(--gam-success); border-color: var(--gam-success); }

	/* ---------- 会话内确认卡 ---------- */
	/* 队列弹窗从输入区打开时必须覆盖整个窗口，而不是只盖住输入框 */
	.gam-confirm-scope .gam-overlay { position: fixed; z-index: 90; }
	.gam-confirm {
	  position: relative; width: 100%; max-width: 760px; margin: 6px auto;
	  padding: 8px 10px 9px;
	  border: 1px solid var(--gam-border); border-radius: var(--gam-r-md);
	  background: var(--gam-surface); box-shadow: var(--gam-shadow-1);
	  font-size: 12px; overflow: hidden;
	}
	.gam-confirm-top { display: flex; align-items: center; gap: 6px; min-width: 0; flex-wrap: wrap; }
	.gam-confirm-icon {
	  display: grid; place-items: center; width: 22px; height: 22px; flex: none;
	  border-radius: var(--gam-r-xs); background: color-mix(in srgb, var(--gam-accent) 10%, transparent);
	  color: var(--gam-accent);
	}
	.gam-confirm-title { font-family: var(--gam-serif); font-size: 13px; font-weight: 600; white-space: nowrap; }
	.gam-confirm-main { display: flex; align-items: center; gap: 12px; margin-top: 4px; }
	.gam-confirm-text { min-width: 0; flex: 1; }
	.gam-confirm-body { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-confirm-sum { margin-top: 1px; color: var(--gam-text-3); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-confirm-reason { color: var(--gam-text-4); font-size: 10px; white-space: nowrap; }
	.gam-confirm-reason.is-block { white-space: normal; margin-top: 2px; }
	.gam-confirm-actions { display: flex; align-items: center; gap: 6px; justify-content: flex-end; flex: none; }
	.gam-confirm-actions .gam-spacer { flex: 1; }
	.gam-countdown { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: var(--gam-surface-3); }
	.gam-countdown > i { display: block; height: 100%; background: var(--gam-accent); transition: width 1s linear; }
	.gam-pendinglist { display: flex; flex-direction: column; gap: 8px; }
	.gam-pendingitem { padding: 10px 12px; border: 1px solid var(--gam-border); border-radius: var(--gam-r-sm); background: var(--gam-surface); }
	.gam-pendingitem-top { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
	.gam-pendingitem-title { margin-top: 4px; font-weight: 600; }
	.gam-pendingitem-sum { margin-top: 1px; color: var(--gam-text-3); font-size: 11.5px; }

	/* ---------- 工具类 ---------- */
	.gam-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
	.gam-dotsep { color: var(--gam-text-4); }
	.gam-inlinecode { font-family: var(--gam-mono); font-size: .94em; }
	.gam-scroll { overflow: auto; min-height: 0; }

	/* ---------- 响应式（按面板宽度，不按视口） ---------- */
	@container gam (max-width: 900px) {
	  .gam-header { padding: 14px 16px 10px; }
	  .gam-shell { display: flex; flex-direction: column; }
	  .gam-rail {
	    flex-direction: row; align-items: center; gap: 4px;
	    padding: 6px 12px; border-right: 0; border-bottom: 1px solid var(--gam-border);
	    overflow-x: auto; overflow-y: hidden; flex: none;
	  }
	  .gam-railgroup { flex-direction: row; align-items: center; gap: 2px; }
	  .gam-rail-label, .gam-railfoot { display: none; }
	  .gam-navitem { width: auto; white-space: nowrap; padding: 5px 9px; }
	  .gam-navitem.is-active::before { left: 50%; top: auto; bottom: -1px; transform: translateX(-50%); width: 14px; height: 2px; }
	  .gam-content-inner { padding: 0 16px 36px; }
	  .gam-page { gap: 14px; }
	  .gam-graph-wrap { grid-template-columns: 1fr; }
	  .gam-graph-side-list { max-height: 220px; }
	  .gam-diff { grid-template-columns: 1fr; }
	  .gam-setting-key { width: 138px; }
	}
	@container gam (max-width: 620px) {
	  .gam-header { gap: 10px; }
	  .gam-brandsub { display: none; }
	  .gam-live { display: none; }
	  .gam-command-trigger span { display: none; }
	  .gam-command-trigger { padding: 0 6px; }
	  .gam-pagetitle { font-size: 22px; }
	  .gam-pagehead { flex-direction: column; align-items: stretch; gap: 10px; }
	  .gam-pageactions { justify-content: flex-start; }
	  .gam-statgrid, .gam-grid2, .gam-grid3, .gam-settingsgrid { grid-template-columns: 1fr; }
	  .gam-stat { min-height: 132px; }
	  .gam-inputwrap { min-width: 100%; }
	  .gam-rowitem { padding: 11px 12px; gap: 10px; }
	  .gam-rowitem-side { display: none; }
	  .gam-rowitem-sum { white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
	  .gam-importgrid { grid-template-columns: 1fr; }
	  .gam-audit-grid { grid-template-columns: 52px 74px minmax(0, 1fr) 30px; }
	  .gam-audit-grid > :nth-child(4) { display: none; }
	  .gam-tl-day { grid-template-columns: 64px 14px minmax(0, 1fr); gap: 0 7px; }
	  .gam-tl-date b { font-size: 10.5px; }
	  .gam-settingrow { flex-direction: column; gap: 3px; }
	  .gam-setting-key { width: auto; }
	  .gam-drawer { width: 100%; border-left: 0; }
	  .gam-overlay { padding: 12px; }
	  .gam-overlay[data-align="right"] { padding: 0; }
	  .gam-dialog { max-height: 86vh; }
	  .gam-toasts { right: 12px; left: 12px; bottom: 12px; max-width: none; }
	}
	@media (pointer: coarse) {
	  .gam-btn, .gam-input, .gam-select, .gam-navitem, .gam-command-trigger { min-height: 40px; }
	  .gam-iconbtn { width: 40px; height: 40px; }
	  .gam-chip { min-height: 34px; }
	}
	@media (prefers-reduced-motion: reduce) {
	  .gam-root *, .gam-root *::before, .gam-root *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
	}
	@media (prefers-contrast: more) {
	  .gam-root { --gam-border: var(--dsw-alias-border-l3, currentColor); }
	  .gam-card, .gam-listcard, .gam-source, .gam-settinggroup { border-width: 1.5px; }
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
	//#region src/client/ui.tsx
	let dialogSeq = 0;
	function cx(...parts) {
		return parts.filter(Boolean).join(" ");
	}
	function Svg(props) {
		const size = props.size ?? 16;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
			className: props.className,
			viewBox: props.viewBox ?? "0 0 24 24",
			width: size,
			height: size,
			fill: props.fill ? "currentColor" : "none",
			stroke: props.fill ? "none" : "currentColor",
			strokeWidth: 1.7,
			strokeLinecap: "round",
			strokeLinejoin: "round",
			"aria-hidden": "true",
			focusable: "false",
			children: props.children
		});
	}
	const IconMemory = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 4.5h10.5L19 8v11.5H5z" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M15.5 4.5V8H19" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "12",
				r: "1.1",
				fill: "currentColor",
				stroke: "none"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "15",
				cy: "16",
				r: "1.1",
				fill: "currentColor",
				stroke: "none"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M9 12l6 4",
				opacity: ".55"
			})
		]
	});
	const IconDashboard = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "4",
				y: "4",
				width: "7",
				height: "7",
				rx: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "13",
				y: "4",
				width: "7",
				height: "4.5",
				rx: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "13",
				y: "11",
				width: "7",
				height: "9",
				rx: "1.5"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
				x: "4",
				y: "13",
				width: "7",
				height: "7",
				rx: "1.5"
			})
		]
	});
	const IconBook = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4.5 5.5A2.5 2.5 0 017 3h12.5v17H7a2.5 2.5 0 00-2.5 2.5z" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M4.5 5.5V22",
				opacity: ".45"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 7.5h8M8 11h6" })
		]
	});
	const IconImport = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 3v11" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 10l4 4 4-4" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 16.5V20h16v-3.5" })
		]
	});
	const IconClock = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "8.5"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 7.5V12l3 2" })]
	});
	const IconGraph = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "6",
				cy: "6.5",
				r: "2.2"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "7",
				r: "2.2"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "18",
				r: "2.2"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
				d: "M8 7.5l7.8 8.6M16.4 8.5l-3 7.2M8.1 7l3.2 8.7",
				opacity: ".7"
			})
		]
	});
	const IconAudit = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 3.5h12v17H6z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 8h6M9 12h6M9 16h4" })]
	});
	const IconRecovery = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4.5 12a7.5 7.5 0 101.8-4.9" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4.5 4.5V9H9" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 8.5V12l2.5 1.5" })
		]
	});
	const IconSettings = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 7h10M18 7h2M4 17h2M10 17h10" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "16",
				cy: "7",
				r: "2"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "8",
				cy: "17",
				r: "2"
			})
		]
	});
	const IconSearch = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "10.5",
			cy: "10.5",
			r: "6"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M15 15l4.5 4.5" })]
	});
	const IconRefresh = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M19 12a7 7 0 11-2-4.9" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M19 4v4.5h-4.5" })]
	});
	const IconPlus = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
		...p,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 5v14M5 12h14" })
	});
	const IconCheck = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
		...p,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 12.5l4.5 4.5L19 7" })
	});
	const IconAlert = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 4L21 20H3z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 9v5M12 17.2v.1" })]
	});
	const IconInfo = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
			cx: "12",
			cy: "12",
			r: "8.5"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 11v5M12 8v.1" })]
	});
	const IconClose = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
		...p,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 6l12 12M18 6L6 18" })
	});
	const IconChevronRight = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
		...p,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 5l7 7-7 7" })
	});
	const IconChevronDown = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
		...p,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 9l7 7 7-7" })
	});
	const IconChevronLeft = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
		...p,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M15 5l-7 7 7 7" })
	});
	const IconCopy = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
			x: "8",
			y: "8",
			width: "11",
			height: "12",
			rx: "2"
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2h2" })]
	});
	const IconEdit = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 20h4l11-11-4-4L4 16z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.5 6.5l4 4" })]
	});
	const IconSave = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 4h11l3 3v13H5z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 4v6h8V4M8 20v-6h8v6" })]
	});
	const IconTrash = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 11v5M14 11v5" })]
	});
	const IconUpload = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 16V5" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 9l4-4 4 4" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 16.5V20h16v-3.5" })
		]
	});
	const IconDownload = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 4v11" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 11l4 4 4-4" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 17v3h16v-3" })
		]
	});
	const IconFile = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 3.5h8l4 4v13H6z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M14 3.5v4h4" })]
	});
	const IconUndo = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 9h9a6 6 0 010 12h-3" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 5L4 9l4 4" })]
	});
	const IconShield = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 12l2 2 4-4" })]
	});
	const IconSparkle = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" })]
	});
	const IconFolder = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
		...p,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.5 6.5h6l2 2h9v11h-17z" })
	});
	const IconList = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 6h11M9 12h11M9 18h11" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4.5 6h.1M4.5 12h.1M4.5 18h.1" })]
	});
	const IconGraphView = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "6",
				cy: "6",
				r: "1.7"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "6",
				r: "1.7"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "18",
				r: "1.7"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M7.5 7l3.5 9M16.5 7l-3.5 9M7.7 6h8.6" })
		]
	});
	const IconArrowRight = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
		...p,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 12h16M14 6l6 6-6 6" })
	});
	function Button(props) {
		const { variant = "secondary", size = "md", icon, className, children, type = "button", ...rest } = props;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			...rest,
			type,
			className: cx("gam-btn", className),
			"data-variant": variant,
			"data-size": size,
			children: [icon, children]
		});
	}
	function IconButton(props) {
		const { label, icon, size = "md", tone = "default", className, type = "button", ...rest } = props;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			...rest,
			type,
			className: cx("gam-iconbtn", className),
			"data-size": size,
			"data-tone": tone,
			"aria-label": label,
			title: label,
			children: icon
		});
	}
	function Badge(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
			className: cx("gam-badge", props.className),
			"data-tone": props.tone ?? "neutral",
			children: [props.dot ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}) : null, props.children]
		});
	}
	function kindLabel(t, kind) {
		const key = `kind.${kind}`;
		const label = t(key);
		return label === key ? kind : label;
	}
	function KindBadge(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: "gam-badge gam-kindbadge",
			children: kindLabel(props.t, props.kind)
		});
	}
	function Kbd(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("kbd", {
			className: "gam-kbd",
			children: props.children
		});
	}
	function PageHeader(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
			className: "gam-pagehead",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-pagehead-main",
				children: [
					props.eyebrow ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "gam-eyebrow",
						children: props.eyebrow
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						className: "gam-pagetitle",
						children: props.title
					}),
					props.description ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "gam-pagedesc",
						children: props.description
					}) : null
				]
			}), props.actions ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "gam-pageactions",
				children: props.actions
			}) : null]
		});
	}
	function Card(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: cx("gam-card", props.className),
			"data-flat": props.flat ? "true" : void 0,
			children: [props.title || props.actions ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-cardhead",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [props.title ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					className: "gam-cardtitle",
					children: props.title
				}) : null, props.hint ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "gam-cardhint",
					children: props.hint
				}) : null] }), props.actions ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-card-actions",
					children: props.actions
				}) : null]
			}) : null, props.children]
		});
	}
	function SkeletonList(props) {
		const rows = props.rows ?? 5;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "gam-listcard",
			"aria-hidden": "true",
			children: Array.from({ length: rows }, (_, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "gam-rowitem",
				"data-static": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-rowitem-main",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-skeleton gam-skeletonline",
						style: { width: `${38 + index * 17 % 34}%` }
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-skeleton gam-skeletonline",
						style: {
							width: `${64 + index * 11 % 22}%`,
							height: 9
						}
					})]
				})
			}, index))
		});
	}
	function Spinner() {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: "gam-spinner",
			"aria-hidden": "true"
		});
	}
	function EmptyState(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-empty",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-empty-icon",
					children: props.icon ?? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconMemory, { size: 20 })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-empty-title",
					children: props.title
				}),
				props.description ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "gam-empty-desc",
					children: props.description
				}) : null,
				props.actions ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-empty-actions",
					children: props.actions
				}) : null
			]
		});
	}
	function ErrorState(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-errorbox",
			role: "alert",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-error-title",
					children: props.title
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
					className: "gam-pre",
					children: props.message
				}),
				props.onRetry ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-inline",
					style: { marginTop: 10 },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 13 }),
						onClick: props.onRetry,
						children: props.retryLabel
					})
				}) : null
			]
		});
	}
	function Meter(props) {
		const pct = Math.max(0, Math.min(1, Number.isFinite(props.value) ? props.value : 0)) * 100;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: cx("gam-meter", props.large && "gam-meter-lg"),
			"data-tone": props.tone,
			role: "presentation",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { style: { width: `${pct}%` } })
		});
	}
	function Segmented(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "gam-chiprow",
			role: "group",
			"aria-label": props.ariaLabel,
			children: props.options.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: cx("gam-chip", props.value === option.value && "is-active"),
				"aria-pressed": props.value === option.value,
				onClick: () => props.onChange(option.value),
				children: option.label
			}, option.value))
		});
	}
	function SearchInput(props) {
		const { value, onChange, shortcut, clearLabel, className, ...rest } = props;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: cx("gam-inputwrap", className),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "gam-inputicon",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSearch, { size: 14 })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					...rest,
					className: "gam-input",
					type: "search",
					value,
					onChange: (event) => onChange(event.target.value)
				}),
				value ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "gam-inputclear",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
						size: "sm",
						label: clearLabel,
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClose, { size: 12 }),
						onClick: () => onChange("")
					})
				}) : shortcut ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "gam-inputkbd",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kbd, { children: shortcut })
				}) : null
			]
		});
	}
	function SelectField(props) {
		const { value, onChange, options, className, ...rest } = props;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
			className: cx("gam-selectwrap", className),
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
				...rest,
				className: "gam-select",
				value,
				onChange: (event) => onChange(event.target.value),
				children: options.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
					value: option.value,
					children: option.label
				}, option.value))
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "gam-select-chevron",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronDown, { size: 13 })
			})]
		});
	}
	function CopyButton(props) {
		const [done, setDone] = (0, react.useState)(false);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
			size: props.size ?? "sm",
			variant: props.variant ?? "ghost",
			icon: done ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, { size: 13 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCopy, { size: 13 }),
			title: props.label,
			onClick: async () => {
				const ok = await copyText(props.text);
				setDone(ok);
				props.onCopied?.(ok);
				if (ok) window.setTimeout(() => setDone(false), 1600);
			},
			children: props.children ?? (done ? props.copiedLabel : props.label)
		});
	}
	function Dialog(props) {
		const titleId = (0, react.useRef)(`gam-dialog-${++dialogSeq}`).current;
		const panelRef = (0, react.useRef)(null);
		(0, react.useEffect)(() => {
			if (!props.open) return;
			const onKey = (event) => {
				if (event.key === "Escape") {
					event.stopPropagation();
					props.onClose();
				}
			};
			window.addEventListener("keydown", onKey);
			const timer = window.setTimeout(() => panelRef.current?.focus(), 20);
			return () => {
				window.removeEventListener("keydown", onKey);
				window.clearTimeout(timer);
			};
		}, [props.open, props.onClose]);
		if (!props.open) return null;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "gam-overlay",
			"data-align": props.align === "top" ? "top" : void 0,
			onMouseDown: (event) => {
				if (event.target === event.currentTarget) props.onClose();
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-dialog",
				"data-size": props.size ?? "default",
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": titleId,
				ref: panelRef,
				tabIndex: -1,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-dialog-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-dialog-head-main",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: "gam-dialog-title",
								id: titleId,
								children: props.title
							}), props.description ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "gam-dialog-desc",
								children: props.description
							}) : null]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
							label: props.closeLabel,
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClose, { size: 15 }),
							onClick: props.onClose
						})]
					}),
					props.children ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-dialog-body",
						children: props.children
					}) : null,
					props.actions ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-dialog-actions",
						children: props.actions
					}) : null
				]
			})
		});
	}
	function ConfirmDialog(props) {
		(0, react.useEffect)(() => {
			if (!props.open || props.busy) return;
			const onKey = (event) => {
				if (event.key !== "Enter") return;
				const target = event.target;
				if (target && /^(input|textarea|select|button|a)$/i.test(target.tagName)) return;
				props.onConfirm();
			};
			window.addEventListener("keydown", onKey);
			return () => window.removeEventListener("keydown", onKey);
		}, [
			props.open,
			props.busy,
			props.onConfirm
		]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Dialog, {
			open: props.open,
			title: props.title,
			description: props.description,
			onClose: props.onClose,
			closeLabel: props.closeLabel,
			size: "sm",
			actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: props.onClose,
				disabled: props.busy,
				children: props.cancelLabel
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Button, {
				variant: props.danger ? "danger" : "primary",
				onClick: props.onConfirm,
				disabled: props.busy,
				children: [props.busy ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : null, props.confirmLabel]
			})] }),
			children: props.children
		});
	}
	function Markdown(props) {
		const lines = props.text.replace(/\r\n?/g, "\n").split("\n");
		const blocks = [];
		let index = 0;
		let key = 0;
		const next = () => lines[index] ?? "";
		while (index < lines.length) {
			const line = next();
			if (/^```/.test(line.trim())) {
				const language = line.trim().slice(3).trim();
				index++;
				const code = [];
				while (index < lines.length && !/^```/.test(next().trim())) {
					code.push(next());
					index++;
				}
				if (index < lines.length) index++;
				blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
					"data-language": language || void 0,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: code.join("\n") })
				}, key++));
				continue;
			}
			const heading = /^(#{1,3})\s+(.*)$/.exec(line);
			if (heading) {
				const level = (heading[1] ?? "#").length;
				const content = inline(heading[2] ?? "", key++);
				if (level === 1) blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: content }, key++));
				else if (level === 2) blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: content }, key++));
				else blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: content }, key++));
				index++;
				continue;
			}
			if (/^\s*[-*]\s+/.test(line)) {
				const items = [];
				while (index < lines.length && /^\s*[-*]\s+/.test(next())) {
					items.push(next().replace(/^\s*[-*]\s+/, ""));
					index++;
				}
				blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", { children: items.map((item, itemIndex) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: inline(item, key++) }, itemIndex)) }, key++));
				continue;
			}
			if (/^\s*\d+\.\s+/.test(line)) {
				const items = [];
				while (index < lines.length && /^\s*\d+\.\s+/.test(next())) {
					items.push(next().replace(/^\s*\d+\.\s+/, ""));
					index++;
				}
				blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", { children: items.map((item, itemIndex) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: inline(item, key++) }, itemIndex)) }, key++));
				continue;
			}
			if (/^>\s?/.test(line)) {
				const quote = [];
				while (index < lines.length && /^>\s?/.test(next())) {
					quote.push(next().replace(/^>\s?/, ""));
					index++;
				}
				blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("blockquote", { children: inline(quote.join(" "), key++) }, key++));
				continue;
			}
			if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
				blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("hr", {}, key++));
				index++;
				continue;
			}
			if (!line.trim()) {
				index++;
				continue;
			}
			const paragraph = [];
			while (index < lines.length) {
				const current = next();
				if (!current.trim() || /^(#{1,3})\s+/.test(current) || /^\s*[-*]\s+/.test(current) || /^\s*\d+\.\s+/.test(current) || /^>\s?/.test(current) || /^```/.test(current.trim())) break;
				paragraph.push(current);
				index++;
			}
			blocks.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: inline(paragraph.join(" "), key++) }, key++));
		}
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "gam-prose",
			children: blocks
		});
	}
	function inline(text, baseKey) {
		const out = [];
		const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\*[^*]+\*)/g;
		let last = 0;
		let match;
		let index = 0;
		while ((match = pattern.exec(text)) !== null) {
			if (match.index > last) out.push(text.slice(last, match.index));
			const token = match[0];
			const key = `${baseKey}-${index++}`;
			if (token.startsWith("**")) out.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: token.slice(2, -2) }, key));
			else if (token.startsWith("`")) out.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: token.slice(1, -1) }, key));
			else if (token.startsWith("[")) {
				const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(token);
				out.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
					href: link?.[2],
					target: "_blank",
					rel: "noreferrer noopener",
					children: link?.[1] ?? token
				}, key));
			} else out.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: token.slice(1, -1) }, key));
			last = match.index + token.length;
		}
		if (last < text.length) out.push(text.slice(last));
		return out;
	}
	function interpolate(text, vars) {
		return text.replace(/\{(\w+)\}/g, (whole, key) => Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : whole);
	}
	function useDebounced(value, delay = 220) {
		const [debounced, setDebounced] = (0, react.useState)(value);
		(0, react.useEffect)(() => {
			const timer = window.setTimeout(() => setDebounced(value), delay);
			return () => window.clearTimeout(timer);
		}, [value, delay]);
		return debounced;
	}
	function useTicker(intervalMs, enabled = true) {
		const [tick, setTick] = (0, react.useState)(Date.now());
		(0, react.useEffect)(() => {
			if (!enabled) return;
			const timer = window.setInterval(() => {
				if (!document.hidden) setTick(Date.now());
			}, intervalMs);
			return () => window.clearInterval(timer);
		}, [intervalMs, enabled]);
		return tick;
	}
	function isMac() {
		if (typeof navigator === "undefined") return false;
		const platform = navigator.platform || "";
		const ua = navigator.userAgent || "";
		return /Mac|iPhone|iPad|iPod/.test(platform) || /Mac OS X/.test(ua);
	}
	function shortcutLabel() {
		return isMac() ? "⌘ K" : "Ctrl K";
	}
	function parseDate(value) {
		if (value === null || value === void 0 || value === "") return null;
		const source = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
		const date = new Date(source);
		return Number.isNaN(date.getTime()) ? null : date;
	}
	function locale() {
		if (typeof navigator !== "undefined" && navigator.language) return navigator.language;
		return "zh-CN";
	}
	function formatNumber(value) {
		try {
			return new Intl.NumberFormat(locale()).format(value);
		} catch {
			return String(value);
		}
	}
	function formatDate(value, opts = {}) {
		const date = parseDate(value);
		if (!date) return typeof value === "string" ? value : "—";
		try {
			return new Intl.DateTimeFormat(locale(), {
				year: "numeric",
				month: "short",
				day: "numeric",
				...opts
			}).format(date);
		} catch {
			return date.toISOString().slice(0, 10);
		}
	}
	function formatMonthDay(value) {
		const date = parseDate(value);
		if (!date) return typeof value === "string" ? value : "—";
		try {
			return new Intl.DateTimeFormat(locale(), {
				month: "short",
				day: "numeric"
			}).format(date);
		} catch {
			return date.toISOString().slice(5, 10);
		}
	}
	function formatTime(value) {
		const date = parseDate(value);
		if (!date) return typeof value === "string" ? value.slice(11, 19) : "—";
		try {
			return new Intl.DateTimeFormat(locale(), {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false
			}).format(date);
		} catch {
			return date.toISOString().slice(11, 19);
		}
	}
	function formatDateTime(value) {
		const date = parseDate(value);
		if (!date) return typeof value === "string" ? value : "—";
		return `${formatDate(date)} ${formatTime(date)}`;
	}
	function formatBytes(bytes) {
		if (!Number.isFinite(bytes) || bytes < 0) return "—";
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}
	function shortId(id, length = 8) {
		return id.length <= length ? id : id.slice(0, length);
	}
	function todayISO() {
		return localDay(/* @__PURE__ */ new Date());
	}
	/** 本地时区的 `YYYY-MM-DD`：用户心智里的“今天”，不是 UTC 日期。 */
	function localDay(value) {
		const date = parseDate(value);
		if (!date) return typeof value === "string" ? value : "";
		const offset = date.getTimezoneOffset();
		return (/* @__PURE__ */ new Date(date.getTime() - offset * 6e4)).toISOString().slice(0, 10);
	}
	function shiftDay(iso, delta) {
		const date = /* @__PURE__ */ new Date(`${iso}T12:00:00`);
		date.setDate(date.getDate() + delta);
		return date.toISOString().slice(0, 10);
	}
	async function copyText(text) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {
			try {
				const area = document.createElement("textarea");
				area.value = text;
				area.setAttribute("readonly", "");
				area.style.position = "fixed";
				area.style.top = "-1000px";
				area.style.opacity = "0";
				document.body.appendChild(area);
				area.select();
				const ok = document.execCommand("copy");
				area.remove();
				return ok;
			} catch {
				return false;
			}
		}
	}

	//#endregion
	//#region src/client/panel.tsx
	/** 侧栏图标（slot: sidebar.panellist，owner props 为 { size, active }） */
	function MemoryPanelIcon(props) {
		const size = props.size ?? 20;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: "gam-icon",
			style: {
				display: "grid",
				placeItems: "center",
				opacity: props.active ? 1 : .78
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconMemory, { size })
		});
	}
	const NAV_GROUPS = [{
		labelKey: "nav.groupMemory",
		items: [
			{
				id: "overview",
				labelKey: "nav.overview",
				icon: IconDashboard
			},
			{
				id: "browse",
				labelKey: "nav.browse",
				icon: IconBook
			},
			{
				id: "import",
				labelKey: "nav.import",
				icon: IconImport
			},
			{
				id: "timeline",
				labelKey: "nav.timeline",
				icon: IconClock
			}
		]
	}, {
		labelKey: "nav.groupSystem",
		items: [
			{
				id: "graph",
				labelKey: "nav.graph",
				icon: IconGraph
			},
			{
				id: "audit",
				labelKey: "nav.audit",
				icon: IconAudit
			},
			{
				id: "recovery",
				labelKey: "nav.recovery",
				icon: IconRecovery
			},
			{
				id: "settings",
				labelKey: "nav.settings",
				icon: IconSettings
			}
		]
	}];
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
	function MemoryPanel(props) {
		ensureStyles();
		const t = props.t;
		const [view, setView] = (0, react.useState)("overview");
		const [openId, setOpenId] = (0, react.useState)(null);
		const [paletteOpen, setPaletteOpen] = (0, react.useState)(false);
		const [version, setVersion] = (0, react.useState)(0);
		const [browseKind, setBrowseKind] = (0, react.useState)("");
		const [toasts, setToasts] = (0, react.useState)([]);
		const [hosted, setHosted] = (0, react.useState)(false);
		const rootRef = (0, react.useRef)(null);
		const toastSeq = (0, react.useRef)(0);
		const toast = (0, react.useCallback)((message, tone = "neutral") => {
			const id = ++toastSeq.current;
			setToasts((prev) => [...prev.slice(-2), {
				id,
				message,
				tone
			}]);
			window.setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3400);
		}, []);
		const changed = (0, react.useCallback)(() => setVersion((value) => value + 1), []);
		const navigate = (0, react.useCallback)((next) => setView(next), []);
		const openEntry = (0, react.useCallback)((id) => setOpenId(id), []);
		const goBrowseKind = (0, react.useCallback)((kind) => {
			setBrowseKind(kind);
			setView("browse");
		}, []);
		(0, react.useEffect)(() => {
			const root = rootRef.current;
			if (!root) return;
			const probe = getComputedStyle(root).getPropertyValue("--dsw-alias-bg-base").trim();
			setHosted(probe.length > 0);
		}, []);
		(0, react.useEffect)(() => {
			const onKey = (event) => {
				const target = event.target;
				const typing = target ? /^(input|textarea|select)$/i.test(target.tagName) || target.isContentEditable : false;
				const mod = event.metaKey || event.ctrlKey;
				if (mod && event.key.toLowerCase() === "k") {
					event.preventDefault();
					setPaletteOpen((open) => !open);
					return;
				}
				if (!mod && event.key === "/" && !typing && !event.altKey) {
					event.preventDefault();
					setPaletteOpen(true);
				}
			};
			window.addEventListener("keydown", onKey);
			return () => window.removeEventListener("keydown", onKey);
		}, []);
		const common = {
			t,
			version,
			onOpen: openEntry,
			onNavigate: navigate,
			onChanged: changed,
			toast
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			ref: rootRef,
			className: cx("gam-root", hosted && "gam-hosted"),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: "gam-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-brand",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-brandmark",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconMemory, { size: 21 })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-brandtext",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-brandtitle",
								children: t("panel.title")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-brandsub",
								children: t("panel.tagline")
							})]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-header-actions",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gam-live",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}), t("panel.autoRefresh")]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "gam-command-trigger",
								onClick: () => setPaletteOpen(true),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSearch, { size: 14 }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("command.trigger") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kbd, { children: shortcutLabel() })
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButtonRefresh, {
								t,
								onClick: () => {
									changed();
									toast(t("common.refreshed"), "success");
								}
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-shell",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
						className: "gam-rail",
						"aria-label": t("panel.title"),
						children: [NAV_GROUPS.map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-railgroup",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-rail-label",
								children: t(group.labelKey)
							}), group.items.map((item) => {
								const Icon = item.icon;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: cx("gam-navitem", view === item.id && "is-active"),
									"aria-current": view === item.id ? "page" : void 0,
									onClick: () => setView(item.id),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-navicon",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Icon, { size: 15 })
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-navtext",
										children: t(item.labelKey)
									})]
								}, item.id);
							})]
						}, group.labelKey)), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-railfoot",
							children: [
								t("panel.shortcutHint"),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kbd, { children: shortcutLabel() })
							]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("main", {
						className: "gam-content",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-content-inner",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Boundary, {
								label: view,
								t,
								children: view === "overview" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Overview, {
									...common,
									onBrowseKind: goBrowseKind
								}) : view === "browse" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Browse, {
									...common,
									kind: browseKind,
									onKindChange: setBrowseKind
								}) : view === "import" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImportView, { ...common }) : view === "timeline" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TimelineView, { ...common }) : view === "graph" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphView, { ...common }) : view === "audit" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AuditView, { ...common }) : view === "recovery" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RecoveryView, { ...common }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SettingsView, { ...common })
							}, view)
						})
					})]
				}),
				openId ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EntryDrawer, {
					id: openId,
					t,
					onClose: () => setOpenId(null),
					onOpen: openEntry,
					onChanged: changed,
					toast
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommandPalette, {
					open: paletteOpen,
					t,
					onClose: () => setPaletteOpen(false),
					onNavigate: navigate,
					onOpen: openEntry,
					onChanged: changed,
					toast
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-toasts",
					"aria-live": "polite",
					children: toasts.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-toast",
						"data-tone": item.tone,
						children: [item.tone === "success" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, { size: 14 }) : item.tone === "danger" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconAlert, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconInfo, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: item.message })]
					}, item.id))
				})
			]
		});
	}
	function IconButtonRefresh(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: "gam-iconbtn",
			title: props.t("common.refresh"),
			"aria-label": props.t("common.refresh"),
			onClick: props.onClick,
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 16 })
		});
	}
	function Overview(props) {
		const t = props.t;
		const [stats, setStats] = (0, react.useState)(null);
		const [pending, setPending] = (0, react.useState)([]);
		const [recent, setRecent] = (0, react.useState)([]);
		const [error, setError] = (0, react.useState)(null);
		const [fixing, setFixing] = (0, react.useState)(false);
		const [catalog, setCatalog] = (0, react.useState)(null);
		const [catalogOpen, setCatalogOpen] = (0, react.useState)(false);
		const [undo, setUndo] = (0, react.useState)(null);
		const [undoing, setUndoing] = (0, react.useState)(false);
		const [deciding, setDeciding] = (0, react.useState)(null);
		const load = (0, react.useCallback)(() => {
			api.stats().then((value) => {
				setStats(value);
				setError(null);
			}).catch((cause) => setError(cause.message));
			api.pending().then((value) => setPending(value.items)).catch(() => {});
			api.audit(todayISO(), 30).then((value) => setRecent(value.items)).catch(() => {});
		}, []);
		(0, react.useEffect)(() => {
			load();
			const timer = window.setInterval(() => {
				if (!document.hidden) load();
			}, 5e3);
			return () => window.clearInterval(timer);
		}, [load, props.version]);
		(0, react.useEffect)(() => {
			if (!catalogOpen) return;
			let alive = true;
			setCatalog(null);
			api.catalog().then((value) => {
				if (alive) setCatalog(value);
			}).catch((cause) => props.toast(cause.message, "danger"));
			return () => {
				alive = false;
			};
		}, [catalogOpen, props.toast]);
		const runDoctor = () => {
			setFixing(true);
			api.doctor(true).then((report) => {
				props.toast(interpolate(t("overview.doctorDone"), { n: report.rebuilt.length }), "success");
				props.onChanged();
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setFixing(false));
		};
		const decide = (item, action) => {
			setDeciding(item.id);
			api.decidePending(item.id, action).then(() => {
				setPending((prev) => prev.filter((entry) => entry.id !== item.id));
				props.toast(action === "accept" ? t("overview.pendingAccepted") : t("overview.pendingRejected"), "success");
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setDeciding(null));
		};
		const doUndo = () => {
			if (!undo?.id) return;
			setUndoing(true);
			api.invalidate(undo.id, "undo from overview").then(() => {
				props.toast(t("overview.undone"), "success");
				setUndo(null);
				props.onChanged();
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setUndoing(false));
		};
		if (error && !stats) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-page",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
				eyebrow: t("nav.groupMemory"),
				title: t("nav.overview"),
				description: t("overview.desc")
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorState, {
				title: t("panel.hostUnavailable"),
				message: error,
				retryLabel: t("panel.retry"),
				onRetry: load
			})]
		});
		if (!stats) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-page",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					eyebrow: t("nav.groupMemory"),
					title: t("nav.overview"),
					description: t("overview.desc")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-statgrid",
					children: Array.from({ length: 4 }, (_, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-card gam-stat",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-skeleton gam-skeletonline",
								style: {
									width: "46%",
									height: 9
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-skeleton gam-skeletonline",
								style: {
									width: "38%",
									height: 28,
									marginTop: 12
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-skeleton gam-skeletonline",
								style: {
									width: "72%",
									height: 9,
									marginTop: "auto"
								}
							})
						]
					}, index))
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkeletonList, { rows: 3 })
			]
		});
		const share = stats.recall.lastShare;
		const cap = stats.recall.maxShare || .03;
		const shareRatio = cap > 0 ? share / cap : 0;
		const verbatimRate = stats.recall.inject.events > 0 ? stats.recall.inject.verbatim / stats.recall.inject.events : 1;
		const zeroHitRate = stats.recall.tool.events > 0 ? stats.recall.tool.zeroHit / stats.recall.tool.events : 0;
		const errors = stats.alerts.filter((alert) => alert.level === "error").length + stats.issues.length;
		const warns = stats.alerts.filter((alert) => alert.level === "warn").length;
		const healthTone = errors > 0 ? "danger" : warns > 0 ? "warn" : "success";
		const kindEntries = Object.entries(stats.byKind).sort((a, b) => b[1] - a[1]);
		const writes = recent.filter((row) => row.act === "write" || row.act === "update" || row.act === "invalidate" || row.act === "import" || row.act === "restore").slice(0, 7);
		const attentionCount = errors + warns + pending.length;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-page",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					eyebrow: t("nav.groupMemory"),
					title: t("nav.overview"),
					description: t("overview.desc"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconImport, { size: 14 }),
						onClick: () => props.onNavigate("import"),
						children: t("nav.import")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						icon: fixing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconShield, { size: 14 }),
						onClick: runDoctor,
						disabled: fixing,
						children: t("recovery.doctor")
					})] })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-health",
					"data-tone": healthTone,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-health-icon",
							children: healthTone === "success" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, { size: 15 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconAlert, { size: 15 })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-health-text",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-health-title",
								children: healthTone === "success" ? t("overview.allClear") : errors > 0 ? interpolate(t("overview.errorsFound"), { n: errors }) : interpolate(t("overview.warningsFound"), { n: warns })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-health-desc",
								children: healthTone === "success" ? t("overview.allClearDesc") : `${errors} ${t("overview.errors")} · ${warns} ${t("overview.warnings")} · ${pending.length} ${t("overview.pending")}`
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-health-actions",
							children: healthTone !== "success" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: runDoctor,
								disabled: fixing,
								children: t("overview.fixNow")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => props.onNavigate("recovery"),
								children: t("nav.recovery")
							})] }) : null
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-statgrid",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
							label: t("overview.budget"),
							value: (share * 100).toFixed(2),
							unit: "%",
							action: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconInfo, {
								size: 14,
								className: "gam-faint"
							}),
							aside: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setCatalogOpen(true),
								children: t("overview.viewInjection")
							}),
							footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.budgetShare") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("b", { children: [(cap * 100).toFixed(1), "%"] })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "INDEX" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("b", { children: [
										stats.index.lines,
										"/",
										stats.index.maxLines,
										" lines"
									] })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.bytes") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: formatBytes(stats.index.bytes) })]
								})
							] }),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Meter, {
								value: shareRatio,
								tone: shareRatio > 1 ? "danger" : "accent"
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
							label: t("overview.cacheHealth"),
							value: `${(verbatimRate * 100).toFixed(0)}`,
							unit: "%",
							footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.verbatimRate") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("b", { children: [
										stats.recall.inject.verbatim,
										"/",
										stats.recall.inject.events
									] })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.injectChars") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: formatNumber(stats.recall.inject.chars) })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.injectTokens") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: formatNumber(stats.recall.inject.tokens) })]
								})
							] }),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Meter, {
								value: verbatimRate,
								tone: verbatimRate < .5 && stats.recall.inject.events > 20 ? "danger" : "success"
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
							label: t("overview.entries"),
							value: formatNumber(stats.entryCount),
							unit: t("overview.itemsUnit"),
							footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.kinds") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: kindEntries.length })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.issues") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: stats.issues.length })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.bodyBytes") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: formatBytes(stats.bytes) })]
								})
							] }),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-tagrow",
								style: { marginTop: 9 },
								children: kindEntries.slice(0, 4).map(([kind, count]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "gam-tag",
									children: [
										kindLabel(t, kind),
										" ",
										count
									]
								}, kind))
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatCard, {
							label: t("overview.recall"),
							value: formatNumber(stats.recall.tool.events),
							unit: t("overview.callsUnit"),
							footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.zeroHit") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("b", { children: [(zeroHitRate * 100).toFixed(0), "%"] })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.gated") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: formatNumber(stats.recall.inject.gated) })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.hits") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: formatNumber(stats.recall.tool.hits) })]
								})
							] }),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Meter, {
								value: 1 - zeroHitRate,
								tone: zeroHitRate > .5 ? "warn" : "success"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-grid2",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						title: t("overview.kindDistribution"),
						hint: t("overview.kindDistributionHint"),
						actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => {
								props.onBrowseKind("");
								props.onNavigate("browse");
							},
							children: t("common.viewAll")
						}),
						children: kindEntries.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-muted",
							children: t("overview.noEntries")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: kindEntries.map(([kind, count]) => {
							const max = kindEntries[0]?.[1] ?? 1;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "gam-kindrow",
								onClick: () => props.onBrowseKind(kind),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-kindname",
										children: kindLabel(t, kind)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-kindbar",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { style: { width: `${Math.max(4, count / max * 100)}%` } })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-kindcount",
										children: count
									})
								]
							}, kind);
						}) })
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						title: t("overview.attention"),
						hint: attentionCount === 0 ? t("overview.noAttention") : interpolate(t("overview.attentionCount"), { n: attentionCount }),
						actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => props.onNavigate("recovery"),
							children: t("nav.recovery")
						}),
						children: attentionCount === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-inline",
							style: { padding: "8px 0" },
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-health-icon",
								style: {
									width: 24,
									height: 24
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, { size: 13 })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-muted",
								children: t("overview.noAttentionDesc")
							})]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-stack",
							children: [
								pending.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-section",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "gam-inline",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
											tone: "accent",
											dot: true,
											children: t("overview.pendingWrites")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-faint",
											children: pending.length
										})]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PendingRows, {
										items: pending.slice(0, 2),
										t,
										busyId: deciding,
										onDecide: decide
									})]
								}) : null,
								stats.issues.slice(0, 3).map((issue) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "gam-rowitem",
									"data-static": "true",
									onClick: () => props.onNavigate("recovery"),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-health-icon",
											style: {
												width: 24,
												height: 24
											},
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconAlert, { size: 13 })
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "gam-rowitem-main",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-rowitem-title",
												children: issue.issue
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: "gam-rowitem-sum",
												children: [
													issue.rel,
													" · ",
													issue.message
												]
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, {
											size: 14,
											className: "gam-faint"
										})
									]
								}, `${issue.rel}:${issue.issue}`)),
								stats.alerts.filter((alert) => !/issues/i.test(alert.code)).slice(0, 3).map((alert) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "gam-rowitem",
									"data-static": "true",
									onClick: () => props.onNavigate("recovery"),
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-health-icon",
											style: {
												width: 24,
												height: 24
											},
											children: alert.level === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconAlert, { size: 13 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconInfo, { size: 13 })
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "gam-rowitem-main",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-rowitem-title",
												children: alert.code
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-rowitem-sum",
												children: alert.message
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, {
											size: 14,
											className: "gam-faint"
										})
									]
								}, alert.code))
							]
						})
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-grid2",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						title: t("overview.recent"),
						hint: t("overview.recentHint"),
						actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => props.onNavigate("audit"),
							children: t("nav.audit")
						}),
						children: writes.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-muted",
							children: t("overview.noRecent")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: writes.map((row, index) => {
							const canUndo = Boolean(row.id) && (row.act === "write" || row.act === "update") && row.decision !== "NOOP";
							const summary = [
								row.kind ? kindLabel(t, String(row.kind)) : null,
								row.title ?? row.id ?? null,
								row.decision ?? null
							].filter(Boolean).join(" · ");
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-rowitem",
								"data-static": "true",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-rowitem-main",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "gam-rowitem-top",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-rowitem-title",
											children: summary || row.act || t("common.unknown")
										})
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "gam-rowitem-meta",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: formatTime(row.ts) }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-dotsep",
												children: "·"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: row.act ?? "—" }),
											row.reason ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-dotsep",
												children: "·"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: String(row.reason) })] }) : null
										]
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-rowitem-side",
									children: [row.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => props.onOpen(String(row.id)),
										children: t("common.open")
									}) : null, canUndo ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconUndo, { size: 12 }),
										onClick: () => setUndo(row),
										children: t("overview.undo")
									}) : null]
								})]
							}, `${row.ts ?? ""}-${index}`);
						}) })
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Card, {
						title: t("overview.quickActions"),
						hint: t("overview.quickActionsHint"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-grid2",
								style: { gap: 8 },
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
										icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconImport, { size: 14 }),
										onClick: () => props.onNavigate("import"),
										children: t("nav.import")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
										icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconDownload, { size: 14 }),
										onClick: () => props.onNavigate("recovery"),
										children: t("recovery.export")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
										icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconShield, { size: 14 }),
										onClick: runDoctor,
										disabled: fixing,
										children: t("recovery.doctor")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
										icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconFile, { size: 14 }),
										onClick: () => setCatalogOpen(true),
										children: t("overview.viewInjection")
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-divider",
								style: { margin: "14px 0 10px" }
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-stat-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-muted",
									children: t("overview.memoryRoot")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "gam-inline",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
										className: "gam-mono gam-truncate",
										style: { maxWidth: 240 },
										title: stats.root,
										children: stats.root
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
										text: stats.root,
										label: t("common.copyPath"),
										copiedLabel: t("common.copied"),
										onCopied: (ok) => {
											if (!ok) props.toast(t("common.copyFailed"), "danger");
										}
									})]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-stat-row",
								style: { marginTop: 6 },
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-muted",
									children: t("overview.ready")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
									tone: stats.ready ? "success" : "warn",
									dot: true,
									children: stats.ready ? t("common.on") : t("common.loading")
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CatalogDialog, {
					open: catalogOpen,
					t,
					catalog,
					onClose: () => setCatalogOpen(false),
					toast: props.toast
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConfirmDialog, {
					open: Boolean(undo),
					title: t("overview.undoTitle"),
					description: t("overview.undoDesc"),
					confirmLabel: t("overview.undo"),
					cancelLabel: t("common.cancel"),
					closeLabel: t("common.close"),
					busy: undoing,
					danger: true,
					onConfirm: doUndo,
					onClose: () => setUndo(null),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
						className: "gam-pre",
						children: undo?.id ?? ""
					})
				})
			]
		});
	}
	function StatCard(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-card gam-stat",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-inline",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-stat-label",
							children: props.label
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
						props.aside,
						props.action
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-stat-value",
					children: [props.value, props.unit ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-stat-unit",
						children: props.unit
					}) : null]
				}),
				props.children,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-stat-sub",
					children: props.footer
				})
			]
		});
	}
	function PendingRows(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "gam-pendinglist",
			children: props.items.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-pendingitem",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-pendingitem-top",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(KindBadge, {
							kind: item.candidate.kind,
							t: props.t
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-tag",
							children: item.candidate.source
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-pendingitem-title",
						children: item.candidate.title
					}),
					item.candidate.summary && item.candidate.summary !== item.candidate.title ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-pendingitem-sum",
						children: item.candidate.summary
					}) : null,
					item.decision.reason ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-confirm-reason is-block",
						children: item.decision.reason
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-confirm-actions",
						style: { marginTop: 6 },
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							disabled: props.busyId === item.id,
							onClick: () => props.onDecide(item, "reject"),
							children: props.t("confirm.reject")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "primary",
							disabled: props.busyId === item.id,
							onClick: () => props.onDecide(item, "accept"),
							children: props.t("confirm.accept")
						})]
					})
				]
			}, item.id))
		});
	}
	function CatalogDialog(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Dialog, {
			open: props.open,
			title: props.t("overview.injectionPreview"),
			description: props.t("overview.injectionPreviewHint"),
			onClose: props.onClose,
			closeLabel: props.t("common.close"),
			size: "wide",
			actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				props.catalog ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "gam-faint",
					children: [
						props.t("overview.shown"),
						" ",
						props.catalog.shown,
						" · ",
						props.t("overview.omitted"),
						" ",
						props.catalog.omitted
					]
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
					variant: "secondary",
					text: props.catalog?.text ?? "",
					label: props.t("common.copy"),
					copiedLabel: props.t("common.copied"),
					onCopied: (ok) => {
						if (!ok) props.toast(props.t("common.copyFailed"), "danger");
					}
				})
			] }),
			children: props.catalog ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
				className: "gam-pre",
				style: { maxHeight: "52vh" },
				children: props.catalog.text || props.t("overview.emptyCatalog")
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkeletonList, { rows: 4 })
		});
	}
	function Browse(props) {
		const t = props.t;
		const [query, setQuery] = (0, react.useState)("");
		const debounced = useDebounced(query, 220);
		const kind = props.kind;
		const setKind = props.onKindChange;
		const [scope, setScope] = (0, react.useState)("");
		const [sort, setSort] = (0, react.useState)("heat");
		const [items, setItems] = (0, react.useState)([]);
		const [total, setTotal] = (0, react.useState)(0);
		const [counts, setCounts] = (0, react.useState)({});
		const [loading, setLoading] = (0, react.useState)(true);
		const [loadingMore, setLoadingMore] = (0, react.useState)(false);
		const [error, setError] = (0, react.useState)(null);
		const [reload, setReload] = (0, react.useState)(0);
		const pageSize = 80;
		(0, react.useEffect)(() => {
			api.stats().then((value) => setCounts(value.byKind)).catch(() => {});
		}, [props.version]);
		(0, react.useEffect)(() => {
			let alive = true;
			setLoading(true);
			setError(null);
			api.entries({
				q: debounced || void 0,
				kind: kind || void 0,
				scope: scope || void 0,
				limit: pageSize,
				offset: 0
			}).then((page) => {
				if (!alive) return;
				setItems(page.items);
				setTotal(page.total);
			}).catch((cause) => {
				if (alive) setError(cause.message);
			}).finally(() => {
				if (alive) setLoading(false);
			});
			return () => {
				alive = false;
			};
		}, [
			debounced,
			kind,
			scope,
			props.version,
			reload
		]);
		const loadMore = () => {
			setLoadingMore(true);
			api.entries({
				q: debounced || void 0,
				kind: kind || void 0,
				scope: scope || void 0,
				limit: pageSize,
				offset: items.length
			}).then((page) => {
				setItems((prev) => [...prev, ...page.items]);
				setTotal(page.total);
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setLoadingMore(false));
		};
		const sorted = (0, react.useMemo)(() => {
			const copy = [...items];
			if (sort === "recent") copy.sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
			else if (sort === "used") copy.sort((a, b) => String(b.lastUsedAt ?? "").localeCompare(String(a.lastUsedAt ?? "")));
			else if (sort === "hits") copy.sort((a, b) => b.hits - a.hits);
			else if (sort === "title") copy.sort((a, b) => a.title.localeCompare(b.title));
			else copy.sort((a, b) => b.heat - a.heat);
			return copy;
		}, [items, sort]);
		const hasFilters = Boolean(query || kind || scope);
		const resetFilters = () => {
			setQuery("");
			setKind("");
			setScope("");
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-page",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					eyebrow: t("nav.groupMemory"),
					title: t("nav.browse"),
					description: t("browse.desc"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, { children: [
						total,
						" ",
						t("overview.itemsUnit")
					] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 14 }),
						onClick: () => setReload((value) => value + 1),
						children: t("common.refresh")
					})] })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-toolbar",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchInput, {
							value: query,
							onChange: setQuery,
							placeholder: t("browse.search"),
							"aria-label": t("browse.search"),
							clearLabel: t("common.clear")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
							value: scope,
							onChange: setScope,
							"aria-label": t("browse.scope"),
							options: [
								{
									value: "",
									label: t("browse.allScopes")
								},
								{
									value: "global",
									label: t("browse.scopeGlobal")
								},
								{
									value: "project",
									label: t("browse.scopeProject")
								}
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
							value: sort,
							onChange: setSort,
							"aria-label": t("browse.sort"),
							options: [
								{
									value: "heat",
									label: t("browse.sortHeat")
								},
								{
									value: "recent",
									label: t("browse.sortRecent")
								},
								{
									value: "used",
									label: t("browse.sortUsed")
								},
								{
									value: "hits",
									label: t("browse.sortHits")
								},
								{
									value: "title",
									label: t("browse.sortTitle")
								}
							]
						}),
						hasFilters ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: resetFilters,
							children: t("browse.clearFilters")
						}) : null,
						loading && items.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : null
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-chiprow",
					"data-scroll": "true",
					role: "group",
					"aria-label": t("browse.allKinds"),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cx("gam-chip", !kind && "is-active"),
						onClick: () => setKind(""),
						children: [t("browse.allKinds"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-chipcount",
							children: Object.values(counts).reduce((sum, count) => sum + count, 0)
						})]
					}), KINDS.map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cx("gam-chip", kind === value && "is-active"),
						onClick: () => setKind(value),
						children: [kindLabel(t, value), counts[value] ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-chipcount",
							children: counts[value]
						}) : null]
					}, value))]
				}),
				error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorState, {
					title: t("browse.loadFailed"),
					message: error,
					retryLabel: t("panel.retry"),
					onRetry: () => setReload((value) => value + 1)
				}) : null,
				loading && items.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkeletonList, { rows: 6 }) : sorted.length === 0 && !error ? hasFilters ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSearch, { size: 20 }),
					title: t("browse.noResults"),
					description: t("browse.noResultsDesc"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: resetFilters,
						children: t("browse.clearFilters")
					})
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconMemory, { size: 20 }),
					title: t("panel.empty"),
					description: t("browse.emptyDesc"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "primary",
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconImport, { size: 14 }),
						onClick: () => props.onNavigate("import"),
						children: t("nav.import")
					})
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-listcard",
					children: sorted.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "gam-rowitem",
						onClick: () => props.onOpen(item.id),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-rowitem-main",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-rowitem-top",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(KindBadge, {
											kind: item.kind,
											t
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-rowitem-title",
											children: item.title
										}),
										item.invalidatedAt ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
											tone: "warn",
											children: t("browse.invalidated")
										}) : null,
										item.pii ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
											tone: "danger",
											children: t("browse.pii")
										}) : null
									]
								}),
								item.summary && item.summary !== item.title ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "gam-rowitem-sum",
									children: item.summary
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-rowitem-meta",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: item.source }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-dotsep",
											children: "·"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: item.confidence }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-dotsep",
											children: "·"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
											item.hits,
											" ",
											t("browse.hits")
										] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-dotsep",
											children: "·"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: formatDate(item.createdAt) }),
										item.project ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-dotsep",
											children: "·"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: item.project })] }) : null
									]
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-rowitem-side",
							children: [typeof item.score === "number" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-tag gam-hits",
								children: item.score.toFixed(2)
							}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, {
								size: 14,
								className: "gam-faint"
							})]
						})]
					}, item.id))
				}), items.length < total ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-inline",
					style: {
						justifyContent: "center",
						marginTop: 12
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: loadMore,
						disabled: loadingMore,
						children: [
							loadingMore ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlus, { size: 13 }),
							t("browse.loadMore"),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gam-faint",
								children: [
									items.length,
									"/",
									total
								]
							})
						]
					})
				}) : null] })
			]
		});
	}
	function EntryDrawer(props) {
		const t = props.t;
		const [entry, setEntry] = (0, react.useState)(null);
		const [tab, setTab] = (0, react.useState)("content");
		const [loading, setLoading] = (0, react.useState)(true);
		const [error, setError] = (0, react.useState)(null);
		const [editing, setEditing] = (0, react.useState)(false);
		const [draft, setDraft] = (0, react.useState)("");
		const [saving, setSaving] = (0, react.useState)(false);
		const [saveError, setSaveError] = (0, react.useState)(null);
		const [showInvalidate, setShowInvalidate] = (0, react.useState)(false);
		const [reason, setReason] = (0, react.useState)("");
		const [invalidating, setInvalidating] = (0, react.useState)(false);
		const [showDiscard, setShowDiscard] = (0, react.useState)(false);
		const load = (0, react.useCallback)(() => {
			let alive = true;
			setLoading(true);
			setError(null);
			api.entry(props.id).then((value) => {
				if (!alive) return;
				setEntry(value);
				setDraft(value.body);
			}).catch((cause) => {
				if (alive) setError(cause.message);
			}).finally(() => {
				if (alive) setLoading(false);
			});
			return () => {
				alive = false;
			};
		}, [props.id]);
		(0, react.useEffect)(() => load(), [load]);
		const dirty = editing && entry !== null && draft !== entry.body;
		const invalidated = Boolean(entry && entry.meta.temporal?.invalidatedAt);
		const requestClose = () => {
			if (dirty) setShowDiscard(true);
			else props.onClose();
		};
		(0, react.useEffect)(() => {
			if (showInvalidate || showDiscard) return;
			const onKey = (event) => {
				if (event.key !== "Escape") return;
				if (dirty) setShowDiscard(true);
				else props.onClose();
			};
			window.addEventListener("keydown", onKey);
			return () => window.removeEventListener("keydown", onKey);
		}, [
			showInvalidate,
			showDiscard,
			dirty,
			props.onClose
		]);
		const save = () => {
			if (!entry) return;
			setSaving(true);
			setSaveError(null);
			const rev = Number(entry.meta.stats?.revisions ?? 0);
			api.patch(entry.meta.id, draft, rev).then(() => {
				props.toast(t("detail.saved"), "success");
				setEditing(false);
				props.onChanged();
				load();
			}).catch((cause) => setSaveError(cause.message)).finally(() => setSaving(false));
		};
		const invalidate = () => {
			if (!entry || !reason.trim()) return;
			setInvalidating(true);
			api.invalidate(entry.meta.id, reason.trim()).then(() => {
				props.toast(t("detail.invalidated"), "success");
				props.onChanged();
				setShowInvalidate(false);
				props.onClose();
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setInvalidating(false));
		};
		const startEdit = () => {
			if (!entry) return;
			setDraft(entry.body);
			setEditing(true);
			setSaveError(null);
			setTab("content");
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-overlay",
			"data-align": "right",
			onMouseDown: (event) => {
				if (event.target === event.currentTarget) requestClose();
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
					className: "gam-drawer",
					role: "dialog",
					"aria-modal": "true",
					"aria-label": entry?.meta.title ?? t("detail.title"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "gam-drawer-head",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-drawer-head-main",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "gam-tagrow",
										children: [
											entry ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(KindBadge, {
												kind: entry.meta.kind,
												t
											}) : null,
											invalidated ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
												tone: "warn",
												children: t("browse.invalidated")
											}) : null,
											entry ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-tag",
												children: String(entry.meta.scope ?? "")
											}) : null,
											entry ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-tag",
												children: String(entry.meta.confidence ?? "")
											}) : null
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
										className: "gam-drawer-title",
										children: entry?.meta.title ?? (loading ? t("common.loading") : t("detail.title"))
									}),
									entry?.meta.summary ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "gam-drawer-sub",
										children: entry.meta.summary
									}) : null
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: requestClose,
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClose, { size: 15 }),
								children: t("common.close")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-drawer-tabs",
							role: "tablist",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: cx("gam-tab", tab === "content" && "is-active"),
									role: "tab",
									"aria-selected": tab === "content",
									onClick: () => setTab("content"),
									children: t("detail.content")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: cx("gam-tab", tab === "meta" && "is-active"),
									role: "tab",
									"aria-selected": tab === "meta",
									onClick: () => setTab("meta"),
									children: t("detail.meta")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: cx("gam-tab", tab === "raw" && "is-active"),
									role: "tab",
									"aria-selected": tab === "raw",
									onClick: () => setTab("raw"),
									children: t("detail.raw")
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-drawer-body",
							children: [
								loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkeletonList, { rows: 5 }) : null,
								error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorState, {
									title: t("detail.loadFailed"),
									message: error,
									retryLabel: t("panel.retry"),
									onRetry: load
								}) : null,
								entry && !error ? tab === "content" ? editing ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stack",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
											className: "gam-textarea",
											value: draft,
											onChange: (event) => setDraft(event.target.value),
											"aria-label": t("detail.editBody")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "gam-field-hint",
											children: [
												t("detail.markdownHint"),
												" · ",
												t("detail.unsaved")
											]
										}),
										saveError ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "gam-errorbox",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
												className: "gam-error-title",
												children: t("detail.saveFailed")
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
												className: "gam-pre",
												children: saveError
											})]
										}) : null
									]
								}) : entry.body.trim() ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Markdown, { text: entry.body }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconFile, { size: 20 }),
									title: t("detail.emptyBody"),
									description: t("detail.emptyBodyDesc")
								}) : tab === "meta" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MetaTab, {
									entry,
									t,
									onOpen: props.onOpen
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stack",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "gam-inline",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-muted",
												children: t("detail.rawHint")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
												text: JSON.stringify({
													meta: entry.meta,
													body: entry.body,
													rel: entry.rel
												}, null, 2),
												label: t("common.copy"),
												copiedLabel: t("common.copied")
											})
										]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
										className: "gam-pre",
										children: JSON.stringify({
											meta: entry.meta,
											body: entry.body,
											rel: entry.rel
										}, null, 2)
									})]
								}) : null
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("footer", {
							className: "gam-drawer-footer",
							children: entry ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
									text: entry.meta.id,
									label: t("common.copyId"),
									copiedLabel: t("common.copied"),
									onCopied: (ok) => {
										if (!ok) props.toast(t("common.copyFailed"), "danger");
									}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
									text: entry.body,
									label: t("detail.copyBody"),
									copiedLabel: t("common.copied"),
									onCopied: (ok) => {
										if (!ok) props.toast(t("common.copyFailed"), "danger");
									}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
								!invalidated ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconTrash, { size: 13 }),
									onClick: () => setShowInvalidate(true),
									children: t("detail.invalidate")
								}) : null,
								editing ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => {
										setDraft(entry.body);
										setEditing(false);
										setSaveError(null);
									},
									children: t("common.cancel")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "primary",
									icon: saving ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSave, { size: 13 }),
									disabled: !dirty || saving,
									onClick: save,
									children: saving ? t("common.saving") : t("common.save")
								})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "primary",
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconEdit, { size: 13 }),
									disabled: invalidated,
									onClick: startEdit,
									children: t("common.edit")
								})
							] }) : null
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Dialog, {
					open: showInvalidate,
					title: t("detail.invalidateTitle"),
					description: t("detail.invalidateDesc"),
					onClose: () => setShowInvalidate(false),
					closeLabel: t("common.close"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setShowInvalidate(false),
						disabled: invalidating,
						children: t("common.cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Button, {
						variant: "danger",
						onClick: invalidate,
						disabled: !reason.trim() || invalidating,
						children: [invalidating ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : null, t("detail.invalidateConfirm")]
					})] }),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-field",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								className: "gam-field-label",
								htmlFor: "gam-invalidate-reason",
								children: t("detail.reason")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								id: "gam-invalidate-reason",
								className: "gam-textarea",
								style: { minHeight: 90 },
								value: reason,
								placeholder: t("detail.reasonPlaceholder"),
								onChange: (event) => setReason(event.target.value),
								autoFocus: true
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-field-hint",
								children: t("detail.invalidateHint")
							})
						]
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConfirmDialog, {
					open: showDiscard,
					title: t("detail.discardTitle"),
					description: t("detail.discardDesc"),
					confirmLabel: t("detail.discardConfirm"),
					cancelLabel: t("common.cancel"),
					closeLabel: t("common.close"),
					danger: true,
					onConfirm: () => {
						setShowDiscard(false);
						props.onClose();
					},
					onClose: () => setShowDiscard(false)
				})
			]
		});
	}
	function MetaTab(props) {
		const t = props.t;
		const meta = props.entry.meta;
		const provenance = asRecord(meta.provenance);
		const temporal = asRecord(meta.temporal);
		const stats = asRecord(meta.stats);
		const links = asRecord(meta.links);
		const privacy = asRecord(meta.privacy);
		const related = [
			"relates",
			"conflictsWith",
			"supersededBy"
		].flatMap((key) => asArray(links[key]).map((id) => ({
			key,
			id: String(id)
		})));
		const groups = [
			{
				title: t("detail.basic"),
				rows: [
					{
						label: "id",
						value: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-mono",
							children: meta.id
						})
					},
					{
						label: "kind",
						value: kindLabel(t, meta.kind)
					},
					{
						label: "scope",
						value: String(meta.scope ?? "—")
					},
					{
						label: "confidence",
						value: String(meta.confidence ?? "—")
					},
					{
						label: "activation",
						value: String(meta.activation ?? "—")
					},
					{
						label: "project",
						value: meta.project ?? "—"
					}
				]
			},
			{
				title: t("detail.time"),
				rows: [
					{
						label: "createdAt",
						value: formatDateTime(asString(provenance.createdAt))
					},
					{
						label: "validFrom",
						value: formatDateTime(asString(temporal.validFrom))
					},
					{
						label: "invalidatedAt",
						value: temporal.invalidatedAt ? formatDateTime(asString(temporal.invalidatedAt)) : "—"
					},
					{
						label: "lastUsedAt",
						value: stats.lastUsedAt ? formatDateTime(asString(stats.lastUsedAt)) : "—"
					}
				]
			},
			{
				title: t("detail.usage"),
				rows: [
					{
						label: "hits",
						value: formatNumber(Number(stats.hits ?? 0))
					},
					{
						label: "revisions",
						value: formatNumber(Number(stats.revisions ?? 0))
					},
					{
						label: "heat",
						value: Number(stats.heat ?? 0).toFixed(3)
					}
				]
			},
			{
				title: t("detail.provenance"),
				rows: [
					{
						label: "source",
						value: asString(provenance.source) ?? "—"
					},
					{
						label: "createdBy",
						value: asString(provenance.createdBy) ?? "—"
					},
					{
						label: "sessionId",
						value: asString(provenance.sessionId) ?? "—"
					},
					{
						label: "importedFrom",
						value: asString(provenance.importedFrom) ?? "—"
					}
				]
			},
			{
				title: t("detail.tagsEntities"),
				rows: [
					{
						label: "tags",
						value: asArray(meta.tags).join(", ") || "—"
					},
					{
						label: "entities",
						value: asArray(meta.entities).join(", ") || "—"
					},
					{
						label: "privacy",
						value: `${asString(privacy.pii) ?? String(privacy.pii ?? false)} / ${String(privacy.shareable ?? "—")}`
					}
				]
			}
		];
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-stack",
			style: { gap: 16 },
			children: [
				groups.map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-subhead",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: group.title })
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-listcard",
					style: { background: "transparent" },
					children: group.rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-settingrow",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-setting-key",
							children: row.label
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-setting-val",
							children: row.value
						})]
					}, row.label))
				})] }, group.title)),
				related.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-subhead",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("detail.relations") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: related.length })]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-tagrow",
					children: related.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "gam-chip",
						onClick: () => props.onOpen(item.id),
						title: item.key,
						children: shortId(item.id, 10)
					}, `${item.key}:${item.id}`))
				})] }) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-subhead",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("detail.file") })
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-listcard",
					style: { background: "transparent" },
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-settingrow",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-setting-key",
							children: "rel"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-setting-val gam-mono",
							children: props.entry.rel
						})]
					})
				})] })
			]
		});
	}
	function ImportView(props) {
		const t = props.t;
		const [sources, setSources] = (0, react.useState)([]);
		const [sourceFilter, setSourceFilter] = (0, react.useState)("all");
		const [scan, setScan] = (0, react.useState)(null);
		const [selected, setSelected] = (0, react.useState)(/* @__PURE__ */ new Set());
		const [itemFilter, setItemFilter] = (0, react.useState)("all");
		const [itemQuery, setItemQuery] = (0, react.useState)("");
		const [report, setReport] = (0, react.useState)(null);
		const [error, setError] = (0, react.useState)(null);
		const [busy, setBusy] = (0, react.useState)(false);
		const [busyLabel, setBusyLabel] = (0, react.useState)("");
		const [pathSource, setPathSource] = (0, react.useState)(null);
		const [pathValue, setPathValue] = (0, react.useState)("");
		const [confirmApply, setConfirmApply] = (0, react.useState)(false);
		const loadSources = (0, react.useCallback)(() => {
			api.importSources().then((result) => setSources(result.sources)).catch((cause) => setError(cause.message));
		}, []);
		(0, react.useEffect)(loadSources, [loadSources, props.version]);
		const startScan = (source, path) => {
			setBusy(true);
			setBusyLabel(source.label);
			setScan(null);
			setReport(null);
			setError(null);
			setItemFilter("all");
			setItemQuery("");
			api.importScan({
				source: source.id,
				limit: 200,
				...path ? { path } : {}
			}).then((result) => {
				setScan(result);
				setSelected(new Set(result.items.filter((item) => !item.duplicateOf && !item.pii).map((item) => item.key)));
			}).catch((cause) => setError(cause.message)).finally(() => setBusy(false));
		};
		const pickSource = (source) => {
			if (source.id === "generic-dir") {
				setPathSource(source);
				setPathValue("");
				return;
			}
			startScan(source);
		};
		const apply = () => {
			if (!scan || selected.size === 0) return;
			setBusy(true);
			setBusyLabel(t("import.applying"));
			api.importApply({
				scanId: scan.scanId,
				keys: [...selected]
			}).then((result) => {
				setReport(result);
				setScan(null);
				setSelected(/* @__PURE__ */ new Set());
				setConfirmApply(false);
				props.onChanged();
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
		const filteredSources = sources.filter((source) => {
			if (sourceFilter === "detected") return source.detected.length > 0;
			if (sourceFilter === "memory") return source.kind === "memory";
			if (sourceFilter === "conversation") return source.kind === "conversation";
			return true;
		}).sort((a, b) => Number(b.detected.length > 0) - Number(a.detected.length > 0) || a.label.localeCompare(b.label));
		const visibleItems = scan ? scan.items.filter((item) => {
			if (itemFilter === "new" && item.duplicateOf) return false;
			if (itemFilter === "existing" && !item.duplicateOf) return false;
			if (itemFilter === "pii" && !item.pii) return false;
			if (!itemQuery.trim()) return true;
			return `${item.title} ${item.summary} ${item.origin}`.toLowerCase().includes(itemQuery.trim().toLowerCase());
		}) : [];
		const memoryCount = sources.filter((source) => source.kind === "memory").length;
		const conversationCount = sources.filter((source) => source.kind === "conversation").length;
		const detectedCount = sources.filter((source) => source.detected.length > 0).length;
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-page",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					eyebrow: t("nav.groupMemory"),
					title: t("nav.import"),
					description: t("import.hint"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 14 }),
						onClick: loadSources,
						children: t("import.rescanSources")
					})
				}),
				error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorState, {
					title: t("import.scanFailed"),
					message: error,
					retryLabel: t("panel.retry"),
					onRetry: () => setError(null)
				}) : null,
				report ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Card, {
					title: t("import.done"),
					hint: t("import.doneHint"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-tagrow",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, {
									tone: "success",
									children: [
										t("import.added"),
										" ",
										report.added
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, {
									tone: "accent",
									children: [
										t("import.updated"),
										" ",
										report.updated
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, { children: [
									t("import.noop"),
									" ",
									report.noop
								] }),
								report.rejected > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, {
									tone: "danger",
									children: [
										t("import.rejected"),
										" ",
										report.rejected
									]
								}) : null
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-stat-row",
							style: { marginTop: 10 },
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-muted",
								children: t("import.snapshot")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gam-inline",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
									className: "gam-mono",
									children: report.snapshot
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
									text: report.snapshot,
									label: t("common.copy"),
									copiedLabel: t("common.copied")
								})]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-inline",
							style: { marginTop: 12 },
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "primary",
								onClick: () => props.onNavigate("browse"),
								children: t("import.viewMemories")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => {
									setReport(null);
									setScan(null);
									setSelected(/* @__PURE__ */ new Set());
									loadSources();
								},
								children: t("import.continue")
							})]
						})
					]
				}) : scan ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-scanbar",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
								tone: "accent",
								children: scan.label
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gam-muted",
								children: [
									scan.items.length,
									" ",
									t("import.items")
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-dotsep",
								children: "·"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, {
								tone: "success",
								children: [
									t("import.new"),
									" ",
									scan.estimate.added
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, {
								tone: "accent",
								children: [
									t("import.merge"),
									" ",
									scan.estimate.merged
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, { children: [
								t("import.duplicate"),
								" ",
								scan.estimate.duplicate
							] }),
							scan.estimate.pii > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, {
								tone: "danger",
								children: ["PII ", scan.estimate.pii]
							}) : null,
							scan.budget?.overBudget ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
								tone: "warn",
								children: t("import.budgetWarn")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => {
									setScan(null);
									setSelected(/* @__PURE__ */ new Set());
								},
								children: t("import.cancel")
							})
						]
					}),
					scan.skipped.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-muted",
						style: { fontSize: 11 },
						children: [
							t("import.skipped"),
							": ",
							scan.skipped.length
						]
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-toolbar",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Segmented, {
								value: itemFilter,
								onChange: setItemFilter,
								ariaLabel: t("import.filterItems"),
								options: [
									{
										value: "all",
										label: `${t("import.filterAll")} ${scan.items.length}`
									},
									{
										value: "new",
										label: `${t("import.new")} ${scan.estimate.added}`
									},
									{
										value: "existing",
										label: `${t("import.duplicate")} ${scan.estimate.duplicate + scan.estimate.merged}`
									},
									...scan.estimate.pii > 0 ? [{
										value: "pii",
										label: `PII ${scan.estimate.pii}`
									}] : []
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchInput, {
								value: itemQuery,
								onChange: setItemQuery,
								placeholder: t("import.searchItems"),
								"aria-label": t("import.searchItems"),
								clearLabel: t("common.clear")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setSelected(new Set(visibleItems.map((item) => item.key))),
								children: t("import.selectVisible")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setSelected(/* @__PURE__ */ new Set()),
								children: t("import.selectNone")
							})
						]
					}),
					visibleItems.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconFile, { size: 20 }),
						title: t("import.noItems"),
						description: t("import.noItemsDesc")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-importlist",
						children: visibleItems.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: "gam-importrow",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: selected.has(item.key),
								onChange: () => toggle(item.key)
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gam-importrow-main",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-rowitem-top",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(KindBadge, {
												kind: item.kind,
												t
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-rowitem-title",
												children: item.title
											}),
											item.duplicateOf ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
												tone: "warn",
												children: t("import.duplicate")
											}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
												tone: "success",
												children: t("import.new")
											}),
											item.pii ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
												tone: "danger",
												children: "PII"
											}) : null
										]
									}),
									item.summary && item.summary !== item.title ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-rowitem-sum",
										children: item.summary
									}) : null,
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-rowitem-meta",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: item.activation }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-dotsep",
												children: "·"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: item.confidence }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-dotsep",
												children: "·"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-mono",
												children: item.origin
											})
										]
									})
								]
							})]
						}, item.key))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-bulkbar",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-muted",
								children: interpolate(t("import.selectedCount"), { n: selected.size })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setScan(null),
								children: t("common.cancel")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "primary",
								disabled: busy || selected.size === 0,
								onClick: () => setConfirmApply(true),
								children: [busy ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconImport, { size: 13 }), interpolate(t("import.applyCount"), { n: selected.size })]
							})
						]
					})
				] }) : busy ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-inline",
					style: {
						padding: "18px 0",
						justifyContent: "center"
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-muted",
						children: interpolate(t("import.scanning"), { name: busyLabel })
					})]
				}) }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-toolbar",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Segmented, {
							value: sourceFilter,
							onChange: setSourceFilter,
							ariaLabel: t("import.filterSources"),
							options: [
								{
									value: "all",
									label: `${t("import.filterAll")} ${sources.length}`
								},
								{
									value: "detected",
									label: `${t("import.detected")} ${detectedCount}`
								},
								{
									value: "memory",
									label: `${t("import.memory")} ${memoryCount}`
								},
								{
									value: "conversation",
									label: `${t("import.conversation")} ${conversationCount}`
								}
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-faint",
							children: t("import.scanOnlyHint")
						})
					]
				}), filteredSources.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconFolder, { size: 20 }),
					title: t("import.noSources"),
					description: t("import.noSourcesDesc")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-importgrid",
					children: filteredSources.map((source) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "gam-source",
						"data-detected": source.detected.length > 0 ? "true" : "false",
						disabled: busy,
						onClick: () => pickSource(source),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gam-source-head",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-source-dot" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-source-title",
										children: source.label
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-source-count",
										children: source.detected.length > 0 ? `${source.detected.length} ${t("import.places")}` : t("import.notDetected")
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-source-path",
								children: source.id === "generic-dir" ? t("import.genericHint") : source.detected[0] ?? t("import.notDetectedHint")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gam-source-cta",
								children: [source.id === "generic-dir" ? t("import.chooseFolder") : t("import.scan"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconArrowRight, { size: 11 })]
							})
						]
					}, source.id))
				})] }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Dialog, {
					open: Boolean(pathSource),
					title: t("import.genericTitle"),
					description: t("import.genericDesc"),
					onClose: () => setPathSource(null),
					closeLabel: t("common.close"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setPathSource(null),
						children: t("common.cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						variant: "primary",
						disabled: !pathValue.trim(),
						onClick: () => {
							if (!pathSource) return;
							const source = pathSource;
							setPathSource(null);
							startScan(source, pathValue.trim());
						},
						children: t("import.scan")
					})] }),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-field",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								className: "gam-field-label",
								htmlFor: "gam-import-path",
								children: t("import.path")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								id: "gam-import-path",
								className: "gam-input",
								value: pathValue,
								placeholder: t("import.pathPlaceholder"),
								onChange: (event) => setPathValue(event.target.value),
								autoFocus: true
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-field-hint",
								children: t("import.pathHint")
							})
						]
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConfirmDialog, {
					open: confirmApply,
					title: t("import.confirmTitle"),
					description: t("import.confirmDesc"),
					confirmLabel: interpolate(t("import.applyCount"), { n: selected.size }),
					cancelLabel: t("common.cancel"),
					closeLabel: t("common.close"),
					busy,
					onConfirm: apply,
					onClose: () => setConfirmApply(false),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-stack",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-stat-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-muted",
									children: t("import.countLabel")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: selected.size })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-stat-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-muted",
									children: t("import.snapshot")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: t("import.snapshotAuto") })]
							}),
							scan?.budget?.overBudget ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
								tone: "warn",
								children: t("import.budgetWarn")
							}) : null
						]
					})
				})
			]
		});
	}
	function TimelineView(props) {
		const t = props.t;
		const [asOf, setAsOf] = (0, react.useState)(todayISO());
		const [items, setItems] = (0, react.useState)([]);
		const [loading, setLoading] = (0, react.useState)(true);
		const [error, setError] = (0, react.useState)(null);
		(0, react.useEffect)(() => {
			let alive = true;
			setLoading(true);
			api.entries({ limit: 1e3 }).then((page) => {
				if (alive) {
					setItems(page.items);
					setError(null);
				}
			}).catch((cause) => {
				if (alive) setError(cause.message);
			}).finally(() => {
				if (alive) setLoading(false);
			});
			return () => {
				alive = false;
			};
		}, [props.version]);
		const valid = (0, react.useMemo)(() => {
			return items.filter((item) => localDay(item.createdAt) <= asOf && (!item.invalidatedAt || localDay(item.invalidatedAt) > asOf)).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
		}, [items, asOf]);
		const byDay = (0, react.useMemo)(() => {
			const map = /* @__PURE__ */ new Map();
			for (const item of valid) {
				const day = localDay(item.createdAt);
				const list = map.get(day) ?? [];
				list.push(item);
				map.set(day, list);
			}
			return [...map.entries()];
		}, [valid]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-page",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					eyebrow: t("nav.groupMemory"),
					title: t("nav.timeline"),
					description: t("timeline.hint"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, { children: [
						valid.length,
						" / ",
						items.length
					] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => setAsOf(todayISO()),
						children: t("common.today")
					})] })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-toolbar",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronLeft, { size: 14 }),
							onClick: () => setAsOf(shiftDay(asOf, -1)),
							"aria-label": t("timeline.prevDay")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
							className: "gam-field-label",
							htmlFor: "gam-asof",
							children: t("timeline.asOf")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							id: "gam-asof",
							className: "gam-input",
							type: "date",
							value: asOf,
							onChange: (event) => setAsOf(event.target.value),
							style: { width: 160 }
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: () => setAsOf(shiftDay(asOf, 1)),
							"aria-label": t("timeline.nextDay"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, { size: 14 })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-faint",
							children: t("timeline.asOfHint")
						})
					]
				}),
				error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorState, {
					title: t("timeline.loadFailed"),
					message: error,
					retryLabel: t("panel.retry")
				}) : null,
				loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkeletonList, { rows: 6 }) : byDay.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClock, { size: 20 }),
					title: t("timeline.empty"),
					description: t("timeline.emptyDesc"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => setAsOf(todayISO()),
						children: t("common.today")
					})
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-timeline",
					children: byDay.map(([day, list]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-tl-day",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-tl-date",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: formatMonthDay(day) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: day.slice(0, 4) })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-tl-rail",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-tl-dot" })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-tl-items",
								children: list.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "gam-tl-item",
									onClick: () => props.onOpen(item.id),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-rowitem-main",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: "gam-rowitem-top",
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)(KindBadge, {
														kind: item.kind,
														t
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: "gam-rowitem-title",
														children: item.title
													}),
													item.invalidatedAt ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, {
														tone: "warn",
														children: [
															t("timeline.invalidatedAfter"),
															" ",
															formatDate(item.invalidatedAt)
														]
													}) : null
												]
											}),
											item.summary && item.summary !== item.title ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-rowitem-sum",
												children: item.summary
											}) : null,
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: "gam-rowitem-meta",
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: item.source }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: "gam-dotsep",
														children: "·"
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
														item.hits,
														" ",
														t("browse.hits")
													] })
												]
											})
										]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, {
										size: 14,
										className: "gam-faint"
									})]
								}, item.id))
							})
						]
					}, day))
				})
			]
		});
	}
	function layoutGraph(nodes, edges) {
		const width = 960;
		const height = 520;
		const centerX = width / 2;
		const centerY = height / 2;
		const count = nodes.length;
		const degree = /* @__PURE__ */ new Map();
		for (const edge of edges) {
			degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
			degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
		}
		const points = nodes.map((id, index) => {
			const angle = index / Math.max(1, count) * Math.PI * 2;
			const radius = Math.min(width, height) * .24 + index % 3 * 18;
			return {
				id,
				x: centerX + Math.cos(angle) * radius,
				y: centerY + Math.sin(angle) * radius,
				vx: 0,
				vy: 0,
				degree: degree.get(id) ?? 0
			};
		});
		const byId = new Map(points.map((point) => [point.id, point]));
		const iterations = count > 60 ? 120 : 180;
		for (let iteration = 0; iteration < iterations; iteration++) {
			for (let i = 0; i < points.length; i++) {
				const a = points[i];
				if (!a) continue;
				for (let j = i + 1; j < points.length; j++) {
					const b = points[j];
					if (!b) continue;
					let dx = a.x - b.x;
					let dy = a.y - b.y;
					let dist2 = dx * dx + dy * dy;
					if (dist2 < 1) {
						dx = 1;
						dy = 1;
						dist2 = 2;
					}
					const force = 9e3 / dist2;
					const dist = Math.sqrt(dist2);
					const fx = dx / dist * force;
					const fy = dy / dist * force;
					a.vx += fx;
					a.vy += fy;
					b.vx -= fx;
					b.vy -= fy;
				}
			}
			for (const edge of edges) {
				const a = byId.get(edge.from);
				const b = byId.get(edge.to);
				if (!a || !b) continue;
				const dx = b.x - a.x;
				const dy = b.y - a.y;
				const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
				const force = (dist - 150) * .012;
				const fx = dx / dist * force;
				const fy = dy / dist * force;
				a.vx += fx;
				a.vy += fy;
				b.vx -= fx;
				b.vy -= fy;
			}
			for (const point of points) {
				point.vx += (centerX - point.x) * .006;
				point.vy += (centerY - point.y) * .006;
				point.vx *= .84;
				point.vy *= .84;
				const step = Math.sqrt(point.vx * point.vx + point.vy * point.vy);
				if (step > 9) {
					point.vx = point.vx / step * 9;
					point.vy = point.vy / step * 9;
				}
				point.x = Math.max(48, Math.min(912, point.x + point.vx));
				point.y = Math.max(40, Math.min(480, point.y + point.vy));
			}
		}
		return new Map(points.map((point) => [point.id, {
			id: point.id,
			x: Number(point.x.toFixed(2)),
			y: Number(point.y.toFixed(2)),
			degree: point.degree
		}]));
	}
	function GraphView(props) {
		const t = props.t;
		const [entity, setEntity] = (0, react.useState)("");
		const [nodes, setNodes] = (0, react.useState)([]);
		const [edges, setEdges] = (0, react.useState)([]);
		const [mermaid, setMermaid] = (0, react.useState)("");
		const [mode, setMode] = (0, react.useState)("graph");
		const [focus, setFocus] = (0, react.useState)(null);
		const [loading, setLoading] = (0, react.useState)(true);
		const [error, setError] = (0, react.useState)(null);
		const load = (0, react.useCallback)((value) => {
			setLoading(true);
			api.graph(value || void 0).then((result) => {
				setNodes(result.nodes);
				setEdges(result.edges);
				setMermaid(result.mermaid);
				setFocus((current) => current && result.nodes.includes(current) ? current : null);
				setError(null);
			}).catch((cause) => setError(cause.message)).finally(() => setLoading(false));
		}, []);
		(0, react.useEffect)(() => load(""), [load, props.version]);
		const layout = (0, react.useMemo)(() => layoutGraph(nodes, edges), [nodes, edges]);
		const visibleEdges = focus ? edges.filter((edge) => edge.from === focus || edge.to === focus) : edges;
		const connected = (0, react.useMemo)(() => {
			if (!focus) return new Set(nodes);
			const next = /* @__PURE__ */ new Set([focus]);
			for (const edge of edges) {
				if (edge.from === focus) next.add(edge.to);
				if (edge.to === focus) next.add(edge.from);
			}
			return next;
		}, [
			focus,
			nodes,
			edges
		]);
		const submit = () => {
			setFocus(null);
			load(entity);
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-page",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					eyebrow: t("nav.groupSystem"),
					title: t("nav.graph"),
					description: t("graph.desc"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, { children: [
							nodes.length,
							" ",
							t("graph.nodes")
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, { children: [
							edges.length,
							" ",
							t("graph.edges")
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
							text: mermaid,
							label: t("graph.copyMermaid"),
							copiedLabel: t("common.copied"),
							onCopied: (ok) => {
								if (!ok) props.toast(t("common.copyFailed"), "danger");
							}
						})
					] })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-toolbar",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchInput, {
							value: entity,
							onChange: setEntity,
							placeholder: t("graph.entity"),
							"aria-label": t("graph.entity"),
							clearLabel: t("common.clear")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: submit,
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSearch, { size: 13 }),
							children: t("common.search")
						}),
						entity || focus ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => {
								setEntity("");
								setFocus(null);
								load("");
							},
							children: t("graph.resetFilter")
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Segmented, {
							value: mode,
							onChange: setMode,
							ariaLabel: t("graph.mode"),
							options: [{
								value: "graph",
								label: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconGraphView, { size: 13 }),
									" ",
									t("graph.graphMode")
								] })
							}, {
								value: "list",
								label: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconList, { size: 13 }),
									" ",
									t("graph.listMode")
								] })
							}]
						})
					]
				}),
				error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorState, {
					title: t("graph.loadFailed"),
					message: error,
					retryLabel: t("panel.retry"),
					onRetry: () => load(entity)
				}) : null,
				loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkeletonList, { rows: 4 }) : edges.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconGraph, { size: 20 }),
					title: t("graph.empty"),
					description: t("graph.emptyDesc")
				}) : mode === "graph" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-graph-wrap",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
						className: "gam-graph-svg",
						viewBox: "0 0 960 520",
						role: "img",
						"aria-label": t("graph.svgLabel"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: t("graph.svgLabel") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("g", { children: visibleEdges.map((edge) => {
								const from = layout.get(edge.from);
								const to = layout.get(edge.to);
								if (!from || !to) return null;
								const low = edge.confidence !== "high";
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("line", {
									className: cx("gam-graph-edge", low && "is-low", focus && "is-active"),
									x1: from.x,
									y1: from.y,
									x2: to.x,
									y2: to.y
								}, edge.id);
							}) }),
							visibleEdges.length <= 20 ? visibleEdges.map((edge) => {
								const from = layout.get(edge.from);
								const to = layout.get(edge.to);
								if (!from || !to) return null;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
									className: "gam-graph-edgelabel",
									x: (from.x + to.x) / 2,
									y: (from.y + to.y) / 2 - 4,
									textAnchor: "middle",
									children: edge.rel.length > 12 ? `${edge.rel.slice(0, 11)}…` : edge.rel
								}, `${edge.id}-label`);
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("g", { children: nodes.map((name) => {
								const point = layout.get(name);
								if (!point) return null;
								const dim = focus !== null && !connected.has(name);
								const radius = 10 + Math.min(8, point.degree * 2);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
									transform: `translate(${point.x} ${point.y})`,
									opacity: dim ? .25 : 1,
									role: "button",
									tabIndex: 0,
									"aria-label": name,
									onClick: () => setFocus((current) => current === name ? null : name),
									onKeyDown: (event) => {
										if (event.key === "Enter" || event.key === " ") {
											event.preventDefault();
											setFocus((current) => current === name ? null : name);
										}
									},
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
										className: cx("gam-graph-node", focus === name && "is-focus"),
										r: radius
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
										className: cx("gam-graph-label", focus === name && "is-focus"),
										y: radius + 13,
										textAnchor: "middle",
										children: name.length > 18 ? `${name.slice(0, 17)}…` : name
									})]
								}, name);
							}) })
						]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-graph-legend",
						style: { marginTop: 8 },
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {}),
								" ",
								t("graph.legendEdge")
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "dashed" }),
								" ",
								t("graph.legendLow")
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("graph.legendClick") }),
							focus ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: interpolate(t("graph.focusHint"), { name: focus }) }) : null
						]
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
						className: "gam-graph-side",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-graph-side-head",
							children: focus ? interpolate(t("graph.relationsOf"), { name: focus }) : t("graph.allRelations")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-graph-side-list",
							children: visibleEdges.map((edge) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "gam-graph-link",
								onClick: () => props.onOpen(edge.id),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "gam-inline",
										style: { gap: 5 },
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "gam-rowitem-title",
											children: [
												edge.from,
												" → ",
												edge.to
											]
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "gam-rowitem-sum",
										children: [
											edge.rel,
											" · ",
											edge.summary
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "gam-tagrow",
										style: { marginTop: 4 },
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-tag",
											children: edge.confidence
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-tag gam-mono",
											children: shortId(edge.id, 10)
										})]
									})
								]
							}, edge.id))
						})]
					})]
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-listcard",
					children: visibleEdges.map((edge) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "gam-rowitem",
						onClick: () => props.onOpen(edge.id),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-rowitem-main",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "gam-rowitem-top",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-rowitem-title",
										children: [
											edge.from,
											" → ",
											edge.to
										]
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-rowitem-sum",
									children: [
										edge.rel,
										" · ",
										edge.summary
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-rowitem-meta",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: edge.confidence }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-dotsep",
											children: "·"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-mono",
											children: edge.id
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, {
							size: 14,
							className: "gam-faint"
						})]
					}, edge.id))
				})
			]
		});
	}
	function AuditView(props) {
		const t = props.t;
		const [date, setDate] = (0, react.useState)(todayISO());
		const [act, setAct] = (0, react.useState)("");
		const [query, setQuery] = (0, react.useState)("");
		const [rows, setRows] = (0, react.useState)([]);
		const [total, setTotal] = (0, react.useState)(0);
		const [expanded, setExpanded] = (0, react.useState)(/* @__PURE__ */ new Set());
		const [loading, setLoading] = (0, react.useState)(true);
		const [error, setError] = (0, react.useState)(null);
		const [reload, setReload] = (0, react.useState)(0);
		(0, react.useEffect)(() => {
			let alive = true;
			setLoading(true);
			api.audit(date, 1e3).then((result) => {
				if (alive) {
					setRows(result.items);
					setTotal(result.total);
					setError(null);
					setExpanded(/* @__PURE__ */ new Set());
				}
			}).catch((cause) => {
				if (alive) setError(cause.message);
			}).finally(() => {
				if (alive) setLoading(false);
			});
			return () => {
				alive = false;
			};
		}, [
			date,
			props.version,
			reload
		]);
		const filtered = (0, react.useMemo)(() => {
			const needle = query.trim().toLowerCase();
			return rows.filter((row) => {
				if (act && row.act !== act) return false;
				if (!needle) return true;
				return JSON.stringify(row).toLowerCase().includes(needle);
			});
		}, [
			rows,
			act,
			query
		]);
		const toggle = (key) => {
			setExpanded((prev) => {
				const next = new Set(prev);
				if (next.has(key)) next.delete(key);
				else next.add(key);
				return next;
			});
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-page",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					eyebrow: t("nav.groupSystem"),
					title: t("nav.audit"),
					description: t("audit.desc"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, { children: [
							filtered.length,
							" / ",
							total
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
							text: JSON.stringify(filtered, null, 2),
							label: t("audit.copyRows"),
							copiedLabel: t("common.copied"),
							onCopied: (ok) => {
								if (!ok) props.toast(t("common.copyFailed"), "danger");
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 14 }),
							onClick: () => setReload((value) => value + 1),
							children: t("common.refresh")
						})
					] })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-toolbar",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronLeft, { size: 14 }),
							"aria-label": t("audit.prevDay"),
							onClick: () => setDate(shiftDay(date, -1))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "gam-input",
							type: "date",
							value: date,
							onChange: (event) => setDate(event.target.value),
							style: { width: 150 },
							"aria-label": t("audit.date")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, { size: 14 }),
							"aria-label": t("audit.nextDay"),
							onClick: () => setDate(shiftDay(date, 1))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setDate(todayISO()),
							children: t("common.today")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
							value: act,
							onChange: setAct,
							"aria-label": t("audit.act"),
							options: [{
								value: "",
								label: t("audit.allActs")
							}, ...AUDIT_ACTS.map((value) => ({
								value,
								label: value
							}))]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchInput, {
							value: query,
							onChange: setQuery,
							placeholder: t("audit.search"),
							"aria-label": t("audit.search"),
							clearLabel: t("common.clear")
						}),
						loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : null
					]
				}),
				error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorState, {
					title: t("audit.loadFailed"),
					message: error,
					retryLabel: t("panel.retry"),
					onRetry: () => setReload((value) => value + 1)
				}) : null,
				loading && rows.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkeletonList, { rows: 7 }) : filtered.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconAudit, { size: 20 }),
					title: t("audit.empty"),
					description: t("audit.emptyDesc")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-listcard",
					children: filtered.map((row, index) => {
						const key = `${row.ts ?? ""}-${index}`;
						const flagged = row.act === "deny" || row.act === "gate-drop";
						const open = expanded.has(key);
						const summary = [
							row.decision ?? null,
							row.reason ?? null,
							row.kind ?? null,
							row.title ?? null,
							row.id ?? null,
							row.source ?? null,
							row.snapshot ?? null,
							typeof row.merged === "number" ? `merged ${row.merged}` : null,
							typeof row.promoted === "number" ? `promoted ${row.promoted}` : null,
							typeof row.added === "number" ? `+${row.added}` : null
						].filter((value) => value !== null && value !== "").join(" · ");
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-auditrow",
							"data-flag": flagged ? "true" : "false",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "gam-audit-grid",
								onClick: () => toggle(key),
								"aria-expanded": open,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-audit-time",
										children: formatTime(row.ts)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
										tone: flagged ? "danger" : row.act === "import" ? "accent" : "neutral",
										children: row.act ?? "—"
									}) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-audit-summary",
										children: summary || "—"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-faint",
										children: row.actor ?? "—"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-faint",
										children: open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronDown, { size: 13 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, { size: 13 })
									})
								]
							}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-audit-json",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
									className: "gam-pre",
									children: JSON.stringify(row, null, 2)
								})
							}) : null]
						}, key);
					})
				})
			]
		});
	}
	function RecoveryView(props) {
		const t = props.t;
		const [snapshots, setSnapshots] = (0, react.useState)([]);
		const [compare, setCompare] = (0, react.useState)([]);
		const [diff, setDiff] = (0, react.useState)(null);
		const [doctor, setDoctor] = (0, react.useState)(null);
		const [busy, setBusy] = (0, react.useState)(null);
		const [error, setError] = (0, react.useState)(null);
		const [restoreTarget, setRestoreTarget] = (0, react.useState)(null);
		const [exportOpen, setExportOpen] = (0, react.useState)(false);
		const [includePii, setIncludePii] = (0, react.useState)(false);
		const [exportResult, setExportResult] = (0, react.useState)(null);
		const [zipOpen, setZipOpen] = (0, react.useState)(false);
		const [zipPath, setZipPath] = (0, react.useState)("");
		const compareTouched = (0, react.useRef)(false);
		const load = (0, react.useCallback)(() => {
			api.snapshots().then((result) => {
				setSnapshots(result.items);
				setCompare((prev) => {
					if (compareTouched.current) return prev;
					if (prev.length === 2) return prev;
					const first = result.items[0];
					const second = result.items[1];
					if (first && second) return [second.label, first.label];
					return first ? [first.label] : [];
				});
			}).catch((cause) => setError(cause.message));
		}, []);
		(0, react.useEffect)(load, [load, props.version]);
		(0, react.useEffect)(() => {
			if (compare.length !== 2) {
				setDiff(null);
				return;
			}
			const first = snapshots.find((snapshot) => snapshot.label === compare[0]);
			const second = snapshots.find((snapshot) => snapshot.label === compare[1]);
			if (!first || !second) return;
			const ordered = [first, second].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
			let alive = true;
			api.snapshotDiff(ordered[0].label, ordered[1].label).then((value) => {
				if (alive) setDiff(value);
			}).catch(() => {
				if (alive) setDiff(null);
			});
			return () => {
				alive = false;
			};
		}, [compare, snapshots]);
		const toggleCompare = (label) => {
			compareTouched.current = true;
			setCompare((prev) => {
				if (prev.includes(label)) return prev.filter((value) => value !== label);
				if (prev.length >= 2) return [prev[1], label];
				return [...prev, label];
			});
		};
		const runDoctor = () => {
			setBusy("doctor");
			api.doctor(true).then((result) => {
				setDoctor(result);
				props.toast(t("recovery.doctorDone"), result.after.length === 0 ? "success" : "warn");
				props.onChanged();
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setBusy(null));
		};
		const consolidate = () => {
			setBusy("consolidate");
			api.consolidate().then((result) => {
				props.toast(`${t("recovery.consolidateDone")} · merged ${result.merged} · promoted ${result.promoted} · ${result.durationMs}ms`, "success");
				props.onChanged();
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setBusy(null));
		};
		const createSnapshot = () => {
			setBusy("snapshot");
			api.createSnapshot("manual").then((info) => {
				props.toast(`${t("recovery.snapshotCreated")} · ${info.label}`, "success");
				load();
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setBusy(null));
		};
		const exportZip = () => {
			setBusy("export");
			api.exportZip(includePii).then((result) => {
				setExportResult(result);
				setExportOpen(false);
				props.toast(t("recovery.exported"), "success");
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setBusy(null));
		};
		const importZip = () => {
			if (!zipPath.trim()) return;
			setBusy("zip");
			api.importZip(zipPath.trim()).then((result) => {
				props.toast(interpolate(t("recovery.zipImported"), { n: result.restored }), "success");
				setZipOpen(false);
				setZipPath("");
				load();
				props.onChanged();
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setBusy(null));
		};
		const restore = () => {
			if (!restoreTarget) return;
			setBusy("restore");
			api.restore(restoreTarget.label).then((result) => {
				props.toast(`${t("recovery.restored")} ${result.restored} · ${t("recovery.preSnapshot")} ${result.preSnapshot}`, "success");
				setRestoreTarget(null);
				load();
				props.onChanged();
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setBusy(null));
		};
		const orderedCompare = compare.map((label) => snapshots.find((snapshot) => snapshot.label === label)).filter((snapshot) => Boolean(snapshot)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-page",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					eyebrow: t("nav.groupSystem"),
					title: t("nav.recovery"),
					description: t("recovery.desc"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							icon: busy === "doctor" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconShield, { size: 14 }),
							onClick: runDoctor,
							disabled: Boolean(busy),
							children: t("recovery.doctor")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							icon: busy === "snapshot" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlus, { size: 14 }),
							onClick: createSnapshot,
							disabled: Boolean(busy),
							children: t("recovery.createSnapshot")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							icon: busy === "consolidate" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSparkle, { size: 14 }),
							onClick: consolidate,
							disabled: Boolean(busy),
							children: t("recovery.consolidate")
						})
					] })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-grid2",
					"data-align": "start",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Card, {
						title: t("recovery.exportTitle"),
						hint: t("recovery.exportHint"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-inline",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconDownload, { size: 14 }),
								onClick: () => setExportOpen(true),
								children: t("recovery.export")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconUpload, { size: 14 }),
								onClick: () => {
									setZipPath("");
									setZipOpen(true);
								},
								children: t("recovery.importZip")
							})]
						}), exportResult ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-stack",
							style: { marginTop: 10 },
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-muted",
										children: t("recovery.exported")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-inline",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
											className: "gam-mono gam-truncate",
											style: { maxWidth: 220 },
											title: exportResult.path,
											children: exportResult.path
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
											text: exportResult.path,
											label: t("common.copyPath"),
											copiedLabel: t("common.copied")
										})]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-muted",
										children: t("recovery.files")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("b", { children: [
										exportResult.files,
										" · ",
										formatBytes(exportResult.bytes)
									] })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-stat-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-muted",
										children: t("recovery.excludedPii")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: exportResult.excluded })]
								})
							]
						}) : null]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						title: t("recovery.doctorResult"),
						hint: t("recovery.doctorHint"),
						children: !doctor ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-muted",
							children: t("recovery.doctorIdle")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-stack",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-inline",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
									tone: doctor.after.length === 0 ? "success" : "warn",
									dot: true,
									children: doctor.after.length === 0 ? t("overview.allClear") : interpolate(t("overview.errorsFound"), { n: doctor.after.length })
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "gam-faint",
									children: [
										doctor.rebuilt.length,
										" ",
										t("recovery.rebuilt"),
										" · ",
										doctor.unchanged,
										" ",
										t("recovery.unchanged")
									]
								})]
							}), doctor.after.slice(0, 5).map((alert) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-stat-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-muted",
									children: alert.code
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: alert.message })]
							}, alert.code))]
						})
					})]
				}),
				error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorState, {
					title: t("recovery.loadFailed"),
					message: error,
					retryLabel: t("panel.retry"),
					onRetry: load
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
					title: t("recovery.snapshots"),
					hint: t("recovery.snapshotsHint"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 13 }),
						onClick: load,
						children: t("common.refresh")
					}),
					children: snapshots.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRecovery, { size: 20 }),
						title: t("recovery.noSnapshots"),
						description: t("recovery.noSnapshotsDesc"),
						actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "primary",
							onClick: createSnapshot,
							children: t("recovery.createSnapshot")
						})
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: snapshots.map((snapshot) => {
						const index = compare.indexOf(snapshot.label);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-snapshotrow",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: index >= 0,
									onChange: () => toggleCompare(snapshot.label),
									"aria-label": t("recovery.compare"),
									style: { accentColor: "var(--gam-accent)" }
								}),
								index >= 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
									tone: "accent",
									children: index === 0 ? "A" : "B"
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-snapshotrow-main",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "gam-snapshotrow-title",
										children: snapshot.label
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "gam-snapshotrow-sub",
										children: [
											formatDateTime(snapshot.createdAt),
											" · ",
											snapshot.files,
											" ",
											t("recovery.files"),
											" · ",
											formatBytes(snapshot.bytes)
										]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setRestoreTarget(snapshot),
									children: t("recovery.restore")
								})
							]
						}, snapshot.label);
					}) })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
					title: t("recovery.diff"),
					hint: compare.length === 2 && orderedCompare.length === 2 ? `${orderedCompare[0].label} → ${orderedCompare[1].label}` : t("recovery.diffHint"),
					children: !diff ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-muted",
						children: t("recovery.diffPick")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-diff",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffColumn, {
								kind: "add",
								title: `+ ${diff.added.length} ${t("recovery.added")}`,
								items: diff.added,
								emptyLabel: t("recovery.none")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffColumn, {
								kind: "remove",
								title: `− ${diff.removed.length} ${t("recovery.removed")}`,
								items: diff.removed,
								emptyLabel: t("recovery.none")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffColumn, {
								kind: "change",
								title: `~ ${diff.changed.length} ${t("recovery.changed")}`,
								items: diff.changed,
								emptyLabel: t("recovery.none")
							})
						]
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Dialog, {
					open: exportOpen,
					title: t("recovery.export"),
					description: t("recovery.exportDialogDesc"),
					onClose: () => setExportOpen(false),
					closeLabel: t("common.close"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setExportOpen(false),
						disabled: busy === "export",
						children: t("common.cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Button, {
						variant: "primary",
						onClick: exportZip,
						disabled: busy === "export",
						children: [busy === "export" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconDownload, { size: 13 }), t("recovery.export")]
					})] }),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "gam-checkrow",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: includePii,
							onChange: (event) => setIncludePii(event.target.checked)
						}), t("recovery.includePii")]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "gam-field-hint",
						style: { marginTop: 6 },
						children: t("recovery.includePiiHint")
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Dialog, {
					open: zipOpen,
					title: t("recovery.importZip"),
					description: t("recovery.importZipDesc"),
					onClose: () => setZipOpen(false),
					closeLabel: t("common.close"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setZipOpen(false),
						disabled: busy === "zip",
						children: t("common.cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Button, {
						variant: "primary",
						onClick: importZip,
						disabled: !zipPath.trim() || busy === "zip",
						children: [busy === "zip" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconUpload, { size: 13 }), t("recovery.importZip")]
					})] }),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-field",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								className: "gam-field-label",
								htmlFor: "gam-zip-path",
								children: t("recovery.zipPath")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								id: "gam-zip-path",
								className: "gam-input",
								value: zipPath,
								placeholder: t("recovery.zipPathPlaceholder"),
								onChange: (event) => setZipPath(event.target.value),
								autoFocus: true
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-field-hint",
								children: t("recovery.importZipHint")
							})
						]
					})
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ConfirmDialog, {
					open: Boolean(restoreTarget),
					title: t("recovery.restoreTitle"),
					description: t("recovery.restoreDesc"),
					confirmLabel: t("recovery.restore"),
					cancelLabel: t("common.cancel"),
					closeLabel: t("common.close"),
					busy: busy === "restore",
					danger: true,
					onConfirm: restore,
					onClose: () => setRestoreTarget(null),
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-stack",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-stat-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-muted",
									children: t("recovery.snapshot")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", {
									className: "gam-mono",
									children: restoreTarget?.label
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-stat-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-muted",
									children: t("recovery.createdAt")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: formatDateTime(restoreTarget?.createdAt) })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-stat-row",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-muted",
									children: t("recovery.preSnapshot")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: t("recovery.auto") })]
							})
						]
					})
				})
			]
		});
	}
	function DiffColumn(props) {
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-diff-col",
			"data-kind": props.kind,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "gam-diff-head",
				children: props.title
			}), props.items.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "gam-diff-item",
				children: props.emptyLabel
			}) : props.items.slice(0, 120).map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "gam-diff-item",
				children: item
			}, item))]
		});
	}
	const SETTINGS_GROUPS = [
		{
			titleKey: "settings.groupStorage",
			keys: ["memoryRoot", "indexBackend"]
		},
		{
			titleKey: "settings.groupBudget",
			keys: ["budget"]
		},
		{
			titleKey: "settings.groupInject",
			keys: ["inject"]
		},
		{
			titleKey: "settings.groupIngest",
			hintKey: "settings.groupIngestHint",
			keys: ["ingest"]
		},
		{
			titleKey: "settings.groupRetrieval",
			keys: ["retrieval"]
		},
		{
			titleKey: "settings.groupCurator",
			keys: ["curator"]
		},
		{
			titleKey: "settings.groupPortability",
			keys: ["portability"]
		},
		{
			titleKey: "settings.groupPrivacy",
			keys: ["privacy"]
		},
		{
			titleKey: "settings.groupAdvanced",
			keys: ["toolSurface", "advanced"]
		}
	];
	function SettingsView(props) {
		const t = props.t;
		const [config, setConfig] = (0, react.useState)(null);
		const [targets, setTargets] = (0, react.useState)([]);
		const [error, setError] = (0, react.useState)(null);
		const [showRaw, setShowRaw] = (0, react.useState)(false);
		const [catalog, setCatalog] = (0, react.useState)(null);
		const [showCatalog, setShowCatalog] = (0, react.useState)(false);
		const [busy, setBusy] = (0, react.useState)(null);
		(0, react.useEffect)(() => {
			api.config().then(setConfig).catch((cause) => setError(cause.message));
			api.projections().then((result) => setTargets(result.targets)).catch(() => {});
		}, [props.version]);
		(0, react.useEffect)(() => {
			if (!showCatalog || catalog) return;
			api.catalog().then(setCatalog).catch((cause) => props.toast(cause.message, "danger"));
		}, [
			showCatalog,
			catalog,
			props.toast
		]);
		const known = new Set(SETTINGS_GROUPS.flatMap((group) => group.keys));
		const unknown = config ? Object.keys(config).filter((key) => !known.has(key)) : [];
		const applyProjections = (ids) => {
			setBusy("projections");
			api.applyProjections(ids).then((result) => {
				props.toast(`${t("settings.applied")} ${result.results.filter((item) => item.changed).length}/${result.results.length}`, "success");
			}).catch((cause) => props.toast(cause.message, "danger")).finally(() => setBusy(null));
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-page",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					eyebrow: t("nav.groupSystem"),
					title: t("nav.settings"),
					description: t("settings.hint"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
						text: config ? JSON.stringify(config, null, 2) : "",
						label: t("settings.copyConfig"),
						copiedLabel: t("common.copied"),
						onCopied: (ok) => {
							if (!ok) props.toast(t("common.copyFailed"), "danger");
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => setShowRaw((value) => !value),
						children: showRaw ? t("settings.hideRaw") : t("settings.showRaw")
					})] })
				}),
				error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorState, {
					title: t("settings.loadFailed"),
					message: error,
					retryLabel: t("panel.retry")
				}) : null,
				!config ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkeletonList, { rows: 5 }) : null,
				config ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-settingsgrid",
						children: [SETTINGS_GROUPS.map((group) => {
							const rows = group.keys.flatMap((key) => {
								const value = config[key];
								if (value === void 0) return [];
								if (isPlainObject(value)) return Object.entries(value).map(([childKey, childValue]) => ({
									label: childKey,
									path: `${key}.${childKey}`,
									value: childValue
								}));
								return [{
									label: key,
									path: key,
									value
								}];
							});
							if (rows.length === 0) return null;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-settinggroup",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-settinggroup-head",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t(group.titleKey) }), group.hintKey ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t(group.hintKey) }) : null]
								}), rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "gam-settingrow",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-setting-key",
										title: row.path,
										children: row.label
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-setting-val",
										children: renderSettingValue(row.value, t)
									})]
								}, row.path))]
							}, group.titleKey);
						}), unknown.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-settinggroup",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-settinggroup-head",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("settings.groupOther") })
							}), unknown.map((key) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-settingrow",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-setting-key",
									children: key
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-setting-val",
									children: renderSettingValue(config[key], t)
								})]
							}, key))]
						}) : null]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						title: t("settings.projections"),
						hint: t("settings.projectionHint"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-stack",
							children: [targets.map((target) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-projectionrow",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "gam-projectionrow-main",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "gam-projectionrow-title",
											children: target.label
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "gam-projectionrow-path",
											children: target.path
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-switch",
										"data-on": target.enabled ? "true" : "false",
										children: target.enabled ? t("common.on") : t("common.off")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										disabled: busy === "projections",
										onClick: () => applyProjections([target.id]),
										children: t("settings.generate")
									})
								]
							}, target.id)), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-inline",
								style: { marginTop: 4 },
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Button, {
									size: "sm",
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 13 }),
									disabled: busy === "projections" || targets.filter((target) => target.enabled).length === 0,
									onClick: () => applyProjections(targets.filter((target) => target.enabled).map((target) => target.id)),
									children: [busy === "projections" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : null, t("settings.applyEnabled")]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-faint",
									children: t("settings.projectionReadonly")
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						title: t("settings.injectionPreview"),
						hint: t("settings.injectionPreviewHint"),
						actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setShowCatalog((value) => !value),
							children: showCatalog ? t("common.hide") : t("common.show")
						}), catalog ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
							text: catalog.text,
							label: t("common.copy"),
							copiedLabel: t("common.copied")
						}) : null] }),
						children: !showCatalog ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-muted",
							children: t("settings.injectionPreviewIdle")
						}) : !catalog ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkeletonList, { rows: 3 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-stack",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gam-faint",
								children: [
									t("overview.shown"),
									" ",
									catalog.shown,
									" · ",
									t("overview.omitted"),
									" ",
									catalog.omitted
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
								className: "gam-pre",
								style: { maxHeight: 320 },
								children: catalog.text || t("overview.emptyCatalog")
							})]
						})
					}),
					showRaw ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						title: t("settings.rawConfig"),
						hint: t("settings.rawConfigHint"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
							className: "gam-pre",
							children: JSON.stringify(config, null, 2)
						})
					}) : null
				] }) : null
			]
		});
	}
	function renderSettingValue(value, t) {
		if (typeof value === "boolean") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
			tone: value ? "success" : "neutral",
			dot: true,
			children: value ? t("common.on") : t("common.off")
		});
		if (Array.isArray(value)) return value.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: "gam-muted",
			children: "—"
		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
			className: "gam-tagrow",
			children: value.map((item, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "gam-tag",
				children: String(item)
			}, index))
		});
		if (isPlainObject(value)) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: JSON.stringify(value) });
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", { children: String(value ?? "—") });
	}
	function isPlainObject(value) {
		return Boolean(value) && typeof value === "object" && !Array.isArray(value);
	}
	function CommandPalette(props) {
		const t = props.t;
		const [query, setQuery] = (0, react.useState)("");
		const debounced = useDebounced(query, 180);
		const [results, setResults] = (0, react.useState)([]);
		const [searching, setSearching] = (0, react.useState)(false);
		const [active, setActive] = (0, react.useState)(0);
		const inputRef = (0, react.useRef)(null);
		(0, react.useEffect)(() => {
			if (!props.open) return;
			setQuery("");
			setResults([]);
			setActive(0);
			const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
			return () => window.clearTimeout(timer);
		}, [props.open]);
		(0, react.useEffect)(() => {
			if (!props.open || !debounced.trim()) {
				setResults([]);
				setSearching(false);
				return;
			}
			let alive = true;
			setSearching(true);
			api.entries({
				q: debounced.trim(),
				limit: 8
			}).then((page) => {
				if (alive) setResults(page.items);
			}).catch(() => {
				if (alive) setResults([]);
			}).finally(() => {
				if (alive) setSearching(false);
			});
			return () => {
				alive = false;
			};
		}, [debounced, props.open]);
		const navItems = NAV_GROUPS.flatMap((group) => group.items.map((item) => {
			const Icon = item.icon;
			return {
				id: `nav:${item.id}`,
				group: t("command.navigation"),
				label: t(item.labelKey),
				hint: group.labelKey === "nav.groupMemory" ? t("command.memoryGroup") : t("command.systemGroup"),
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Icon, { size: 14 }),
				run: () => props.onNavigate(item.id)
			};
		}));
		const actionItems = [
			{
				id: "action:refresh",
				group: t("command.actions"),
				label: t("common.refresh"),
				hint: t("command.refreshHint"),
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 14 }),
				run: () => {
					props.onChanged();
					props.toast(t("common.refreshed"), "success");
				}
			},
			{
				id: "action:doctor",
				group: t("command.actions"),
				label: t("recovery.doctor"),
				hint: t("command.doctorHint"),
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconShield, { size: 14 }),
				run: () => {
					api.doctor(true).then((report) => {
						props.toast(interpolate(t("overview.doctorDone"), { n: report.rebuilt.length }), "success");
						props.onChanged();
					}).catch((cause) => props.toast(cause.message, "danger"));
				}
			},
			{
				id: "action:export",
				group: t("command.actions"),
				label: t("recovery.export"),
				hint: t("command.exportHint"),
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconDownload, { size: 14 }),
				run: () => {
					api.exportZip(false).then((result) => props.toast(`${t("recovery.exported")} · ${result.files} files`, "success")).catch((cause) => props.toast(cause.message, "danger"));
				}
			}
		];
		const entryItems = results.map((entry) => ({
			id: `entry:${entry.id}`,
			group: t("command.memories"),
			label: entry.title,
			hint: [kindLabel(t, entry.kind), entry.summary].filter(Boolean).join(" · "),
			icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconBook, { size: 14 }),
			run: () => props.onOpen(entry.id)
		}));
		const needle = query.trim().toLowerCase();
		const filterItems = (items) => needle ? items.filter((item) => `${item.label} ${item.hint ?? ""}`.toLowerCase().includes(needle)) : items;
		const items = needle ? [
			...entryItems,
			...filterItems(navItems),
			...filterItems(actionItems)
		] : [...navItems, ...actionItems];
		const activeItem = items[Math.min(active, Math.max(0, items.length - 1))];
		(0, react.useEffect)(() => {
			setActive(0);
		}, [query, results.length]);
		if (!props.open) return null;
		const runItem = (item) => {
			item.run();
			props.onClose();
		};
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "gam-overlay",
			"data-align": "top",
			onMouseDown: (event) => {
				if (event.target === event.currentTarget) props.onClose();
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-command",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": t("command.title"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-command-inputrow",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSearch, {
								size: 16,
								className: "gam-faint"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								ref: inputRef,
								className: "gam-input",
								value: query,
								placeholder: t("command.placeholder"),
								"aria-label": t("command.placeholder"),
								onChange: (event) => setQuery(event.target.value),
								onKeyDown: (event) => {
									if (event.key === "ArrowDown") {
										event.preventDefault();
										setActive((value) => Math.min(items.length - 1, value + 1));
									} else if (event.key === "ArrowUp") {
										event.preventDefault();
										setActive((value) => Math.max(0, value - 1));
									} else if (event.key === "Enter") {
										event.preventDefault();
										if (activeItem) runItem(activeItem);
									} else if (event.key === "Escape") {
										event.preventDefault();
										props.onClose();
									}
								}
							}),
							searching ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kbd, { children: "esc" })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-command-list",
						children: items.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-empty",
							style: { padding: "32px 16px" },
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-empty-title",
								children: t("command.noResults")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-empty-desc",
								children: t("command.noResultsDesc")
							})]
						}) : items.map((item, index) => {
							const showGroup = index === 0 || items[index - 1]?.group !== item.group;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [showGroup ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-command-section",
								children: item.group
							}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cx("gam-command-item", index === Math.min(active, items.length - 1) && "is-active"),
								onMouseEnter: () => setActive(index),
								onClick: () => runItem(item),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-command-icon",
										children: item.icon
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-command-label",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: item.label }), item.hint ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: item.hint }) : null]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-command-hint",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, { size: 12 })
									})
								]
							})] }, item.id);
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-command-foot",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kbd, { children: "↑" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kbd, { children: "↓" }),
								t("command.select")
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kbd, { children: "↵" }), t("command.open")] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kbd, { children: "esc" }), t("command.close")] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: shortcutLabel() })
						]
					})
				]
			})
		});
	}
	function WriteConfirmCard(props) {
		ensureStyles();
		const t = props.t;
		const [items, setItems] = (0, react.useState)([]);
		const [busyId, setBusyId] = (0, react.useState)(null);
		const [queueOpen, setQueueOpen] = (0, react.useState)(false);
		const now = useTicker(1e3, items.length > 0);
		(0, react.useEffect)(() => {
			const load = () => {
				if (document.hidden) return;
				api.pending().then((result) => setItems(result.items)).catch(() => {});
			};
			load();
			const timer = window.setInterval(load, 1800);
			return () => window.clearInterval(timer);
		}, []);
		const item = items[0];
		if (!item) return null;
		const decide = (target, action) => {
			setBusyId(target.id);
			api.decidePending(target.id, action).then(() => setItems((prev) => prev.filter((entry) => entry.id !== target.id))).catch(() => {}).finally(() => setBusyId(null));
		};
		const created = new Date(item.createdAt).getTime();
		const total = Math.max(1, item.expiresAt - (Number.isNaN(created) ? Date.now() : created));
		const remaining = Math.max(0, item.expiresAt - now);
		const fraction = Math.max(0, Math.min(1, remaining / total));
		const seconds = Math.max(0, Math.ceil(remaining / 1e3));
		const sameText = item.candidate.summary.trim() === item.candidate.title.trim();
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-confirm-scope",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-confirm",
				role: "group",
				"aria-label": t("confirm.prompt"),
				"aria-live": "polite",
				title: item.decision.reason || void 0,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-confirm-top",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-confirm-icon",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSparkle, { size: 13 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-confirm-title",
								children: t("confirm.prompt")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(KindBadge, {
								kind: item.candidate.kind,
								t
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-tag",
								children: item.candidate.source
							}),
							items.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "gam-chip",
								style: {
									minHeight: 22,
									padding: "0 7px",
									fontSize: 10.5
								},
								onClick: () => setQueueOpen(true),
								children: interpolate(t("confirm.more"), { n: items.length - 1 })
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-confirm-reason",
								children: interpolate(t("confirm.autoDismiss"), { n: seconds })
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-confirm-main",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-confirm-text",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-confirm-body",
								children: item.candidate.title
							}), !sameText && item.candidate.summary ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-confirm-sum",
								children: item.candidate.summary
							}) : null]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-confirm-actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								disabled: busyId === item.id,
								onClick: () => decide(item, "reject"),
								children: t("confirm.reject")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "primary",
								disabled: busyId === item.id,
								onClick: () => decide(item, "accept"),
								children: t("confirm.accept")
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-countdown",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { style: { width: `${fraction * 100}%` } })
					})
				]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Dialog, {
				open: queueOpen,
				title: t("confirm.queueTitle"),
				description: t("confirm.queueDesc"),
				onClose: () => setQueueOpen(false),
				closeLabel: t("common.close"),
				size: "wide",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PendingRows, {
					items,
					t,
					busyId,
					onDecide: decide
				})
			})]
		});
	}
	function asRecord(value) {
		return value && typeof value === "object" && !Array.isArray(value) ? value : {};
	}
	function asArray(value) {
		return Array.isArray(value) ? value : [];
	}
	function asString(value) {
		return typeof value === "string" && value.length > 0 ? value : void 0;
	}
	var Boundary = class extends react.Component {
		state = { error: null };
		static getDerivedStateFromError(error) {
			return { error };
		}
		render() {
			if (this.state.error) {
				const t = this.props.t;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-page",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, { title: t("panel.error") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorState, {
						title: t("panel.error"),
						message: `${this.props.label}: ${this.state.error.message}`,
						retryLabel: t("panel.retry"),
						onRetry: () => this.setState({ error: null })
					})]
				});
			}
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
