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
			"doctorDone": "Check complete · {n} derived files rebuilt",
			"injectHits": "Injected hits"
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
			"continue": "Import more",
			"scanRoot": "Scan root",
			"alreadyImported": "Already imported",
			"alreadyImportedHint": "These entries were imported from the same source before and are skipped",
			"alreadyImportedNote": "Already-imported entries stay out of the list to avoid redundancy; new content in the same source is still picked up.",
			"noMinedItems": "Nothing importable in this source",
			"noMinedItemsDesc": "The scan succeeded but found no long-term memory to extract (e.g. a small-talk-only conversation)."
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
			"desc": "Projects, code, people, teams, actions and systems in one relation map. Zoom, pan, double-click to focus, and filter by project and entity type.",
			"nodes": "nodes",
			"edges": "relations",
			"projects": "projects",
			"searchPlaceholder": "Search entities, projects or relations (Enter to locate)",
			"filters": "Filters",
			"filtersHint": "Values within a dimension are OR; dimensions combine with AND.",
			"matchInfo": "{nodes} entities · {edges} relations match",
			"searchActive": "{count} matches highlighted",
			"noMatch": "No matching entities or relations",
			"mode": "View mode",
			"graphMode": "Graph",
			"listMode": "List",
			"insightMode": "Insights",
			"copyMermaid": "Copy Mermaid",
			"refresh": "Refresh",
			"refreshing": "Refreshing",
			"refreshFailed": "Failed to refresh; showing the last result",
			"loadFailed": "Failed to load genealogy",
			"empty": "No relationship memories yet",
			"emptyDesc": "Say “X owns Y”; it appears here after import or automatic extraction. You can also import memories from other tools first.",
			"goImport": "Import memories",
			"filteredEmpty": "No relations match these filters",
			"filteredEmptyDesc": "Broaden project, type or time filters, or clear all conditions.",
			"clearAll": "Clear all conditions",
			"clearFilters": "Clear filters",
			"clearSearch": "Clear search",
			"activeFilters": "Filtered by",
			"visibleSummary": "Showing {nodes}/{totalNodes} nodes · {edges}/{totalEdges} relations",
			"totalSummary": "{nodes} nodes · {edges} relations",
			"projectSummary": "{projects} projects",
			"truncatedTitle": "Graph capped for performance",
			"truncatedDesc": "Loaded the most recent {shown}/{total} relationship memories to avoid rendering too many nodes at once.",
			"loadMore": "Load more",
			"loadMoreToast": "Loading up to {limit} relations…",
			"limitReached": "Performance limit reached; narrow the filters to explore older relations.",
			"facetTruncated": "Facet counts reflect the currently loaded data.",
			"defaultProject": "Grouped by project for clarity. Switch to force layout to see the whole graph.",
			"autoGrouped": "Large graph detected; switched to project clusters. You can switch back to force layout anytime.",
			"project": "Project",
			"unassigned": "Unassigned",
			"entityType": "Entity type",
			"relationType": "Relation type",
			"confidenceLevel": "Confidence",
			"sourceType": "Source",
			"tags": "Tags",
			"time": "Time range",
			"timeAll": "All time",
			"timeDays": "Last {days} days",
			"timeYear": "Last year",
			"crossOnly": "Cross-project only",
			"heuristicNote": "Entity types are inferred from names and tags and may be wrong; the original entity name is always shown.",
			"layout": "Layout",
			"layoutForce": "Force",
			"layoutProject": "Projects",
			"layoutType": "Types",
			"zoom": "Zoom",
			"zoomIn": "Zoom in",
			"zoomOut": "Zoom out",
			"zoomLevel": "Zoom level",
			"fit": "Fit to canvas",
			"svgLabel": "Memory entity graph. Zoom, pan, click a node to inspect relations, or click a relation to open its source memory.",
			"legend": "Legend & keys",
			"legendEdge": "Relation (arrow points to the object)",
			"legendLow": "Medium/low confidence (dashed)",
			"hintPanZoom": "Scroll to zoom · drag to pan · double-click a node to center",
			"hintPanZoomShort": "Scroll to zoom · drag to pan · double-click to center",
			"hintDoubleClick": "Double-click empty space to zoom in",
			"hintKeys": "Keys:",
			"tipDegree": "{count} relations",
			"tipNodeHint": "Click to inspect · double-click to center",
			"tipEdgeHint": "Click to open the source memory",
			"sideOverview": "Projects & entities",
			"sideRelations": "Entity relations",
			"projectProfiles": "Project profiles",
			"projectProfilesHint": "Grouped by each entity's primary project; cross-project relations are counted separately.",
			"projectRowMeta": "{nodes} nodes · {edges} relations",
			"crossCount": "{count} cross-project",
			"coreEntities": "Key entities",
			"coreEntitiesHint": "Ranked by relation count; click to locate.",
			"sideHint": "Click a project to focus it; click an entity to locate it and inspect all its relations.",
			"sideEditHint": "Types are inferred; open a relation to correct the source memory.",
			"nodeDegree": "{count} relations",
			"isolate": "Only related",
			"isolateOn": "Showing related only",
			"isolateHint": "Showing only relations connected to the selected entity",
			"locate": "Locate",
			"copyName": "Copy name",
			"clearSelection": "Clear selection",
			"relationsOf": "Relations of {name}",
			"noRelations": "No relations under the current filters.",
			"loadMoreRows": "Show more ({shown}/{total})",
			"loadMoreRowsShort": "Show more",
			"openSource": "Open the memory that produced this relation",
			"groupBy": "Group by",
			"groupProject": "Project",
			"groupRelation": "Relation",
			"groupConfidence": "Confidence",
			"groupNone": "None",
			"searchEmpty": "No search results",
			"searchEmptyDesc": "Try another entity name or relation term, or clear the search to see everything.",
			"listShowing": "Showing {shown}/{total}",
			"insightHint": "Project profiles and the matrix are computed from the filtered graph. Entity types are heuristic: use them to spot structure, not as ground truth.",
			"insightProjects": "Projects",
			"insightNodes": "Entities",
			"insightEdges": "Relations",
			"insightPeople": "People/teams",
			"insightCross": "Cross-project relations",
			"viewInGraph": "View in graph",
			"noCross": "No cross-project relations",
			"matrixTitle": "Project × entity type",
			"matrixHint": "Click a cell to filter by both project and type; darker cells contain more entities.",
			"matrixMore": "{count} more projects are not shown in this matrix.",
			"crossProjectTag": "Cross-project relation",
			"profileMore": "{count} more projects are not shown.",
			"crossLinksTitle": "Cross-project dependencies",
			"crossLinksHint": "Relations whose endpoints have different primary projects; click to focus this pair.",
			"noCrossLinks": "No cross-project relations yet. They appear when people or code from different projects become connected.",
			"crossMore": "{count} more dependency pairs are not shown.",
			"noProjects": "No projects to aggregate under the current filters.",
			"noEntities": "No entities under the current filters.",
			"confidence": {
				"high": "High",
				"medium": "Medium",
				"low": "Low"
			},
			"nodeType": {
				"project": "Project",
				"code": "Code",
				"person": "Person",
				"team": "Team",
				"action": "Action",
				"system": "System",
				"concept": "Concept"
			},
			"relType": {
				"owns": "Owns",
				"belongs": "Belongs to",
				"depends": "Depends on",
				"uses": "Uses",
				"hosts": "Hosted at",
				"participates": "Participates",
				"supersedes": "Supersedes",
				"conflicts": "Conflicts with",
				"related": "Related"
			},
			"source": {
				"user-stated": "User stated",
				"model-inferred": "Model inferred",
				"tool-output": "Tool output",
				"web-content": "Web content",
				"imported": "Imported",
				"team": "Team",
				"manual": "Manual"
			}
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
			"doctorDone": "体检完成 · 重建 {n} 个派生文件",
			"injectHits": "注入命中"
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
			"continue": "继续导入",
			"scanRoot": "扫描目录",
			"alreadyImported": "已导入过",
			"alreadyImportedHint": "这些条目此前已从同一来源导入，本次直接跳过",
			"alreadyImportedNote": "已导入过的条目不再进入列表，避免重复冗余；来源文件新增内容仍会被扫出来。",
			"noMinedItems": "这个来源没有可导入的记忆",
			"noMinedItemsDesc": "扫描成功，但内容里没有可抽取的长期记忆（例如纯闲聊的会话）。"
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
			"desc": "把项目、代码、人员、团队、操作与系统放进同一张关系图：滚轮缩放、拖拽平移、双击定位，按项目与实体类型多维筛选。",
			"nodes": "节点",
			"edges": "关系",
			"projects": "项目",
			"searchPlaceholder": "搜索实体、项目或关系（回车定位）",
			"filters": "筛选",
			"filtersHint": "同一维度内为「或」，不同维度之间为「且」。",
			"matchInfo": "{nodes} 个实体 · {edges} 条关系匹配",
			"searchActive": "{count} 项匹配已高亮",
			"noMatch": "没有匹配的实体或关系",
			"mode": "展示方式",
			"graphMode": "图谱",
			"listMode": "列表",
			"insightMode": "洞察",
			"copyMermaid": "复制 Mermaid",
			"refresh": "刷新",
			"refreshing": "刷新中",
			"refreshFailed": "刷新族谱失败，正在显示上一次结果",
			"loadFailed": "加载族谱失败",
			"empty": "还没有关系记忆",
			"emptyDesc": "说一句「谁负责什么」，导入或自动抽取后就会出现在这里；也可以先导入其他工具的记忆。",
			"goImport": "去导入",
			"filteredEmpty": "当前筛选下没有关系",
			"filteredEmptyDesc": "放宽项目、类型或时间范围，或清除全部筛选。",
			"clearAll": "清除全部条件",
			"clearFilters": "清除筛选",
			"clearSearch": "清除搜索",
			"activeFilters": "已筛选",
			"visibleSummary": "可见 {nodes}/{totalNodes} 节点 · {edges}/{totalEdges} 关系",
			"totalSummary": "共 {nodes} 节点 · {edges} 关系",
			"projectSummary": "{projects} 个项目",
			"truncatedTitle": "图谱已按性能上限裁剪",
			"truncatedDesc": "仅载入最近 {shown}/{total} 条关系记忆，避免一次渲染过多节点。",
			"loadMore": "加载更多",
			"loadMoreToast": "正在载入到 {limit} 条关系…",
			"limitReached": "已达性能上限；建议用筛选缩小范围。",
			"facetTruncated": "筛选计数基于当前载入的数据。",
			"defaultProject": "已按项目分组展示；想整体看关系可切回力导向。",
			"autoGrouped": "节点较多，已切换到按项目分组；可随时切回力导向。",
			"project": "项目",
			"unassigned": "未归属",
			"entityType": "实体类型",
			"relationType": "关系类型",
			"confidenceLevel": "置信度",
			"sourceType": "来源",
			"tags": "标签",
			"time": "时间范围",
			"timeAll": "全部时间",
			"timeDays": "近 {days} 天",
			"timeYear": "近一年",
			"crossOnly": "只看跨项目",
			"heuristicNote": "实体维度由名称与标签自动推断，可能有误；面板始终显示原始实体名。",
			"layout": "布局",
			"layoutForce": "力导向",
			"layoutProject": "按项目",
			"layoutType": "按类型",
			"zoom": "缩放",
			"zoomIn": "放大",
			"zoomOut": "缩小",
			"zoomLevel": "当前缩放比例",
			"fit": "适应画布",
			"svgLabel": "记忆实体关系图：可缩放、拖拽，点击节点查看关联，点击关系打开源记忆。",
			"legend": "图例与快捷键",
			"legendEdge": "关系边（箭头指向对象）",
			"legendLow": "中/低置信（虚线）",
			"hintPanZoom": "滚轮缩放 · 拖拽平移 · 双击节点定位",
			"hintPanZoomShort": "滚轮缩放 · 拖拽平移 · 双击定位",
			"hintDoubleClick": "双击空白处放大",
			"hintKeys": "键盘：",
			"tipDegree": "{count} 条关联",
			"tipNodeHint": "点击查看关联 · 双击定位",
			"tipEdgeHint": "点击打开源记忆",
			"sideOverview": "项目与实体概览",
			"sideRelations": "实体关联",
			"projectProfiles": "项目画像",
			"projectProfilesHint": "按实体主归属项目聚合；跨项目关系单独计数。",
			"projectRowMeta": "{nodes} 节点 · {edges} 关系",
			"crossCount": "跨项目 {count}",
			"coreEntities": "关键实体",
			"coreEntitiesHint": "按关联关系数排序，点击可定位。",
			"sideHint": "点击项目可只看该项目；点击实体可定位并查看它的全部关联。",
			"sideEditHint": "维度是自动推断的；点开关系可修正源记忆正文。",
			"nodeDegree": "{count} 条关联",
			"isolate": "只看关联",
			"isolateOn": "正在只看关联",
			"isolateHint": "仅显示与该实体相关的关系",
			"locate": "定位",
			"copyName": "复制名称",
			"clearSelection": "取消选择",
			"relationsOf": "{name} 的关联",
			"noRelations": "当前筛选下没有关联关系。",
			"loadMoreRows": "显示更多（{shown}/{total}）",
			"loadMoreRowsShort": "显示更多",
			"openSource": "打开产生这条关系的源记忆",
			"groupBy": "分组方式",
			"groupProject": "按项目",
			"groupRelation": "按关系",
			"groupConfidence": "按置信度",
			"groupNone": "不分组",
			"searchEmpty": "搜索没有命中",
			"searchEmptyDesc": "换个实体名或关系词；也可以清除搜索查看全部。",
			"listShowing": "已显示 {shown}/{total} 条",
			"insightHint": "项目画像与矩阵按当前筛选后的图计算；实体类型为启发式推断，适合发现结构，不替代原文核对。",
			"insightProjects": "项目",
			"insightNodes": "实体",
			"insightEdges": "关系",
			"insightPeople": "人员/团队",
			"insightCross": "跨项目关系",
			"viewInGraph": "在图谱中查看",
			"noCross": "无跨项目关系",
			"matrixTitle": "项目 × 实体类型",
			"matrixHint": "点单元格可同时筛选项目与类型；颜色越深表示实体越多。",
			"matrixMore": "还有 {count} 个项目未在此矩阵展示。",
			"crossProjectTag": "跨项目关系",
			"profileMore": "还有 {count} 个项目未展示。",
			"crossLinksTitle": "跨项目依赖",
			"crossLinksHint": "两端实体主项目不同的关系；点击只看这组项目。",
			"noCrossLinks": "还没有跨项目关系。让不同项目的人员或代码产生关联后，这里会出现依赖。",
			"crossMore": "还有 {count} 组依赖未展开。",
			"noProjects": "当前筛选下没有可聚合的项目。",
			"noEntities": "当前筛选下没有实体。",
			"confidence": {
				"high": "高",
				"medium": "中",
				"low": "低"
			},
			"nodeType": {
				"project": "项目",
				"code": "代码",
				"person": "人员",
				"team": "团队",
				"action": "操作",
				"system": "系统",
				"concept": "概念"
			},
			"relType": {
				"owns": "负责",
				"belongs": "属于",
				"depends": "依赖",
				"uses": "使用",
				"hosts": "部署于",
				"participates": "参与",
				"supersedes": "取代",
				"conflicts": "冲突",
				"related": "相关"
			},
			"source": {
				"user-stated": "用户陈述",
				"model-inferred": "模型推断",
				"tool-output": "工具输出",
				"web-content": "网页内容",
				"imported": "导入",
				"team": "团队",
				"manual": "手动"
			}
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
		graph: (limit) => get("graph", { limit }),
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
	  /* 族谱实体色：全部由主题 token 混出，不写死色值 */
	  --gam-g-project: var(--gam-accent);
	  --gam-g-code: var(--gam-info);
	  --gam-g-person: var(--gam-success);
	  --gam-g-team: color-mix(in srgb, var(--gam-success) 58%, var(--gam-info));
	  --gam-g-action: var(--gam-warn);
	  --gam-g-system: color-mix(in srgb, var(--gam-info) 58%, var(--gam-accent));
	  --gam-g-concept: var(--gam-text-3);
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
	.gam-grefreshing { display: inline-flex; align-items: center; gap: 5px; color: var(--gam-text-3); font-size: 11px; }
	.gam-gmatchinfo { font-size: 11px; color: var(--gam-text-3); white-space: nowrap; }
	.gam-gmatchinfo.is-miss { color: var(--gam-warn); }
	.gam-gfcount {
	  display: inline-grid; place-items: center; min-width: 16px; height: 16px; padding: 0 4px;
	  border-radius: 999px; background: var(--gam-accent); color: var(--gam-accent-fg);
	  font-size: 9.5px; font-weight: 700; font-variant-numeric: tabular-nums;
	}
	.gam-gsummary {
	  display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
	  color: var(--gam-text-3); font-size: 11px; font-variant-numeric: tabular-nums;
	}
	.gam-gsummary-match { display: inline-flex; align-items: center; gap: 4px; color: var(--gam-success); }
	.gam-gsummary-match.is-miss { color: var(--gam-warn); }

	.gam-gfilters {
	  display: flex; flex-direction: column; gap: 11px;
	  padding: 15px 16px; border: 1px solid var(--gam-border); border-radius: var(--gam-r-lg);
	  background: var(--gam-surface);
	}
	.gam-gfilters-head { display: flex; align-items: flex-start; gap: 12px; }
	.gam-gfilters-head h3 { margin: 0; font-size: 12px; font-weight: 650; }
	.gam-gfilters-head p { margin: 2px 0 0; font-size: 11px; color: var(--gam-text-4); }
	.gam-gfilters-head .gam-btn { margin-left: auto; }
	.gam-gfilters-row { display: grid; grid-template-columns: 70px minmax(0, 1fr); gap: 10px; align-items: start; }
	.gam-gfilters-label { padding-top: 5px; font-size: 10.5px; color: var(--gam-text-4); font-weight: 600; }
	.gam-gfacet { max-width: 100%; }
	.gam-gfacet-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-gtagrow { max-height: 72px; overflow: auto; padding-right: 2px; }
	.gam-gfilters-note {
	  display: flex; align-items: flex-start; gap: 5px; margin: 0;
	  color: var(--gam-text-4); font-size: 10.5px; line-height: 1.55;
	}
	.gam-gfilters-note svg { flex: none; margin-top: 2px; }

	.gam-gactivefilters { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
	.gam-gactivefilters-label { font-size: 10.5px; color: var(--gam-text-4); margin-right: 2px; }
	.gam-gfilterpill {
	  display: inline-flex; align-items: center; gap: 4px;
	  min-height: 24px; padding: 1px 7px 1px 9px;
	  border: 1px solid color-mix(in srgb, var(--gam-accent) 26%, var(--gam-border));
	  border-radius: 999px; background: color-mix(in srgb, var(--gam-accent) 7%, transparent);
	  color: var(--gam-text-2); font-size: 10.5px; cursor: pointer;
	}
	.gam-gfilterpill:hover { background: color-mix(in srgb, var(--gam-accent) 13%, transparent); color: var(--gam-text); }

	.gam-gnotice {
	  display: flex; align-items: center; gap: 10px;
	  padding: 10px 13px; border: 1px solid var(--gam-border); border-radius: var(--gam-r-md);
	  background: var(--gam-surface); color: var(--gam-text-2); font-size: 11.5px;
	}
	.gam-gnotice[data-tone="info"] { border-color: color-mix(in srgb, var(--gam-info) 26%, var(--gam-border)); background: color-mix(in srgb, var(--gam-info) 5%, transparent); }
	.gam-gnotice[data-tone="danger"] { border-color: color-mix(in srgb, var(--gam-danger) 30%, var(--gam-border)); background: color-mix(in srgb, var(--gam-danger) 6%, transparent); }
	.gam-gnotice > svg { flex: none; color: var(--gam-text-3); }
	.gam-gnotice[data-tone="info"] > svg { color: var(--gam-info); }
	.gam-gnotice[data-tone="danger"] > svg { color: var(--gam-danger); }
	.gam-gnotice-main { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
	.gam-gnotice-main b { font-size: 11.5px; font-weight: 650; color: var(--gam-text); }
	.gam-gnotice-main span { color: var(--gam-text-3); }
	.gam-gnotice-note { color: var(--gam-text-4); font-size: 10.5px; }

	.gam-glayout { display: grid; grid-template-columns: minmax(0, 1fr) 312px; gap: 12px; align-items: stretch; }
	.gam-gcanvascol { min-width: 0; display: flex; flex-direction: column; }
	.gam-gstage {
	  position: relative; flex: 1; min-height: 420px; height: clamp(440px, 62vh, 760px);
	  border: 1px solid var(--gam-border); border-radius: var(--gam-r-lg);
	  background-color: var(--gam-surface);
	  background-image: radial-gradient(color-mix(in srgb, var(--gam-text) 9%, transparent) 0.7px, transparent 0.8px);
	  background-size: 22px 22px;
	  overflow: hidden; outline: none; touch-action: none;
	}
	.gam-gstage:focus-visible { outline: 2px solid var(--gam-accent); outline-offset: 2px; }
	.gam-gsvg { display: block; width: 100%; height: 100%; cursor: grab; touch-action: none; }
	.gam-gsvg:active { cursor: grabbing; }
	.gam-gstage-top {
	  position: absolute; top: 10px; left: 10px; z-index: 3;
	  display: flex; align-items: center; gap: 8px; max-width: calc(100% - 20px);
	}
	.gam-gstage-top .gam-chiprow {
	  padding: 3px; border: 1px solid var(--gam-border); border-radius: 999px;
	  background: color-mix(in srgb, var(--gam-panel) 88%, transparent);
	  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
	}
	.gam-gstage-note {
	  padding: 3px 8px; border: 1px solid var(--gam-border); border-radius: 999px;
	  background: color-mix(in srgb, var(--gam-panel) 88%, transparent);
	  color: var(--gam-text-4); font-size: 10px; white-space: nowrap;
	  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
	}
	.gam-gzoom {
	  position: absolute; top: 10px; right: 10px; z-index: 3;
	  display: flex; align-items: center; gap: 1px; padding: 3px;
	  border: 1px solid var(--gam-border); border-radius: 999px;
	  background: color-mix(in srgb, var(--gam-panel) 88%, transparent);
	  box-shadow: var(--gam-shadow-1);
	  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
	}
	.gam-gzoom .gam-iconbtn { width: 28px; height: 28px; border-radius: 999px; }
	.gam-gzoom-pct {
	  min-width: 42px; text-align: center; color: var(--gam-text-3);
	  font-size: 10px; font-variant-numeric: tabular-nums; font-family: var(--gam-mono);
	}
	.gam-glegend { position: absolute; left: 10px; bottom: 10px; z-index: 3; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
	.gam-glegend-toggle {
	  display: inline-flex; align-items: center; gap: 5px;
	  min-height: 23px; padding: 1px 8px; border: 1px solid var(--gam-border); border-radius: 999px;
	  background: color-mix(in srgb, var(--gam-panel) 88%, transparent); color: var(--gam-text-3);
	  font-size: 10px; cursor: pointer; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
	}
	.gam-glegend-toggle:hover { color: var(--gam-text); border-color: var(--gam-border-2); }
	.gam-glegend-hint {
	  color: var(--gam-text-4); font-size: 10px; padding: 0 3px;
	  text-shadow: 0 1px 2px var(--gam-bg);
	}
	.gam-glegend-card {
	  display: flex; flex-direction: column; gap: 7px; max-width: 340px; padding: 10px 12px;
	  border: 1px solid var(--gam-border); border-radius: var(--gam-r-md);
	  background: color-mix(in srgb, var(--gam-panel) 94%, transparent);
	  box-shadow: var(--gam-shadow-2); color: var(--gam-text-3); font-size: 10.5px;
	  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
	}
	.gam-glegend-types { display: flex; align-items: center; gap: 5px 10px; flex-wrap: wrap; }
	.gam-glegend-item { display: inline-flex; align-items: center; gap: 4px; }
	.gam-glegend-edges { display: flex; gap: 12px; flex-wrap: wrap; }
	.gam-glegend-edges span { display: inline-flex; align-items: center; gap: 4px; }
	.gam-glegend-line { width: 18px; height: 1px; background: var(--gam-border-3); display: inline-block; }
	.gam-glegend-line.is-low { background: repeating-linear-gradient(90deg, var(--gam-border-3) 0 3px, transparent 3px 6px); }
	.gam-glegend-hints { display: flex; flex-direction: column; gap: 2px; color: var(--gam-text-4); font-size: 10px; }
	.gam-gtip {
	  position: absolute; top: 0; left: 0; z-index: 4; max-width: 270px;
	  padding: 9px 11px; border: 1px solid var(--gam-border); border-radius: var(--gam-r-md);
	  background: color-mix(in srgb, var(--gam-panel) 96%, transparent);
	  box-shadow: var(--gam-shadow-2); pointer-events: none;
	  opacity: 0; transition: opacity .1s ease;
	  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
	}
	.gam-gtip[data-visible="true"] { opacity: 1; }
	.gam-gtip-head { display: flex; align-items: center; gap: 6px; min-width: 0; }
	.gam-gtip-title { font-size: 12px; font-weight: 650; color: var(--gam-text); overflow-wrap: anywhere; }
	.gam-gtip-meta { display: flex; align-items: center; gap: 4px; margin-top: 3px; color: var(--gam-text-4); font-size: 10.5px; }
	.gam-gtip-summary {
	  margin-top: 4px; color: var(--gam-text-3); font-size: 10.5px; line-height: 1.45;
	  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
	}
	.gam-gtip-cross { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; color: var(--gam-warn); font-size: 10px; }
	.gam-gtip-hint { margin-top: 5px; color: var(--gam-text-4); font-size: 10px; }

	.gam-gdot {
	  display: inline-block; width: 7px; height: 7px; border-radius: 50%; flex: none;
	  background: var(--gam-text-3);
	}
	.gam-gdot[data-type="project"] { background: var(--gam-g-project, var(--gam-accent)); }
	.gam-gdot[data-type="code"] { background: var(--gam-g-code, var(--gam-info)); }
	.gam-gdot[data-type="person"] { background: var(--gam-g-person, var(--gam-success)); }
	.gam-gdot[data-type="team"] { background: var(--gam-g-team, var(--gam-success)); }
	.gam-gdot[data-type="action"] { background: var(--gam-g-action, var(--gam-warn)); }
	.gam-gdot[data-type="system"] { background: var(--gam-g-system, var(--gam-info)); }
	.gam-gdot[data-type="concept"] { background: var(--gam-g-concept, var(--gam-text-3)); }
	.gam-gdot[data-tone="0"] { background: var(--gam-accent); }
	.gam-gdot[data-tone="1"] { background: var(--gam-info); }
	.gam-gdot[data-tone="2"] { background: var(--gam-success); }
	.gam-gdot[data-tone="3"] { background: var(--gam-warn); }
	.gam-gdot[data-tone="4"] { background: var(--gam-danger); }
	.gam-gdot[data-tone="5"] { background: color-mix(in srgb, var(--gam-accent) 52%, var(--gam-info)); }
	.gam-gdot[data-tone="6"] { background: var(--gam-text-4); }
	.gam-gdot[data-rel="owns"] { background: var(--gam-accent); }
	.gam-gdot[data-rel="belongs"] { background: var(--gam-text-3); }
	.gam-gdot[data-rel="depends"] { background: var(--gam-info); }
	.gam-gdot[data-rel="uses"] { background: var(--gam-success); }
	.gam-gdot[data-rel="hosts"] { background: var(--gam-g-system, var(--gam-info)); }
	.gam-gdot[data-rel="participates"] { background: var(--gam-g-team, var(--gam-success)); }
	.gam-gdot[data-rel="supersedes"] { background: var(--gam-warn); }
	.gam-gdot[data-rel="conflicts"] { background: var(--gam-danger); }
	.gam-gdot[data-rel="related"] { background: var(--gam-text-4); }
	.gam-gdot[data-confidence="high"] { background: var(--gam-success); }
	.gam-gdot[data-confidence="medium"] { background: var(--gam-warn); }
	.gam-gdot[data-confidence="low"] { background: var(--gam-text-4); }

	.gam-ghull { stroke-width: 1; stroke-dasharray: 4 5; fill: color-mix(in srgb, var(--gam-text) 2.5%, transparent); stroke: var(--gam-border-2); pointer-events: none; }
	.gam-ghull[data-tone="0"] { stroke: color-mix(in srgb, var(--gam-accent) 42%, var(--gam-border-3)); fill: color-mix(in srgb, var(--gam-accent) 4.5%, transparent); }
	.gam-ghull[data-tone="1"] { stroke: color-mix(in srgb, var(--gam-info) 42%, var(--gam-border-3)); fill: color-mix(in srgb, var(--gam-info) 4.5%, transparent); }
	.gam-ghull[data-tone="2"] { stroke: color-mix(in srgb, var(--gam-success) 42%, var(--gam-border-3)); fill: color-mix(in srgb, var(--gam-success) 4.5%, transparent); }
	.gam-ghull[data-tone="3"] { stroke: color-mix(in srgb, var(--gam-warn) 42%, var(--gam-border-3)); fill: color-mix(in srgb, var(--gam-warn) 4.5%, transparent); }
	.gam-ghull[data-tone="4"] { stroke: color-mix(in srgb, var(--gam-danger) 42%, var(--gam-border-3)); fill: color-mix(in srgb, var(--gam-danger) 4.5%, transparent); }
	.gam-ghull[data-tone="5"] { stroke: color-mix(in srgb, var(--gam-accent) 28%, var(--gam-info)); fill: color-mix(in srgb, var(--gam-info) 4%, transparent); }
	.gam-ghull[data-tone="6"] { stroke: var(--gam-border-2); fill: color-mix(in srgb, var(--gam-text) 2%, transparent); }
	.gam-ghull[data-type="project"] { stroke: color-mix(in srgb, var(--gam-g-project) 42%, var(--gam-border-3)); }
	.gam-ghull[data-type="code"] { stroke: color-mix(in srgb, var(--gam-g-code) 42%, var(--gam-border-3)); }
	.gam-ghull[data-type="person"] { stroke: color-mix(in srgb, var(--gam-g-person) 42%, var(--gam-border-3)); }
	.gam-ghull[data-type="team"] { stroke: color-mix(in srgb, var(--gam-g-team) 42%, var(--gam-border-3)); }
	.gam-ghull[data-type="action"] { stroke: color-mix(in srgb, var(--gam-g-action) 42%, var(--gam-border-3)); }
	.gam-ghull[data-type="system"] { stroke: color-mix(in srgb, var(--gam-g-system) 42%, var(--gam-border-3)); }
	.gam-ghull[data-type="concept"] { stroke: color-mix(in srgb, var(--gam-g-concept) 42%, var(--gam-border-3)); }
	.gam-ggroup.is-dim { opacity: .32; }
	.gam-ggroup-head { cursor: pointer; outline: none; }
	.gam-ggroup-head:focus-visible .gam-ghull-label { fill: var(--gam-accent); }
	.gam-ghull-label {
	  fill: var(--gam-text-2); font-family: var(--gam-sans); font-size: 11px; font-weight: 650;
	  paint-order: stroke; stroke: var(--gam-surface); stroke-width: 3px; stroke-linejoin: round;
	}
	.gam-ghull-count { fill: var(--gam-text-4); font-family: var(--gam-mono); font-size: 10px; pointer-events: none; }
	.gam-gdot-svg { fill: var(--gam-text-4); stroke: none; pointer-events: none; }
	.gam-gdot-svg[data-type="project"] { fill: var(--gam-g-project); }
	.gam-gdot-svg[data-type="code"] { fill: var(--gam-g-code); }
	.gam-gdot-svg[data-type="person"] { fill: var(--gam-g-person); }
	.gam-gdot-svg[data-type="team"] { fill: var(--gam-g-team); }
	.gam-gdot-svg[data-type="action"] { fill: var(--gam-g-action); }
	.gam-gdot-svg[data-type="system"] { fill: var(--gam-g-system); }
	.gam-gdot-svg[data-type="concept"] { fill: var(--gam-g-concept); }
	.gam-gdot-svg[data-tone="0"] { fill: var(--gam-accent); }
	.gam-gdot-svg[data-tone="1"] { fill: var(--gam-info); }
	.gam-gdot-svg[data-tone="2"] { fill: var(--gam-success); }
	.gam-gdot-svg[data-tone="3"] { fill: var(--gam-warn); }
	.gam-gdot-svg[data-tone="4"] { fill: var(--gam-danger); }
	.gam-gdot-svg[data-tone="5"] { fill: color-mix(in srgb, var(--gam-accent) 52%, var(--gam-info)); }
	.gam-gdot-svg[data-tone="6"] { fill: var(--gam-text-4); }

	.gam-gedge { fill: none; stroke: var(--gam-border-3); stroke-width: 1.1; opacity: .68; pointer-events: none; vector-effect: non-scaling-stroke; }
	.gam-gedge[data-rel="owns"] { stroke: color-mix(in srgb, var(--gam-accent) 78%, var(--gam-border-3)); }
	.gam-gedge[data-rel="depends"] { stroke: color-mix(in srgb, var(--gam-info) 70%, var(--gam-border-3)); }
	.gam-gedge[data-rel="uses"] { stroke: color-mix(in srgb, var(--gam-success) 65%, var(--gam-border-3)); }
	.gam-gedge[data-rel="hosts"] { stroke: color-mix(in srgb, var(--gam-g-system) 62%, var(--gam-border-3)); }
	.gam-gedge[data-rel="participates"] { stroke: color-mix(in srgb, var(--gam-g-team) 62%, var(--gam-border-3)); }
	.gam-gedge[data-rel="supersedes"] { stroke: color-mix(in srgb, var(--gam-warn) 70%, var(--gam-border-3)); }
	.gam-gedge[data-rel="conflicts"] { stroke: color-mix(in srgb, var(--gam-danger) 72%, var(--gam-border-3)); }
	.gam-gedge.is-low { stroke-dasharray: 3 4; opacity: .45; }
	.gam-gedge-hit { fill: none; stroke: transparent; stroke-width: 12; pointer-events: stroke; cursor: pointer; }
	.gam-gedge-group.is-dim { opacity: .13; }
	.gam-gedge-group.is-active .gam-gedge { stroke-width: 2; opacity: .96; }
	.gam-gedge-group.is-match .gam-gedge { stroke-width: 1.9; opacity: 1; }
	.gam-gedge-group.is-cross .gam-gedge { stroke-width: 1.6; opacity: .78; stroke-dasharray: 5 4; }
	.gam-gedge-label {
	  fill: var(--gam-text-4); font-family: var(--gam-sans); font-size: 9.5px;
	  paint-order: stroke; stroke: var(--gam-surface); stroke-width: 3.6px; stroke-linejoin: round;
	  pointer-events: none;
	}
	.gam-garrow { fill: var(--gam-border-3); }

	.gam-gnode { cursor: pointer; outline: none; }
	.gam-gnode.is-dim { opacity: .26; }
	.gam-gnode-dot {
	  fill: color-mix(in srgb, var(--gam-g-concept) 18%, var(--gam-surface));
	  stroke: var(--gam-g-concept); stroke-width: 1.4;
	  vector-effect: non-scaling-stroke;
	  transition: fill .12s ease, stroke-width .12s ease;
	}
	.gam-gnode-dot[data-type="project"] { fill: color-mix(in srgb, var(--gam-g-project) 22%, var(--gam-surface)); stroke: var(--gam-g-project); }
	.gam-gnode-dot[data-type="code"] { fill: color-mix(in srgb, var(--gam-g-code) 20%, var(--gam-surface)); stroke: var(--gam-g-code); }
	.gam-gnode-dot[data-type="person"] { fill: color-mix(in srgb, var(--gam-g-person) 22%, var(--gam-surface)); stroke: var(--gam-g-person); }
	.gam-gnode-dot[data-type="team"] { fill: color-mix(in srgb, var(--gam-g-team) 20%, var(--gam-surface)); stroke: var(--gam-g-team); }
	.gam-gnode-dot[data-type="action"] { fill: color-mix(in srgb, var(--gam-g-action) 20%, var(--gam-surface)); stroke: var(--gam-g-action); }
	.gam-gnode-dot[data-type="system"] { fill: color-mix(in srgb, var(--gam-g-system) 20%, var(--gam-surface)); stroke: var(--gam-g-system); }
	.gam-gnode-dot[data-type="concept"] { fill: color-mix(in srgb, var(--gam-g-concept) 16%, var(--gam-surface)); stroke: var(--gam-g-concept); }
	.gam-gnode:hover .gam-gnode-dot, .gam-gnode.is-hover .gam-gnode-dot { stroke-width: 2.2; }
	.gam-gnode.is-selected .gam-gnode-dot { stroke-width: 2.6; }
	.gam-gnode:focus-visible .gam-gnode-dot { stroke-width: 3; }
	.gam-gnode-ring { fill: none; stroke: var(--gam-g-concept); stroke-width: 1.4; opacity: .65; vector-effect: non-scaling-stroke; }
	.gam-gnode-ring[data-type="project"] { stroke: var(--gam-g-project); }
	.gam-gnode-ring[data-type="code"] { stroke: var(--gam-g-code); }
	.gam-gnode-ring[data-type="person"] { stroke: var(--gam-g-person); }
	.gam-gnode-ring[data-type="team"] { stroke: var(--gam-g-team); }
	.gam-gnode-ring[data-type="action"] { stroke: var(--gam-g-action); }
	.gam-gnode-ring[data-type="system"] { stroke: var(--gam-g-system); }
	.gam-gnode.is-selected .gam-gnode-ring { stroke: var(--gam-accent); stroke-width: 2; opacity: .8; }
	.gam-gnode.is-match .gam-gnode-ring { stroke-dasharray: 3 3; }
	.gam-gnode-label {
	  fill: var(--gam-text-2); font-family: var(--gam-sans); font-size: 11px;
	  paint-order: stroke; stroke: var(--gam-surface); stroke-width: 4.4px; stroke-linejoin: round;
	  pointer-events: none;
	}
	.gam-gnode.is-selected .gam-gnode-label { fill: var(--gam-text); font-weight: 650; }
	.gam-gnode.is-match .gam-gnode-label { fill: var(--gam-text); }

	.gam-gside {
	  display: flex; flex-direction: column; min-height: 0;
	  border: 1px solid var(--gam-border); border-radius: var(--gam-r-lg);
	  background: var(--gam-surface); overflow: hidden;
	}
	.gam-gside-head {
	  display: flex; align-items: center; gap: 8px; flex: none;
	  padding: 11px 13px; border-bottom: 1px solid var(--gam-border);
	  color: var(--gam-text-2); font-size: 11px; font-weight: 650;
	}
	.gam-gside-head > .gam-badge { margin-left: auto; }
	.gam-gside-headnode { align-items: flex-start; }
	.gam-gside-nodename { display: flex; align-items: flex-start; gap: 6px; min-width: 0; flex: 1; font-size: 12px; line-height: 1.45; overflow-wrap: anywhere; }
	.gam-gside-nodename .gam-gdot { margin-top: 5px; }
	.gam-gside-scroll { display: flex; flex-direction: column; gap: 12px; min-height: 0; flex: 1; overflow: auto; padding: 12px 13px 16px; }
	.gam-gside-section { display: flex; flex-direction: column; gap: 2px; }
	.gam-gside-sectiontitle {
	  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
	  font-size: 10.5px; font-weight: 650; color: var(--gam-text-3);
	  margin: 1px 0 4px;
	}
	.gam-gside-sectiontitle span { color: var(--gam-text-4); font-variant-numeric: tabular-nums; }
	.gam-gside-badges, .gam-gside-projects, .gam-gside-actions { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
	.gam-gside-actions { gap: 4px; }
	.gam-gtagbutton { background: transparent; cursor: pointer; font: inherit; color: var(--gam-text-3); }
	.gam-gtagbutton:hover { color: var(--gam-text); border-color: var(--gam-border-3); }
	.gam-gprojectrow {
	  display: flex; align-items: center; gap: 8px; width: 100%;
	  padding: 7px 4px; border: 0; border-bottom: 1px solid var(--gam-border);
	  background: transparent; color: inherit; text-align: left; cursor: pointer;
	}
	.gam-gprojectrow:last-child { border-bottom: 0; }
	.gam-gprojectrow:hover { background: var(--gam-surface-2); }
	.gam-gprojectrow-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
	.gam-gprojectrow-top { display: flex; align-items: center; gap: 5px; min-width: 0; }
	.gam-gprojectrow-name { font-size: 11.5px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-gprojectrow-meta { color: var(--gam-text-4); font-size: 10px; }
	.gam-gentityrow {
	  display: flex; align-items: center; gap: 6px; width: 100%;
	  padding: 5px 4px; border: 0; border-bottom: 1px solid var(--gam-border);
	  background: transparent; color: inherit; text-align: left; cursor: pointer;
	}
	.gam-gentityrow:last-child { border-bottom: 0; }
	.gam-gentityrow:hover { background: var(--gam-surface-2); }
	.gam-gentityrow-name { font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
	.gam-gentityrow-meta { color: var(--gam-text-4); font-size: 10px; font-variant-numeric: tabular-nums; }
	.gam-gside-hint { display: flex; align-items: flex-start; gap: 5px; margin: 0; color: var(--gam-text-4); font-size: 10.5px; line-height: 1.55; }
	.gam-gside-hint svg { flex: none; margin-top: 2px; }
	.gam-grelations { display: flex; flex-direction: column; }
	.gam-grelation {
	  display: flex; flex-direction: column; gap: 3px; width: 100%;
	  padding: 8px 4px; border: 0; border-bottom: 1px solid var(--gam-border);
	  background: transparent; color: inherit; text-align: left; cursor: pointer;
	}
	.gam-grelation:last-child { border-bottom: 0; }
	.gam-grelation:hover { background: var(--gam-surface-2); }
	.gam-grelation-line { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; font-size: 11px; }
	.gam-grelation-entity { display: inline-flex; align-items: center; gap: 4px; min-width: 0; color: var(--gam-text-2); overflow-wrap: anywhere; }
	.gam-grelation-entity.is-focus { color: var(--gam-text); font-weight: 650; }
	.gam-grelation-rel { display: flex; align-items: flex-start; gap: 5px; min-width: 0; }
	.gam-grelation-summary {
	  color: var(--gam-text-3); font-size: 10.5px; line-height: 1.45;
	  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
	}
	.gam-grelation-meta { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; color: var(--gam-text-4); font-size: 9.5px; }
	.gam-grel-badge {
	  display: inline-flex; align-items: center; padding: 0 5px; min-height: 17px;
	  border: 1px solid var(--gam-border); border-radius: var(--gam-r-xs);
	  background: var(--gam-surface-2); color: var(--gam-text-3); font-size: 9.5px; white-space: nowrap;
	}
	.gam-grel-badge[data-rel="owns"] { color: var(--gam-accent); border-color: color-mix(in srgb, var(--gam-accent) 28%, var(--gam-border)); }
	.gam-grel-badge[data-rel="depends"] { color: var(--gam-info); border-color: color-mix(in srgb, var(--gam-info) 28%, var(--gam-border)); }
	.gam-grel-badge[data-rel="uses"] { color: var(--gam-success); border-color: color-mix(in srgb, var(--gam-success) 28%, var(--gam-border)); }
	.gam-grel-badge[data-rel="supersedes"] { color: var(--gam-warn); border-color: color-mix(in srgb, var(--gam-warn) 28%, var(--gam-border)); }
	.gam-grel-badge[data-rel="conflicts"] { color: var(--gam-danger); border-color: color-mix(in srgb, var(--gam-danger) 28%, var(--gam-border)); }

	.gam-glist { display: flex; flex-direction: column; gap: 14px; }
	.gam-glistgroup { display: flex; flex-direction: column; gap: 5px; }
	.gam-glistgroup-head {
	  display: flex; align-items: center; gap: 7px; padding: 0 3px;
	  color: var(--gam-text-3); font-size: 10.5px; font-weight: 650;
	}
	.gam-glistgroup-head .gam-chipcount { margin-left: 0; }
	.gam-glistrow { align-items: flex-start; }
	.gam-glistrow-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
	.gam-glistrow-entities { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; font-size: 11.5px; }
	.gam-glist-footer {
	  display: flex; align-items: center; justify-content: space-between; gap: 10px;
	  color: var(--gam-text-4); font-size: 10.5px;
	}

	.gam-ginsights { display: flex; flex-direction: column; gap: 14px; }
	.gam-gstatgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(132px, 1fr)); gap: 10px; }
	.gam-gstat {
	  display: flex; flex-direction: column; gap: 4px; min-height: 76px; padding: 12px 14px;
	  border: 1px solid var(--gam-border); border-radius: var(--gam-r-md); background: var(--gam-surface);
	}
	.gam-gstat[data-tone="accent"] { border-color: color-mix(in srgb, var(--gam-accent) 26%, var(--gam-border)); background: color-mix(in srgb, var(--gam-accent) 5%, transparent); }
	.gam-gstat-label { color: var(--gam-text-3); font-size: 10.5px; }
	.gam-gstat-value { font-family: var(--gam-serif); font-size: 26px; font-weight: 600; line-height: 1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
	.gam-gprofilegrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; }
	.gam-gprofile {
	  display: flex; flex-direction: column; gap: 8px; min-width: 0; padding: 12px 13px;
	  border: 1px solid var(--gam-border); border-radius: var(--gam-r-md); background: var(--gam-panel);
	}
	.gam-gprofile-head { display: flex; align-items: center; gap: 6px; min-width: 0; }
	.gam-gprofile-name { font-size: 12px; font-weight: 650; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-gprofile-count { margin-left: auto; color: var(--gam-text-4); font-size: 9.5px; white-space: nowrap; font-variant-numeric: tabular-nums; }
	.gam-gtypebar { display: flex; height: 6px; border-radius: 999px; overflow: hidden; background: var(--gam-surface-3); }
	.gam-gtypebar i[data-type="project"] { background: var(--gam-g-project); }
	.gam-gtypebar i[data-type="code"] { background: var(--gam-g-code); }
	.gam-gtypebar i[data-type="person"] { background: var(--gam-g-person); }
	.gam-gtypebar i[data-type="team"] { background: var(--gam-g-team); }
	.gam-gtypebar i[data-type="action"] { background: var(--gam-g-action); }
	.gam-gtypebar i[data-type="system"] { background: var(--gam-g-system); }
	.gam-gtypebar i[data-type="concept"] { background: var(--gam-g-concept); }
	.gam-gprofile-types { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
	.gam-gprofile-types .gam-tag { font-size: 9.5px; }
	.gam-gprofile-foot { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: auto; }
	.gam-gprofile-cross { color: var(--gam-text-4); font-size: 9.5px; line-height: 1.4; }
	.gam-gmatrix-wrap { overflow: auto; }
	.gam-gmatrix { width: 100%; min-width: 620px; border-collapse: separate; border-spacing: 3px; }
	.gam-gmatrix th, .gam-gmatrix td { padding: 0; text-align: center; font-weight: 400; }
	.gam-gmatrix thead th { color: var(--gam-text-4); font-size: 9.5px; font-weight: 550; padding-bottom: 2px; }
	.gam-gmatrix tbody th {
	  position: sticky; left: 0; z-index: 1; text-align: left; min-width: 132px;
	  background: var(--gam-surface); padding-right: 6px;
	}
	.gam-gmatrix-th { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
	.gam-gmatrix-project { display: inline-flex; align-items: center; gap: 5px; max-width: 170px; font-size: 10.5px; color: var(--gam-text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-gmatrix-cell {
	  width: 100%; min-width: 34px; height: 30px; border: 1px solid transparent; border-radius: var(--gam-r-xs);
	  background: transparent; color: var(--gam-text-2); font-size: 10.5px; font-variant-numeric: tabular-nums; cursor: pointer;
	}
	.gam-gmatrix-cell:hover:not([disabled]) { border-color: var(--gam-border-3); color: var(--gam-text); }
	.gam-gmatrix-cell[disabled] { color: var(--gam-text-4); opacity: .45; cursor: default; }
	.gam-gcrosslist { display: flex; flex-direction: column; }
	.gam-gcrossrow {
	  display: flex; align-items: center; gap: 10px; width: 100%;
	  padding: 8px 2px; border: 0; border-bottom: 1px solid var(--gam-border);
	  background: transparent; color: inherit; text-align: left; cursor: pointer;
	}
	.gam-gcrossrow:last-child { border-bottom: 0; }
	.gam-gcrossrow:hover { background: var(--gam-surface-2); }
	.gam-gcrossrow-main { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
	.gam-gcrossrow-projects { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; font-size: 11px; color: var(--gam-text-2); }
	.gam-gcrossrow-rels { color: var(--gam-text-4); font-size: 9.5px; }
	.gam-gcrossrow-count { flex: none; color: var(--gam-text-3); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
	.gam-gentitygrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 4px; }
	.gam-gentitychip {
	  display: flex; align-items: center; gap: 6px; min-width: 0; padding: 6px 7px;
	  border: 1px solid transparent; border-radius: var(--gam-r-xs);
	  background: transparent; color: inherit; text-align: left; cursor: pointer;
	}
	.gam-gentitychip:hover { background: var(--gam-surface-2); border-color: var(--gam-border); }
	.gam-gentitychip-name { min-width: 0; flex: 1; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.gam-gentitychip-meta { color: var(--gam-text-4); font-size: 9.5px; font-variant-numeric: tabular-nums; }

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
	  .gam-glayout { grid-template-columns: 1fr; }
	  .gam-gside { max-height: 360px; }
	  .gam-gstage { height: 480px; }
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
	  .gam-gstage { height: 420px; min-height: 360px; }
	  .gam-gstage-top { top: 8px; left: 8px; right: 8px; align-items: flex-start; }
	  .gam-gstage-note { display: none; }
	  .gam-gzoom { top: auto; bottom: 8px; right: 8px; }
	  .gam-glegend { left: 8px; bottom: 8px; max-width: calc(100% - 132px); }
	  .gam-glegend-hint { display: none; }
	  .gam-glegend-card { max-width: min(300px, calc(100vw - 60px)); }
	  .gam-gfilters-row { grid-template-columns: 1fr; gap: 4px; }
	  .gam-gfilters-label { padding-top: 0; }
	  .gam-gstatgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	  .gam-gprofilegrid { grid-template-columns: 1fr; }
	  .gam-gsummary { font-size: 10.5px; }
	  .gam-gnotice { align-items: flex-start; flex-wrap: wrap; }
	  .gam-gnotice .gam-btn { margin-left: 25px; }
	  .gam-grelation-rel { flex-direction: column; gap: 2px; }
	}
	@media (pointer: coarse) {
	  .gam-btn, .gam-input, .gam-select, .gam-navitem, .gam-command-trigger { min-height: 40px; }
	  .gam-iconbtn { width: 40px; height: 40px; }
	  .gam-chip { min-height: 34px; }
	  .gam-gzoom .gam-iconbtn { width: 34px; height: 34px; }
	  .gam-gstage-top .gam-chip { min-height: 30px; }
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
	const IconMinus = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
		...p,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 12h14" })
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
	const IconFit = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Svg, {
		...p,
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 4H4v5M15 4h5v5M9 20H4v-5M20 15v5h-5" })
	});
	const IconFilter = (p) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Svg, {
		...p,
		children: [
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 6h16M7 12h10M10 18h4" }),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "14",
				cy: "6",
				r: "2"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "9",
				cy: "12",
				r: "2"
			}),
			/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
				cx: "12",
				cy: "18",
				r: "2"
			})
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
			const timer = window.setTimeout(() => {
				const panel = panelRef.current;
				if (!panel) return;
				if (panel.contains(document.activeElement)) return;
				panel.focus();
			}, 20);
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
	function formatRelative(value) {
		const date = parseDate(value);
		if (!date) return "—";
		const diff = date.getTime() - Date.now();
		const abs = Math.abs(diff);
		try {
			const formatter = new Intl.RelativeTimeFormat(locale(), { numeric: "auto" });
			if (abs < 6e4) return formatter.format(Math.round(diff / 1e3), "second");
			if (abs < 36e5) return formatter.format(Math.round(diff / 6e4), "minute");
			if (abs < 864e5) return formatter.format(Math.round(diff / 36e5), "hour");
			if (abs < 2592e6) return formatter.format(Math.round(diff / 864e5), "day");
			return formatDate(date);
		} catch {
			return formatDate(date);
		}
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
	//#region src/client/graph.tsx
	const UNASSIGNED_PROJECT = "__unassigned__";
	const DEFAULT_LIMIT = 800;
	const MAX_LIMIT = 3e3;
	const NODE_TYPE_ORDER = [
		"project",
		"code",
		"person",
		"team",
		"action",
		"system",
		"concept"
	];
	const REL_TYPE_ORDER = [
		"owns",
		"belongs",
		"depends",
		"uses",
		"hosts",
		"participates",
		"supersedes",
		"conflicts",
		"related"
	];
	const CONFIDENCE_ORDER = [
		"high",
		"medium",
		"low"
	];
	const TIME_RANGES = [
		0,
		7,
		30,
		90,
		365
	];
	function text(t, key, fallback) {
		const value = t(key);
		return value === key ? fallback : value;
	}
	function nodeTypeLabel(t, type) {
		return text(t, `graph.nodeType.${type}`, type);
	}
	function relTypeLabel(t, type) {
		return text(t, `graph.relType.${type}`, type);
	}
	function confidenceLabel(t, value) {
		return text(t, `graph.confidence.${value}`, value);
	}
	function sourceLabel(t, value) {
		return text(t, `graph.source.${value}`, value);
	}
	function timeLabel(t, days) {
		if (days === 0) return t("graph.timeAll");
		if (days === 365) return t("graph.timeYear");
		return interpolate(t("graph.timeDays"), { days });
	}
	function projectTone(id) {
		if (id === UNASSIGNED_PROJECT) return 6;
		let hash = 0;
		for (let i = 0; i < id.length; i++) hash = hash * 31 + id.charCodeAt(i) >>> 0;
		return hash % 6;
	}
	function hashString(value) {
		let hash = 0;
		for (let i = 0; i < value.length; i++) hash = hash * 33 + value.charCodeAt(i) >>> 0;
		return hash;
	}
	function blankFilters() {
		return {
			projects: [],
			types: [],
			rels: [],
			confidences: [],
			sources: [],
			tags: [],
			days: 0,
			crossOnly: false
		};
	}
	function toggleValue(list, value) {
		return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
	}
	function activeFilterCount(filters) {
		return filters.projects.length + filters.types.length + filters.rels.length + filters.confidences.length + filters.sources.length + filters.tags.length + (filters.days > 0 ? 1 : 0) + (filters.crossOnly ? 1 : 0);
	}
	function filterGraph(data, filters) {
		const fullNodeById = new Map(data.nodes.map((node) => [node.id, node]));
		const projectSet = new Set(filters.projects);
		const typeSet = new Set(filters.types);
		const relSet = new Set(filters.rels);
		const confidenceSet = new Set(filters.confidences);
		const sourceSet = new Set(filters.sources);
		const tagSet = new Set(filters.tags);
		const cutoff = filters.days > 0 ? Date.now() - filters.days * 864e5 : 0;
		const edges = [];
		for (const edge of data.edges) {
			if (projectSet.size > 0 && !projectSet.has(edge.project ?? UNASSIGNED_PROJECT)) continue;
			if (relSet.size > 0 && !relSet.has(edge.relType)) continue;
			if (confidenceSet.size > 0 && !confidenceSet.has(edge.confidence)) continue;
			if (sourceSet.size > 0 && !sourceSet.has(edge.source)) continue;
			if (tagSet.size > 0 && !edge.tags.some((tag) => tagSet.has(tag.toLowerCase()))) continue;
			if (filters.crossOnly && !edge.crossProject) continue;
			if (cutoff > 0) {
				const time = Date.parse(edge.createdAt);
				if (!Number.isFinite(time) || time < cutoff) continue;
			}
			if (typeSet.size > 0) {
				const fromType = fullNodeById.get(edge.from)?.type;
				const toType = fullNodeById.get(edge.to)?.type;
				if (!fromType || !toType || !typeSet.has(fromType) || !typeSet.has(toType)) continue;
			}
			edges.push(edge);
		}
		const ids = /* @__PURE__ */ new Set();
		for (const edge of edges) {
			ids.add(edge.from);
			ids.add(edge.to);
		}
		const nodes = data.nodes.filter((node) => ids.has(node.id));
		return {
			nodes,
			edges,
			nodeById: new Map(nodes.map((node) => [node.id, node]))
		};
	}
	const EMPTY_MATCH = {
		nodes: /* @__PURE__ */ new Set(),
		edges: /* @__PURE__ */ new Set(),
		reach: /* @__PURE__ */ new Set(),
		active: false,
		miss: false
	};
	function computeMatch(nodes, edges, query, projectLabel, typeLabel, relationLabel) {
		const needle = query.trim().toLowerCase();
		if (!needle) return EMPTY_MATCH;
		const matchedNodes = /* @__PURE__ */ new Set();
		const matchedEdges = /* @__PURE__ */ new Set();
		const reach = /* @__PURE__ */ new Set();
		for (const node of nodes) {
			if (!(node.id.toLowerCase().includes(needle) || typeLabel(node.type).toLowerCase().includes(needle) || node.projects.some((project) => projectLabel(project).toLowerCase().includes(needle)))) continue;
			matchedNodes.add(node.id);
			reach.add(node.id);
		}
		for (const edge of edges) {
			if (!(edge.rel.toLowerCase().includes(needle) || edge.summary.toLowerCase().includes(needle) || relationLabel(edge.relType).toLowerCase().includes(needle) || edge.tags.some((tag) => tag.toLowerCase().includes(needle)))) continue;
			matchedEdges.add(edge.id);
			reach.add(edge.from);
			reach.add(edge.to);
		}
		const active = matchedNodes.size > 0 || matchedEdges.size > 0;
		return {
			nodes: matchedNodes,
			edges: matchedEdges,
			reach,
			active,
			miss: !active
		};
	}
	function facetWithSelected(facets, selected) {
		const seen = new Set(facets.map((facet) => facet.id));
		const extra = selected.filter((id) => !seen.has(id)).map((id) => ({
			id,
			label: id,
			count: 0
		}));
		return extra.length > 0 ? [...facets, ...extra] : facets;
	}
	function nodeRadius(degree) {
		return 6 + Math.min(13, Math.sqrt(Math.max(0, degree)) * 2.7);
	}
	function boxesOverlap(a, b) {
		return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
	}
	/** 估算标签宽度：CJK 按字号，拉丁按 0.58 字号；用于标签避让，不追求像素级精确。 */
	function estimateTextWidth(text, fontSize) {
		let width = 0;
		for (const char of text) width += /[\u3000-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(char) ? fontSize : fontSize * .58;
		return width;
	}
	function boundsOfPositions(nodes, positions) {
		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;
		for (const node of nodes) {
			const point = positions.get(node.id);
			if (!point) continue;
			const pad = nodeRadius(node.degree) + 34;
			minX = Math.min(minX, point.x - pad);
			minY = Math.min(minY, point.y - pad);
			maxX = Math.max(maxX, point.x + pad);
			maxY = Math.max(maxY, point.y + pad);
		}
		if (!Number.isFinite(minX)) return {
			minX: 0,
			minY: 0,
			maxX: 0,
			maxY: 0
		};
		return {
			minX,
			minY,
			maxX,
			maxY
		};
	}
	function layoutBounds(layout, nodes) {
		if (layout.groups.length === 0) return boundsOfPositions(nodes, layout.positions);
		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;
		for (const group of layout.groups) {
			minX = Math.min(minX, group.x);
			minY = Math.min(minY, group.y);
			maxX = Math.max(maxX, group.x + group.width);
			maxY = Math.max(maxY, group.y + group.height);
		}
		return {
			minX: minX - 8,
			minY: minY - 8,
			maxX: maxX + 8,
			maxY: maxY + 8
		};
	}
	function makeQuad(x0, y0, x1, y1) {
		return {
			x0,
			y0,
			x1,
			y1,
			mass: 0,
			cx: 0,
			cy: 0,
			point: null,
			bucket: null,
			children: null
		};
	}
	function childIndex(quad, point) {
		const midX = (quad.x0 + quad.x1) / 2;
		const midY = (quad.y0 + quad.y1) / 2;
		return (point.x >= midX ? 1 : 0) + (point.y >= midY ? 2 : 0);
	}
	function subdivide(quad) {
		const midX = (quad.x0 + quad.x1) / 2;
		const midY = (quad.y0 + quad.y1) / 2;
		return [
			makeQuad(quad.x0, quad.y0, midX, midY),
			makeQuad(midX, quad.y0, quad.x1, midY),
			makeQuad(quad.x0, midY, midX, quad.y1),
			makeQuad(midX, midY, quad.x1, quad.y1)
		];
	}
	function insertPoint(quad, point, depth = 0) {
		if (depth > 28) {
			if (quad.point) {
				quad.bucket = [quad.point];
				quad.point = null;
			}
			quad.bucket = quad.bucket ?? [];
			quad.bucket.push(point);
			const mass = quad.mass + 1;
			quad.cx = (quad.cx * quad.mass + point.x) / mass;
			quad.cy = (quad.cy * quad.mass + point.y) / mass;
			quad.mass = mass;
			return;
		}
		if (!quad.children && quad.bucket) {
			quad.bucket.push(point);
			const mass = quad.mass + 1;
			quad.cx = (quad.cx * quad.mass + point.x) / mass;
			quad.cy = (quad.cy * quad.mass + point.y) / mass;
			quad.mass = mass;
			return;
		}
		if (!quad.children && quad.point === null && quad.bucket === null) {
			quad.point = point;
			quad.mass = 1;
			quad.cx = point.x;
			quad.cy = point.y;
			return;
		}
		if (!quad.children && quad.point) {
			const old = quad.point;
			if (old.x === point.x && old.y === point.y) {
				point.x += .01;
				point.y += .01;
			}
			quad.point = null;
			quad.children = subdivide(quad);
			insertPoint(quad.children[childIndex(quad, old)], old, depth + 1);
		}
		if (!quad.children) return;
		insertPoint(quad.children[childIndex(quad, point)], point, depth + 1);
		const mass = quad.mass + 1;
		quad.cx = (quad.cx * quad.mass + point.x) / mass;
		quad.cy = (quad.cy * quad.mass + point.y) / mass;
		quad.mass = mass;
	}
	function applyRepulsion(quad, point, k2, theta) {
		if (quad.mass === 0) return;
		if (!quad.children) {
			const others = quad.bucket ?? (quad.point ? [quad.point] : []);
			for (const other of others) {
				if (other === point) continue;
				let dx = point.x - other.x;
				let dy = point.y - other.y;
				let d2 = dx * dx + dy * dy;
				if (d2 < .01) {
					dx = .1;
					dy = .1;
					d2 = .02;
				}
				const dist = Math.sqrt(d2);
				const force = k2 / dist;
				point.dx += dx / dist * force;
				point.dy += dy / dist * force;
			}
			return;
		}
		const dx = point.x - quad.cx;
		const dy = point.y - quad.cy;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const size = quad.x1 - quad.x0;
		if (dist > 0 && size / dist < theta) {
			const safe = Math.max(.5, dist);
			const force = k2 * quad.mass / safe;
			point.dx += dx / safe * force;
			point.dy += dy / safe * force;
			return;
		}
		for (const child of quad.children) applyRepulsion(child, point, k2, theta);
	}
	function noise(index) {
		const value = Math.sin(index * 127.1 + 311.7) * 43758.5453;
		return (value - Math.floor(value)) * 2 - 1;
	}
	function forceLayout(nodes, edges, width, height) {
		if (nodes.length === 0) return {
			positions: /* @__PURE__ */ new Map(),
			groups: []
		};
		const ordered = [...nodes].sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id));
		const k = Math.max(28, Math.sqrt(Math.max(1, width * height) / Math.max(1, nodes.length)) * .55);
		const points = ordered.map((node, index) => {
			const angle = index * 2.399963229728653;
			const radius = index === 0 ? 0 : k * .42 * Math.sqrt(index);
			return {
				id: node.id,
				degree: node.degree,
				x: Math.cos(angle) * radius + noise(index) * 3,
				y: Math.sin(angle) * radius + noise(index + 17) * 3,
				dx: 0,
				dy: 0
			};
		});
		const byId = new Map(points.map((point) => [point.id, point]));
		const iterations = points.length <= 80 ? 220 : points.length <= 250 ? 160 : points.length <= 600 ? 110 : 80;
		let temperature = k * .55;
		const cooling = temperature / (iterations + 1);
		for (let iteration = 0; iteration < iterations; iteration++) {
			for (const point of points) {
				point.dx = 0;
				point.dy = 0;
			}
			let minX = Number.POSITIVE_INFINITY;
			let minY = Number.POSITIVE_INFINITY;
			let maxX = Number.NEGATIVE_INFINITY;
			let maxY = Number.NEGATIVE_INFINITY;
			for (const point of points) {
				minX = Math.min(minX, point.x);
				minY = Math.min(minY, point.y);
				maxX = Math.max(maxX, point.x);
				maxY = Math.max(maxY, point.y);
			}
			const root = makeQuad(minX - 1, minY - 1, maxX + 1, maxY + 1);
			for (const point of points) insertPoint(root, point);
			for (const point of points) applyRepulsion(root, point, k * k, .9);
			for (const edge of edges) {
				const from = byId.get(edge.from);
				const to = byId.get(edge.to);
				if (!from || !to || from === to) continue;
				const dx = to.x - from.x;
				const dy = to.y - from.y;
				const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
				const force = dist * dist / k;
				const fx = dx / dist * force;
				const fy = dy / dist * force;
				from.dx += fx;
				from.dy += fy;
				to.dx -= fx;
				to.dy -= fy;
			}
			for (const point of points) {
				point.dx -= point.x * .012;
				point.dy -= point.y * .012;
				const length = Math.sqrt(point.dx * point.dx + point.dy * point.dy);
				if (length < .001) continue;
				const step = Math.min(length, temperature);
				point.x += point.dx / length * step;
				point.y += point.dy / length * step;
			}
			temperature -= cooling;
		}
		let minX = Number.POSITIVE_INFINITY;
		let minY = Number.POSITIVE_INFINITY;
		let maxX = Number.NEGATIVE_INFINITY;
		let maxY = Number.NEGATIVE_INFINITY;
		for (const point of points) {
			minX = Math.min(minX, point.x);
			minY = Math.min(minY, point.y);
			maxX = Math.max(maxX, point.x);
			maxY = Math.max(maxY, point.y);
		}
		const extent = Math.max(maxX - minX, maxY - minY);
		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;
		const target = Math.max(420, Math.sqrt(points.length) * 130);
		const scale = extent > .5 ? target / extent : 1;
		const positions = /* @__PURE__ */ new Map();
		for (const point of points) positions.set(point.id, {
			x: (point.x - centerX) * scale,
			y: (point.y - centerY) * scale
		});
		return {
			positions,
			groups: []
		};
	}
	function clusterLayout(nodes, mode) {
		if (nodes.length === 0) return {
			positions: /* @__PURE__ */ new Map(),
			groups: []
		};
		const groups = /* @__PURE__ */ new Map();
		for (const node of nodes) {
			const key = mode === "project" ? node.projects[0] ?? UNASSIGNED_PROJECT : node.type;
			const list = groups.get(key) ?? [];
			list.push(node);
			groups.set(key, list);
		}
		const items = [...groups.entries()].map(([id, list]) => {
			const ordered = [...list].sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id));
			const angleOffset = hashString(id) % 360 * Math.PI / 180;
			const local = ordered.map((node, index) => {
				if (index === 0) return {
					node,
					x: 0,
					y: 0
				};
				const angle = index * 2.399963229728653 + angleOffset;
				const radius = 32 + 27 * Math.sqrt(index);
				return {
					node,
					x: Math.cos(angle) * radius,
					y: Math.sin(angle) * radius
				};
			});
			let minX = Number.POSITIVE_INFINITY;
			let minY = Number.POSITIVE_INFINITY;
			let maxX = Number.NEGATIVE_INFINITY;
			let maxY = Number.NEGATIVE_INFINITY;
			for (const point of local) {
				minX = Math.min(minX, point.x);
				minY = Math.min(minY, point.y);
				maxX = Math.max(maxX, point.x);
				maxY = Math.max(maxY, point.y);
			}
			const contentWidth = maxX - minX;
			const contentHeight = maxY - minY;
			const width = Math.max(200, contentWidth + 84);
			const height = Math.max(140, contentHeight + 58 + 34);
			const shifted = local.map((point) => ({
				id: point.node.id,
				x: point.x - minX + (width - contentWidth) / 2,
				y: point.y - minY + 58
			}));
			return {
				id,
				width,
				height,
				ids: ordered.map((node) => node.id),
				local: shifted,
				gx: 0,
				gy: 0
			};
		}).sort((a, b) => b.ids.length - a.ids.length || a.id.localeCompare(b.id));
		const gap = 28;
		const area = items.reduce((sum, item) => sum + item.width * item.height, 0);
		const targetWidth = Math.max(560, Math.sqrt(Math.max(1, area)) * 1.45);
		let cursorX = 0;
		let cursorY = 0;
		let rowHeight = 0;
		for (const item of items) {
			if (cursorX > 0 && cursorX + item.width > targetWidth) {
				cursorX = 0;
				cursorY += rowHeight + gap;
				rowHeight = 0;
			}
			item.gx = cursorX;
			item.gy = cursorY;
			cursorX += item.width + gap;
			rowHeight = Math.max(rowHeight, item.height);
		}
		const totalWidth = Math.max(...items.map((item) => item.gx + item.width));
		const totalHeight = Math.max(...items.map((item) => item.gy + item.height));
		const offsetX = -totalWidth / 2;
		const offsetY = -totalHeight / 2;
		const positions = /* @__PURE__ */ new Map();
		const boxes = [];
		for (const item of items) {
			boxes.push({
				id: item.id,
				x: item.gx + offsetX,
				y: item.gy + offsetY,
				width: item.width,
				height: item.height,
				count: item.ids.length,
				ids: item.ids
			});
			for (const point of item.local) positions.set(point.id, {
				x: item.gx + offsetX + point.x,
				y: item.gy + offsetY + point.y
			});
		}
		return {
			positions,
			groups: boxes
		};
	}
	function buildLayout(mode, nodes, edges, width, height) {
		return mode === "force" ? forceLayout(nodes, edges, width, height) : clusterLayout(nodes, mode);
	}
	function emptyTypeCounts() {
		return {
			project: 0,
			code: 0,
			person: 0,
			team: 0,
			action: 0,
			system: 0,
			concept: 0
		};
	}
	function aggregateProjects(nodes, edges, projectLabel) {
		const nodeById = new Map(nodes.map((node) => [node.id, node]));
		const aggregates = /* @__PURE__ */ new Map();
		const neighborCounts = /* @__PURE__ */ new Map();
		const ensure = (id) => {
			const existing = aggregates.get(id);
			if (existing) return existing;
			const created = {
				id,
				label: projectLabel(id),
				nodes: 0,
				edges: 0,
				crossEdges: 0,
				types: emptyTypeCounts(),
				neighbors: [],
				lastSeen: ""
			};
			aggregates.set(id, created);
			neighborCounts.set(id, /* @__PURE__ */ new Map());
			return created;
		};
		const primaryOf = (nodeId) => nodeById.get(nodeId)?.projects[0];
		for (const node of nodes) {
			const aggregate = ensure(node.projects[0] ?? UNASSIGNED_PROJECT);
			aggregate.nodes += 1;
			aggregate.types[node.type] += 1;
			if (node.lastSeen > aggregate.lastSeen) aggregate.lastSeen = node.lastSeen;
		}
		for (const edge of edges) {
			const aggregate = ensure(edge.project ?? UNASSIGNED_PROJECT);
			aggregate.edges += 1;
			if (edge.createdAt > aggregate.lastSeen) aggregate.lastSeen = edge.createdAt;
			if (!edge.crossProject) continue;
			const fromProject = primaryOf(edge.from);
			const toProject = primaryOf(edge.to);
			if (!fromProject || !toProject || fromProject === toProject) continue;
			ensure(fromProject).crossEdges += 1;
			ensure(toProject).crossEdges += 1;
			const fromNeighbors = neighborCounts.get(fromProject);
			const toNeighbors = neighborCounts.get(toProject);
			if (fromNeighbors) fromNeighbors.set(toProject, (fromNeighbors.get(toProject) ?? 0) + 1);
			if (toNeighbors) toNeighbors.set(fromProject, (toNeighbors.get(fromProject) ?? 0) + 1);
		}
		for (const aggregate of aggregates.values()) {
			const counts = neighborCounts.get(aggregate.id);
			if (!counts) continue;
			aggregate.neighbors = [...counts.entries()].map(([id, count]) => ({
				id,
				count
			})).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
		}
		return [...aggregates.values()].sort((a, b) => b.edges - a.edges || b.nodes - a.nodes || a.label.localeCompare(b.label));
	}
	function crossLinks(nodes, edges) {
		const nodeById = new Map(nodes.map((node) => [node.id, node]));
		const map = /* @__PURE__ */ new Map();
		for (const edge of edges) {
			if (!edge.crossProject) continue;
			const from = nodeById.get(edge.from)?.projects[0];
			const to = nodeById.get(edge.to)?.projects[0];
			if (!from || !to || from === to) continue;
			const key = `${from}\u0000${to}`;
			const current = map.get(key) ?? {
				from,
				to,
				count: 0,
				rels: /* @__PURE__ */ new Set()
			};
			current.count += 1;
			current.rels.add(edge.relType);
			map.set(key, current);
		}
		return [...map.values()].map((link) => ({
			from: link.from,
			to: link.to,
			count: link.count,
			rels: [...link.rels]
		})).sort((a, b) => b.count - a.count || a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
	}
	function mermaidOf(nodes, edges) {
		if (nodes.length === 0 || edges.length === 0) return "";
		const index = new Map(nodes.map((node, i) => [node.id, `n${i}`]));
		const escape = (value) => value.replace(/"/g, "'").replace(/\|/g, "/").replace(/\s+/g, " ").trim();
		const lines = ["graph LR"];
		for (const node of nodes) lines.push(`  ${index.get(node.id)}["${escape(node.id)}"]`);
		for (const edge of edges) {
			const from = index.get(edge.from);
			const to = index.get(edge.to);
			if (!from || !to) continue;
			lines.push(`  ${from} -->|${escape(edge.rel)}| ${to}`);
		}
		return lines.join("\n");
	}
	function GraphView(props) {
		const t = props.t;
		const [data, setData] = (0, react.useState)(null);
		const [loading, setLoading] = (0, react.useState)(true);
		const [error, setError] = (0, react.useState)(null);
		const [limit, setLimit] = (0, react.useState)(DEFAULT_LIMIT);
		const [reload, setReload] = (0, react.useState)(0);
		const [viewMode, setViewMode] = (0, react.useState)("graph");
		const [layoutMode, setLayoutMode] = (0, react.useState)("force");
		const [filters, setFilters] = (0, react.useState)(blankFilters);
		const [filterOpen, setFilterOpen] = (0, react.useState)(false);
		const [search, setSearch] = (0, react.useState)("");
		const [selected, setSelected] = (0, react.useState)(null);
		const [isolate, setIsolate] = (0, react.useState)(false);
		const [focusTarget, setFocusTarget] = (0, react.useState)(null);
		const [focusToken, setFocusToken] = (0, react.useState)(0);
		const [listGroup, setListGroup] = (0, react.useState)("project");
		const autoGrouped = (0, react.useRef)(false);
		(0, react.useEffect)(() => {
			let alive = true;
			setLoading(true);
			api.graph(limit).then((result) => {
				if (!alive) return;
				setData(result);
				setError(null);
			}).catch((cause) => {
				if (alive) setError(cause.message);
			}).finally(() => {
				if (alive) setLoading(false);
			});
			return () => {
				alive = false;
			};
		}, [
			limit,
			props.version,
			reload
		]);
		(0, react.useEffect)(() => {
			if (!data || autoGrouped.current) return;
			if (data.projects.filter((project) => project.id !== UNASSIGNED_PROJECT).length < 2) return;
			autoGrouped.current = true;
			setLayoutMode("project");
			props.toast(data.nodes.length > 240 ? t("graph.autoGrouped") : t("graph.defaultProject"), "neutral");
		}, [
			data,
			props,
			t
		]);
		const projectLabelMap = (0, react.useMemo)(() => {
			const map = /* @__PURE__ */ new Map();
			for (const project of data?.projects ?? []) map.set(project.id, project.label);
			return map;
		}, [data]);
		const projectLabel = (0, react.useCallback)((id) => id === UNASSIGNED_PROJECT ? t("graph.unassigned") : projectLabelMap.get(id) ?? id, [projectLabelMap, t]);
		const typeLabel = (0, react.useCallback)((type) => nodeTypeLabel(t, type), [t]);
		const relationLabel = (0, react.useCallback)((type) => relTypeLabel(t, type), [t]);
		const filtered = (0, react.useMemo)(() => data ? filterGraph(data, filters) : {
			nodes: [],
			edges: [],
			nodeById: /* @__PURE__ */ new Map()
		}, [data, filters]);
		const match = (0, react.useMemo)(() => computeMatch(filtered.nodes, filtered.edges, search, projectLabel, typeLabel, relationLabel), [
			filtered,
			search,
			projectLabel,
			typeLabel,
			relationLabel
		]);
		const focusEdges = (0, react.useMemo)(() => {
			if (!isolate || !selected) return filtered.edges;
			return filtered.edges.filter((edge) => edge.from === selected || edge.to === selected);
		}, [
			filtered.edges,
			isolate,
			selected
		]);
		const focusNodeIds = (0, react.useMemo)(() => {
			const ids = /* @__PURE__ */ new Set();
			for (const edge of focusEdges) {
				ids.add(edge.from);
				ids.add(edge.to);
			}
			return ids;
		}, [focusEdges]);
		const graphNodes = (0, react.useMemo)(() => isolate && selected ? filtered.nodes.filter((node) => focusNodeIds.has(node.id)) : filtered.nodes, [
			filtered.nodes,
			focusNodeIds,
			isolate,
			selected
		]);
		(0, react.useEffect)(() => {
			if (selected && !filtered.nodeById.has(selected)) {
				setSelected(null);
				setIsolate(false);
			}
		}, [filtered.nodeById, selected]);
		(0, react.useEffect)(() => {
			if (viewMode !== "graph") setIsolate(false);
		}, [viewMode]);
		const selectNode = (0, react.useCallback)((id) => {
			setSelected(id);
			if (id === null) setIsolate(false);
		}, []);
		const locateNode = (0, react.useCallback)((id) => {
			setSelected(id);
			setIsolate(false);
			setFocusTarget(id);
			setFocusToken((value) => value + 1);
		}, []);
		const resetFilters = (0, react.useCallback)(() => setFilters(blankFilters()), []);
		const applyProjectFilter = (0, react.useCallback)((id) => {
			setFilters({
				...blankFilters(),
				projects: [id]
			});
			setSelected(null);
			setIsolate(false);
			setViewMode("graph");
		}, []);
		const applyCellFilter = (0, react.useCallback)((project, type) => {
			setFilters({
				...blankFilters(),
				projects: [project],
				types: [type]
			});
			setSelected(null);
			setIsolate(false);
			setViewMode("graph");
		}, []);
		const applyCrossLink = (0, react.useCallback)((from, to) => {
			setFilters({
				...blankFilters(),
				projects: [from, to],
				crossOnly: true
			});
			setSelected(null);
			setIsolate(false);
			setLayoutMode("project");
			setViewMode("graph");
			autoGrouped.current = true;
		}, []);
		const groupFilter = (0, react.useCallback)((id) => {
			if (layoutMode === "project") applyProjectFilter(id);
			else {
				setFilters({
					...blankFilters(),
					types: [id]
				});
				setSelected(null);
				setIsolate(false);
			}
		}, [applyProjectFilter, layoutMode]);
		const submitSearch = (0, react.useCallback)(() => {
			if (!match.active) {
				props.toast(t("graph.noMatch"), "warn");
				return;
			}
			const best = [...match.reach].map((id) => filtered.nodeById.get(id)).filter((node) => node !== void 0).sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id))[0];
			if (!best) {
				props.toast(t("graph.noMatch"), "warn");
				return;
			}
			setViewMode("graph");
			locateNode(best.id);
		}, [
			filtered.nodeById,
			locateNode,
			match,
			props,
			t
		]);
		const visibleEdges = (0, react.useMemo)(() => {
			if (viewMode !== "list" || !search.trim()) return filtered.edges;
			if (!match.active) return [];
			return filtered.edges.filter((edge) => match.edges.has(edge.id) || match.nodes.has(edge.from) || match.nodes.has(edge.to));
		}, [
			filtered.edges,
			match,
			search,
			viewMode
		]);
		const confidenceCounts = (0, react.useMemo)(() => {
			const counts = {
				high: 0,
				medium: 0,
				low: 0
			};
			for (const edge of data?.edges ?? []) counts[edge.confidence] += 1;
			return counts;
		}, [data]);
		const mermaid = (0, react.useMemo)(() => mermaidOf(graphNodes, focusEdges), [graphNodes, focusEdges]);
		const counts = data?.total ?? {
			nodes: 0,
			edges: 0,
			relations: 0,
			relationsShown: 0,
			projects: 0
		};
		const filterCount = activeFilterCount(filters);
		const noVisible = (data?.edges.length ?? 0) > 0 && filtered.edges.length === 0;
		const visibleProjectCount = (0, react.useMemo)(() => {
			const ids = /* @__PURE__ */ new Set();
			for (const edge of filtered.edges) ids.add(edge.project ?? UNASSIGNED_PROJECT);
			return ids.size;
		}, [filtered.edges]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-page",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PageHeader, {
					eyebrow: t("nav.groupSystem"),
					title: t("nav.graph"),
					description: t("graph.desc"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, { children: [
							formatNumber(counts.nodes),
							" ",
							t("graph.nodes")
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, { children: [
							formatNumber(counts.edges),
							" ",
							t("graph.edges")
						] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, { children: [
							formatNumber(counts.projects),
							" ",
							t("graph.projects")
						] }),
						mermaid ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CopyButton, {
							text: mermaid,
							label: t("graph.copyMermaid"),
							copiedLabel: t("common.copied"),
							onCopied: (ok) => {
								if (!ok) props.toast(t("common.copyFailed"), "danger");
							}
						}) : null,
						loading && data ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "gam-grefreshing",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Spinner, {}),
								" ",
								t("graph.refreshing")
							]
						}) : null
					] })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-toolbar",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchInput, {
							value: search,
							onChange: setSearch,
							placeholder: t("graph.searchPlaceholder"),
							"aria-label": t("graph.searchPlaceholder"),
							clearLabel: t("common.clear"),
							onKeyDown: (event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									submitSearch();
								}
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: filterOpen ? "secondary" : "ghost",
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconFilter, { size: 13 }),
							"aria-expanded": filterOpen,
							onClick: () => setFilterOpen((value) => !value),
							children: [t("graph.filters"), filterCount > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gfcount",
								children: filterCount
							}) : null]
						}),
						search ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: cx("gam-gmatchinfo", match.miss && "is-miss"),
							children: match.miss ? t("graph.noMatch") : interpolate(t("graph.matchInfo"), {
								nodes: match.nodes.size,
								edges: match.edges.size
							})
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "gam-spacer" }),
						viewMode === "list" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SelectField, {
							value: listGroup,
							onChange: (value) => setListGroup(value),
							options: [
								{
									value: "project",
									label: t("graph.groupProject")
								},
								{
									value: "relation",
									label: t("graph.groupRelation")
								},
								{
									value: "confidence",
									label: t("graph.groupConfidence")
								},
								{
									value: "none",
									label: t("graph.groupNone")
								}
							],
							"aria-label": t("graph.groupBy")
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Segmented, {
							value: viewMode,
							onChange: setViewMode,
							ariaLabel: t("graph.mode"),
							options: [
								{
									value: "graph",
									label: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconGraphView, { size: 13 }),
										" ",
										t("graph.graphMode")
									] })
								},
								{
									value: "list",
									label: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconList, { size: 13 }),
										" ",
										t("graph.listMode")
									] })
								},
								{
									value: "insight",
									label: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconSparkle, { size: 13 }),
										" ",
										t("graph.insightMode")
									] })
								}
							]
						})
					]
				}),
				filterOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphFilterPanel, {
					t,
					data,
					filters,
					confidenceCounts,
					projectLabel,
					onChange: (patch) => setFilters((previous) => ({
						...previous,
						...patch
					})),
					onReset: resetFilters
				}) : filterCount > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphActiveFilters, {
					t,
					filters,
					data,
					projectLabel,
					onChange: (patch) => setFilters((previous) => ({
						...previous,
						...patch
					})),
					onReset: resetFilters
				}) : null,
				error && data ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gnotice",
					"data-tone": "danger",
					role: "alert",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconInfo, { size: 15 }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gnotice-main",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: t("graph.refreshFailed") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: error })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 13 }),
							onClick: () => setReload((value) => value + 1),
							children: t("panel.retry")
						})
					]
				}) : null,
				data?.truncated ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gnotice",
					"data-tone": "info",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconInfo, { size: 15 }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gnotice-main",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: t("graph.truncatedTitle") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: interpolate(t("graph.truncatedDesc"), {
								shown: formatNumber(data.total.relationsShown),
								total: formatNumber(data.total.relations)
							}) })]
						}),
						data.limit < MAX_LIMIT ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
							size: "sm",
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlus, { size: 13 }),
							onClick: () => {
								const next = Math.min(MAX_LIMIT, Math.max(DEFAULT_LIMIT, limit * 2));
								setLimit(next);
								props.toast(interpolate(t("graph.loadMoreToast"), { limit: formatNumber(next) }), "neutral");
							},
							children: t("graph.loadMore")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-gnotice-note",
							children: t("graph.limitReached")
						})
					]
				}) : null,
				loading && !data ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkeletonList, { rows: 5 }) : error && !data ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorState, {
					title: t("graph.loadFailed"),
					message: error,
					retryLabel: t("panel.retry"),
					onRetry: () => setReload((value) => value + 1)
				}) : !data || data.edges.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconGraph, { size: 20 }),
					title: t("graph.empty"),
					description: t("graph.emptyDesc"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "primary",
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconArrowRight, { size: 13 }),
						onClick: () => props.onNavigate("import"),
						children: t("graph.goImport")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconRefresh, { size: 13 }),
						onClick: () => setReload((value) => value + 1),
						children: t("graph.refresh")
					})] })
				}) : noVisible ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconFilter, { size: 20 }),
					title: t("graph.filteredEmpty"),
					description: t("graph.filteredEmptyDesc"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "primary",
						onClick: () => {
							resetFilters();
							setSearch("");
						},
						children: t("graph.clearAll")
					})
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gsummary",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: filterCount > 0 || search ? interpolate(t("graph.visibleSummary"), {
							nodes: formatNumber(graphNodes.length),
							edges: formatNumber(focusEdges.length),
							totalNodes: formatNumber(counts.nodes),
							totalEdges: formatNumber(counts.edges)
						}) : interpolate(t("graph.totalSummary"), {
							nodes: formatNumber(graphNodes.length),
							edges: formatNumber(focusEdges.length)
						}) }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-dotsep",
							children: "·"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: interpolate(t("graph.projectSummary"), { projects: formatNumber(visibleProjectCount) }) }),
						match.active ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-dotsep",
							children: "·"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "gam-gsummary-match",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCheck, { size: 12 }),
								" ",
								interpolate(t("graph.searchActive"), { count: match.nodes.size + match.edges.size })
							]
						})] }) : null,
						search && match.miss ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-dotsep",
							children: "·"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gam-gsummary-match is-miss",
							children: t("graph.noMatch")
						})] }) : null
					]
				}), viewMode === "graph" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-glayout",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-gcanvascol",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphCanvas, {
							t,
							nodes: graphNodes,
							edges: focusEdges,
							layoutMode,
							onLayoutMode: setLayoutMode,
							selected,
							onSelect: selectNode,
							onOpen: props.onOpen,
							onGroupSelect: groupFilter,
							projectLabel,
							match,
							focusTarget,
							focusToken,
							layoutNote: isolate ? t("graph.isolateHint") : void 0
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphSide, {
						t,
						selected,
						node: selected ? filtered.nodeById.get(selected) : void 0,
						nodes: graphNodes,
						edges: filtered.edges,
						nodeById: filtered.nodeById,
						projectLabel,
						onOpen: props.onOpen,
						onSelect: selectNode,
						onLocate: locateNode,
						onFilterProject: applyProjectFilter,
						isolate,
						onIsolate: setIsolate,
						toast: props.toast
					})]
				}) : viewMode === "list" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphList, {
					t,
					edges: visibleEdges,
					nodeById: filtered.nodeById,
					projectLabel,
					groupBy: listGroup,
					onOpen: props.onOpen,
					onClearSearch: () => setSearch(""),
					hasSearch: Boolean(search)
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphInsights, {
					t,
					nodes: graphNodes,
					edges: focusEdges,
					projectLabel,
					onProject: applyProjectFilter,
					onCell: applyCellFilter,
					onCrossLink: applyCrossLink,
					onEntity: locateNode
				})] })
			]
		});
	}
	function GraphFilterPanel(props) {
		const t = props.t;
		const data = props.data;
		const projects = facetWithSelected(data?.projects ?? [], props.filters.projects);
		const types = facetWithSelected(data?.nodeTypes ?? [], props.filters.types);
		const rels = facetWithSelected(data?.relTypes ?? [], props.filters.rels);
		const sources = facetWithSelected(data?.sources ?? [], props.filters.sources);
		const tags = facetWithSelected(data?.tags ?? [], props.filters.tags);
		const count = activeFilterCount(props.filters);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
			className: "gam-gfilters",
			"aria-label": t("graph.filters"),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gfilters-head",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("graph.filters") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("graph.filtersHint") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: props.onReset,
						disabled: count === 0,
						children: t("graph.clearFilters")
					})]
				}),
				projects.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gfilters-row",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-gfilters-label",
						children: t("graph.project")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-chiprow",
						children: projects.map((project) => {
							const active = props.filters.projects.includes(project.id);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cx("gam-chip", "gam-gfacet", active && "is-active"),
								"aria-pressed": active,
								onClick: () => props.onChange({ projects: toggleValue(props.filters.projects, project.id) }),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
										className: "gam-gdot",
										"data-tone": projectTone(project.id)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-gfacet-label",
										children: project.id === UNASSIGNED_PROJECT ? t("graph.unassigned") : project.label
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-chipcount",
										children: project.count
									})
								]
							}, project.id);
						})
					})]
				}) : null,
				types.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gfilters-row",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-gfilters-label",
						children: t("graph.entityType")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-chiprow",
						children: types.map((facet) => {
							const type = facet.id;
							const active = props.filters.types.includes(type);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cx("gam-chip", "gam-gfacet", active && "is-active"),
								"aria-pressed": active,
								onClick: () => props.onChange({ types: toggleValue(props.filters.types, type) }),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
										className: "gam-gdot",
										"data-type": type
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: nodeTypeLabel(t, type) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-chipcount",
										children: facet.count
									})
								]
							}, type);
						})
					})]
				}) : null,
				rels.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gfilters-row",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-gfilters-label",
						children: t("graph.relationType")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-chiprow",
						children: rels.map((facet) => {
							const type = facet.id;
							const active = props.filters.rels.includes(type);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cx("gam-chip", active && "is-active"),
								"aria-pressed": active,
								onClick: () => props.onChange({ rels: toggleValue(props.filters.rels, type) }),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
										className: "gam-gdot",
										"data-rel": type
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: relTypeLabel(t, type) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-chipcount",
										children: facet.count
									})
								]
							}, type);
						})
					})]
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gfilters-row",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-gfilters-label",
						children: t("graph.confidenceLevel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-chiprow",
						children: CONFIDENCE_ORDER.map((value) => {
							const active = props.filters.confidences.includes(value);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cx("gam-chip", active && "is-active"),
								"aria-pressed": active,
								onClick: () => props.onChange({ confidences: toggleValue(props.filters.confidences, value) }),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
										className: "gam-gdot",
										"data-confidence": value
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: confidenceLabel(t, value) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-chipcount",
										children: props.confidenceCounts[value]
									})
								]
							}, value);
						})
					})]
				}),
				sources.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gfilters-row",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-gfilters-label",
						children: t("graph.sourceType")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-chiprow",
						children: sources.map((facet) => {
							const active = props.filters.sources.includes(facet.id);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cx("gam-chip", active && "is-active"),
								"aria-pressed": active,
								onClick: () => props.onChange({ sources: toggleValue(props.filters.sources, facet.id) }),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: sourceLabel(t, facet.id) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-chipcount",
									children: facet.count
								})]
							}, facet.id);
						})
					})]
				}) : null,
				tags.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gfilters-row",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-gfilters-label",
						children: t("graph.tags")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-chiprow gam-gtagrow",
						children: tags.map((facet) => {
							const active = props.filters.tags.includes(facet.id);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: cx("gam-chip", active && "is-active"),
								"aria-pressed": active,
								onClick: () => props.onChange({ tags: toggleValue(props.filters.tags, facet.id) }),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: facet.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-chipcount",
									children: facet.count
								})]
							}, facet.id);
						})
					})]
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gfilters-row",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-gfilters-label",
						children: t("graph.time")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-chiprow",
						children: [TIME_RANGES.map((days) => {
							const active = props.filters.days === days;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: cx("gam-chip", active && "is-active"),
								"aria-pressed": active,
								onClick: () => props.onChange({ days }),
								children: timeLabel(t, days)
							}, days);
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: cx("gam-chip", props.filters.crossOnly && "is-active"),
							"aria-pressed": props.filters.crossOnly,
							onClick: () => props.onChange({ crossOnly: !props.filters.crossOnly }),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconArrowRight, { size: 12 }), t("graph.crossOnly")]
						})]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					className: "gam-gfilters-note",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconInfo, { size: 12 }),
						" ",
						t("graph.heuristicNote"),
						data?.truncated ? ` ${t("graph.facetTruncated")}` : ""
					]
				})
			]
		});
	}
	function GraphActiveFilters(props) {
		const t = props.t;
		const tagLabels = new Map((props.data?.tags ?? []).map((facet) => [facet.id, facet.label]));
		const chips = [];
		for (const id of props.filters.projects) chips.push({
			key: `p:${id}`,
			label: props.projectLabel(id),
			remove: () => props.onChange({ projects: toggleValue(props.filters.projects, id) })
		});
		for (const type of props.filters.types) chips.push({
			key: `t:${type}`,
			label: nodeTypeLabel(t, type),
			remove: () => props.onChange({ types: toggleValue(props.filters.types, type) })
		});
		for (const rel of props.filters.rels) chips.push({
			key: `r:${rel}`,
			label: relTypeLabel(t, rel),
			remove: () => props.onChange({ rels: toggleValue(props.filters.rels, rel) })
		});
		for (const confidence of props.filters.confidences) chips.push({
			key: `c:${confidence}`,
			label: confidenceLabel(t, confidence),
			remove: () => props.onChange({ confidences: toggleValue(props.filters.confidences, confidence) })
		});
		for (const source of props.filters.sources) chips.push({
			key: `s:${source}`,
			label: sourceLabel(t, source),
			remove: () => props.onChange({ sources: toggleValue(props.filters.sources, source) })
		});
		for (const tag of props.filters.tags) chips.push({
			key: `g:${tag}`,
			label: tagLabels.get(tag) ?? tag,
			remove: () => props.onChange({ tags: toggleValue(props.filters.tags, tag) })
		});
		if (props.filters.days > 0) chips.push({
			key: "days",
			label: timeLabel(t, props.filters.days),
			remove: () => props.onChange({ days: 0 })
		});
		if (props.filters.crossOnly) chips.push({
			key: "cross",
			label: t("graph.crossOnly"),
			remove: () => props.onChange({ crossOnly: false })
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-gactivefilters",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "gam-gactivefilters-label",
					children: t("graph.activeFilters")
				}),
				chips.map((chip) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "gam-gfilterpill",
					onClick: chip.remove,
					"aria-label": `${chip.label} ×`,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: chip.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClose, { size: 11 })]
				}, chip.key)),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: props.onReset,
					children: t("graph.clearFilters")
				})
			]
		});
	}
	function clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}
	function prefersReducedMotion() {
		return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
	}
	function GraphCanvas(props) {
		const t = props.t;
		const wrapRef = (0, react.useRef)(null);
		const tipRef = (0, react.useRef)(null);
		const [size, setSize] = (0, react.useState)({
			width: 960,
			height: 600
		});
		const [view, setView] = (0, react.useState)({
			x: 0,
			y: 0,
			k: 1
		});
		const viewRef = (0, react.useRef)(view);
		const [hover, setHover] = (0, react.useState)(null);
		const [legendOpen, setLegendOpen] = (0, react.useState)(false);
		const lastPointer = (0, react.useRef)({
			x: 0,
			y: 0
		});
		const pendingView = (0, react.useRef)(null);
		const viewRaf = (0, react.useRef)(null);
		const animRaf = (0, react.useRef)(null);
		const pointers = (0, react.useRef)(/* @__PURE__ */ new Map());
		const dragRef = (0, react.useRef)(null);
		const pinchRef = (0, react.useRef)(null);
		const suppressClickUntil = (0, react.useRef)(0);
		const lastFocusToken = (0, react.useRef)(0);
		const widthBucket = Math.round(size.width / 60) * 60;
		const heightBucket = Math.round(size.height / 60) * 60;
		const layout = (0, react.useMemo)(() => buildLayout(props.layoutMode, props.nodes, props.edges, widthBucket, heightBucket), [
			props.layoutMode,
			props.nodes,
			props.edges,
			widthBucket,
			heightBucket
		]);
		const nodeById = (0, react.useMemo)(() => new Map(props.nodes.map((node) => [node.id, node])), [props.nodes]);
		const edgeById = (0, react.useMemo)(() => new Map(props.edges.map((edge) => [edge.id, edge])), [props.edges]);
		const lod = view.k < .55 ? "far" : view.k < 1.05 ? "mid" : "near";
		const commitView = (0, react.useCallback)((next) => {
			viewRef.current = next;
			setView(next);
		}, []);
		const scheduleView = (0, react.useCallback)((next) => {
			pendingView.current = next;
			if (viewRaf.current !== null) return;
			viewRaf.current = requestAnimationFrame(() => {
				viewRaf.current = null;
				const pending = pendingView.current;
				pendingView.current = null;
				if (pending) commitView(pending);
			});
		}, [commitView]);
		const animateTo = (0, react.useCallback)((next) => {
			if (animRaf.current !== null) cancelAnimationFrame(animRaf.current);
			if (prefersReducedMotion()) {
				commitView(next);
				return;
			}
			const from = viewRef.current;
			const start = performance.now();
			const duration = 280;
			const step = (now) => {
				const progress = Math.min(1, (now - start) / duration);
				const eased = 1 - Math.pow(1 - progress, 3);
				commitView({
					x: from.x + (next.x - from.x) * eased,
					y: from.y + (next.y - from.y) * eased,
					k: from.k + (next.k - from.k) * eased
				});
				if (progress < 1) animRaf.current = requestAnimationFrame(step);
				else animRaf.current = null;
			};
			animRaf.current = requestAnimationFrame(step);
		}, [commitView]);
		const fitView = (0, react.useCallback)((animate = false) => {
			const bounds = layoutBounds(layout, props.nodes);
			const padTop = 78;
			const padBottom = 54;
			const contentWidth = Math.max(1, bounds.maxX - bounds.minX);
			const contentHeight = Math.max(1, bounds.maxY - bounds.minY);
			const k = clamp(Math.min((size.width - 128) / contentWidth, (size.height - padTop - padBottom) / contentHeight), .08, 1.8);
			const centerX = (bounds.minX + bounds.maxX) / 2;
			const centerY = (bounds.minY + bounds.maxY) / 2;
			const next = {
				x: size.width / 2 - centerX * k,
				y: padTop + (size.height - padTop - padBottom) / 2 - centerY * k,
				k
			};
			if (animate) animateTo(next);
			else commitView(next);
		}, [
			animateTo,
			commitView,
			layout,
			props.nodes,
			size.height,
			size.width
		]);
		const fitRef = (0, react.useRef)(fitView);
		fitRef.current = fitView;
		(0, react.useEffect)(() => {
			const element = wrapRef.current;
			if (!element) return;
			const update = () => {
				const rect = element.getBoundingClientRect();
				setSize({
					width: Math.max(320, Math.round(rect.width)),
					height: Math.max(320, Math.round(rect.height))
				});
			};
			update();
			const observer = new ResizeObserver(update);
			observer.observe(element);
			return () => observer.disconnect();
		}, []);
		(0, react.useEffect)(() => {
			const raf = requestAnimationFrame(() => fitRef.current(false));
			return () => cancelAnimationFrame(raf);
		}, [layout]);
		(0, react.useEffect)(() => {
			const raf = requestAnimationFrame(() => fitRef.current(false));
			return () => cancelAnimationFrame(raf);
		}, [size.width, size.height]);
		(0, react.useEffect)(() => {
			if (!props.focusTarget || props.focusToken === lastFocusToken.current) return;
			lastFocusToken.current = props.focusToken;
			const point = layout.positions.get(props.focusTarget);
			if (!point) return;
			const k = clamp(Math.max(1.15, viewRef.current.k), .08, 2.4);
			animateTo({
				x: size.width / 2 - point.x * k,
				y: size.height / 2 - point.y * k,
				k
			});
		}, [
			animateTo,
			layout,
			props.focusTarget,
			props.focusToken,
			size.height,
			size.width
		]);
		(0, react.useEffect)(() => {
			const element = wrapRef.current;
			if (!element) return;
			const onWheel = (event) => {
				if (event.target?.closest("[data-gcontrol]")) return;
				event.preventDefault();
				const rect = element.getBoundingClientRect();
				const mouseX = event.clientX - rect.left;
				const mouseY = event.clientY - rect.top;
				const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
				const factor = Math.exp(-delta * (event.ctrlKey ? .004 : .0016));
				const current = viewRef.current;
				const k = clamp(current.k * factor, .08, 6);
				if (k === current.k) return;
				const ratio = k / current.k;
				scheduleView({
					x: mouseX - (mouseX - current.x) * ratio,
					y: mouseY - (mouseY - current.y) * ratio,
					k
				});
			};
			element.addEventListener("wheel", onWheel, { passive: false });
			return () => element.removeEventListener("wheel", onWheel);
		}, [scheduleView]);
		const positionTip = (0, react.useCallback)((point) => {
			const tip = tipRef.current;
			const wrap = wrapRef.current;
			if (!tip || !wrap) return;
			const width = tip.offsetWidth;
			const height = tip.offsetHeight;
			const maxX = wrap.clientWidth - width - 12;
			const maxY = wrap.clientHeight - height - 12;
			tip.style.transform = `translate(${clamp(point.x + 16, 10, Math.max(10, maxX))}px, ${clamp(point.y + 16, 10, Math.max(10, maxY))}px)`;
		}, []);
		(0, react.useEffect)(() => {
			if (hover) positionTip(lastPointer.current);
		}, [hover, positionTip]);
		const localPoint = (event) => {
			const rect = wrapRef.current?.getBoundingClientRect();
			return {
				x: event.clientX - (rect?.left ?? 0),
				y: event.clientY - (rect?.top ?? 0)
			};
		};
		const zoomBy = (factor, anchor) => {
			const current = viewRef.current;
			const k = clamp(current.k * factor, .08, 6);
			const ax = anchor?.x ?? size.width / 2;
			const ay = anchor?.y ?? size.height / 2;
			const ratio = k / current.k;
			animateTo({
				x: ax - (ax - current.x) * ratio,
				y: ay - (ay - current.y) * ratio,
				k
			});
		};
		const centerNode = (0, react.useCallback)((id) => {
			const point = layout.positions.get(id);
			if (!point) return;
			const k = clamp(Math.max(1.2, viewRef.current.k * 1.15), .08, 2.4);
			animateTo({
				x: size.width / 2 - point.x * k,
				y: size.height / 2 - point.y * k,
				k
			});
		}, [
			animateTo,
			layout,
			size.height,
			size.width
		]);
		const onPointerDown = (event) => {
			if (event.target.closest("[data-gnode],[data-ggroup],[data-gcontrol]")) return;
			if (event.pointerType === "mouse" && event.button !== 0) return;
			const point = localPoint(event);
			pointers.current.set(event.pointerId, point);
			if (pointers.current.size >= 2) {
				const [a, b] = [...pointers.current.values()];
				if (a && b) {
					pinchRef.current = {
						distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
						view: viewRef.current,
						midX: (a.x + b.x) / 2,
						midY: (a.y + b.y) / 2
					};
					dragRef.current = null;
				}
				return;
			}
			dragRef.current = {
				startX: point.x,
				startY: point.y,
				view: viewRef.current,
				moved: false
			};
		};
		const onPointerMove = (event) => {
			if (!pointers.current.has(event.pointerId)) return;
			const point = localPoint(event);
			pointers.current.set(event.pointerId, point);
			const pinch = pinchRef.current;
			if (pinch && pointers.current.size >= 2) {
				const [a, b] = [...pointers.current.values()];
				if (!a || !b) return;
				const distance = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
				const midX = (a.x + b.x) / 2;
				const midY = (a.y + b.y) / 2;
				const k = clamp(pinch.view.k * distance / pinch.distance, .08, 6);
				const ratio = k / pinch.view.k;
				scheduleView({
					x: midX - (pinch.midX - pinch.view.x) * ratio,
					y: midY - (pinch.midY - pinch.view.y) * ratio,
					k
				});
				return;
			}
			const drag = dragRef.current;
			if (!drag) return;
			const dx = point.x - drag.startX;
			const dy = point.y - drag.startY;
			if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;
			scheduleView({
				x: drag.view.x + dx,
				y: drag.view.y + dy,
				k: drag.view.k
			});
		};
		const endPointer = (event) => {
			pointers.current.delete(event.pointerId);
			if (pointers.current.size < 2) pinchRef.current = null;
			if (pointers.current.size === 0) {
				if (dragRef.current?.moved) suppressClickUntil.current = performance.now() + 150;
				dragRef.current = null;
			}
		};
		const onPointerLeave = () => {
			if (dragRef.current?.moved) suppressClickUntil.current = performance.now() + 150;
			pointers.current.clear();
			dragRef.current = null;
			pinchRef.current = null;
		};
		const onKeyDown = (event) => {
			if (event.target !== event.currentTarget) return;
			if (event.key === "+" || event.key === "=") {
				event.preventDefault();
				zoomBy(1.25);
			} else if (event.key === "-" || event.key === "_") {
				event.preventDefault();
				zoomBy(.8);
			} else if (event.key === "0" || event.key.toLowerCase() === "f") {
				event.preventDefault();
				fitView(true);
			} else if (event.key === "Escape") props.onSelect(null);
			else if (event.key === "ArrowLeft") {
				event.preventDefault();
				animateTo({
					...viewRef.current,
					x: viewRef.current.x + 70
				});
			} else if (event.key === "ArrowRight") {
				event.preventDefault();
				animateTo({
					...viewRef.current,
					x: viewRef.current.x - 70
				});
			} else if (event.key === "ArrowUp") {
				event.preventDefault();
				animateTo({
					...viewRef.current,
					y: viewRef.current.y + 70
				});
			} else if (event.key === "ArrowDown") {
				event.preventDefault();
				animateTo({
					...viewRef.current,
					y: viewRef.current.y - 70
				});
			}
		};
		const labels = (0, react.useMemo)(() => {
			const budget = lod === "far" ? props.nodes.length <= 40 ? props.nodes.length : 24 : lod === "mid" ? props.nodes.length <= 160 ? props.nodes.length : 120 : props.nodes.length <= 420 ? props.nodes.length : 320;
			return new Set([...props.nodes].sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id)).slice(0, budget).map((node) => node.id));
		}, [lod, props.nodes]);
		const selectedNeighbors = (0, react.useMemo)(() => {
			const ids = /* @__PURE__ */ new Set();
			if (!props.selected) return ids;
			ids.add(props.selected);
			for (const edge of props.edges) {
				if (edge.from === props.selected) ids.add(edge.to);
				if (edge.to === props.selected) ids.add(edge.from);
			}
			return ids;
		}, [props.edges, props.selected]);
		const incidentEdges = (0, react.useMemo)(() => {
			const ids = /* @__PURE__ */ new Set();
			if (!props.selected) return ids;
			for (const edge of props.edges) if (edge.from === props.selected || edge.to === props.selected) ids.add(edge.id);
			return ids;
		}, [props.edges, props.selected]);
		const hoverNode = hover?.kind === "node" ? nodeById.get(hover.id) : void 0;
		const hoverEdge = hover?.kind === "edge" ? edgeById.get(hover.id) : void 0;
		const projectLabel = props.projectLabel;
		const scene = (0, react.useMemo)(() => {
			const hasQuery = props.match.active;
			const dimNodes = /* @__PURE__ */ new Set();
			for (const node of props.nodes) {
				const focusDim = Boolean(props.selected) && !selectedNeighbors.has(node.id);
				const searchDim = hasQuery && !props.match.reach.has(node.id);
				if (focusDim || searchDim) dimNodes.add(node.id);
			}
			const dimEdges = /* @__PURE__ */ new Set();
			for (const edge of props.edges) {
				const focusDim = Boolean(props.selected) && !incidentEdges.has(edge.id);
				const searchEdgeActive = props.match.edges.has(edge.id) || props.match.nodes.has(edge.from) || props.match.nodes.has(edge.to);
				if (focusDim || hasQuery && !searchEdgeActive) dimEdges.add(edge.id);
			}
			const pairCounts = /* @__PURE__ */ new Map();
			for (const edge of props.edges) {
				const key = edge.from < edge.to ? `${edge.from}\u0000${edge.to}` : `${edge.to}\u0000${edge.from}`;
				pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
			}
			const pairSeen = /* @__PURE__ */ new Map();
			const drawEdges = [...props.edges].reverse();
			const incidentLabelBudget = incidentEdges.size <= 28;
			const groups = props.layoutMode !== "force" ? layout.groups : [];
			const labelText = (node) => {
				const maxChars = lod === "far" ? 18 : lod === "near" ? 30 : 23;
				return node.id.length > maxChars ? `${node.id.slice(0, maxChars - 1)}…` : node.id;
			};
			const labelPlacements = /* @__PURE__ */ new Map();
			const occupied = [];
			for (const group of groups) occupied.push({
				x0: group.x,
				y0: group.y,
				x1: group.x + group.width,
				y1: group.y + 32
			});
			for (const node of props.nodes) {
				const point = layout.positions.get(node.id);
				if (!point) continue;
				const pad = nodeRadius(node.degree) + 2;
				occupied.push({
					x0: point.x - pad,
					y0: point.y - pad,
					x1: point.x + pad,
					y1: point.y + pad
				});
			}
			const labelCandidates = props.nodes.map((node) => {
				const selected = props.selected === node.id;
				const matched = props.match.reach.has(node.id);
				const hovered = hover?.kind === "node" && hover.id === node.id;
				const dim = dimNodes.has(node.id);
				return {
					node,
					visible: selected || matched || hovered || !dim && (labels.has(node.id) || props.selected !== null && selectedNeighbors.has(node.id)),
					priority: selected ? 0 : hovered ? 1 : matched ? 2 : 3
				};
			}).filter((item) => item.visible).sort((a, b) => a.priority - b.priority || b.node.degree - a.node.degree || a.node.id.localeCompare(b.node.id));
			for (const item of labelCandidates) {
				const point = layout.positions.get(item.node.id);
				if (!point) continue;
				const width = estimateTextWidth(labelText(item.node), 11);
				const radius = nodeRadius(item.node.degree);
				const options = [
					{
						dx: 0,
						dy: radius + 13,
						anchor: "middle",
						box: {
							x0: point.x - width / 2,
							y0: point.y + radius + 3,
							x1: point.x + width / 2,
							y1: point.y + radius + 16
						}
					},
					{
						dx: 0,
						dy: -(radius + 6),
						anchor: "middle",
						box: {
							x0: point.x - width / 2,
							y0: point.y - radius - 18,
							x1: point.x + width / 2,
							y1: point.y - radius - 5
						}
					},
					{
						dx: radius + 6,
						dy: 4,
						anchor: "start",
						box: {
							x0: point.x + radius + 5,
							y0: point.y - 9,
							x1: point.x + radius + 5 + width,
							y1: point.y + 5
						}
					},
					{
						dx: -(radius + 6),
						dy: 4,
						anchor: "end",
						box: {
							x0: point.x - radius - 5 - width,
							y0: point.y - 9,
							x1: point.x - radius - 5,
							y1: point.y + 5
						}
					},
					{
						dx: 0,
						dy: radius + 27,
						anchor: "middle",
						box: {
							x0: point.x - width / 2,
							y0: point.y + radius + 17,
							x1: point.x + width / 2,
							y1: point.y + radius + 30
						}
					},
					{
						dx: 0,
						dy: -(radius + 20),
						anchor: "middle",
						box: {
							x0: point.x - width / 2,
							y0: point.y - radius - 32,
							x1: point.x + width / 2,
							y1: point.y - radius - 19
						}
					}
				];
				let placed = false;
				for (const option of options) {
					if (occupied.some((box) => boxesOverlap(option.box, box))) continue;
					labelPlacements.set(item.node.id, {
						dx: option.dx,
						dy: option.dy,
						anchor: option.anchor
					});
					occupied.push(option.box);
					placed = true;
					break;
				}
				if (!placed && item.priority <= 2) {
					const fallback = options[0];
					labelPlacements.set(item.node.id, {
						dx: fallback.dx,
						dy: fallback.dy,
						anchor: fallback.anchor
					});
					occupied.push(fallback.box);
				}
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				groups.map((group) => {
					const dim = group.ids.length > 0 && group.ids.every((id) => dimNodes.has(id));
					const label = props.layoutMode === "project" ? projectLabel(group.id) : nodeTypeLabel(t, group.id);
					const maxChars = Math.max(8, Math.floor((group.width - 70) / 7));
					const short = label.length > maxChars ? `${label.slice(0, maxChars - 1)}…` : label;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
						className: cx("gam-ggroup", dim && "is-dim"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
							className: "gam-ghull",
							"data-tone": props.layoutMode === "project" ? projectTone(group.id) : void 0,
							"data-type": props.layoutMode === "type" ? group.id : void 0,
							x: group.x,
							y: group.y,
							width: group.width,
							height: group.height,
							rx: 18,
							ry: 18
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
							"data-ggroup": group.id,
							className: "gam-ggroup-head",
							role: "button",
							tabIndex: 0,
							"aria-label": `${label} · ${group.count}`,
							onClick: (event) => {
								event.stopPropagation();
								props.onGroupSelect(group.id);
							},
							onKeyDown: (event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									event.stopPropagation();
									props.onGroupSelect(group.id);
								}
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
									className: "gam-gdot-svg",
									"data-tone": props.layoutMode === "project" ? projectTone(group.id) : void 0,
									"data-type": props.layoutMode === "type" ? group.id : void 0,
									cx: group.x + 18,
									cy: group.y + 22,
									r: 4
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
									className: "gam-ghull-label",
									x: group.x + 28,
									y: group.y + 26,
									children: short
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
									className: "gam-ghull-count",
									x: group.x + group.width - 14,
									y: group.y + 26,
									textAnchor: "end",
									children: group.count
								})
							]
						})]
					}, `group-${group.id}`);
				}),
				drawEdges.map((edge) => {
					const from = layout.positions.get(edge.from);
					const to = layout.positions.get(edge.to);
					if (!from || !to) return null;
					const fromNode = nodeById.get(edge.from);
					const toNode = nodeById.get(edge.to);
					const fromRadius = fromNode ? nodeRadius(fromNode.degree) : 7;
					const toRadius = toNode ? nodeRadius(toNode.degree) : 7;
					let dx = to.x - from.x;
					let dy = to.y - from.y;
					const length = Math.max(1, Math.hypot(dx, dy));
					const ux = dx / length;
					const uy = dy / length;
					const sx = from.x + ux * (fromRadius + 3);
					const sy = from.y + uy * (fromRadius + 3);
					const ex = to.x - ux * (toRadius + 5);
					const ey = to.y - uy * (toRadius + 5);
					const pairKey = edge.from < edge.to ? `${edge.from}\u0000${edge.to}` : `${edge.to}\u0000${edge.from}`;
					const total = pairCounts.get(pairKey) ?? 1;
					const seen = pairSeen.get(pairKey) ?? 0;
					pairSeen.set(pairKey, seen + 1);
					const offset = total > 1 ? (seen - (total - 1) / 2) * 26 : 0;
					const mx = (sx + ex) / 2 - uy * offset;
					const my = (sy + ey) / 2 + ux * offset;
					const d = `M${sx.toFixed(2)},${sy.toFixed(2)} Q${mx.toFixed(2)},${my.toFixed(2)} ${ex.toFixed(2)},${ey.toFixed(2)}`;
					const labelX = .25 * sx + .5 * mx + .25 * ex;
					const labelY = .25 * sy + .5 * my + .25 * ey;
					const active = Boolean(props.selected && incidentEdges.has(edge.id));
					const matched = hasQuery && props.match.edges.has(edge.id);
					const showLabel = edge.id === hover?.id || props.edges.length <= 12 && offset === 0 || hasQuery && matched || active && incidentLabelBudget;
					const shortRel = edge.rel.length > 16 ? `${edge.rel.slice(0, 15)}…` : edge.rel;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
						className: cx("gam-gedge-group", edge.crossProject && "is-cross", dimEdges.has(edge.id) && "is-dim", active && "is-active", matched && "is-match"),
						children: [
							props.edges.length <= 900 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								className: "gam-gedge-hit",
								d,
								"data-gedge": edge.id,
								onClick: (event) => {
									if (performance.now() < suppressClickUntil.current) {
										event.preventDefault();
										return;
									}
									event.stopPropagation();
									props.onOpen(edge.entryId);
								},
								onPointerEnter: (event) => {
									lastPointer.current = {
										x: event.clientX,
										y: event.clientY
									};
									setHover({
										kind: "edge",
										id: edge.id
									});
								},
								onPointerMove: (event) => {
									lastPointer.current = {
										x: event.clientX,
										y: event.clientY
									};
									positionTip(lastPointer.current);
								},
								onPointerLeave: () => setHover((current) => current?.kind === "edge" && current.id === edge.id ? null : current)
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								className: cx("gam-gedge", edge.confidence !== "high" && "is-low"),
								"data-rel": edge.relType,
								d,
								markerEnd: props.edges.length <= 900 ? "url(#gam-garrow)" : void 0
							}),
							showLabel ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
								className: "gam-gedge-label",
								x: labelX,
								y: labelY - 5,
								textAnchor: "middle",
								children: shortRel
							}) : null
						]
					}, edge.id);
				}),
				props.nodes.map((node) => {
					const point = layout.positions.get(node.id);
					if (!point) return null;
					const radius = nodeRadius(node.degree);
					const isSelected = props.selected === node.id;
					const isMatched = props.match.reach.has(node.id);
					const isHovered = hover?.kind === "node" && hover.id === node.id;
					const dim = dimNodes.has(node.id);
					const placement = labelPlacements.get(node.id);
					const focusable = isSelected || isMatched || placement !== void 0;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("g", {
						"data-gnode": node.id,
						className: cx("gam-gnode", dim && "is-dim", isSelected && "is-selected", isMatched && "is-match", isHovered && "is-hover"),
						transform: `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`,
						role: "button",
						tabIndex: focusable ? 0 : -1,
						"aria-label": `${node.id} · ${nodeTypeLabel(t, node.type)} · ${node.degree}`,
						onClick: (event) => {
							event.stopPropagation();
							if (event.detail > 1) return;
							props.onSelect(isSelected ? null : node.id);
						},
						onDoubleClick: (event) => {
							event.stopPropagation();
							props.onSelect(node.id);
							centerNode(node.id);
						},
						onKeyDown: (event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								event.stopPropagation();
								props.onSelect(isSelected ? null : node.id);
							}
						},
						onPointerEnter: (event) => {
							lastPointer.current = {
								x: event.clientX,
								y: event.clientY
							};
							setHover({
								kind: "node",
								id: node.id
							});
						},
						onPointerMove: (event) => {
							lastPointer.current = {
								x: event.clientX,
								y: event.clientY
							};
							positionTip(lastPointer.current);
						},
						onPointerLeave: () => setHover((current) => current?.kind === "node" && current.id === node.id ? null : current),
						children: [
							(isSelected || isMatched || isHovered) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								className: "gam-gnode-ring",
								r: radius + 5,
								"data-type": node.type
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								className: "gam-gnode-dot",
								"data-type": node.type,
								r: radius
							}),
							placement ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
								className: "gam-gnode-label",
								x: placement.dx,
								y: placement.dy,
								textAnchor: placement.anchor,
								children: labelText(node)
							}) : null
						]
					}, node.id);
				})
			] });
		}, [
			centerNode,
			hover,
			incidentEdges,
			labels,
			layout,
			lod,
			nodeById,
			positionTip,
			projectLabel,
			props,
			selectedNeighbors,
			t
		]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-gstage",
			ref: wrapRef,
			tabIndex: 0,
			onKeyDown,
			onPointerDown,
			onPointerMove,
			onPointerUp: endPointer,
			onPointerCancel: endPointer,
			onPointerLeave,
			onDoubleClick: (event) => {
				if (event.target.closest("[data-gnode],[data-ggroup],[data-gedge],[data-gcontrol]")) return;
				const point = localPoint(event);
				const current = viewRef.current;
				const k = clamp(current.k * 1.5, .08, 6);
				const ratio = k / current.k;
				animateTo({
					x: point.x - (point.x - current.x) * ratio,
					y: point.y - (point.y - current.y) * ratio,
					k
				});
			},
			"aria-label": t("graph.svgLabel"),
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					className: "gam-gsvg",
					width: size.width,
					height: size.height,
					role: "group",
					"aria-label": t("graph.svgLabel"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("title", { children: t("graph.svgLabel") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("marker", {
							id: "gam-garrow",
							viewBox: "0 0 8 8",
							refX: "7",
							refY: "4",
							markerWidth: "7",
							markerHeight: "7",
							orient: "auto-start-reverse",
							markerUnits: "userSpaceOnUse",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
								className: "gam-garrow",
								d: "M0 0 L8 4 L0 8 z"
							})
						}) }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("g", {
							transform: `translate(${view.x} ${view.y}) scale(${view.k})`,
							children: scene
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gstage-top",
					"data-gcontrol": true,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Segmented, {
						value: props.layoutMode,
						onChange: props.onLayoutMode,
						ariaLabel: t("graph.layout"),
						options: [
							{
								value: "force",
								label: t("graph.layoutForce")
							},
							{
								value: "project",
								label: t("graph.layoutProject")
							},
							{
								value: "type",
								label: t("graph.layoutType")
							}
						]
					}), props.layoutNote ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-gstage-note",
						children: props.layoutNote
					}) : null]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gzoom",
					"data-gcontrol": true,
					role: "group",
					"aria-label": t("graph.zoom"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
							label: t("graph.zoomOut"),
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconMinus, { size: 14 }),
							onClick: () => zoomBy(.8)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "gam-gzoom-pct",
							"aria-label": t("graph.zoomLevel"),
							children: [Math.round(view.k * 100), "%"]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
							label: t("graph.zoomIn"),
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconPlus, { size: 14 }),
							onClick: () => zoomBy(1.25)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
							label: t("graph.fit"),
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconFit, { size: 14 }),
							onClick: () => fitView(true)
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-glegend",
					"data-gcontrol": true,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "gam-glegend-toggle",
						onClick: () => setLegendOpen((value) => !value),
						"aria-expanded": legendOpen,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconInfo, { size: 12 }), t("graph.legend")]
					}), legendOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-glegend-card",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gam-glegend-types",
								children: NODE_TYPE_ORDER.map((type) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "gam-glegend-item",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
										className: "gam-gdot",
										"data-type": type
									}), nodeTypeLabel(t, type)]
								}, type))
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-glegend-edges",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "gam-glegend-line" }),
									" ",
									t("graph.legendEdge")
								] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { className: "gam-glegend-line is-low" }),
									" ",
									t("graph.legendLow")
								] })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-glegend-hints",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("graph.hintPanZoom") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("graph.hintDoubleClick") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
										t("graph.hintKeys"),
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kbd, { children: "+" }),
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kbd, { children: "−" }),
										" ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Kbd, { children: "0" })
									] })
								]
							})
						]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-glegend-hint",
						children: t("graph.hintPanZoomShort")
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-gtip",
					ref: tipRef,
					"data-visible": hover !== null,
					role: "presentation",
					children: hoverNode ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gtip-head",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
								className: "gam-gdot",
								"data-type": hoverNode.type
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gtip-title",
								children: hoverNode.id
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gtip-meta",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: nodeTypeLabel(t, hoverNode.type) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: interpolate(t("graph.tipDegree"), { count: hoverNode.degree }) })
							]
						}),
						hoverNode.projects.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-gtip-meta",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: projectLabel(hoverNode.projects[0] ?? UNASSIGNED_PROJECT) })
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-gtip-hint",
							children: t("graph.tipNodeHint")
						})
					] }) : hoverEdge ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-gtip-head",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gam-gtip-title",
								children: [
									hoverEdge.from,
									" → ",
									hoverEdge.to
								]
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gtip-meta",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: relTypeLabel(t, hoverEdge.relType) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: confidenceLabel(t, hoverEdge.confidence) }),
								hoverEdge.project ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "·" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: projectLabel(hoverEdge.project) })] }) : null
							]
						}),
						hoverEdge.crossProject ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gtip-cross",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconArrowRight, { size: 10 }), t("graph.crossProjectTag")]
						}) : null,
						hoverEdge.summary ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-gtip-summary",
							children: hoverEdge.summary
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-gtip-hint",
							children: t("graph.tipEdgeHint")
						})
					] }) : null
				})
			]
		});
	}
	function GraphSide(props) {
		const t = props.t;
		const [sideLimit, setSideLimit] = (0, react.useState)(40);
		const selected = props.selected;
		(0, react.useEffect)(() => setSideLimit(40), [selected]);
		const projectRows = (0, react.useMemo)(() => aggregateProjects(props.nodes, props.edges, props.projectLabel).slice(0, 14), [
			props.edges,
			props.nodes,
			props.projectLabel
		]);
		const topEntities = (0, react.useMemo)(() => [...props.nodes].sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id)).slice(0, 8), [props.nodes]);
		const incidentEdges = (0, react.useMemo)(() => {
			if (!selected) return [];
			return props.edges.filter((edge) => edge.from === selected || edge.to === selected).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
		}, [props.edges, selected]);
		if (!props.node) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
			className: "gam-gside",
			"aria-label": t("graph.sideOverview"),
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-gside-head",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("graph.sideOverview") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, { children: [
					formatNumber(props.nodes.length),
					" ",
					t("graph.nodes")
				] })]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-gside-scroll",
				children: [
					projectRows.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-gside-section",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-gside-sectiontitle",
							children: t("graph.projectProfiles")
						}), projectRows.map((project) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "gam-gprojectrow",
							onClick: () => props.onFilterProject(project.id),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gam-gprojectrow-main",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "gam-gprojectrow-top",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
											className: "gam-gdot",
											"data-tone": projectTone(project.id)
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-gprojectrow-name",
											children: project.label
										}),
										project.crossEdges > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-gtag",
											children: interpolate(t("graph.crossCount"), { count: project.crossEdges })
										}) : null
									]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-gprojectrow-meta",
									children: interpolate(t("graph.projectRowMeta"), {
										nodes: project.nodes,
										edges: project.edges
									})
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, {
								size: 13,
								className: "gam-faint"
							})]
						}, project.id))]
					}) : null,
					topEntities.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-gside-section",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-gside-sectiontitle",
							children: t("graph.coreEntities")
						}), topEntities.map((node) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "gam-gentityrow",
							onClick: () => props.onLocate(node.id),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
									className: "gam-gdot",
									"data-type": node.type
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-gentityrow-name",
									children: node.id
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-gentityrow-meta",
									children: node.degree
								})
							]
						}, node.id))]
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						className: "gam-gside-hint",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconInfo, { size: 12 }),
							" ",
							t("graph.sideHint")
						]
					})
				]
			})]
		});
		const node = props.node;
		const shown = incidentEdges.slice(0, sideLimit);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
			className: "gam-gside",
			"aria-label": t("graph.sideRelations"),
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-gside-head gam-gside-headnode",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "gam-gside-nodename",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
						className: "gam-gdot",
						"data-type": node.type
					}), node.id]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
					size: "sm",
					label: t("graph.clearSelection"),
					icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconClose, { size: 13 }),
					onClick: () => props.onSelect(null)
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-gside-scroll",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-gside-badges",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
								tone: "accent",
								children: nodeTypeLabel(t, node.type)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, { children: interpolate(t("graph.nodeDegree"), { count: incidentEdges.length }) }),
							node.lastSeen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, { children: formatRelative(node.lastSeen) }) : null
						]
					}),
					node.projects.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-gside-projects",
						children: node.projects.map((project) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "gam-gtag gam-gtagbutton",
							onClick: () => props.onFilterProject(project),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
								className: "gam-gdot",
								"data-tone": projectTone(project)
							}), props.projectLabel(project)]
						}, project))
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-gside-actions",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: props.isolate ? "primary" : "secondary",
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconGraphView, { size: 13 }),
								onClick: () => props.onIsolate(!props.isolate),
								"aria-pressed": props.isolate,
								children: props.isolate ? t("graph.isolateOn") : t("graph.isolate")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconFit, { size: 13 }),
								onClick: () => props.onLocate(node.id),
								children: t("graph.locate")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconCopy, { size: 13 }),
								onClick: async () => {
									try {
										await navigator.clipboard.writeText(node.id);
										props.toast(t("common.copied"), "success");
									} catch {
										props.toast(t("common.copyFailed"), "danger");
									}
								},
								children: t("graph.copyName")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-gside-section",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gside-sectiontitle",
							children: [interpolate(t("graph.relationsOf"), { name: node.id }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: incidentEdges.length })]
						}), incidentEdges.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "gam-gside-hint",
							children: t("graph.noRelations")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-grelations",
							children: [shown.map((edge) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "gam-grelation",
								onClick: () => props.onOpen(edge.entryId),
								title: t("graph.openSource"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-grelation-line",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: cx("gam-grelation-entity", edge.from === node.id && "is-focus"),
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
													className: "gam-gdot",
													"data-type": props.nodeById.get(edge.from)?.type ?? "concept"
												}), edge.from]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconArrowRight, { size: 11 }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: cx("gam-grelation-entity", edge.to === node.id && "is-focus"),
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
													className: "gam-gdot",
													"data-type": props.nodeById.get(edge.to)?.type ?? "concept"
												}), edge.to]
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-grelation-rel",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-grel-badge",
											"data-rel": edge.relType,
											children: relTypeLabel(t, edge.relType)
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "gam-grelation-summary",
											children: edge.summary
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-grelation-meta",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: confidenceLabel(t, edge.confidence) }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "·" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: formatDate(edge.createdAt) }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "·" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-mono",
												children: shortId(edge.entryId, 10)
											})
										]
									})
								]
							}, edge.id)), incidentEdges.length > sideLimit ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setSideLimit((value) => value + 40),
								children: interpolate(t("graph.loadMoreRows"), {
									shown: shown.length,
									total: incidentEdges.length
								})
							}) : null]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						className: "gam-gside-hint",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconInfo, { size: 12 }),
							" ",
							t("graph.sideEditHint")
						]
					})
				]
			})]
		});
	}
	function groupEdges(edges, groupBy, projectLabel, t) {
		if (groupBy === "none") return [{
			id: "all",
			label: "",
			edges
		}];
		const groups = /* @__PURE__ */ new Map();
		for (const edge of edges) {
			const key = groupBy === "project" ? edge.project ?? UNASSIGNED_PROJECT : groupBy === "relation" ? edge.relType : edge.confidence;
			const list = groups.get(key) ?? [];
			list.push(edge);
			groups.set(key, list);
		}
		const ordered = groupBy === "confidence" ? CONFIDENCE_ORDER.filter((value) => groups.has(value)) : groupBy === "relation" ? REL_TYPE_ORDER.filter((value) => groups.has(value)) : [...groups.keys()];
		const labelOf = (id) => groupBy === "project" ? projectLabel(id) : groupBy === "relation" ? relTypeLabel(t, id) : confidenceLabel(t, id);
		return ordered.map((id) => ({
			id,
			label: labelOf(id),
			edges: (groups.get(id) ?? []).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1)
		})).sort((a, b) => b.edges.length - a.edges.length || a.label.localeCompare(b.label));
	}
	function GraphList(props) {
		const t = props.t;
		const [limit, setLimit] = (0, react.useState)(80);
		const groups = (0, react.useMemo)(() => groupEdges(props.edges, props.groupBy, props.projectLabel, t), [
			props.edges,
			props.groupBy,
			props.projectLabel,
			t
		]);
		(0, react.useEffect)(() => setLimit(80), [props.edges]);
		let remaining = limit;
		const rendered = [];
		for (const group of groups) {
			if (remaining <= 0) break;
			const slice = group.edges.slice(0, remaining);
			remaining -= slice.length;
			rendered.push(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-glistgroup",
				children: [props.groupBy !== "none" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-glistgroup-head",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: group.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gam-chipcount",
						children: group.edges.length
					})]
				}) : null, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gam-listcard",
					children: slice.map((edge) => {
						const from = props.nodeById.get(edge.from);
						const to = props.nodeById.get(edge.to);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "gam-rowitem gam-glistrow",
							onClick: () => props.onOpen(edge.entryId),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gam-glistrow-main",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-glistrow-entities",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: "gam-grelation-entity",
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
													className: "gam-gdot",
													"data-type": from?.type ?? "concept"
												}), edge.from]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconArrowRight, { size: 12 }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: "gam-grelation-entity",
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
													className: "gam-gdot",
													"data-type": to?.type ?? "concept"
												}), edge.to]
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-grel-badge",
												"data-rel": edge.relType,
												children: relTypeLabel(t, edge.relType)
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-rowitem-sum",
										children: edge.summary
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-rowitem-meta",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: props.projectLabel(edge.project ?? UNASSIGNED_PROJECT) }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-dotsep",
												children: "·"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-gconfidence",
												"data-confidence": edge.confidence,
												children: confidenceLabel(t, edge.confidence)
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-dotsep",
												children: "·"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: formatDate(edge.createdAt) }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-dotsep",
												children: "·"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: sourceLabel(t, edge.source) })
										]
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconChevronRight, {
								size: 14,
								className: "gam-faint"
							})]
						}, edge.id);
					})
				})]
			}, group.id));
		}
		const shown = Math.min(limit, props.edges.length);
		if (props.edges.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
			icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconList, { size: 20 }),
			title: t("graph.searchEmpty"),
			description: t("graph.searchEmptyDesc"),
			actions: props.hasSearch ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
				size: "sm",
				onClick: props.onClearSearch,
				children: t("graph.clearSearch")
			}) : void 0
		});
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-glist",
			children: [rendered, /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gam-glist-footer",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: interpolate(t("graph.listShowing"), {
					shown: formatNumber(shown),
					total: formatNumber(props.edges.length)
				}) }), props.edges.length > limit ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => setLimit((value) => value + 120),
					children: t("graph.loadMoreRowsShort")
				}) : null]
			})]
		});
	}
	function GraphInsights(props) {
		const t = props.t;
		const projects = (0, react.useMemo)(() => aggregateProjects(props.nodes, props.edges, props.projectLabel), [
			props.nodes,
			props.edges,
			props.projectLabel
		]);
		const links = (0, react.useMemo)(() => crossLinks(props.nodes, props.edges), [props.nodes, props.edges]);
		const topEntities = (0, react.useMemo)(() => [...props.nodes].sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id)).slice(0, 12), [props.nodes]);
		const crossCount = (0, react.useMemo)(() => props.edges.filter((edge) => edge.crossProject).length, [props.edges]);
		const peopleCount = (0, react.useMemo)(() => props.nodes.filter((node) => node.type === "person" || node.type === "team").length, [props.nodes]);
		const matrixRows = projects.slice(0, 12);
		const maxCell = (0, react.useMemo)(() => {
			let max = 1;
			for (const project of matrixRows) for (const type of NODE_TYPE_ORDER) max = Math.max(max, project.types[type]);
			return max;
		}, [matrixRows]);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "gam-ginsights",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					className: "gam-gfilters-note",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconInfo, { size: 12 }),
						" ",
						t("graph.insightHint")
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-gstatgrid",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gstat",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gstat-label",
								children: t("graph.insightProjects")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gstat-value",
								children: formatNumber(projects.filter((project) => project.id !== UNASSIGNED_PROJECT).length)
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gstat",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gstat-label",
								children: t("graph.insightNodes")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gstat-value",
								children: formatNumber(props.nodes.length)
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gstat",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gstat-label",
								children: t("graph.insightEdges")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gstat-value",
								children: formatNumber(props.edges.length)
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gstat",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gstat-label",
								children: t("graph.insightPeople")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gstat-value",
								children: formatNumber(peopleCount)
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gstat",
							"data-tone": "accent",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gstat-label",
								children: t("graph.insightCross")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-gstat-value",
								children: formatNumber(crossCount)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Card, {
					title: t("graph.projectProfiles"),
					hint: t("graph.projectProfilesHint"),
					actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, { children: projects.length }),
					children: [projects.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "gam-gside-hint",
						children: t("graph.noProjects")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-gprofilegrid",
						children: projects.slice(0, 12).map((project) => {
							const totalTypes = Math.max(1, Object.values(project.types).reduce((sum, value) => sum + value, 0));
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "gam-gprofile",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "gam-gprofile-head",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
												className: "gam-gdot",
												"data-tone": projectTone(project.id)
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-gprofile-name",
												children: project.label
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "gam-gprofile-count",
												children: interpolate(t("graph.projectRowMeta"), {
													nodes: project.nodes,
													edges: project.edges
												})
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "gam-gtypebar",
										"aria-hidden": "true",
										children: NODE_TYPE_ORDER.map((type) => project.types[type] > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
											"data-type": type,
											style: { width: `${project.types[type] / totalTypes * 100}%` }
										}, type) : null)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "gam-gprofile-types",
										children: NODE_TYPE_ORDER.filter((type) => project.types[type] > 0).map((type) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "gam-gtag",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
													className: "gam-gdot",
													"data-type": type
												}),
												nodeTypeLabel(t, type),
												" ",
												project.types[type]
											]
										}, type))
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "gam-gprofile-foot",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "gam-gprofile-cross",
											children: [project.crossEdges > 0 ? interpolate(t("graph.crossCount"), { count: project.crossEdges }) : t("graph.noCross"), project.neighbors.length > 0 ? ` · ${project.neighbors.slice(0, 3).map((neighbor) => props.projectLabel(neighbor.id)).join(" / ")}` : ""]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Button, {
											size: "sm",
											variant: "ghost",
											icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconGraphView, { size: 13 }),
											onClick: () => props.onProject(project.id),
											children: t("graph.viewInGraph")
										})]
									})
								]
							}, project.id);
						})
					}), projects.length > 12 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "gam-gfilters-note",
						children: interpolate(t("graph.profileMore"), { count: projects.length - 12 })
					}) : null]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Card, {
					title: t("graph.matrixTitle"),
					hint: t("graph.matrixHint"),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-gmatrix-wrap",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
							className: "gam-gmatrix",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								scope: "col",
								children: t("graph.project")
							}), NODE_TYPE_ORDER.map((type) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								scope: "col",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "gam-gmatrix-th",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
										className: "gam-gdot",
										"data-type": type
									}), nodeTypeLabel(t, type)]
								})
							}, type))] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: matrixRows.map((project) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
								scope: "row",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "gam-gmatrix-project",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
										className: "gam-gdot",
										"data-tone": projectTone(project.id)
									}), project.label]
								})
							}), NODE_TYPE_ORDER.map((type) => {
								const count = project.types[type];
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "gam-gmatrix-cell",
									disabled: count === 0,
									style: count > 0 ? { background: `color-mix(in srgb, var(--gam-accent) ${Math.round(count / maxCell * 20)}%, transparent)` } : void 0,
									onClick: () => props.onCell(project.id, type),
									"aria-label": `${project.label} · ${nodeTypeLabel(t, type)} · ${count}`,
									children: count || ""
								}) }, type);
							})] }, project.id)) })]
						})
					}), projects.length > 12 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "gam-gfilters-note",
						children: interpolate(t("graph.matrixMore"), { count: projects.length - 12 })
					}) : null]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gam-grid2",
					"data-align": "start",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						title: t("graph.crossLinksTitle"),
						hint: t("graph.crossLinksHint"),
						actions: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Badge, {
							tone: crossCount > 0 ? "accent" : "neutral",
							children: crossCount
						}),
						children: links.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "gam-gside-hint",
							children: t("graph.noCrossLinks")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gam-gcrosslist",
							children: [links.slice(0, 20).map((link) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "gam-gcrossrow",
								onClick: () => props.onCrossLink(link.from, link.to),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "gam-gcrossrow-main",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "gam-gcrossrow-projects",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
												className: "gam-gdot",
												"data-tone": projectTone(link.from)
											}),
											props.projectLabel(link.from),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconArrowRight, { size: 11 }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
												className: "gam-gdot",
												"data-tone": projectTone(link.to)
											}),
											props.projectLabel(link.to)
										]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-gcrossrow-rels",
										children: link.rels.map((rel) => relTypeLabel(t, rel)).join(" · ")
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gam-gcrossrow-count",
									children: link.count
								})]
							}, `${link.from}\u0000${link.to}`)), links.length > 20 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "gam-gfilters-note",
								children: interpolate(t("graph.crossMore"), { count: links.length - 20 })
							}) : null]
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Card, {
						title: t("graph.coreEntities"),
						hint: t("graph.coreEntitiesHint"),
						children: topEntities.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "gam-gside-hint",
							children: t("graph.noEntities")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gam-gentitygrid",
							children: topEntities.map((node) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "gam-gentitychip",
								onClick: () => props.onEntity(node.id),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", {
										className: "gam-gdot",
										"data-type": node.type
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-gentitychip-name",
										children: node.id
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gam-gentitychip-meta",
										children: node.degree
									})
								]
							}, node.id))
						})
					})]
				})
			]
		});
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
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("overview.injectHits") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: formatNumber(stats.recall.inject.hits) })]
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
		const [scanRoot, setScanRoot] = (0, react.useState)("");
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
			api.importSources().then((result) => {
				setSources(result.sources);
				setScanRoot(result.cwd);
			}).catch((cause) => setError(cause.message));
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
							scan.estimate.alreadyImported > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Badge, {
								tone: "warn",
								children: [
									t("import.alreadyImported"),
									" ",
									scan.estimate.alreadyImported
								]
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
					scan.estimate.alreadyImported > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gam-muted",
						style: { fontSize: 11 },
						children: t("import.alreadyImportedNote")
					}) : null,
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
					visibleItems.length === 0 ? scan.items.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
						icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconFile, { size: 20 }),
						title: t("import.noMinedItems"),
						description: scan.skipped.length > 0 ? `${t("import.noMinedItemsDesc")}（${t("import.skipped")} ${scan.skipped.length}）` : t("import.noMinedItemsDesc")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
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
				}) }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
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
					}),
					scanRoot ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gam-muted",
						style: { fontSize: 11 },
						children: [
							t("import.scanRoot"),
							": ",
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gam-mono",
								children: scanRoot
							})
						]
					}) : null,
					filteredSources.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyState, {
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
					})
				] }),
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
		let current = dictionaries.zh ?? dictionaries.en;
		for (const part of key.split(".")) {
			if (!current || typeof current !== "object") return key;
			current = current[part];
		}
		return typeof current === "string" ? current : key;
	}

	//#endregion
	exports.apply = apply;
	exports.inject = inject;
	exports.name = name;
	return module.exports;
	}
});
