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
export const STYLE_ID = 'gam-styles'

export const CSS = `
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
`

export function ensureStyles(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = CSS
  document.head.appendChild(style)
}
