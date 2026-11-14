# diorama-switch · 一间房，一枚开关

一枚装着房间的开关。胶囊里是一间 1:12 的等距微缩房间，玻璃球既是滑块也是透镜：
球走到哪里，光就跟到哪里 —— 白天它替房间向城市借光，入夜只剩一盏灯。

八间房，**每一间都是一个独立组件**，可以单独引入、单独换图、单独调灯位。

```
diorama-switch/
├── index.html              演示页（八间房并排 + 首屏读数）
├── src/
│   ├── diorama-switch.js   <diorama-switch> 自定义元素（引擎 + 液态弹簧）
│   ├── diorama-switch.css  四层结构的样式
│   └── rooms/
│       ├── registry.js     房间注册表
│       ├── index.js        一次注册八间
│       ├── work.js         工作间
│       ├── sound.js        声音间
│       ├── rest.js         休息间
│       ├── cyber.js        赛博间
│       ├── garden.js       苔庭
│       ├── greenhouse.js   温室
│       ├── station.js      观测站
│       └── archive.js      档案室
└── assets/                 八张贴图（1881×1254）
```

## 用法

```html
<script type="module" src="./src/diorama-switch.js"></script>

<diorama-switch room="cyber" height="260"></diorama-switch>
```

只要其中一间，就只引一个房间文件：

```js
import './src/rooms/garden.js';
import './src/diorama-switch.js';
```

想加第九间房，照 `src/rooms/archive.js` 复制一份改参数，再在 `src/rooms/index.js` 里 `import` 一行即可 —— 不用碰引擎。


## 单文件版本

`dist/diorama-switch.html` 是一个 350 KB 的独立页面：组件、八间房、样式、图片全部内嵌，双击就能开，不用服务器、不用联网。

```bash
python3 build/bundle.py     # 重新生成 dist/diorama-switch.html
```

它也是唯一一个能直接挂到任何静态空间（对象存储、Pages、OSS）就能用的形态。

## 示例

跑起来之后看 `examples/index.html`，五个场景，都是同一行标签：

| 示例 | 场景 | 看点 |
|---|---|---|
| [01 设置项里的一行](examples/01-settings-row.html) | 88px，四行并排 | 最小可用尺寸下房间退成一条色带 |
| [02 一枚开关，八个房间](examples/02-gallery.html) | 点列表换房 | `sw.room = 'cyber'` 一行换世界 |
| [03 滚动就是一整天](examples/03-scrollytelling.html) | 滚动驱动 | `sw.value = 滚动进度`，不走缓动 |
| [04 从 44 到 280](examples/04-sizes.html) | 四档尺寸对照 | 宽度永远 1.82×高度 |
| [05 落地页里的一块](examples/05-landing-band.html) | 嵌进普通页面 | 不改布局，直接摆在文案旁边 |

## API

| 属性 / 方法 | 说明 |
|---|---|
| `room` | 房间 id：`work` `sound` `rest` `cyber` `garden` `greenhouse` `station` `archive` |
| `height` | 胶囊高度（px），宽度按 **1.82 : 1** 自动算 |
| `value` | 昼夜进度 `0–1`（0 = 06:40 清晨，1 = 22:15 深夜） |
| `.toggle()` | 切换白天 / 夜间，640 ms 吸附 |
| `.animateTo(v, ms)` | 平滑拨到指定进度 |
| `diorama-change` | 事件，`detail = { value, room, on }` |
| `aria-checked` | 同步读写，`role="switch"`，键盘 Space / Enter / ← / → |

## 四层结构

1. **壳** —— 外唇口 → 台阶 → 视窗井，三段剖面。厚度靠分界线与落影，不靠渐变堆出来的体积感。
2. **视窗** —— 16:9 贴图，随球平移 7%，视差就是深度。
3. **昼夜** —— 只有一个进度变量 `--p`：贴图 `filter` + 紫黑 multiply + 暖光池 screen + 球位移，四件事共用一个数，所以中间没有一帧是断的。
4. **球** —— 硼硅玻璃折射球，`backdrop-filter` 把身后那一段压缩、倒置；速度驱动一条弹簧，拖动时拉长 36%、按下压扁 8%、松手果冻回弹。

## 八间房

| id | 房间 | 规格 | 光 |
|---|---|---|---|
| `work` | 工作间 | 5600K · 窗朝东 · 12㎡ | 清晨阳光斜切，琥珀台灯在右手边 |
| `sound` | 声音间 | 2700K · 台灯在右 · 8㎡ | 李子紫吸音墙，整间只有一盏灯 |
| `rest` | 休息间 | 2400K · 纸灯 · 暮色 | 纸灯罩把光揉成一团，暮色淌到地板 |
| `cyber` | 赛博间 | 霓虹 · 湿沥青 · 12㎡ | 窗外落雨，霓虹压在湿沥青上 |
| `garden` | 苔庭 | 晨雾 · 枯山水 · 8㎡ | 纸障子透进来的天光，没有方向 |
| `greenhouse` | 温室 | 逆光 · 热带 · 16㎡ | 穹顶逆光，尘土在光柱里浮着 |
| `station` | 观测站 | 轨道 · 青仪表 · 6㎡ | 轨道与环状行星，屋里只有青色的仪表 |
| `archive` | 档案室 | 琥珀 · 纸与铜 · 14㎡ | 一盏铜灯照开一桌纸 |

## 本地跑

```bash
python3 -m http.server 8080
# 打开 http://localhost:8080
```

`file://` 直接打开会因为 ES module 的同源策略失败，请走本地服务器。

## License

**GPL-3.0**（GNU General Public License v3.0）© 2026 Robincheng34

用它、改它、商用都可以，但**分发衍生作品时必须以同样许可证开源**，
并保留版权与许可声明。若你的产品要闭源，这个许可不合适 —— 需要另谈授权。
完整文本见 [LICENSE](./LICENSE)。
