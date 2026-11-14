#!/usr/bin/env python3
"""把 src/ 打成一个可以直接双击打开、也可以挂 CDN 的单文件版本。

    python3 build/bundle.py
    → dist/diorama-switch.html

单文件里：
  · CSS 内联进 <style>，图片走公网 URL（部署时替换 IMAGE_BASE 即可）
  · ES module 被剥掉 import/export，九间房全部就地注册
  · 页面本身就是八间房的实例墙 + 一枚可拖的首屏
"""

import re, pathlib, json, datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT  = ROOT / "dist" / "diorama-switch.html"

# 公网图床（想换自己的 CDN，只改这一处）
IMAGE_BASE = "https://aka.doubaocdn.com/s/"
IMAGES = {                       # 房间 id → 图床短号
    "work":       "9pd72F7D88",
    "sound":      "pP3ElrpweZ",
    "rest":       "LUOdx8hTXT",
    "cyber":      "SDCl2hInyC",
    "garden":     "I9Nguk7Nov",
    "greenhouse": "N7v5fCorlQ",
    "station":    "MOMaFNLnjh",
    "archive":    "cZD4gTeHO9",
}

ORDER = ["work", "sound", "rest", "cyber", "garden", "greenhouse", "station", "archive"]


import base64, io

def inline_images(max_w=760, quality=74):
    """把 assets 里八张房图压成小 webp，返回 {id: data-uri}。dist 版本用它保证零依赖。"""
    from PIL import Image
    out = {}
    for rid in ORDER:
        f = ROOT / "assets" / f"room-{rid}.jpg"
        im = Image.open(f).convert("RGB")
        if im.width > max_w:
            im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "WEBP", quality=quality, method=6)
        out[rid] = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
        print(f"  {rid:11} {im.width}x{im.height}  {len(buf.getvalue())/1024:5.1f} KB")
    return out


def read(p):
    return (ROOT / p).read_text(encoding="utf-8")


def room_specs(imgmap):
    specs = []
    for rid in ORDER:
        src = read(f"src/rooms/{rid}.js")
        d = {"id": rid}
        for k in ("name", "spec", "desc", "gx", "gy", "wx", "wy", "accent"):
            m = re.search(rf"{k}: '([^']*)'", src)
            if m:
                d[k] = m.group(1)
        specs.append(d)
    return specs


def bundle_js(imgmap):
    """组件源码去掉模块语法，补上注册表与八间房。"""
    src = read("src/diorama-switch.js")
    src = re.sub(r"^import .*?;\s*$", "", src, flags=re.M)          # 去掉 import
    src = re.sub(r"^export .*?;\s*$", "", src, flags=re.M)           # 去掉 export
    src = src.replace("export default DioramaSwitch;", "")
    # 内联 CSS：单文件里 CSS_URL 为 null，用 window.__DIORAMA_CSS__
    src = src.replace(
        "const CSS_URL = new URL('./diorama-switch.css', import.meta.url).href;",
        "const CSS_URL = null;",
    )
    registry = read("src/rooms/registry.js")
    registry = re.sub(r"^export ", "", registry, flags=re.M)

    room_calls = []
    for r in room_specs(imgmap):
        fields = [f"id: {json.dumps(r['id'])}", f"name: {json.dumps(r['name'])}"]
        for k in ("spec", "desc", "gx", "gy", "wx", "wy", "accent"):
            if k in r:
                fields.append(f"{k}: {json.dumps(r[k])}")
        fields.append("image: " + json.dumps(imgmap[r["id"]]) if imgmap else "image: " + json.dumps(IMAGE_BASE + IMAGES[r["id"]] + ".jpg"))
        room_calls.append("  registerRoom({ " + ", ".join(fields) + " });")

    return (
        "(function(){\n"
        + registry + "\n"
        + "\n".join(room_calls) + "\n"
        + src + "\n"
        + "window.__DIORAMA__ = { ROOMS, getRoom, registerRoom, DioramaSwitch };\n"
        + "})();"
    )


PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>一间房，一枚开关 · diorama-switch</title>
<style>
  :root{{--bg:#0A0C16;--ink:#E8E7EE;--muted:#7E849F;--accent:#FFB25C;--hair:rgba(232,231,238,.12)}}
  *{{box-sizing:border-box}}
  html,body{{margin:0}}
  body{{background:var(--bg);color:var(--ink);font:15px/1.75 "Noto Serif CJK SC","Songti SC",Georgia,serif;
       padding:clamp(24px,5vw,72px)}}
  .wrap{{max-width:1240px;margin:0 auto}}
  .kicker{{font:11px/1 "DejaVu Sans Mono",ui-monospace,monospace;letter-spacing:.22em;color:var(--muted);text-transform:uppercase}}
  h1{{font-size:clamp(32px,4.6vw,58px);line-height:1.08;margin:.35em 0 .2em;letter-spacing:-.01em}}
  h1 em{{font-style:normal;color:var(--accent)}}
  .lead{{max-width:34em;color:var(--muted);margin:0 0 2.2em}}
  .hero{{display:flex;flex-wrap:wrap;align-items:center;gap:clamp(20px,4vw,54px);margin:0 0 2.4em}}
  .readout{{font:12px/1.9 "DejaVu Sans Mono",ui-monospace,monospace;color:var(--muted);letter-spacing:.08em}}
  .readout b{{display:block;font-size:clamp(22px,3vw,34px);color:var(--ink);letter-spacing:-.01em}}
  .readout b small{{font-size:.5em;color:var(--muted);margin-left:.35em}}
  .grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1px;background:var(--hair);
        border:1px solid var(--hair);margin:1.4em 0 2.4em}}
  .cell{{background:var(--bg);padding:clamp(18px,2.2vw,28px);display:flex;flex-direction:column;gap:14px}}
  .cell .hd{{display:flex;justify-content:space-between;align-items:baseline}}
  .cell .name{{font-size:17px;letter-spacing:.02em}}
  .cell .no{{font:10px "DejaVu Sans Mono",monospace;color:var(--muted);letter-spacing:.12em}}
  .cell .spec{{font:10.5px/1.6 "DejaVu Sans Mono",ui-monospace,monospace;letter-spacing:.1em;color:var(--muted);text-transform:uppercase}}
  .cell p{{margin:0;font-size:13px;line-height:1.7;color:var(--muted)}}
  pre{{background:#11141F;border:1px solid var(--hair);border-radius:2px;padding:18px 20px;overflow:auto;
      font:12.5px/1.8 "DejaVu Sans Mono",ui-monospace,monospace;color:#C9CCDA}}
  footer{{margin-top:2.6em;padding-top:1.4em;border-top:1px solid var(--hair);display:flex;flex-wrap:wrap;gap:18px;
          justify-content:space-between;font:11px/1.7 "DejaVu Sans Mono",monospace;letter-spacing:.14em;color:var(--muted)}}
  .note{{font-size:12.5px;color:var(--muted)}}
</style>
</head>
<body>
<div class="wrap">

  <div class="kicker">DIORAMA SWITCH / 八间房实例</div>
  <h1>一间房，<em>一枚开关</em></h1>
  <p class="lead">八间 1:12 的等距微缩房间，八种光的性格。拖动那枚玻璃球：球走到哪里，光就跟到哪里 —— 白天它替房间向城市借光，入夜只剩一盏灯。每间房都是同一个组件的一个实例。</p>

  <div class="hero">
    <diorama-switch id="hero" room="work" height="300" value="0"></diorama-switch>
    <div class="readout">
      <b><span id="lux">3 200</span><small>LX</small></b>
      <span id="when">06:40 · 窗朝东</span>
    </div>
  </div>

  <div class="kicker">八间房 / 八个实例</div>
  <div class="grid" id="grid"></div>

  <div class="kicker">用法</div>
<pre>&lt;script type="module" src="./src/diorama-switch.js"&gt;&lt;/script&gt;
&lt;diorama-switch room="cyber" height="260"&gt;&lt;/diorama-switch&gt;</pre>
  <p class="note">属性 <b>room</b> / <b>height</b> / <b>value</b>；方法 <b>toggle()</b> / <b>animateTo(v, ms)</b>；事件 <b>diorama-change</b>；键盘 Space / Enter / ← / →。</p>

  <footer>
    <span>CAPSULE 1.82 : 1 · LIQUID SPRING</span>
    <span>GPL-3.0 · 2026</span>
  </footer>
</div>

<script>window.__DIORAMA_CSS__ = {css};</script>
<script>{js}</script>
<script>
  const nodes = document.getElementById('grid');
  window.__DIORAMA__.ROOMS.forEach((r, i) => {{
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerHTML = `
      <div class="hd"><span class="name">${{r.name}}</span><span class="no">${{String(i+1).padStart(2,'0')}}</span></div>
      <div class="spec">${{r.spec || ''}}</div>
      <diorama-switch room="${{r.id}}" height="124" value="0"></diorama-switch>
      <p>${{r.desc || ''}}</p>`;
    nodes.appendChild(cell);
  }});

  const hero = document.getElementById('hero');
  const luxEl = document.getElementById('lux'), whenEl = document.getElementById('when');
  const fmtLux = p => (3200 * Math.pow(8/3200, p)).toFixed(0).replace(/(\\d)(?=(\\d{{3}})+$)/g, '$1 ');
  const fmtTime = p => {{
    const m = Math.round(400 + (1335-400)*p);
    return String(Math.floor(m/60)).padStart(2,'0') + ':' + String(m%60).padStart(2,'0')
         + (p > .5 ? ' · 灯已亮' : ' · 窗朝东');
  }};
  hero.addEventListener('diorama-change', e => {{
    luxEl.textContent = fmtLux(e.detail.value);
    whenEl.textContent = fmtTime(e.detail.value);
  }});
</script>
</body>
</html>
"""


def main():
    css = read("src/diorama-switch.css")
    css = "/* inlined from src/diorama-switch.css */\n" + css
    imgmap = inline_images()
    html = PAGE.format(css=json.dumps(css), js=bundle_js(imgmap))
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    kb = OUT.stat().st_size / 1024
    print(f"built {OUT.relative_to(ROOT)}  {kb:.0f} KB  ·  {datetime.date.today()}")


if __name__ == "__main__":
    main()
