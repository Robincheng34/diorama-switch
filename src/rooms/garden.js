/* 苔庭 —— 晨雾 · 枯山水 · 8㎡
   晨雾压着砂纹，纸障子透进来的是没有方向的天光。
   只 import 这一个文件，就只会有这一间房。 */

import { registerRoom } from './registry.js';

registerRoom({
  id: 'garden',
  name: '苔庭',
  spec: '晨雾 · 枯山水 · 8㎡',
  gx: '30%', gy: '44%',      /* 灯的位置 */
  wx: '62%', wy: '42%',      /* 窗的方向 */
  accent: '#FFB25C',
  desc: '晨雾压着砂纹，纸障子透进来的是没有方向的天光。',
  image: new URL('../../assets/room-garden.jpg', import.meta.url).href,
});
