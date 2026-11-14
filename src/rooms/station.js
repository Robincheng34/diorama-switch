/* 观测站 —— 轨道 · 青仪表 · 6㎡
   外面是轨道和一颗环状行星，屋里只有青色的仪表和应急灯。
   只 import 这一个文件，就只会有这一间房。 */

import { registerRoom } from './registry.js';

registerRoom({
  id: 'station',
  name: '观测站',
  spec: '轨道 · 青仪表 · 6㎡',
  gx: '84%', gy: '56%',      /* 灯的位置 */
  wx: '52%', wy: '38%',      /* 窗的方向 */
  accent: '#FFB25C',
  desc: '外面是轨道和一颗环状行星，屋里只有青色的仪表。',
  image: new URL('../../assets/room-station.jpg', import.meta.url).href,
});
