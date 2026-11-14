/* 休息间 —— 2400K · 纸灯 · 暮色
   纸灯罩把光揉成一团，暮色从西窗淌到地板上。
   只 import 这一个文件，就只会有这一间房。 */

import { registerRoom } from './registry.js';

registerRoom({
  id: 'rest',
  name: '休息间',
  spec: '2400K · 纸灯 · 暮色',
  gx: '76%', gy: '50%',      /* 灯的位置 */
  wx: '18%', wy: '40%',      /* 窗的方向 */
  accent: '#FFB25C',
  desc: '纸灯罩把光揉成一团，暮色从西窗淌到地板上。',
  image: new URL('../../assets/room-rest.jpg', import.meta.url).href,
});
