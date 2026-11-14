/* 档案室 —— 琥珀 · 纸与铜 · 14㎡
   一盏铜灯照开一桌纸，书架高到看不见顶。
   只 import 这一个文件，就只会有这一间房。 */

import { registerRoom } from './registry.js';

registerRoom({
  id: 'archive',
  name: '档案室',
  spec: '琥珀 · 纸与铜 · 14㎡',
  gx: '46%', gy: '54%',      /* 灯的位置 */
  wx: '74%', wy: '32%',      /* 窗的方向 */
  accent: '#FFB25C',
  desc: '一盏铜灯照开一桌纸，书架高到看不见顶。',
  image: new URL('../../assets/room-archive.jpg', import.meta.url).href,
});
