/**
 * 面板样式（单文件 <style> 注入，类名统一 .gam-）。
 *
 * 硬约束：只消费宿主主题 token，不写死颜色，不写主题选择器。
 * 设计取向：Claude 式的编辑感 —— 衬线标题、纸面留白、发丝边框、低饱和表面、
 * 列表化信息层级；所有交互元件都有键盘焦点、触控尺寸与 reduced-motion 降级。
 */
export const STYLE_ID = 'gam-styles'

export const CSS = `
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
`

export function ensureStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  document.head.appendChild(style)
}
