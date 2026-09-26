#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "artifacts.local/stylex");
const comparison = JSON.parse(
  await readFile(resolve(output, "comparison/comparison.json"), "utf8"),
);
const scenes = comparison.compared.map((scene) => {
  const [scope, id, viewport, theme] = scene.key.split("/");
  const path = `${scope === "app" ? "app" : "components"}/${id}--${viewport}--${theme}.png`;
  return { ...scene, before: `before/${path}`, after: `after/${path}` };
});
const exact = scenes.filter(
  (scene) => scene.changedPixels === 0 && scene.dimensionsMatch,
).length;
const html = `<!doctype html><html lang="zh-Hans"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>StyleX 视觉迁移对比</title>
<style>
:root{font:16px/1.5 Georgia,"Songti SC",serif;color:#e8e4db;background:#171b20}body{margin:0;padding:24px;max-width:1440px;margin:auto}h1{font-size:28px;margin:0 0 8px}p{margin:0 0 18px;color:#bfc4ca}label{margin-right:12px}select,input,button{font:inherit}select{max-width:100%;padding:8px;margin:12px 0;background:#252c34;color:inherit;border:1px solid #68737e}input[type=range]{width:300px;max-width:70vw;accent-color:#edb76b}.viewer{position:relative;max-width:100%;overflow:hidden;background:#fff;line-height:0;margin-top:18px}.viewer img{display:block;width:100%;height:auto}.over{position:absolute;inset:0;clip-path:inset(0 50% 0 0)}.divider{position:absolute;inset:0 auto 0 50%;border-left:2px solid #ea9b32;pointer-events:none}.caption{display:flex;justify-content:space-between;margin-top:10px}a{color:#edb76b}#meta{font:14px/1.5 ui-monospace,monospace;white-space:pre-wrap}details{margin:16px 0}summary{cursor:pointer}
</style><h1>Tailwind CSS → StyleX</h1><p>${exact} / ${scenes.length} 个场景逐像素一致；缺失或失败 ${comparison.missing.length} 项。阈值：${comparison.channelThreshold}，容许差异：${comparison.maxDiffPercent}%。</p>
<label><input id="onlyDiff" type="checkbox">只显示差异</label><br><select id="scene" aria-label="选择截图场景"></select><div id="meta"></div>
<div class="caption"><span>迁移前（左侧覆盖层）</span><span>迁移后</span></div><label>分界线 <input id="slider" type="range" min="0" max="100" value="50"></label><a id="diffLink" target="_blank">打开像素差异图</a>
<div class="viewer"><img id="after" alt="迁移后"><div class="over"><img id="before" alt="迁移前"></div><div class="divider"></div></div>
<script>
const scenes=${JSON.stringify(scenes).replaceAll("<", "\\u003c")};
const select=document.querySelector('#scene');function populate(){select.replaceChildren();for(const [i,s] of scenes.entries()){if(document.querySelector('#onlyDiff').checked&&s.changedPixels===0&&s.dimensionsMatch)continue;const o=document.createElement('option');o.value=i;o.textContent=(s.changedPixels===0&&s.dimensionsMatch?'✓ ':'△ ')+s.key;select.append(o)}show()}
function show(){const s=scenes[select.value];document.querySelector('.viewer').hidden=!s;if(!s){document.querySelector('#meta').textContent='没有符合筛选条件的差异场景。';document.querySelector('#diffLink').hidden=true;return;}document.querySelector('#before').src=s.before;document.querySelector('#after').src=s.after;document.querySelector('#meta').textContent='变化像素 '+s.changedPixels+' · '+s.diffPercent+'% · 尺寸 '+s.beforeSize.join('×')+' → '+s.afterSize.join('×');const a=document.querySelector('#diffLink');a.hidden=!s.diffFile;a.href='comparison/'+s.diffFile}
select.onchange=show;document.querySelector('#onlyDiff').onchange=populate;document.querySelector('#slider').oninput=e=>{document.querySelector('.over').style.clipPath='inset(0 '+(100-e.target.value)+'% 0 0)';document.querySelector('.divider').style.left=e.target.value+'%'};populate();
</script></html>`;
await writeFile(resolve(output, "report.html"), html);
console.log(resolve(output, "report.html"));
